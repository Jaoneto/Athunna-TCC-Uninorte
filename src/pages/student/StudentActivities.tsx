import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Award, MapPin, User, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivities } from '@/hooks/useActivities';
import { format, parseISO, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const StudentActivities: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'oficina' | 'workshop' | 'palestra'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'agendada' | 'concluida'>('all');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [registeredActivities, setRegisteredActivities] = useState<Set<string>>(new Set());
  const { activities: rawActivities, loading, refetch } = useActivities();
  const { toast } = useToast();
  const { user } = useAuth();

  const activities = useMemo(() => {
    const now = new Date();
    
    return rawActivities.map(activity => {
      const startDate = parseISO(activity.data_inicio);
      const endDate = activity.data_fim ? parseISO(activity.data_fim) : null;
      
      let status: 'agendada' | 'concluida' = 'agendada';
      if (endDate && isBefore(endDate, now)) {
        status = 'concluida';
      }
      
      return {
        id: activity.id,
        title: activity.titulo,
        type: activity.tipo?.toLowerCase() || 'outros',
        date: format(startDate, "dd/MM/yyyy 'às' HH:mm", { locale: pt }),
        dateObj: startDate,
        time: endDate ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}` : format(startDate, 'HH:mm'),
        location: activity.local || 'Local não definido',
        instructor: activity.palestrante || 'Não definido',
        bio: activity.palestrante_bio,
        description: activity.descricao || 'Sem descrição',
        complementaryHours: activity.carga_horaria || 0,
        availableSpots: activity.vagas_disponiveis || 0,
        maxCapacity: activity.capacidade_maxima || 0,
        status
      };
    });
  }, [rawActivities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [activities, typeFilter, statusFilter]);

  const totalHours = activities
    .filter(activity => activity.status === 'concluida')
    .reduce((sum, activity) => sum + activity.complementaryHours, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'palestra': return 'bg-blue-100 text-blue-800';
      case 'oficina': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'agendada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Buscar atividades inscritas do usuário
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('participacoes_atividades')
        .select('atividade_id')
        .eq('usuario_id', user.id);
      
      if (data) {
        setRegisteredActivities(new Set(data.map(r => r.atividade_id)));
      }
    };
    
    fetchRegistrations();
  }, [user]);

  const handleReserve = async (activityId: string, activityTitle: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para se inscrever",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(activityId);
    
    try {
      // Verificar se há vagas
      const activity = activities.find(a => a.id === activityId);
      if (activity && activity.availableSpots <= 0) {
        toast({
          title: "Sem vagas",
          description: "Não há vagas disponíveis para esta atividade",
          variant: "destructive",
        });
        return;
      }

      // Criar inscrição
      const { error: insertError } = await supabase
        .from('participacoes_atividades')
        .insert({
          atividade_id: activityId,
          usuario_id: user.id,
          presenca: false,
        });

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          toast({
            title: "Já inscrito",
            description: "Você já está inscrito nesta atividade",
            variant: "destructive",
          });
          return;
        }
        throw insertError;
      }

      // Atualizar vagas disponíveis
      if (activity && activity.availableSpots > 0) {
        await supabase
          .from('atividades')
          .update({ vagas_disponiveis: activity.availableSpots - 1 })
          .eq('id', activityId);
      }

      // Enviar notificação de inscrição (email e in-app)
      if (activity) {
        try {
          await supabase.functions.invoke('send-registration-notification', {
            body: {
              userId: user.id,
              type: 'activity',
              itemId: activityId,
              itemTitle: activityTitle,
              itemDate: activity.dateObj.toISOString(),
              itemLocal: activity.location
            }
          });
        } catch (notifError) {
          console.error('Erro ao enviar notificação:', notifError);
          // Não falha a inscrição se a notificação falhar
        }
      }

      toast({
        title: "✅ Reserva confirmada!",
        description: `Você se inscreveu em "${activityTitle}"`,
        className: "bg-green-50 border-green-200",
      });

      // Atualizar lista de inscrições
      setRegisteredActivities(prev => new Set([...prev, activityId]));
      refetch();
    } catch (error: any) {
      console.error('Erro ao reservar:', error);
      toast({
        title: "Erro ao reservar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelReservation = async (activityId: string, activityTitle: string) => {
    if (!user) return;

    setProcessingId(activityId);
    
    try {
      const activity = activities.find(a => a.id === activityId);

      // Deletar inscrição
      const { error: deleteError } = await supabase
        .from('participacoes_atividades')
        .delete()
        .eq('atividade_id', activityId)
        .eq('usuario_id', user.id);

      if (deleteError) throw deleteError;

      // Atualizar vagas disponíveis
      if (activity) {
        await supabase
          .from('atividades')
          .update({ vagas_disponiveis: activity.availableSpots + 1 })
          .eq('id', activityId);
      }

      toast({
        title: "Reserva cancelada",
        description: `Sua inscrição em "${activityTitle}" foi cancelada`,
        className: "bg-orange-50 border-orange-200",
      });

      // Atualizar lista de inscrições
      setRegisteredActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
      refetch();
    } catch (error: any) {
      console.error('Erro ao cancelar:', error);
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Minhas Atividades
        </h1>
        <p className="text-gray-600">
          Explore e participe de oficinas, workshops e palestras
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Horas Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.status === 'concluida').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Agendadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.status === 'agendada').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="oficina">Oficinas</SelectItem>
            <SelectItem value="workshop">Workshops</SelectItem>
            <SelectItem value="palestra">Palestras</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="agendada">Agendadas</SelectItem>
            <SelectItem value="concluida">Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12 text-gray-500">
            Carregando atividades...
          </div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold flex-1">{activity.title}</h3>
                  <Badge className={getStatusColor(activity.status)} variant="secondary">
                    {activity.status === 'agendada' ? 'Agendada' : 'Concluída'}
                  </Badge>
                </div>

                <Badge className={getTypeColor(activity.type)} variant="secondary">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Badge>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User size={16} className="mr-2 flex-shrink-0" />
                    {activity.instructor}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    {activity.date}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 flex-shrink-0" />
                    {activity.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    {activity.location}
                  </div>
                  <div className="flex items-center">
                    <Award size={16} className="mr-2 flex-shrink-0" />
                    {activity.complementaryHours}h de carga horária
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(activity)}
                  >
                    Detalhes
                  </Button>
                  {activity.status === 'agendada' && (
                    registeredActivities.has(activity.id) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleCancelReservation(activity.id, activity.title)}
                        disabled={processingId === activity.id}
                      >
                        {processingId === activity.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelando...</>
                        ) : (
                          'Cancelar'
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 bg-[#5D5FEF] hover:bg-[#4A4AE3]"
                        onClick={() => handleReserve(activity.id, activity.title)}
                        disabled={processingId === activity.id || activity.availableSpots === 0}
                      >
                        {processingId === activity.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reservando...</>
                        ) : activity.availableSpots === 0 ? (
                          'Esgotado'
                        ) : (
                          'Reservar'
                        )}
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-12 text-gray-500 bg-white rounded-lg">
            Nenhuma atividade encontrada
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedActivity?.title}</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getTypeColor(selectedActivity.type)} variant="secondary">
                    {selectedActivity.type.charAt(0).toUpperCase() + selectedActivity.type.slice(1)}
                  </Badge>
                  <Badge className={getStatusColor(selectedActivity.status)} variant="secondary">
                    {selectedActivity.status === 'agendada' ? 'Agendada' : 'Concluída'}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Descrição</h4>
                  <p className="text-gray-600">{selectedActivity.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Instrutor</h4>
                    <p className="text-gray-600">{selectedActivity.instructor}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Local</h4>
                    <p className="text-gray-600">{selectedActivity.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Data e Hora</h4>
                    <p className="text-gray-600">{selectedActivity.date}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Duração</h4>
                    <p className="text-gray-600">{selectedActivity.time}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Carga Horária</h4>
                    <p className="text-gray-600">{selectedActivity.complementaryHours}h</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Vagas</h4>
                    <p className="text-gray-600">{selectedActivity.availableSpots}/{selectedActivity.maxCapacity}</p>
                  </div>
                </div>

                {selectedActivity.bio && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Sobre o Instrutor</h4>
                    <p className="text-gray-600">{selectedActivity.bio}</p>
                  </div>
                )}

                {selectedActivity.status === 'agendada' && (
                  registeredActivities.has(selectedActivity.id) ? (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        handleCancelReservation(selectedActivity.id, selectedActivity.title);
                        setIsDetailsOpen(false);
                      }}
                      disabled={processingId === selectedActivity.id}
                    >
                      {processingId === selectedActivity.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelando...</>
                      ) : (
                        'Cancelar Reserva'
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-[#5D5FEF] hover:bg-[#4A4AE3]"
                      onClick={() => {
                        handleReserve(selectedActivity.id, selectedActivity.title);
                        setIsDetailsOpen(false);
                      }}
                      disabled={processingId === selectedActivity.id || selectedActivity.availableSpots === 0}
                    >
                      {processingId === selectedActivity.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reservando...</>
                      ) : selectedActivity.availableSpots === 0 ? (
                        'Sem Vagas'
                      ) : (
                        'Fazer Reserva'
                      )}
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentActivities;
