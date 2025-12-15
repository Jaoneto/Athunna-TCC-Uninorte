import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Upload, Play, Image as ImageIcon, Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EventDetailsDialog from "@/components/EventDetailsDialog";

// Mock data for past events
const mockPastEvents = [
  {
    id: 1,
    title: "Workshop de Primeiros Socorros",
    date: "2024-01-15",
    location: "Sala A - Centro Comunitário",
    participants: 25,
    photos: 12,
    videos: 2,
    description: "Workshop sobre técnicas básicas de primeiros socorros para a comunidade."
  },
  {
    id: 2,
    title: "Feira de Ciências",
    date: "2024-02-20",
    location: "Pátio Principal",
    participants: 150,
    photos: 45,
    videos: 5,
    description: "Evento de apresentação de projetos científicos dos estudantes."
  },
  {
    id: 3,
    title: "Palestra sobre Sustentabilidade",
    date: "2024-03-10",
    location: "Auditório",
    participants: 80,
    photos: 20,
    videos: 3,
    description: "Discussão sobre práticas sustentáveis no dia a dia."
  }
];

const PastEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<typeof mockPastEvents[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const filteredEvents = mockPastEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = (eventId: number) => {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*';
    
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // Process the uploaded files
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        
        toast({
          title: "Upload realizado com sucesso!",
          description: `${files.length} arquivo(s) enviado(s): ${fileNames}`,
        });
        
        console.log(`Uploaded ${files.length} files for event ${eventId}:`, files);
      }
    };
    
    fileInput.click();
  };

  const handleViewDetails = (event: typeof mockPastEvents[0]) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Eventos Anteriores</h1>
        <div className="relative flex-1 md:flex-initial max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar eventos..." 
            className="pl-10 pr-4 w-full" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                {new Date(event.date).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                {event.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                {event.participants} participantes
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">{event.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <ImageIcon size={16} className="text-blue-600" />
                    <span>{event.photos} fotos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Play size={16} className="text-red-600" />
                    <span>{event.videos} vídeos</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUpload(event.id)}
                >
                  <Upload size={16} className="mr-2" />
                  Upload
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-[#5D5FEF]"
                  onClick={() => handleViewDetails(event)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-500">Tente ajustar os termos de busca.</p>
        </div>
      )}

      <EventDetailsDialog 
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};

export default PastEvents;
