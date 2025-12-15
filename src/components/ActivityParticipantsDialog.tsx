import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react";
import { ActivityRegistration, PublicRegistration } from '@/hooks/useActivityRegistrations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityParticipantsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  activityId: string;
  registrations: ActivityRegistration[];
  publicRegistrations?: PublicRegistration[];
  onRefetch?: () => void;
}

const ActivityParticipantsDialog: React.FC<ActivityParticipantsDialogProps> = ({
  isOpen,
  onClose,
  activityTitle,
  activityId,
  registrations,
  publicRegistrations = [],
  onRefetch
}) => {
  const { toast } = useToast();
  const [updatingPresence, setUpdatingPresence] = useState<string | null>(null);

  const presentCount = registrations.filter(r => r.presenca).length + 
    publicRegistrations.filter(r => r.presenca_confirmada).length;

  const handleTogglePresence = async (registrationId: string, currentPresence: boolean, isPublic: boolean = false, usuarioId?: string) => {
    setUpdatingPresence(registrationId);
    try {
      if (isPublic) {
        const { error } = await supabase
          .from('inscricoes_publicas')
          .update({ status: currentPresence ? 'confirmada' : 'presente' })
          .eq('id', registrationId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('participacoes_atividades')
          .update({ presenca: !currentPresence })
          .eq('id', registrationId);
        if (error) throw error;
      }
      
      // Se marcou como presente (não é isPublic e tem usuarioId), gera certificado automaticamente
      if (!currentPresence && !isPublic && usuarioId) {
        try {
          const { data, error: certError } = await supabase.functions.invoke('generate-certificates', {
            body: { 
              atividade_id: activityId,
              usuario_id: usuarioId
            },
          });

          if (certError) {
            console.error('Erro ao gerar certificado:', certError);
            toast({
              title: "Presença confirmada",
              description: "Porém houve um erro ao gerar o certificado. Tente novamente.",
              variant: "destructive",
            });
          } else if (data?.generated > 0) {
            toast({
              title: "Presença confirmada e certificado gerado!",
              description: "O certificado já está disponível para o aluno.",
            });
          } else {
            toast({
              title: "Presença confirmada",
              description: data?.message === "All certificates already exist or participants need accounts" 
                ? "Certificado já havia sido gerado anteriormente."
                : "Status atualizado com sucesso.",
            });
          }
        } catch (certError: any) {
          console.error('Erro ao gerar certificado:', certError);
          toast({
            title: "Presença confirmada",
            description: "Porém houve um erro ao gerar o certificado.",
          });
        }
      } else if (currentPresence && !isPublic && usuarioId) {
        // Se marcou como ausente, revoga o certificado
        try {
          const { error: deleteError } = await supabase
            .from('certificados')
            .delete()
            .eq('atividade_id', activityId)
            .eq('usuario_id', usuarioId);

          if (deleteError) {
            console.error('Erro ao revogar certificado:', deleteError);
            toast({
              title: "Presença removida",
              description: "Porém houve um erro ao revogar o certificado.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Presença removida e certificado revogado",
              description: "O certificado foi removido do histórico do aluno.",
            });
          }
        } catch (deleteError: any) {
          console.error('Erro ao revogar certificado:', deleteError);
          toast({
            title: "Presença removida",
            description: "Porém houve um erro ao revogar o certificado.",
          });
        }
      } else {
        toast({
          title: currentPresence ? "Presença removida" : "Presença confirmada",
          description: `Status atualizado com sucesso.`,
        });
      }
      
      onRefetch?.();
    } catch (error: any) {
      console.error('Erro ao atualizar presença:', error);
      toast({
        title: "Erro ao atualizar presença",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingPresence(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Participantes - {activityTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Total de inscritos: <span className="font-bold text-foreground">{registrations.length + publicRegistrations.length}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Presentes: <span className="font-bold text-green-600">{presentCount}</span>
            </p>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Clique no badge de presença para alternar entre "Ausente" e "Presente"
          </p>

          {(registrations.length > 0 || publicRegistrations.length > 0) ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {/* Participantes cadastrados no sistema */}
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {registration.usuarios?.nome_completo || 'Nome não disponível'}
                        </span>
                        <Badge variant="secondary" className="text-xs">Cadastrado</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{registration.usuarios?.email || 'Email não disponível'}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updatingPresence === registration.id}
                      onClick={() => handleTogglePresence(registration.id, registration.presenca, false, registration.usuario_id)}
                      className="p-0 h-auto"
                    >
                      {updatingPresence === registration.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : registration.presenca ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Presente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="hover:bg-muted cursor-pointer flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Ausente
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {/* Participantes inscritos presencialmente (QR Code) */}
              {publicRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors border-dashed"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {registration.nome_completo}
                        </span>
                        <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                          Presencial
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{registration.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updatingPresence === registration.id}
                      onClick={() => handleTogglePresence(registration.id, registration.presenca_confirmada, true)}
                      className="p-0 h-auto"
                    >
                      {updatingPresence === registration.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : registration.presenca_confirmada ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Presente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="hover:bg-muted cursor-pointer flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Ausente
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum participante inscrito ainda
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityParticipantsDialog;