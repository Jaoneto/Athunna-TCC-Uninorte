import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventRegistration {
  id: string;
  usuario_id: string;
  evento_id: string;
  status: string;
  data_inscricao: string;
  presenca_confirmada: boolean;
  usuarios: {
    nome_completo: string;
    email: string;
  };
}

export interface EventWithRegistrationsData {
  eventId: string;
  registrations: EventRegistration[];
  count: number;
}

export const useEventRegistrationsData = (eventIds?: string[]) => {
  const [registrations, setRegistrations] = useState<Record<string, EventWithRegistrationsData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('inscricoes_eventos')
        .select(`
          id,
          usuario_id,
          evento_id,
          status,
          data_inscricao,
          presenca_confirmada,
          usuarios:usuario_id (
            nome_completo,
            email
          )
        `)
        .eq('status', 'confirmada');

      if (eventIds && eventIds.length > 0) {
        query = query.in('evento_id', eventIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por evento
      const grouped: Record<string, EventWithRegistrationsData> = {};
      
      (data || []).forEach((reg: any) => {
        const eventId = reg.evento_id;
        if (!grouped[eventId]) {
          grouped[eventId] = {
            eventId,
            registrations: [],
            count: 0
          };
        }
        grouped[eventId].registrations.push(reg);
        grouped[eventId].count++;
      });

      setRegistrations(grouped);
    } catch (error: any) {
      console.error('Erro ao carregar inscrições:', error);
      toast({
        title: "Erro ao carregar inscrições",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    // Realtime updates
    const channel = supabase
      .channel('inscricoes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inscricoes_eventos' },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventIds?.join(',')]);

  return {
    registrations,
    loading,
    refetch: fetchRegistrations,
    getRegistrationsForEvent: (eventId: string) => registrations[eventId] || { eventId, registrations: [], count: 0 }
  };
};
