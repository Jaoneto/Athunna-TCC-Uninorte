
import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FeedbackItem {
  id: string;
  eventTitle: string;
  eventType: 'palestra' | 'oficina' | 'atividade';
  instructor: string;
  date: string;
  rating?: number;
  comment?: string;
  hasSubmitted: boolean;
}

const StudentFeedback: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [activeRating, setActiveRating] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      eventTitle: 'Introdução ao React',
      eventType: 'oficina',
      instructor: 'Prof. Maria Silva',
      date: '2024-02-15',
      rating: 5,
      comment: 'Excelente oficina! Conteúdo muito bem estruturado e professor muito didático.',
      hasSubmitted: true
    },
    {
      id: '2',
      eventTitle: 'Metodologias Ágeis',
      eventType: 'palestra',
      instructor: 'Dr. João Santos',
      date: '2024-02-20',
      rating: 4,
      comment: 'Boa palestra, mas poderia ter mais exemplos práticos.',
      hasSubmitted: true
    },
    {
      id: '3',
      eventTitle: 'Workshop de UX/UI',
      eventType: 'oficina',
      instructor: 'Design Team',
      date: '2024-03-10',
      hasSubmitted: false
    },
    {
      id: '4',
      eventTitle: 'Palestra sobre IA',
      eventType: 'palestra',
      instructor: 'Dr. Ana Costa',
      date: '2024-03-15',
      hasSubmitted: false
    }
  ]);

  const filteredItems = feedbackItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.hasSubmitted;
    if (filter === 'submitted') return item.hasSubmitted;
    return item.eventType === filter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'palestra': return 'bg-blue-100 text-blue-800';
      case 'oficina': return 'bg-green-100 text-green-800';
      case 'atividade': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRatingChange = (itemId: string, rating: number) => {
    setActiveRating(prev => ({ ...prev, [itemId]: rating }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setComments(prev => ({ ...prev, [itemId]: comment }));
  };

  const handleSubmitFeedback = (itemId: string) => {
    const rating = activeRating[itemId];
    const comment = comments[itemId];
    
    if (!rating) {
      alert('Por favor, selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    setFeedbackItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, rating, comment, hasSubmitted: true }
        : item
    ));

    // Limpar estados temporários
    setActiveRating(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
    setComments(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });

    console.log('Feedback enviado:', { itemId, rating, comment });
  };

  const renderStars = (itemId: string, currentRating?: number, interactive = false) => {
    const rating = interactive ? (activeRating[itemId] || 0) : (currentRating || 0);
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => handleRatingChange(itemId, star) : undefined}
          />
        ))}
        {!interactive && currentRating && (
          <span className="ml-2 text-sm text-gray-600">({currentRating}/5)</span>
        )}
      </div>
    );
  };

  const pendingCount = feedbackItems.filter(item => !item.hasSubmitted).length;
  const submittedCount = feedbackItems.filter(item => item.hasSubmitted).length;
  const averageRating = feedbackItems
    .filter(item => item.rating)
    .reduce((sum, item) => sum + (item.rating || 0), 0) / submittedCount || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Avaliações e Feedback
        </h1>
        <p className="text-gray-600">
          Avalie sua experiência e ajude a melhorar nossos eventos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Média de Avaliação</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-64">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar avaliações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as avaliações</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="submitted">Enviadas</SelectItem>
            <SelectItem value="palestra">Palestras</SelectItem>
            <SelectItem value="oficina">Oficinas</SelectItem>
            <SelectItem value="atividade">Atividades</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="space-y-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.eventTitle}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Instrutor: {item.instructor} • {new Date(item.date).toLocaleDateString('pt-BR')}
                    </p>
                    <Badge className={getTypeColor(item.eventType)} variant="secondary">
                      {item.eventType.charAt(0).toUpperCase() + item.eventType.slice(1)}
                    </Badge>
                  </div>
                </div>

                {item.hasSubmitted ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Sua Avaliação:</p>
                      {renderStars(item.id, item.rating)}
                    </div>
                    {item.comment && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Seu Comentário:</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700">{item.comment}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-green-600">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Feedback enviado com sucesso!</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Avalie este evento:</p>
                      {renderStars(item.id, undefined, true)}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Comentário (opcional):
                      </p>
                      <Textarea
                        placeholder="Compartilhe sua experiência, sugestões ou críticas construtivas..."
                        value={comments[item.id] || ''}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button 
                      onClick={() => handleSubmitFeedback(item.id)}
                      className="bg-[#5D5FEF] hover:bg-[#4A4AE3]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Avaliação
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma avaliação encontrada
          </h3>
          <p className="text-gray-600">
            Participe de eventos para poder avaliá-los
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentFeedback;
