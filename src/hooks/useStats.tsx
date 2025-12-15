import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalStudents: number;
  totalProfessors: number;
  totalBeneficiaries: number;
  totalActivities: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalProfessors: 0,
    totalBeneficiaries: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Total de estudantes
        const { count: studentsCount } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_perfil', 'estudante');

        // Total de professores
        const { count: professorsCount } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_perfil', 'professor');

        // Total de inscrições (beneficiários)
        const { count: beneficiariesCount } = await supabase
          .from('inscricoes_eventos')
          .select('*', { count: 'exact', head: true });

        // Total de atividades
        const { count: activitiesCount } = await supabase
          .from('atividades')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalStudents: studentsCount || 0,
          totalProfessors: professorsCount || 0,
          totalBeneficiaries: beneficiariesCount || 0,
          totalActivities: activitiesCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
