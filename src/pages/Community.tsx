import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  ThumbsUp, 
  Users, 
  TrendingUp,
  Search,
  Filter,
  Send,
  Reply
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  type: 'discussion' | 'achievement' | 'question' | 'event';
}

const Community: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  // Mock data - substituir por dados reais do Supabase
  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Ana Silva',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c8d5?w=100',
        role: 'Estudante de Engenharia'
      },
      content: 'Participei da oficina de React ontem e foi incrível! Alguém mais está aplicando os conceitos de hooks em seus projetos?',
      timestamp: '2024-01-15T10:30:00',
      likes: 24,
      comments: 8,
      tags: ['react', 'programação', 'oficina'],
      type: 'discussion'
    },
    {
      id: '2',
      author: {
        name: 'João Santos',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
        role: 'Estudante de Design'
      },
      content: 'Acabei de receber meu certificado de Design Thinking! 🎉 Agradeço a todos os professores e colegas que tornaram essa experiência incrível.',
      timestamp: '2024-01-14T15:20:00',
      likes: 42,
      comments: 15,
      tags: ['certificado', 'design-thinking', 'conquista'],
      type: 'achievement'
    },
    {
      id: '3',
      author: {
        name: 'Maria Costa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        role: 'Estudante de Administração'
      },
      content: 'Alguém sabe quando será o próximo workshop de Empreendedorismo? Gostaria muito de participar!',
      timestamp: '2024-01-13T09:15:00',
      likes: 12,
      comments: 5,
      tags: ['workshop', 'empreendedorismo'],
      type: 'question'
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'bg-blue-100 text-blue-800';
      case 'achievement': return 'bg-green-100 text-green-800';
      case 'question': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discussion': return 'Discussão';
      case 'achievement': return 'Conquista';
      case 'question': return 'Pergunta';
      case 'event': return 'Evento';
      default: return type;
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedFilter === 'all' || post.type === selectedFilter;
    
    return matchesSearch && matchesType;
  });

  const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments, 0);

  const handleNewPost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva algo antes de publicar",
        variant: "destructive"
      });
      return;
    }

    // Aqui você integraria com o Supabase para salvar o post
    toast({
      title: "Post publicado!",
      description: "Seu post foi compartilhado com a comunidade"
    });
    setNewPostContent('');
  };

  const handleReply = (postId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva uma resposta",
        variant: "destructive"
      });
      return;
    }

    // Aqui você integraria com o Supabase para salvar a resposta
    toast({
      title: "Resposta enviada!",
      description: "Sua resposta foi publicada"
    });
    setReplyContent('');
    setReplyingTo(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Comunidade</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe as discussões e interações dos estudantes
        </p>
      </div>

      {/* Nova publicação */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-[#5D5FEF]" />
          Criar Nova Publicação
        </h3>
        <Textarea
          placeholder="Compartilhe informações, avisos ou discussões com os alunos..."
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="mb-4 min-h-[100px]"
        />
        <Button 
          onClick={handleNewPost}
          className="bg-[#5D5FEF] hover:bg-[#4D4FDF] gap-2"
        >
          <Send size={18} />
          Publicar
        </Button>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Membros Ativos</p>
              <p className="text-2xl font-bold text-gray-800">248</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Posts Hoje</p>
              <p className="text-2xl font-bold text-gray-800">{posts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ThumbsUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Engajamento</p>
              <p className="text-2xl font-bold text-gray-800">{totalEngagement}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Crescimento</p>
              <p className="text-2xl font-bold text-gray-800">+12%</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar posts, pessoas ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Post" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="discussion">Discussões</SelectItem>
              <SelectItem value="achievement">Conquistas</SelectItem>
              <SelectItem value="question">Perguntas</SelectItem>
              <SelectItem value="event">Eventos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{post.author.name}</h3>
                    <Badge className={getTypeColor(post.type)}>
                      {getTypeLabel(post.type)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{post.author.role}</p>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp size={16} />
                      <span>{post.likes}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare size={16} />
                      <span>{post.comments}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-[#5D5FEF] hover:text-[#4D4FDF]"
                      onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    >
                      <Reply size={16} />
                      Responder
                    </Button>
                    
                    <span className="ml-auto">
                      {new Date(post.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Reply section */}
                  {replyingTo === post.id && (
                    <div className="mt-4 pt-4 border-t">
                      <Textarea
                        placeholder="Escreva sua resposta..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-3 min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleReply(post.id)}
                          size="sm"
                          className="bg-[#5D5FEF] hover:bg-[#4D4FDF]"
                        >
                          Enviar Resposta
                        </Button>
                        <Button 
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum post encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou termos de busca
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
