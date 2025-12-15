
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Search, BookmarkPlus, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';

const StudentEvents: React.FC = () => {
  const { events, loading, registerForEvent, cancelRegistration } = useEventRegistrations();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.descricao && event.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || event.tipo === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'palestra': return 'bg-blue-100 text-blue-800';
      case 'oficina': return 'bg-green-100 text-green-800';
      case 'atividade': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReserve = async (eventId: string) => {
    setProcessingEventId(eventId);
    await registerForEvent(eventId);
    setProcessingEventId(null);
  };

  const handleCancelReservation = async (eventId: string) => {
    setProcessingEventId(eventId);
    await cancelRegistration(eventId);
    setProcessingEventId(null);
  };

  const toggleCard = (eventId: string) => {
    setExpandedCard(expandedCard === eventId ? null : eventId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eventos Disponíveis
        </h1>
        <p className="text-gray-600">
          Descubra e reserve sua participação em palestras, oficinas e atividades
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar eventos, tags ou instrutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="palestra">Palestras</SelectItem>
                <SelectItem value="oficina">Oficinas</SelectItem>
                <SelectItem value="atividade">Atividades</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {filteredEvents.length} de {events.length} eventos
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Events Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isExpanded = expandedCard === event.id;
            const imageUrl = event.imagem_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400';
            const disponivel = event.vagas_disponiveis ?? 0;
            const total = event.capacidade_maxima ?? 0;
            
            // Calcular carga horária com formatação melhorada
            let cargaHorariaText = null;
            if (event.data_fim) {
              const diffMs = new Date(event.data_fim).getTime() - new Date(event.data_inicio).getTime();
              const diffHours = diffMs / (1000 * 60 * 60);
              const hours = Math.floor(diffHours);
              const minutes = Math.round((diffHours - hours) * 60);
              
              if (hours > 0 && minutes > 0) {
                cargaHorariaText = `${hours}h${minutes}min`;
              } else if (hours > 0) {
                cargaHorariaText = `${hours}h`;
              } else if (minutes > 0) {
                cargaHorariaText = `${minutes}min`;
              }
            }
            
            return (
              <div 
                key={event.id} 
                className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${
                  isExpanded ? 'lg:col-span-2 xl:col-span-2' : ''
                }`}
                onClick={() => toggleCard(event.id)}
              >
                <div className={`${isExpanded ? 'flex flex-row' : 'flex flex-col'}`}>
                  {/* Imagem */}
                  <div className={`relative ${isExpanded ? 'w-2/5' : 'w-full'}`}>
                    <img 
                      src={imageUrl} 
                      alt={event.titulo}
                      className={`w-full object-cover ${isExpanded ? 'h-full' : 'h-48'}`}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className={getTypeColor(event.tipo)} variant="secondary">
                        {event.tipo.charAt(0).toUpperCase() + event.tipo.slice(1)}
                      </Badge>
                      {event.isReserved && (
                        <Badge className="bg-green-100 text-green-800" variant="secondary">
                          Reservado
                        </Badge>
                      )}
                    </div>
                  </div>
                
                  {/* Conteúdo */}
                  <div className={`p-6 ${isExpanded ? 'w-3/5' : 'w-full'}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.titulo}
                    </h3>
                    <p className={`text-gray-600 text-sm mb-4 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {event.descricao || 'Sem descrição disponível'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.data_inicio).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(event.data_inicio).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {cargaHorariaText && (
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <Timer className="w-4 h-4 mr-2" />
                          Carga horária: {cargaHorariaText}
                        </div>
                      )}
                      {event.local && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.local}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        {disponivel} vagas disponíveis{total > 0 && ` de ${total}`}
                      </div>
                    </div>

                    {/* Informações expandidas */}
                    {isExpanded && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg animate-fade-in">
                        <h4 className="font-semibold text-gray-900 mb-2">Detalhes Adicionais</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Modalidade: <span className="capitalize font-medium">{event.modalidade || 'Presencial'}</span>
                        </p>
                        {event.data_fim && (
                          <p className="text-sm text-gray-600">
                            Término: {new Date(event.data_fim).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm">
                        <Badge variant="outline" className="text-primary">
                          {event.tipo}
                        </Badge>
                      </div>
                      {event.isReserved ? (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelReservation(event.id);
                          }}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={processingEventId === event.id}
                        >
                          {processingEventId === event.id ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelando...</>
                          ) : (
                            'Cancelar Reserva'
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReserve(event.id);
                          }}
                          className="bg-[#5D5FEF] hover:bg-[#4A4AE3]"
                          disabled={disponivel === 0 || processingEventId === event.id}
                        >
                          {processingEventId === event.id ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reservando...</>
                          ) : (
                            <><BookmarkPlus className="w-4 h-4 mr-2" /> {disponivel === 0 ? 'Esgotado' : 'Reservar'}</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum evento encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentEvents;
