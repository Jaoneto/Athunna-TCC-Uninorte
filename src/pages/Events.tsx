import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEvents } from '@/hooks/useEvents';
import { EventQRCode } from '@/components/EventQRCode';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
  color: string;
}

const Events: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { events: dbEvents, loading } = useEvents();

  // Converter eventos do banco para formato do calendário
  const events: Event[] = useMemo(() => {
    return dbEvents.map(event => ({
      id: event.id,
      title: event.titulo,
      date: parseISO(event.data_inicio),
      type: event.tipo,
      color: event.tipo === 'workshop' ? '#5D5FEF' : 
             event.tipo === 'palestra' ? '#4CAF50' : 
             event.tipo === 'oficina' ? '#FF9800' :
             event.tipo === 'minicurso' ? '#9C27B0' : '#E91E63'
    }));
  }, [dbEvents]);

  // Dias do mês atual
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Pega o primeiro dia da semana (domingo = 0, segunda = 1, etc.)
  const firstDayOfMonth = startOfMonth(currentDate).getDay();

  // Mês anterior
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  // Próximo mês
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  // Filtra eventos por dia
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cronograma</h1>
        <Link to="/new-event">
          <Button className="flex items-center gap-2 bg-[#5D5FEF] hover:bg-[#4A4AE3]">
            <Plus size={18} />
            <span className={cn(!isMobile && "ml-1")}>
              {isMobile ? "Adicionar" : "Novo Evento"}
            </span>
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cabeçalho do calendário */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: pt })}
            </h2>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={view === 'month' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setView('month')}
              className={view === 'month' ? 'bg-[#5D5FEF] hover:bg-[#4A4AE3]' : ''}
            >
              Mês
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-[#5D5FEF] hover:bg-[#4A4AE3]' : ''}
            >
              Semana
            </Button>
            <Button 
              variant={view === 'day' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setView('day')}
              className={view === 'day' ? 'bg-[#5D5FEF] hover:bg-[#4A4AE3]' : ''}
            >
              Dia
            </Button>
          </div>
        </div>
        
        {/* Visualização mensal */}
        {view === 'month' && (
          <div>
            {/* Dias da semana */}
            <div className="grid grid-cols-7 text-center border-b">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                <div key={index} className="py-2 text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid de dias */}
            <div className="grid grid-cols-7 divide-x divide-y">
              {/* Espaços em branco antes do primeiro dia do mês */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-28 p-2 bg-gray-50" />
              ))}
              
              {/* Dias do mês atual */}
              {daysInMonth.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "h-28 p-2 relative overflow-y-auto transition-colors",
                      isToday && "bg-blue-50"
                    )}
                  >
                    <span className={cn(
                      "inline-flex w-6 h-6 items-center justify-center text-sm rounded-full",
                      isToday && "bg-[#5D5FEF] text-white"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Eventos do dia */}
                    <div className="mt-1 space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:bg-gray-50 group"
                          style={{ backgroundColor: `${event.color}20`, borderLeft: `3px solid ${event.color}` }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate flex-1">{event.title}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <EventQRCode eventId={event.id} eventTitle={event.title} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Visualizações de semana e dia */}
        {view === 'week' && (
          <div className="p-8 text-center text-gray-500">
            Visualização semanal será implementada em breve
          </div>
        )}
        
        {view === 'day' && (
          <div className="p-8 text-center text-gray-500">
            Visualização diária será implementada em breve
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
