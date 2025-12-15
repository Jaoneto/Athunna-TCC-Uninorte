import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Users, 
  Heart, 
  Share, 
  Search, 
  Plus,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface Post {
  id: string;
  usuario_id: string;
  content: string;
  image_url: string | null;
  tipo: 'discussion' | 'achievement' | 'question' | 'event';
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    nome_completo: string;
    avatar_url: string | null;
    tipo_perfil: string;
  };
}

const StudentCommunity: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [content, setContent] = useState('');
  const [tipo, setTipo] = useState<'discussion' | 'achievement' | 'question' | 'event'>('discussion');
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author data separately
      const userIds = [...new Set(postsData?.map(p => p.usuario_id))];
      const { data: usersData } = await supabase
        .from('usuarios')
        .select('id, nome_completo, avatar_url, tipo_perfil')
        .in('id', userIds);

      // Merge posts with author data
      const postsWithAuthors = postsData?.map(post => ({
        ...post,
        tipo: post.tipo as 'discussion' | 'achievement' | 'question' | 'event',
        author: usersData?.find(u => u.id === post.usuario_id)
      }));

      setPosts(postsWithAuthors || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Erro ao carregar posts',
        description: 'Não foi possível carregar as publicações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      let imageUrl = null;

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create post
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error: insertError } = await supabase
        .from('community_posts')
        .insert({
          usuario_id: user.id,
          content,
          tipo,
          tags,
          image_url: imageUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Publicação criada!',
        description: 'Sua publicação foi compartilhada com a comunidade.',
      });

      // Reset form
      setContent('');
      setTipo('discussion');
      setTagsInput('');
      setImageFile(null);
      setImagePreview(null);
      setIsDialogOpen(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Erro ao criar publicação',
        description: 'Não foi possível criar a publicação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-100 text-green-800';
      case 'discussion': return 'bg-blue-100 text-blue-800';
      case 'question': return 'bg-yellow-100 text-yellow-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor': return 'bg-primary/10 text-primary';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || post.tipo === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'agora mesmo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    const days = Math.floor(hours / 24);
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Comunidade
        </h1>
        <p className="text-gray-600">
          Conecte-se com outros estudantes, compartilhe experiências e tire dúvidas
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar discussões, pessoas ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Publicação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Publicação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Publicação</Label>
                  <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discussion">Discussão</SelectItem>
                      <SelectItem value="question">Pergunta</SelectItem>
                      <SelectItem value="achievement">Conquista</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Compartilhe suas ideias, perguntas ou experiências..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="React, Programação, Workshop"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem (opcional)</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <Label
                        htmlFor="image"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Clique para adicionar uma imagem
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PNG, JPG até 5MB
                        </span>
                      </Label>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'discussion', 'question', 'achievement', 'event'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className="capitalize"
            >
              {filter === 'all' ? 'Todos' : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">247</p>
                <p className="text-sm text-gray-600">Membros Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-gray-600">Discussões Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">423</p>
                <p className="text-sm text-gray-600">Curtidas Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando publicações...</p>
          </div>
        ) : filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.author?.avatar_url || ''} alt={post.author?.nome_completo} />
                    <AvatarFallback>
                      {post.author?.nome_completo.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{post.author?.nome_completo}</h3>
                      <Badge 
                        variant="secondary" 
                        className={getRoleColor(post.author?.tipo_perfil || 'estudante')}
                      >
                        {post.author?.tipo_perfil === 'professor' ? 'Professor' : 
                         post.author?.tipo_perfil === 'admin' ? 'Admin' : 'Estudante'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{getTimeAgo(post.created_at)}</p>
                  </div>
                </div>
                <Badge className={getTypeColor(post.tipo)} variant="secondary">
                  {post.tipo === 'achievement' ? 'Conquista' :
                   post.tipo === 'discussion' ? 'Discussão' :
                   post.tipo === 'question' ? 'Pergunta' : 'Evento'}
                </Badge>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image_url && (
                <div className="mb-4">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {post.comments_count}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                  <Share className="w-4 h-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma publicação encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCommunity;