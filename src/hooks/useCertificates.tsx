import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
  id: string;
  codigo_verificacao: string;
  tipo: string;
  carga_horaria: number;
  data_emissao: string;
  url_pdf: string | null;
  usuario_id: string;
  evento?: {
    id: string;
    titulo: string;
    data_inicio: string;
    data_fim: string | null;
    local: string | null;
    tipo: string;
  } | null;
  atividade?: {
    id: string;
    titulo: string;
    palestrante: string | null;
    data_inicio: string;
    data_fim: string | null;
    local: string | null;
    tipo: string;
  } | null;
  instituicao?: {
    id: string;
    nome: string;
    sigla: string | null;
    logo_url?: string | null;
  } | null;
}

export const useCertificates = (userId?: string) => {
  return useQuery({
    queryKey: ['certificates', userId],
    queryFn: async () => {
      // Get current user if no userId provided
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }

      if (!targetUserId) {
        return [];
      }

      const { data: certificates, error } = await supabase
        .from('certificados')
        .select(`
          id,
          codigo_verificacao,
          tipo,
          carga_horaria,
          data_emissao,
          url_pdf,
          usuario_id,
          evento_id,
          atividade_id
        `)
        .eq('usuario_id', targetUserId)
        .order('data_emissao', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }

      if (!certificates || certificates.length === 0) {
        return [];
      }

      // Fetch related data for each certificate
      const certificatesWithDetails = await Promise.all(
        certificates.map(async (cert) => {
          let evento = null;
          let atividade = null;
          let instituicao = null;

          // Fetch event data if evento_id exists
          if (cert.evento_id) {
            const { data: eventoData } = await supabase
              .from('eventos')
              .select('id, titulo, data_inicio, data_fim, local, tipo, instituicao_id')
              .eq('id', cert.evento_id)
              .single();
            
            if (eventoData) {
              evento = {
                id: eventoData.id,
                titulo: eventoData.titulo,
                data_inicio: eventoData.data_inicio,
                data_fim: eventoData.data_fim,
                local: eventoData.local,
                tipo: eventoData.tipo
              };

              // Fetch institution from event
              if (eventoData.instituicao_id) {
                const { data: instData } = await supabase
                  .from('instituicoes')
                  .select('id, nome, sigla')
                  .eq('id', eventoData.instituicao_id)
                  .single();
                
                if (instData) {
                  instituicao = instData;
                }
              }
            }
          }

          // Fetch activity data if atividade_id exists
          if (cert.atividade_id) {
            const { data: atividadeData } = await supabase
              .from('atividades')
              .select('id, titulo, palestrante, data_inicio, data_fim, local, tipo, evento_id')
              .eq('id', cert.atividade_id)
              .single();
            
            if (atividadeData) {
              atividade = {
                id: atividadeData.id,
                titulo: atividadeData.titulo,
                palestrante: atividadeData.palestrante,
                data_inicio: atividadeData.data_inicio,
                data_fim: atividadeData.data_fim,
                local: atividadeData.local,
                tipo: atividadeData.tipo
              };

              // If no event data yet, try to get institution from activity's event
              if (!instituicao && atividadeData.evento_id) {
                const { data: eventoData } = await supabase
                  .from('eventos')
                  .select('instituicao_id')
                  .eq('id', atividadeData.evento_id)
                  .single();

                if (eventoData?.instituicao_id) {
                  const { data: instData } = await supabase
                    .from('instituicoes')
                    .select('id, nome, sigla')
                    .eq('id', eventoData.instituicao_id)
                    .single();
                  
                  if (instData) {
                    instituicao = instData;
                  }
                }
              }
            }
          }

          // Default institution if none found
          if (!instituicao) {
            instituicao = {
              id: 'default',
              nome: 'Athunna',
              sigla: 'ATH'
            };
          }

          return {
            id: cert.id,
            codigo_verificacao: cert.codigo_verificacao,
            tipo: cert.tipo || 'Participação',
            carga_horaria: cert.carga_horaria || 1,
            data_emissao: cert.data_emissao,
            url_pdf: cert.url_pdf,
            usuario_id: cert.usuario_id,
            evento,
            atividade,
            instituicao
          } as CertificateData;
        })
      );

      return certificatesWithDetails;
    },
    enabled: true,
  });
};
