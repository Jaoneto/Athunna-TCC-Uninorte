import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HistoryItem {
  id: string;
  title: string;
  type: 'workshop' | 'oficina' | 'palestra' | 'evento';
  date: string;
  duration: number;
  location: string | null;
  instructor: string | null;
  status: 'completed' | 'in-progress' | 'cancelled';
  rating?: number;
  complementaryHours: number;
  certificateId?: string;
  eventId?: string;
  activityId?: string;
}

export const useStudentHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return { items: [], totalHours: 0, completedCount: 0, certificatesCount: 0, averageRating: 0 };

      // Fetch activity participations
      const { data: participations, error: partError } = await supabase
        .from('participacoes_atividades')
        .select(`
          id,
          presenca,
          avaliacao,
          atividade_id,
          atividades (
            id,
            titulo,
            tipo,
            data_inicio,
            data_fim,
            local,
            palestrante,
            carga_horaria,
            evento_id
          )
        `)
        .eq('usuario_id', user.id);

      if (partError) {
        console.error('Error fetching participations:', partError);
        throw partError;
      }

      // Fetch event registrations
      const { data: eventRegistrations, error: eventError } = await supabase
        .from('inscricoes_eventos')
        .select(`
          id,
          status,
          presenca_confirmada,
          evento_id,
          eventos (
            id,
            titulo,
            tipo,
            data_inicio,
            data_fim,
            local
          )
        `)
        .eq('usuario_id', user.id);

      if (eventError) {
        console.error('Error fetching event registrations:', eventError);
        throw eventError;
      }

      // Fetch certificates for this user
      const { data: certificates, error: certError } = await supabase
        .from('certificados')
        .select('id, evento_id, atividade_id')
        .eq('usuario_id', user.id);

      if (certError) {
        console.error('Error fetching certificates:', certError);
      }

      const items: HistoryItem[] = [];

      // Process activity participations
      if (participations) {
        for (const part of participations) {
          const activity = part.atividades as any;
          if (!activity) continue;

          const certificate = certificates?.find(c => c.atividade_id === activity.id);
          
          // Determine status based on presence and date
          const now = new Date();
          const activityDate = new Date(activity.data_inicio);
          let status: 'completed' | 'in-progress' | 'cancelled' = 'in-progress';
          
          if (part.presenca) {
            status = 'completed';
          } else if (activityDate < now) {
            status = 'cancelled'; // Past activity without presence = absent
          }

          items.push({
            id: part.id,
            title: activity.titulo,
            type: (activity.tipo?.toLowerCase() || 'oficina') as any,
            date: activity.data_inicio,
            duration: activity.carga_horaria || 1,
            location: activity.local,
            instructor: activity.palestrante,
            status,
            rating: part.avaliacao || undefined,
            complementaryHours: part.presenca ? (activity.carga_horaria || 1) : 0,
            certificateId: certificate?.id,
            activityId: activity.id,
            eventId: activity.evento_id
          });
        }
      }

      // Process event registrations (only events without activities already added)
      if (eventRegistrations) {
        for (const reg of eventRegistrations) {
          const event = reg.eventos as any;
          if (!event) continue;

          // Skip if we already have activities from this event
          const hasActivitiesFromEvent = items.some(item => item.eventId === event.id);
          if (hasActivitiesFromEvent) continue;

          const certificate = certificates?.find(c => c.evento_id === event.id);
          
          // Determine status
          const now = new Date();
          const eventDate = new Date(event.data_inicio);
          let status: 'completed' | 'in-progress' | 'cancelled' = 'in-progress';
          
          if (reg.presenca_confirmada) {
            status = 'completed';
          } else if (reg.status === 'cancelada') {
            status = 'cancelled';
          } else if (eventDate < now) {
            status = reg.presenca_confirmada ? 'completed' : 'in-progress';
          }

          // Calculate duration from dates
          let duration = 1;
          if (event.data_fim && event.data_inicio) {
            const start = new Date(event.data_inicio);
            const end = new Date(event.data_fim);
            duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
          }

          items.push({
            id: reg.id,
            title: event.titulo,
            type: 'evento',
            date: event.data_inicio,
            duration,
            location: event.local,
            instructor: null,
            status,
            complementaryHours: reg.presenca_confirmada ? duration : 0,
            certificateId: certificate?.id,
            eventId: event.id
          });
        }
      }

      // Sort by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate stats
      const completedItems = items.filter(i => i.status === 'completed');
      const totalHours = completedItems.reduce((sum, i) => sum + i.complementaryHours, 0);
      const completedCount = completedItems.length;
      const certificatesCount = items.filter(i => i.certificateId).length;
      
      const ratings = items.filter(i => i.rating).map(i => i.rating!);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;

      return {
        items,
        totalHours,
        completedCount,
        certificatesCount,
        averageRating: Math.round(averageRating * 10) / 10
      };
    },
    enabled: !!user?.id,
  });
};
