import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock,
  Tag,
  Users
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NewActivityDialog from '@/components/NewActivityDialog';
import { useActivities } from '@/hooks/useActivities';
import { useActivityRegistrations } from '@/hooks/useActivityRegistrations';
import ActivityParticipantsDialog from '@/components/ActivityParticipantsDialog';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { pt } from 'date-fns/locale';

const Activities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<{ id: string; title: string } | null>(null);
  const { activities, loading, refetch } = useActivities();
  
  const activityIds = useMemo(() => activities.map(a => a.id), [activities]);
  // Get evento_id from first activity to fetch public registrations
  const eventoId = useMemo(() => activities[0]?.evento_id, [activities]);
  const { registrations, publicRegistrations, loading: registrationsLoading, getRegistrationsForActivity, refetch: refetchRegistrations } = useActivityRegistrations(activityIds, eventoId);

  // Converter e filtrar atividades (apenas oficinas)
  const filteredActivities = useMemo(() => {
    const now = new Date();
    
    return activities
      .filter(activity => activity.tipo?.toLowerCase() === 'oficina')
      .map(activity => {
        const startDate = parseISO(activity.data_inicio);
        const endDate = activity.data_fim ? parseISO(activity.data_fim) : null;
        
        let status = 'scheduled';
        if (endDate && isBefore(endDate, now)) {
          status = 'completed';
        }
        
        return {
          id: activity.id,
          title: activity.titulo,
          date: format(startDate, 'dd/MM/yyyy', { locale: pt }),
          time: `${format(startDate, 'HH:mm')} - ${endDate ? format(endDate, 'HH:mm') : 'Sem fim definido'}`,
          location: activity.local || 'Local não definido',
          type: activity.tipo || 'Oficina',
          status,
          description: activity.descricao || 'Sem descrição'
        };
      })
      .filter(activity => {
        const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              activity.location.toLowerCase().includes(searchTerm.toLowerCase());
                              
        if (activeTab === "all") return matchesSearch;
        if (activeTab === "scheduled") return matchesSearch && activity.status === "scheduled";
        if (activeTab === "completed") return matchesSearch && activity.status === "completed";
        
        return matchesSearch;
      });
  }, [activities, searchTerm, activeTab]);

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Agendada</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Concluída</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge>Indefinido</Badge>;
    }
  };

  // Function to get type badge
  const getTypeBadge = (type: string) => {
    switch(type) {
      case "Recreativa":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Recreativa</Badge>;
      case "Terapêutica":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Terapêutica</Badge>;
      case "Física":
        return <Badge variant="outline" className="border-green-500 text-green-500">Física</Badge>;
      case "Lúdica":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Lúdica</Badge>;
      default:
        return <Badge variant="outline">Outros</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0 text-foreground tracking-tight">Oficinas</h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Buscar oficinas..." 
              className="pl-10 pr-4 w-full glass-card border-border/50" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <NewActivityDialog onSuccess={refetch}>
            <Button className="bg-primary hover:bg-primary/90 shadow-athunna-sm transition-athunna">
              <Plus size={18} className="mr-2" /> Nova Oficina
            </Button>
          </NewActivityDialog>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
        <TabsList className="glass-card border-border/50">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12 text-muted-foreground glass-card rounded-lg border-border/50">
            Carregando oficinas...
          </div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden glass-card hover:shadow-glass transition-athunna border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">{activity.title}</h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{activity.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <CalendarIcon size={16} className="mr-2 flex-shrink-0" />
                        {activity.date}
                      </div>
                      <div className="flex items-center mb-2 sm:mb-0">
                        <Clock size={16} className="mr-2 flex-shrink-0" />
                        {activity.time}
                      </div>
                      <div className="flex items-center mb-2 sm:mb-0">
                        <MapPin size={16} className="mr-2 flex-shrink-0" />
                        {activity.location}
                      </div>
                       <div className="flex items-center">
                        <Tag size={16} className="mr-2 flex-shrink-0" />
                        {getTypeBadge(activity.type)}
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 flex-shrink-0" />
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                          {getRegistrationsForActivity(activity.id).count} inscritos
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border/50 hover:bg-accent/50 transition-athunna"
                      onClick={() => setSelectedActivity({ id: activity.id, title: activity.title })}
                    >
                      Ver Participantes ({getRegistrationsForActivity(activity.id).count})
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50 hover:bg-accent/50 transition-athunna">Detalhes</Button>
                    {activity.status === "scheduled" && (
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 transition-athunna">Cancelar</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex justify-center items-center py-12 text-muted-foreground glass-card rounded-lg border-border/50">
            Nenhuma oficina encontrada
          </div>
        )}
      </div>

      {/* Dialog de Participantes */}
      {selectedActivity && (
        <ActivityParticipantsDialog
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          activityTitle={selectedActivity.title}
          activityId={selectedActivity.id}
          registrations={getRegistrationsForActivity(selectedActivity.id).registrations}
          publicRegistrations={publicRegistrations}
          onRefetch={refetchRegistrations}
        />
      )}
    </div>
  );
};

export default Activities;
