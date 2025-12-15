import React, { useEffect, useState } from 'react';
import { Award, Calendar, Shield } from 'lucide-react';
import { CertificateData } from '@/hooks/useCertificates';
import QRCode from 'qrcode';

interface CertificateTemplateProps {
  certificate: CertificateData;
  studentName: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, studentName }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const eventOrActivity = certificate.evento || certificate.atividade;
    const title = eventOrActivity?.titulo || 'Atividade Acadêmica';
    const instituicaoNome = certificate.instituicao?.nome || 'Athunna';
    const instituicaoSigla = certificate.instituicao?.sigla || 'ATH';

    useEffect(() => {
      const generateQRCode = async () => {
        try {
          const validationUrl = `${window.location.origin}/validar/${certificate.codigo_verificacao}`;
          const qrDataUrl = await QRCode.toDataURL(validationUrl, {
            width: 120,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qrDataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };

      generateQRCode();
    }, [certificate.codigo_verificacao]);

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    return (
      <div 
        ref={ref}
        className="w-[210mm] h-[297mm] bg-white p-16 relative overflow-hidden print:shadow-none shadow-2xl"
        style={{
          fontFamily: "'Times New Roman', serif",
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-4 border-8 border-double border-primary/20" />
        
        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary/30" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary/30" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary/30" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary/30" />

        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="flex justify-center mb-6">
            <Award className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-2 tracking-wide">
            CERTIFICADO
          </h1>
          <div className="h-1 w-32 bg-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground italic">{instituicaoNome}</p>
          {instituicaoSigla && (
            <p className="text-sm text-muted-foreground">{instituicaoSigla}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-8 text-center relative z-10">
          <p className="text-xl text-foreground">
            Certificamos que
          </p>
          
          <h2 className="text-4xl font-bold text-foreground py-4 border-b-2 border-t-2 border-primary/30">
            {studentName}
          </h2>
          
          <p className="text-xl text-foreground leading-relaxed px-8">
            participou com êxito do(a) <strong>{certificate.tipo}</strong>
          </p>
          
          <h3 className="text-3xl font-bold text-primary px-8">
            "{title}"
          </h3>
          
          {eventOrActivity?.local && (
            <p className="text-lg text-muted-foreground">
              Realizado em {eventOrActivity.local}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span>
              {formatDate(certificate.data_emissao)}
            </span>
          </div>
          
          <p className="text-lg text-foreground">
            Com carga horária de <strong>{certificate.carga_horaria} horas</strong>
          </p>
        </div>

        {/* Footer with QR Code */}
        <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end">
          <div className="text-center flex-1">
            <div className="h-px bg-border mb-2" />
            <p className="text-sm text-muted-foreground">Coordenação Acadêmica</p>
            <p className="text-xs text-muted-foreground">{instituicaoNome}</p>
          </div>
          
          {/* QR Code for validation */}
          <div className="flex flex-col items-center justify-center px-8">
            {qrCodeUrl && (
              <div className="bg-white p-2 rounded border-2 border-gray-300">
                <img src={qrCodeUrl} alt="QR Code de Validação" className="w-24 h-24" />
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground text-center">
              <Shield className="w-3 h-3 inline mr-1" />
              <span>Validar certificado</span>
            </div>
          </div>
          
          <div className="text-center flex-1">
            <div className="h-px bg-border mb-2" />
            <p className="text-sm text-muted-foreground">Direção</p>
            <p className="text-xs text-muted-foreground">{instituicaoNome}</p>
          </div>
        </div>

        {/* Certificate code */}
        <div className="absolute bottom-6 left-16 right-16 text-center text-xs text-muted-foreground">
          <span>Código: <strong>{certificate.codigo_verificacao}</strong></span>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
