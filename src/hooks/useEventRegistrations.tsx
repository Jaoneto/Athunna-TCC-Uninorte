import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface EventWithRegistration {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  modalidade: string | null;
  status: string | null;
  capacidade_maxima: number | null;
  vagas_disponiveis: number | null;
  imagem_url: string | null;
  isReserved: boolean;
}

export const useEventRegistrations = () => {
  const [events, setEvents] = useState<EventWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEventsWithRegistrations = async () => {
    try {
      setLoading(true);
      
      // Buscar eventos ativos
      const { data: eventsData, error: eventsError } = await supabase
        .from('eventos')
        .select('*')
        .eq('status', 'ativo')
        .order('data_inicio', { ascending: true });

      if (eventsError) throw eventsError;

      // Se não houver usuário logado, retornar eventos sem inscrições
      if (!user) {
        setEvents(
          (eventsData || []).map(event => ({
            ...event,
            isReserved: false,
          }))
        );
        return;
      }

      // Buscar inscrições do usuário
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', user.id)
        .eq('status', 'confirmada');

      if (registrationsError) throw registrationsError;

      const registeredEventIds = new Set(
        (registrationsData || []).map(r => r.evento_id)
      );

      // Combinar dados
      const eventsWithRegistrations = (eventsData || []).map(event => ({
        ...event,
        isReserved: registeredEventIds.has(event.id),
      }));

      setEvents(eventsWithRegistrations);
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para reservar uma vaga.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Verificar se há vagas disponíveis
      const { data: eventData, error: eventError } = await supabase
        .from('eventos')
        .select('vagas_disponiveis, titulo, data_inicio, local')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (eventData.vagas_disponiveis && eventData.vagas_disponiveis <= 0) {
        toast({
          title: "Evento esgotado",
          description: "Não há mais vagas disponíveis para este evento.",
          variant: "destructive",
        });
        return false;
      }

      // Criar inscrição
      const { error: insertError } = await supabase
        .from('inscricoes_eventos')
        .insert({
          evento_id: eventId,
          usuario_id: user.id,
          status: 'confirmada',
        });

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          toast({
            title: "Já inscrito",
            description: "Você já está inscrito neste evento.",
            variant: "destructive",
          });
          return false;
        }
        throw insertError;
      }

      // Atualizar vagas disponíveis
      if (eventData.vagas_disponiveis) {
        await supabase
          .from('eventos')
          .update({ vagas_disponiveis: eventData.vagas_disponiveis - 1 })
          .eq('id', eventId);
      }

      // Enviar notificação de inscrição (email e in-app)
      try {
        await supabase.functions.invoke('send-registration-notification', {
          body: {
            userId: user.id,
            type: 'event',
            itemId: eventId,
            itemTitle: eventData.titulo,
            itemDate: eventData.data_inicio,
            itemLocal: eventData.local
          }
        });
      } catch (notifError) {
        console.error('Erro ao enviar notificação:', notifError);
        // Não falha a inscrição se a notificação falhar
      }

      toast({
        title: "✅ Reserva confirmada!",
        description: `Sua vaga em "${eventData.titulo}" foi reservada com sucesso.`,
        className: "bg-green-50 border-green-200",
      });

      fetchEventsWithRegistrations();
      return true;
    } catch (error: any) {
      console.error('Erro ao reservar vaga:', error);
      toast({
        title: "Erro ao reservar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelRegistration = async (eventId: string) => {
    if (!user) return false;

    try {
      // Buscar título do evento
      const { data: eventData } = await supabase
        .from('eventos')
        .select('titulo, vagas_disponiveis')
        .eq('id', eventId)
        .single();

      // Deletar inscrição
      const { error: deleteError } = await supabase
        .from('inscricoes_eventos')
        .delete()
        .eq('evento_id', eventId)
        .eq('usuario_id', user.id);

      if (deleteError) throw deleteError;

      // Atualizar vagas disponíveis
      if (eventData && eventData.vagas_disponiveis !== null) {
        await supabase
          .from('eventos')
          .update({ vagas_disponiveis: eventData.vagas_disponiveis + 1 })
          .eq('id', eventId);
      }

      toast({
        title: "Reserva cancelada",
        description: eventData ? `Sua reserva em "${eventData.titulo}" foi cancelada.` : "Reserva cancelada com sucesso.",
        className: "bg-orange-50 border-orange-200",
      });

      fetchEventsWithRegistrations();
      return true;
    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error);
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEventsWithRegistrations();

    // Configurar realtime para sincronização
    const channel = supabase
      .channel('eventos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        () => {
          fetchEventsWithRegistrations();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inscricoes_eventos' },
        () => {
          fetchEventsWithRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    events,
    loading,
    registerForEvent,
    cancelRegistration,
    refetch: fetchEventsWithRegistrations,
  };
};
