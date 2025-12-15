import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, BookmarkPlus, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';

const StudentDashboard: React.FC = () => {
  const { events, loading, registerForEvent, cancelRegistration } = useEventRegistrations();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);

  // Mostrar apenas os 3 primeiros eventos em destaque
  const featuredEvents = events.slice(0, 3);

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
          Descubra Eventos Incríveis
        </h1>
        <p className="text-gray-600">
          Participe de palestras, oficinas e atividades para complementar sua formação acadêmica
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Eventos Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookmarkPlus className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Minhas Reservas</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.isReserved).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Vagas Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + (e.vagas_disponiveis ?? 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tipos de Eventos</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(events.map(e => e.tipo)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Eventos em Destaque</h2>
        
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => {
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
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#5D5FEF] to-[#4A4AE3] rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Acelere sua Jornada Acadêmica</h3>
        <p className="mb-4 opacity-90">
          Explore todas as oportunidades disponíveis e maximize seu aprendizado
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" className="bg-white text-[#5D5FEF] hover:bg-gray-100">
            Ver Todos os Eventos
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            Meus Certificados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
