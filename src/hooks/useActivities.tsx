import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  evento_id: string | null;
  titulo: string;
  descricao: string | null;
  tipo: string | null;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  palestrante: string | null;
  palestrante_bio: string | null;
  capacidade_maxima: number | null;
  vagas_disponiveis: number | null;
  carga_horaria: number | null;
}

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Erro ao carregar atividades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return { activities, loading, refetch: fetchActivities };
};
