
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Image as ImageIcon, Play } from "lucide-react";

interface EventDetailsDialogProps {
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
    participants: number;
    photos: number;
    videos: number;
    description: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  open,
  onOpenChange,
}) => {
  if (!event) return null;

  // Mock data para fotos e vídeos - em uma aplicação real, isso viria de uma API
  const mockPhotos = Array.from({ length: Math.min(event.photos, 6) }, (_, i) => ({
    id: i + 1,
    url: `https://images.unsplash.com/photo-164997290434${i}?w=400&h=300&fit=crop`,
    caption: `Foto ${i + 1} do evento`
  }));

  const mockVideos = Array.from({ length: event.videos }, (_, i) => ({
    id: i + 1,
    thumbnail: `https://images.unsplash.com/photo-160581023043${i}?w=400&h=300&fit=crop`,
    title: `Vídeo ${i + 1} - ${event.title}`,
    duration: `${Math.floor(Math.random() * 10) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações básicas do evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm">{event.participants} participantes</span>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Descrição</h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Fotos */}
          {event.photos > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Fotos ({event.photos})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockPhotos.map((photo) => (
                  <div key={photo.id} className="relative group cursor-pointer">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                  </div>
                ))}
              </div>
              {event.photos > 6 && (
                <p className="text-sm text-gray-500 mt-2">
                  E mais {event.photos - 6} fotos...
                </p>
              )}
            </div>
          )}

          {/* Vídeos */}
          {event.videos > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold">Vídeos ({event.videos})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockVideos.map((video) => (
                  <div key={video.id} className="relative group cursor-pointer">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <Play size={48} className="text-white" />
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white">
                        {video.duration}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-2">{video.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Estatísticas do Evento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{event.participants}</div>
                <div className="text-sm text-gray-600">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{event.photos}</div>
                <div className="text-sm text-gray-600">Fotos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{event.videos}</div>
                <div className="text-sm text-gray-600">Vídeos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(Math.random() * 50) + 20}
                </div>
                <div className="text-sm text-gray-600">Avaliações</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
