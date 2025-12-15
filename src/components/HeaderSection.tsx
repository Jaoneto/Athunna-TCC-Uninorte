
import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface HeaderSectionProps {
  userName: string;
  alerts: number;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ userName, alerts }) => {
  const isMobile = useIsMobile();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Bem-vindo, {userName}</h1>
          <p className="text-sm text-muted-foreground">
            Projeto Athunna - Março 2024
            {alerts > 0 && (
              <span className="ml-1">
                Você tem <span className="text-[#5D5FEF] font-medium">{alerts} notificações</span> pendentes!
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-200 text-sm">
          <span className="text-xs sm:text-sm font-medium mr-2">Março (2024)</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      <div 
        className="bg-[#E9EFFF] rounded-xl overflow-hidden cursor-pointer hover:bg-[#DDE6F7] transition-colors"
        onClick={() => setEventDialogOpen(true)}
      >
        <div className="py-6 px-8 flex items-start gap-4">
          <Calendar className="text-[#213157] flex-shrink-0" size={isMobile ? 24 : 28} />
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#213157]">DOWN DAY</h2>
            <h3 className="text-[#213157] text-base md:text-lg font-medium">Dia Internacional da Síndrome de Down</h3>
            <p className="text-sm text-[#213157]">21 de Março</p>
          </div>
        </div>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#213157]">DOWN DAY</DialogTitle>
            <DialogDescription className="text-gray-600">
              Dia Internacional da Síndrome de Down
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-700 mb-4">21 de Março</p>
            <div className="bg-[#F8F9FC] p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                O Dia Internacional da Síndrome de Down (WDSD) é comemorado anualmente em 21 de março. 
                A data foi selecionada para significar a triplicação (trissomia) do 21º cromossomo 
                que causa a síndrome de Down.
              </p>
              <p className="text-sm text-gray-700">
                Este dia é observado para aumentar a conscientização pública sobre a síndrome de Down 
                e para celebrar as contribuições das pessoas com síndrome de Down para nossas 
                comunidades e sociedade.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeaderSection;
