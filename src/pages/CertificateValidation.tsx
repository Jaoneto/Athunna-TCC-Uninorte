import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, XCircle, Search, Calendar, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CertificateData {
  id: string;
  codigo_verificacao: string;
  data_emissao: string;
  carga_horaria: number | null;
  tipo: string | null;
  usuarios: {
    nome_completo: string;
  };
  eventos?: {
    titulo: string;
    data_inicio: string;
    instituicoes?: {
      nome: string;
      sigla: string | null;
    };
  };
  atividades?: {
    titulo: string;
    data_inicio: string;
    eventos?: {
      instituicoes?: {
        nome: string;
        sigla: string | null;
      };
    };
  };
}

const CertificateValidation = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState(codigo || searchParams.get('codigo') || '');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCertificate = async (code: string) => {
    if (!code.trim()) {
      setError('Por favor, insira um código de verificação');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);
    setValidated(false);

    try {
      const { data, error: fetchError } = await supabase
        .from('certificados')
        .select(`
          id,
          codigo_verificacao,
          data_emissao,
          carga_horaria,
          tipo,
          usuarios!inner (
            nome_completo
          ),
          eventos (
            titulo,
            data_inicio,
            instituicoes (
              nome,
              sigla
            )
          ),
          atividades (
            titulo,
            data_inicio,
            eventos (
              instituicoes (
                nome,
                sigla
              )
            )
          )
        `)
        .eq('codigo_verificacao', code.toUpperCase().trim())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setCertificate(data as CertificateData);
        setValidated(true);
      } else {
        setError('Código de verificação inválido ou certificado não encontrado');
      }
    } catch (err) {
      console.error('Erro ao validar certificado:', err);
      setError('Erro ao validar certificado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codigo) {
      validateCertificate(codigo);
    }
  }, [codigo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateCertificate(verificationCode);
  };

  const getInstitution = () => {
    if (certificate?.eventos?.instituicoes) {
      return certificate.eventos.instituicoes;
    }
    if (certificate?.atividades?.eventos?.instituicoes) {
      return certificate.atividades.eventos.instituicoes;
    }
    return null;
  };

  const getEventTitle = () => {
    if (certificate?.eventos) {
      return certificate.eventos.titulo;
    }
    if (certificate?.atividades) {
      return `${certificate.atividades.titulo}`;
    }
    return 'Evento não especificado';
  };

  const getEventDate = () => {
    if (certificate?.eventos) {
      return certificate.eventos.data_inicio;
    }
    if (certificate?.atividades) {
      return certificate.atividades.data_inicio;
    }
    return null;
  };

  const institution = getInstitution();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Validação de Certificado</CardTitle>
          <CardDescription className="text-base">
            Verifique a autenticidade de certificados emitidos pela plataforma
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Digite o código de verificação"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              className="flex-1 font-mono text-lg"
              maxLength={50}
            />
            <Button type="submit" disabled={loading} size="lg">
              <Search className="h-5 w-5 mr-2" />
              Validar
            </Button>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Validando certificado...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-destructive mb-2">Certificado Inválido</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Success State */}
          {validated && certificate && !loading && (
            <div className="space-y-6">
              {/* Validation Badge */}
              <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <Badge className="bg-green-600 hover:bg-green-700 text-white text-lg px-4 py-2">
                  <Shield className="h-5 w-5 mr-2" />
                  Certificado Autêntico
                </Badge>
                <p className="mt-4 text-sm text-muted-foreground">
                  Este certificado foi verificado e é válido
                </p>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4 border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Informações do Certificado
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Participante</p>
                    <p className="text-lg font-semibold">{certificate.usuarios.nome_completo}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Evento/Atividade</p>
                    <p className="text-lg font-semibold">{getEventTitle()}</p>
                    {certificate.tipo && (
                      <Badge variant="outline" className="mt-1">
                        {certificate.tipo}
                      </Badge>
                    )}
                  </div>

                  {institution && (
                    <div>
                      <p className="text-sm text-muted-foreground">Instituição</p>
                      <p className="text-lg font-semibold">
                        {institution.nome}
                        {institution.sigla && ` (${institution.sigla})`}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {certificate.data_emissao && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Emissão</p>
                          <p className="font-medium">
                            {format(new Date(certificate.data_emissao), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )}

                    {certificate.carga_horaria && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Carga Horária</p>
                          <p className="font-medium">{certificate.carga_horaria}h</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Código de Verificação</p>
                    <p className="font-mono text-sm font-semibold text-primary">
                      {certificate.codigo_verificacao}
                    </p>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Imprimir Comprovante de Validação
              </Button>
            </div>
          )}

          {/* Instructions */}
          {!validated && !loading && !error && (
            <div className="text-center text-muted-foreground text-sm space-y-2">
              <p>Digite o código de verificação que aparece no certificado</p>
              <p className="text-xs">ou escaneie o QR Code presente no documento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateValidation;