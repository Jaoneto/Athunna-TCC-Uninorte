import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, Linkedin, Link as LinkIcon, Copy } from 'lucide-react';
import { CertificateData } from '@/hooks/useCertificates';
import { useToast } from '@/hooks/use-toast';

interface ShareCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateData | null;
  studentName: string;
}

export const ShareCertificateDialog: React.FC<ShareCertificateDialogProps> = ({
  open,
  onOpenChange,
  certificate,
  studentName,
}) => {
  const { toast } = useToast();

  if (!certificate) return null;

  const title = certificate.evento?.titulo || certificate.atividade?.titulo || 'Certificado';
  const validationUrl = `${window.location.origin}/validar/${certificate.codigo_verificacao}`;
  const encodedUrl = encodeURIComponent(validationUrl);
  
  const shareText = `Certificado de ${certificate.tipo}: "${title}"\n` +
    `Concluído por: ${studentName}\n` +
    `Carga horária: ${certificate.carga_horaria}h\n` +
    `Data: ${new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}\n` +
    `Validar certificado: ${validationUrl}`;

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Certificado - ${title}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: 'Email aberto',
      description: 'Cliente de email foi aberto com as informações do certificado.',
    });
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    
    toast({
      title: 'WhatsApp aberto',
      description: 'Compartilhe seu certificado via WhatsApp.',
    });
  };

  const handleShareLinkedIn = () => {
    const linkedInText = encodeURIComponent(
      `Tenho o prazer de compartilhar que concluí: ${title}\n\n` +
      `📚 ${certificate.tipo}\n` +
      `⏱️ ${certificate.carga_horaria}h de carga horária\n` +
      `📅 ${new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}\n\n` +
      `Certificado validável em: ${validationUrl}`
    );
    
    // LinkedIn não suporta pre-fill de texto, mas podemos abrir o dialog de compartilhamento
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=600,height=600'
    );
    
    toast({
      title: 'LinkedIn aberto',
      description: 'Compartilhe seu certificado profissional no LinkedIn.',
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(validationUrl);
      toast({
        title: 'Link copiado! 📋',
        description: 'Link de validação copiado para área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyInfo = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Informações copiadas! 📋',
        description: 'Todas as informações do certificado foram copiadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar as informações.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Certificado</DialogTitle>
          <DialogDescription>
            Escolha como deseja compartilhar seu certificado profissional
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Professional Platforms */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Plataformas Profissionais
            </h3>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleShareLinkedIn}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0A66C2] text-white">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">LinkedIn</div>
                <div className="text-xs text-muted-foreground">
                  Compartilhe em sua rede profissional
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleShareEmail}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700 text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Email</div>
                <div className="text-xs text-muted-foreground">
                  Envie por email com informações completas
                </div>
              </div>
            </Button>
          </div>

          {/* Messaging Apps */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Mensagens
            </h3>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleShareWhatsApp}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#25D366] text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-xs text-muted-foreground">
                  Compartilhe via WhatsApp
                </div>
              </div>
            </Button>
          </div>

          {/* Copy Options */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Copiar
            </h3>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleCopyLink}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Copiar Link</div>
                <div className="text-xs text-muted-foreground">
                  Link direto para validação
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleCopyInfo}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-500 text-white">
                <Copy className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Copiar Informações</div>
                <div className="text-xs text-muted-foreground">
                  Todas as informações do certificado
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="border-t pt-4">
          <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
            <div className="font-medium">{title}</div>
            <div className="text-muted-foreground">
              {certificate.tipo} • {certificate.carga_horaria}h • {' '}
              {new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Código: {certificate.codigo_verificacao}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
