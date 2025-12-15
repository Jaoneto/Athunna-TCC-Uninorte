import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  tipo_perfil: 'admin' | 'professor' | 'estudante';
  curso?: string;
  semestre?: string;
  bio?: string;
  avatar_url?: string;
}

export const useUserProfile = () => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
      } else if (data) {
        console.log('Profile fetched successfully:', data.email, data.nome_completo);
        setProfile(data);
      } else {
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Limpar profile quando não há usuário
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Verificar se o profile atual corresponde ao usuário atual
    if (profile && profile.id !== user.id) {
      console.log('Profile mismatch detected, clearing and refetching');
      setProfile(null);
    }

    setLoading(true);
    fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  // Limpar profile quando sessão muda
  useEffect(() => {
    if (!session) {
      setProfile(null);
    }
  }, [session]);

  const isAdmin = profile?.tipo_perfil === 'admin';
  const isProfessor = profile?.tipo_perfil === 'professor';
  const isEstudante = profile?.tipo_perfil === 'estudante';

  const refetch = useCallback(() => {
    if (user?.id) {
      setLoading(true);
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  return {
    profile,
    loading,
    isAdmin,
    isProfessor,
    isEstudante,
    refetch,
  };
};
