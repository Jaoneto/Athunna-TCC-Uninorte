import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  Award, 
  BookOpen,
  Clock,
  Star,
  Trophy,
  Target,
  Camera,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

const StudentProfile: React.FC = () => {
  const { toast } = useToast();
  const { profile: userProfile, loading: profileLoading, refetch } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editedData, setEditedData] = useState({
    nome_completo: '',
    telefone: '',
    bio: ''
  });

  // Stats from database
  const [stats, setStats] = useState({
    completedActivities: 0,
    totalHours: 0,
    certificates: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (userProfile) {
      setEditedData({
        nome_completo: userProfile.nome_completo || '',
        telefone: (userProfile as any).telefone || '',
        bio: userProfile.bio || ''
      });
      fetchStats();
    }
  }, [userProfile]);

  const fetchStats = async () => {
    if (!userProfile?.id) return;

    try {
      // Fetch certificates count
      const { count: certCount } = await supabase
        .from('certificados')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userProfile.id);

      // Fetch participations with presence
      const { data: participations } = await supabase
        .from('participacoes_atividades')
        .select('presenca, avaliacao, atividade_id')
        .eq('usuario_id', userProfile.id)
        .eq('presenca', true);

      // Calculate stats
      const completedCount = participations?.length || 0;
      const avgRating = participations && participations.length > 0
        ? participations.reduce((acc, p) => acc + (p.avaliacao || 0), 0) / participations.filter(p => p.avaliacao).length
        : 0;

      // Fetch total hours from activities
      let totalHours = 0;
      if (participations && participations.length > 0) {
        const activityIds = participations.map(p => p.atividade_id);
        const { data: activities } = await supabase
          .from('atividades')
          .select('carga_horaria')
          .in('id', activityIds);
        
        totalHours = activities?.reduce((acc, a) => acc + (a.carga_horaria || 0), 0) || 0;
      }

      setStats({
        completedActivities: completedCount,
        totalHours,
        certificates: certCount || 0,
        averageRating: isNaN(avgRating) ? 0 : Number(avgRating.toFixed(1))
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : '';
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setEditedData({ ...editedData, telefone: formatted });
  };

  const handleSave = async () => {
    if (!userProfile?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome_completo: editedData.nome_completo,
          telefone: editedData.telefone,
          bio: editedData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      refetch();
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setEditedData({
        nome_completo: userProfile.nome_completo || '',
        telefone: (userProfile as any).telefone || '',
        bio: userProfile.bio || ''
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const progressToNextLevel = (stats.completedActivities % 10) * 10;

  if (profileLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Não foi possível carregar o perfil.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e acompanhe seu progresso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={userProfile.avatar_url || ''} alt={userProfile.nome_completo} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(userProfile.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{userProfile.nome_completo}</CardTitle>
              <p className="text-primary">{userProfile.curso || 'Curso não informado'}</p>
              <p className="text-sm text-muted-foreground">{userProfile.semestre || 'Semestre não informado'}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  {userProfile.email}
                </div>
                {(userProfile as any).telefone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    {(userProfile as any).telefone}
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                  {userProfile.tipo_perfil === 'estudante' ? 'Estudante' : userProfile.tipo_perfil}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Progresso de Nível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Nível Atual</span>
                    <span className="font-semibold">
                      {Math.floor(stats.completedActivities / 10) + 1}
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {10 - (stats.completedActivities % 10)} atividades para o próximo nível
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="info">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Informações Pessoais</CardTitle>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={isEditing ? editedData.nome_completo : userProfile.nome_completo}
                        onChange={(e) => setEditedData({...editedData, nome_completo: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userProfile.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editedData.telefone : (userProfile as any).telefone || ''}
                        onChange={handlePhoneChange}
                        disabled={!isEditing}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editedData.bio : userProfile.bio || ''}
                      onChange={(e) => setEditedData({...editedData, bio: e.target.value})}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BookOpen className="w-8 h-8 text-blue-600 mr-4" />
                      <div>
                        <p className="text-2xl font-bold">{stats.completedActivities}</p>
                        <p className="text-sm text-muted-foreground">Atividades Concluídas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-green-600 mr-4" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalHours}h</p>
                        <p className="text-sm text-muted-foreground">Total de Horas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Award className="w-8 h-8 text-yellow-600 mr-4" />
                      <div>
                        <p className="text-2xl font-bold">{stats.certificates}</p>
                        <p className="text-sm text-muted-foreground">Certificados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Star className="w-8 h-8 text-purple-600 mr-4" />
                      <div>
                        <p className="text-2xl font-bold">{stats.averageRating || '-'}</p>
                        <p className="text-sm text-muted-foreground">Avaliação Média</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Continue participando de atividades para desbloquear conquistas!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
