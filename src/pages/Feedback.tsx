import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, User, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Feedback {
  id: string;
  studentName: string;
  eventTitle: string;
  eventType: 'palestra' | 'oficina' | 'workshop';
  rating: number;
  comment: string;
  date: string;
}

const Feedback: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  // Mock data - substituir por dados reais do Supabase
  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      studentName: 'Maria Silva',
      eventTitle: 'Introdução ao React',
      eventType: 'oficina',
      rating: 5,
      comment: 'Excelente oficina! Aprendi muito sobre hooks e componentes.',
      date: '2024-01-15'
    },
    {
      id: '2',
      studentName: 'João Santos',
      eventTitle: 'Design Thinking na Prática',
      eventType: 'workshop',
      rating: 4,
      comment: 'Muito bom, mas poderia ter mais exemplos práticos.',
      date: '2024-01-14'
    },
    {
      id: '3',
      studentName: 'Ana Costa',
      eventTitle: 'Inovação e Empreendedorismo',
      eventType: 'palestra',
      rating: 5,
      comment: 'Palestrante incrível! Conteúdo muito inspirador.',
      date: '2024-01-13'
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'oficina': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'palestra': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || feedback.eventType === filterType;
    const matchesRating = filterRating === 'all' || feedback.rating.toString() === filterRating;
    
    return matchesSearch && matchesType && matchesRating;
  });

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Avaliações dos Alunos</h1>
        <p className="text-gray-600 mt-2">
          Visualize o feedback dos estudantes sobre eventos e atividades
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-gray-800">{averageRating}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Avaliações</p>
              <p className="text-2xl font-bold text-gray-800">{feedbacks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avaliações 5 Estrelas</p>
              <p className="text-2xl font-bold text-gray-800">
                {feedbacks.filter(f => f.rating === 5).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por aluno, evento ou comentário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="oficina">Oficina</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="palestra">Palestra</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger>
              <SelectValue placeholder="Avaliação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as avaliações</SelectItem>
              <SelectItem value="5">5 estrelas</SelectItem>
              <SelectItem value="4">4 estrelas</SelectItem>
              <SelectItem value="3">3 estrelas</SelectItem>
              <SelectItem value="2">2 estrelas</SelectItem>
              <SelectItem value="1">1 estrela</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {feedback.eventTitle}
                    </h3>
                    <Badge className={getTypeColor(feedback.eventType)}>
                      {feedback.eventType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{feedback.studentName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(feedback.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou aguarde novas avaliações dos alunos
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Feedback;
