import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Clock, Users, Calendar as CalendarIcon, MapPin, User } from "lucide-react";
import { useActivities } from '@/hooks/useActivities';
import { useActivityRegistrations } from '@/hooks/useActivityRegistrations';
import ActivityParticipantsDialog from '@/components/ActivityParticipantsDialog';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import NewActivityDialog from '@/components/NewActivityDialog';

const Lectures = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<{ id: string; title: string } | null>(null);
  const { activities, loading, refetch } = useActivities();
  
  const activityIds = useMemo(() => activities.map(a => a.id), [activities]);
  const eventoId = useMemo(() => activities.find(a => a.tipo?.toLowerCase() === 'palestra')?.evento_id, [activities]);
  const { publicRegistrations, getRegistrationsForActivity, refetch: refetchRegistrations } = useActivityRegistrations(activityIds, eventoId);

  // Filtrar apenas palestras do banco de dados
  const filteredLectures = useMemo(() => {
    return activities
      .filter(activity => activity.tipo?.toLowerCase() === 'palestra')
      .map(activity => {
        const startDate = parseISO(activity.data_inicio);
        const endDate = activity.data_fim ? parseISO(activity.data_fim) : null;
        
        return {
          id: activity.id,
          title: activity.titulo,
          speaker: activity.palestrante || 'Palestrante não definido',
          date: format(startDate, 'dd/MM/yyyy', { locale: pt }),
          time: `${format(startDate, 'HH:mm')} - ${endDate ? format(endDate, 'HH:mm') : 'Sem fim'}`,
          participants: activity.capacidade_maxima ? (activity.capacidade_maxima - (activity.vagas_disponiveis || 0)) : 0,
          location: activity.local || 'Local não definido',
          description: activity.descricao || 'Sem descrição disponível',
          cargaHoraria: activity.carga_horaria,
          bio: activity.palestrante_bio
        };
      })
      .filter(lecture =>
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.speaker.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [activities, searchTerm]);

  const handleViewDetails = (lecture: any) => {
    setSelectedLecture(lecture);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0 text-foreground tracking-tight">Palestras</h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Buscar palestras..." 
              className="pl-10 pr-4 w-full glass-card border-border/50" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <NewActivityDialog onSuccess={refetch}>
            <Button className="bg-primary hover:bg-primary/90 shadow-athunna-sm transition-athunna">
              <Plus size={18} className="mr-2" /> Nova Palestra
            </Button>
          </NewActivityDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12 text-muted-foreground">
            Carregando palestras...
          </div>
        ) : filteredLectures.length > 0 ? (
          filteredLectures.map((lecture) => (
            <Card key={lecture.id} className="overflow-hidden glass-card hover:shadow-glass hover:scale-[1.02] transition-athunna border-border/50">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-foreground tracking-tight">{lecture.title}</h3>
                <div className="flex items-center text-muted-foreground mb-4">
                  <User size={16} className="mr-2" />
                  <span className="text-sm">{lecture.speaker}</span>
                </div>
                
                <div className="flex flex-col space-y-2 text-sm mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon size={16} className="mr-2" />
                    {lecture.date}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock size={16} className="mr-2" />
                    {lecture.time}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users size={16} className="mr-2" />
                    {getRegistrationsForActivity(lecture.id).count} inscritos
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin size={16} className="mr-2" />
                    {lecture.location}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-border/50 hover:bg-accent/50 transition-athunna"
                    onClick={() => setSelectedParticipants({ id: lecture.id, title: lecture.title })}
                  >
                    Participantes ({getRegistrationsForActivity(lecture.id).count})
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90 transition-athunna"
                    onClick={() => handleViewDetails(lecture)}
                  >
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-12 text-muted-foreground">
            Nenhuma palestra encontrada
          </div>
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">{selectedLecture?.title}</DialogTitle>
          </DialogHeader>
          {selectedLecture && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Descrição</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedLecture.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Palestrante</h4>
                    <p className="text-muted-foreground">{selectedLecture.speaker}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Local</h4>
                    <p className="text-muted-foreground">{selectedLecture.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Data</h4>
                    <p className="text-muted-foreground">{selectedLecture.date}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                    <p className="text-muted-foreground">{selectedLecture.time}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Participantes</h4>
                    <p className="text-muted-foreground">{selectedLecture.participants} inscritos</p>
                  </div>
                  {selectedLecture.cargaHoraria && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Carga Horária</h4>
                      <p className="text-muted-foreground">{selectedLecture.cargaHoraria}h</p>
                    </div>
                  )}
                </div>

                {selectedLecture.bio && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Sobre o Palestrante</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedLecture.bio}</p>
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

export default Lectures;
