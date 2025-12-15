import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Clock, Users, Calendar as CalendarIcon, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from '@/hooks/useActivities';
import { useActivityRegistrations } from '@/hooks/useActivityRegistrations';
import ActivityParticipantsDialog from '@/components/ActivityParticipantsDialog';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import NewActivityDialog from '@/components/NewActivityDialog';

const Workshops = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<{ id: string; title: string } | null>(null);
  const { activities, loading, refetch } = useActivities();
  
  const activityIds = useMemo(() => activities.map(a => a.id), [activities]);
  const eventoId = useMemo(() => activities.find(a => a.tipo?.toLowerCase() === 'workshop')?.evento_id, [activities]);
  const { publicRegistrations, getRegistrationsForActivity, refetch: refetchRegistrations } = useActivityRegistrations(activityIds, eventoId);

  // Filtrar apenas workshops do banco de dados
  const filteredWorkshops = useMemo(() => {
    return activities
      .filter(activity => activity.tipo?.toLowerCase() === 'workshop')
      .map(activity => {
        const startDate = parseISO(activity.data_inicio);
        const endDate = activity.data_fim ? parseISO(activity.data_fim) : null;
        
        return {
          id: activity.id,
          title: activity.titulo,
          instructor: activity.palestrante || 'Instrutor não definido',
          date: format(startDate, 'dd/MM/yyyy', { locale: pt }),
          time: `${format(startDate, 'HH:mm')} - ${endDate ? format(endDate, 'HH:mm') : 'Sem fim'}`,
          participants: activity.capacidade_maxima ? (activity.capacidade_maxima - (activity.vagas_disponiveis || 0)) : 0,
          location: activity.local || 'Local não definido',
          description: activity.descricao || 'Sem descrição disponível',
          cargaHoraria: activity.carga_horaria,
          bio: activity.palestrante_bio
        };
      })
      .filter(workshop =>
        workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [activities, searchTerm]);

  const handleViewDetails = (workshop: any) => {
    setSelectedWorkshop(workshop);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Oficinas</h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar oficinas..." 
              className="pl-10 pr-4 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <NewActivityDialog onSuccess={refetch}>
            <Button className="bg-primary hover:bg-primary/90 shadow-athunna-sm transition-athunna">
              <Plus size={18} className="mr-2" /> Novo Workshop
            </Button>
          </NewActivityDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12 text-muted-foreground">
            Carregando workshops...
          </div>
        ) : filteredWorkshops.length > 0 ? (
          filteredWorkshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden glass-card hover:shadow-glass hover:scale-[1.02] transition-athunna border-border/50">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-foreground tracking-tight">{workshop.title}</h3>
                <div className="flex items-center text-muted-foreground mb-4">
                  <User size={16} className="mr-2" />
                  <span className="text-sm">{workshop.instructor}</span>
                </div>
                
                <div className="flex flex-col space-y-2 text-sm mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon size={16} className="mr-2" />
                    {workshop.date}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock size={16} className="mr-2" />
                    {workshop.time}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users size={16} className="mr-2" />
                    {getRegistrationsForActivity(workshop.id).count} inscritos
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin size={16} className="mr-2" />
                    {workshop.location}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-border/50 hover:bg-accent/50 transition-athunna"
                    onClick={() => setSelectedParticipants({ id: workshop.id, title: workshop.title })}
                  >
                    Participantes ({getRegistrationsForActivity(workshop.id).count})
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90 transition-athunna"
                    onClick={() => handleViewDetails(workshop)}
                  >
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-12 text-muted-foreground">
            Nenhum workshop encontrado
          </div>
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">{selectedWorkshop?.title}</DialogTitle>
          </DialogHeader>
          {selectedWorkshop && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Descrição</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedWorkshop.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Instrutor</h4>
                    <p className="text-muted-foreground">{selectedWorkshop.instructor}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Local</h4>
                    <p className="text-muted-foreground">{selectedWorkshop.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Data</h4>
                    <p className="text-muted-foreground">{selectedWorkshop.date}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                    <p className="text-muted-foreground">{selectedWorkshop.time}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Participantes</h4>
                    <p className="text-muted-foreground">{selectedWorkshop.participants} inscritos</p>
                  </div>
                  {selectedWorkshop.cargaHoraria && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Carga Horária</h4>
                      <p className="text-muted-foreground">{selectedWorkshop.cargaHoraria}h</p>
                    </div>
                  )}
                </div>

                {selectedWorkshop.bio && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Sobre o Instrutor</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedWorkshop.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Participantes */}
      {selectedParticipants && (
        <ActivityParticipantsDialog
          isOpen={!!selectedParticipants}
          onClose={() => setSelectedParticipants(null)}
          activityTitle={selectedParticipants.title}
          activityId={selectedParticipants.id}
          registrations={getRegistrationsForActivity(selectedParticipants.id).registrations}
          publicRegistrations={publicRegistrations}
          onRefetch={refetchRegistrations}
        />
      )}
    </div>
  );
};

export default Workshops;
