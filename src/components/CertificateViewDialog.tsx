import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Printer } from 'lucide-react';
import { CertificateTemplate } from './CertificateTemplate';
import { CertificateData } from '@/hooks/useCertificates';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateData | null;
  studentName: string;
}

export const CertificateViewDialog: React.FC<CertificateViewDialogProps> = ({
  open,
  onOpenChange,
  certificate,
  studentName,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!certificateRef.current || !certificate) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificado-${certificate.codigo_verificacao}.pdf`);

      toast({
        title: 'Download concluído',
        description: 'Certificado baixado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o certificado.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!certificate) return;

    const title = certificate.evento?.titulo || certificate.atividade?.titulo || 'Certificado';
    const validationUrl = `${window.location.origin}/validar/${certificate.codigo_verificacao}`;
    
    const shareText = `🎓 Certificado de ${certificate.tipo}\n\n` +
      `"${title}"\n\n` +
      `✓ ${certificate.carga_horaria}h certificadas\n` +
      `📅 ${new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}\n\n` +
      `🔍 Validar: ${validationUrl}\n` +
      `📋 Código: ${certificate.codigo_verificacao}`;

    // Try Web Share API first (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado - ${title}`,
          text: shareText,
        });
        
        toast({
          title: 'Compartilhado com sucesso! ✓',
          description: 'Certificado compartilhado.',
        });
        return;
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.log('Share error:', error);
        }
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Link copiado! 📋',
        description: 'Informações do certificado copiadas para área de transferência.',
      });
    } catch (error) {
      // Final fallback: Show info in toast
      toast({
        title: 'Código do certificado',
        description: certificate.codigo_verificacao,
        duration: 5000,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!certificate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-white z-10 border-b print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle>Certificado</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-8 flex justify-center bg-gray-50 print:p-0 print:bg-white">
          <div className="scale-90 origin-top print:scale-100" data-print-certificate>
            <CertificateTemplate
              ref={certificateRef}
              certificate={certificate}
              studentName={studentName}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
