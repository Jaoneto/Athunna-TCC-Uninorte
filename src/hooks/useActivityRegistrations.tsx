import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActivityRegistration {
  id: string;
  usuario_id: string;
  atividade_id: string;
  presenca: boolean;
  created_at: string;
  usuarios: {
    nome_completo: string;
    email: string;
  };
}

export interface PublicRegistration {
  id: string;
  evento_id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  tipo_vinculo: string;
  status: string;
  presenca_confirmada: boolean;
  created_at: string;
}

export interface ActivityWithRegistrations {
  activityId: string;
  registrations: ActivityRegistration[];
  publicRegistrations: PublicRegistration[];
  count: number;
}

export const useActivityRegistrations = (activityIds?: string[], eventoId?: string) => {
  const [registrations, setRegistrations] = useState<Record<string, ActivityWithRegistrations>>({});
  const [publicRegistrations, setPublicRegistrations] = useState<PublicRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      
      // Fetch system registrations
      let query = supabase
        .from('participacoes_atividades')
        .select(`
          id,
          usuario_id,
          atividade_id,
          presenca,
          created_at,
          usuarios:usuario_id (
            nome_completo,
            email
          )
        `);

      if (activityIds && activityIds.length > 0) {
        query = query.in('atividade_id', activityIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por atividade
      const grouped: Record<string, ActivityWithRegistrations> = {};
      
      (data || []).forEach((reg: any) => {
        const activityId = reg.atividade_id;
        if (!grouped[activityId]) {
          grouped[activityId] = {
            activityId,
            registrations: [],
            publicRegistrations: [],
            count: 0
          };
        }
        grouped[activityId].registrations.push(reg);
        grouped[activityId].count++;
      });

      setRegistrations(grouped);

      // Fetch public registrations if eventoId is provided
      if (eventoId) {
        const { data: publicData, error: publicError } = await supabase
          .from('inscricoes_publicas')
          .select('*')
          .eq('evento_id', eventoId);

        if (publicError) {
          console.error('Erro ao carregar inscrições públicas:', publicError);
        } else {
          const mappedPublicData = (publicData || []).map(reg => ({
            ...reg,
            presenca_confirmada: reg.status === 'presente'
          }));
          setPublicRegistrations(mappedPublicData);
        }
      }
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
      .channel('participacoes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participacoes_atividades' },
        () => {
          fetchRegistrations();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inscricoes_publicas' },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activityIds?.join(','), eventoId]);

  return {
    registrations,
    publicRegistrations,
    loading,
    refetch: fetchRegistrations,
    getRegistrationsForActivity: (activityId: string) => registrations[activityId] || { activityId, registrations: [], publicRegistrations: [], count: 0 }
  };
};
