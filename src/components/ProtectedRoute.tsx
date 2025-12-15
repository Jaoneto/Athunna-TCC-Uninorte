import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'professor' | 'estudante';
  allowedRoles?: ('admin' | 'professor' | 'estudante')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const location = useLocation();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem o role correto
  if (profile) {
    const isStudentArea = location.pathname.startsWith('/student');
    const isAdminArea = !isStudentArea && location.pathname !== '/login';

    // Estudantes só podem acessar área de estudante
    if (profile.tipo_perfil === 'estudante' && isAdminArea) {
      return <Navigate to="/student" replace />;
    }

    // Professores não podem acessar área de estudante
    if (profile.tipo_perfil === 'professor' && isStudentArea) {
      return <Navigate to="/" replace />;
    }

    // Verificar roles específicos se fornecidos
    if (requiredRole && profile.tipo_perfil !== requiredRole) {
      const defaultRedirect = profile.tipo_perfil === 'estudante' ? '/student' : '/';
      return <Navigate to={defaultRedirect} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(profile.tipo_perfil)) {
      const defaultRedirect = profile.tipo_perfil === 'estudante' ? '/student' : '/';
      return <Navigate to={defaultRedirect} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
