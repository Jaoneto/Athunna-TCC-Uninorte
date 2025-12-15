import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Mail, CheckCircle, XCircle, Calendar } from "lucide-react";
import type { EventRegistration } from '@/hooks/useEventRegistrationsData';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface EventParticipantsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  registrations: EventRegistration[];
}

const EventParticipantsDialog: React.FC<EventParticipantsDialogProps> = ({
  isOpen,
  onClose,
  eventTitle,
  registrations
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Participantes - {eventTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total de inscritos: <span className="font-bold text-gray-900">{registrations.length}</span>
            </p>
          </div>

          {registrations.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {registration.usuarios?.nome_completo || 'Nome não disponível'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="w-4 h-4" />
                        <span>{registration.usuarios?.email || 'Email não disponível'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Inscrito em: {format(parseISO(registration.data_inscricao), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
                      </div>
                    </div>
                    <div>
                      {registration.presenca_confirmada ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Presente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Ausente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              Nenhum participante inscrito ainda
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventParticipantsDialog;
