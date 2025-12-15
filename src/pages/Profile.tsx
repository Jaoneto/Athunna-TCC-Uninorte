import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Mail, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  name: string;
  email: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const Profile = () => {
  const { profile, loading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.nome_completo,
        email: profile.email,
        bio: profile.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    // Validate password fields if trying to change password
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        toast({
          title: "Erro",
          description: "Digite a senha atual para alterar a senha.",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Erro",
          description: "A nova senha e a confirmação não coincidem.",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A nova senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('usuarios')
        .update({
          nome_completo: formData.name,
          bio: formData.bio
        })
        .eq('id', profile.id);
      
      if (profileError) throw profileError;
      
      // Update password if provided
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (passwordError) throw passwordError;
      }
      
      setIsEditing(false);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      toast({
        title: "Sucesso",
        description: formData.newPassword ? "Perfil e senha atualizados com sucesso!" : "Perfil atualizado com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil.",
        variant: "destructive"
      });
    }
  };

  if (loading || !profile) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Perfil do Usuário</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-28 w-28">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.nome_completo} />
              ) : (
                <AvatarFallback className="bg-blue-500 text-2xl">
                  {profile.nome_completo.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsEditing(true)}
              >
                Editar perfil
              </Button>
            )}
          </div>
          
          <div className="flex-1 w-full">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      id="name"
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      id="email"
                      name="email" 
                      type="email"
                      value={formData.email} 
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
                  <Input 
                    id="bio"
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre você"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium">Função</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      id="role"
                      name="role" 
                      value={profile.tipo_perfil} 
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="block text-sm font-medium">Senha Atual</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="currentPassword"
                          name="currentPassword" 
                          type="password"
                          value={formData.currentPassword || ''} 
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Digite sua senha atual"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="block text-sm font-medium">Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="newPassword"
                          name="newPassword" 
                          type="password"
                          value={formData.newPassword || ''} 
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Digite a nova senha"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="confirmPassword"
                          name="confirmPassword" 
                          type="password"
                          value={formData.confirmPassword || ''} 
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile.nome_completo,
                        email: profile.email,
                        bio: profile.bio || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar alterações</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{profile.nome_completo}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                
                {profile.bio && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium">{profile.bio}</p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Função</p>
                  <p className="font-medium text-blue-600 uppercase">{profile.tipo_perfil}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
