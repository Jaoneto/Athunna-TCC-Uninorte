
import React from 'react';
import { Search, Bell, Menu, LogOut, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNotifications } from '@/hooks/useNotifications';
import EnvironmentSwitcher from '../EnvironmentSwitcher';
import athunnaIcon from '@/assets/athunna-icon.png';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface StudentNavbarProps {
  onToggleSidebar?: () => void;
}

const StudentNavbar: React.FC<StudentNavbarProps> = ({ onToggleSidebar }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const { 
    notifications, 
    loading: notificationsLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    formatTimeAgo 
  } = useNotifications();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleMenuClick = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  return (
    <div className="flex flex-col">
      {isAdmin && (
        <div className="bg-muted border-b border-border px-4 py-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Você está visualizando como estudante</span>
            <EnvironmentSwitcher />
          </div>
        </div>
      )}
      <div className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6">
      {isMobile && (
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMenuClick} 
            className="p-2 -ml-2 rounded-md hover:bg-muted focus:outline-none" 
            aria-label="Toggle Menu"
          >
            <Menu size={20} className="text-foreground" />
          </button>
          <img src={athunnaIcon} alt="Athunna" className="w-8 h-8" />
          <span className="text-primary font-bold text-lg">Athunna</span>
        </div>
      )}
      
      <div className={`flex-1 flex items-center ${isMobile ? 'justify-end' : ''}`}>
        {!isMobile && (
          <div className="relative w-64">
            <Search size={18} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar eventos, oficinas..." 
              className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-1 rounded-md hover:bg-muted focus:outline-none">
              <Bell size={20} className="text-foreground cursor-pointer hover:text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
            <div className="flex justify-between items-center border-b border-border px-4 py-3">
              <h3 className="font-medium text-foreground">Notificações</h3>
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-primary hover:text-primary/80"
              >
                Marcar todas como lidas
              </button>
            </div>
            
            <div className="max-h-[300px] overflow-auto p-2">
              {notificationsLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-md cursor-pointer transition-colors ${notification.lida ? 'bg-muted/50' : 'bg-primary/10'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-foreground">{notification.titulo}</h4>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.mensagem}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma notificação
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-muted">
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-medium">
                  {profile?.nome_completo?.charAt(0) || 'U'}
                </div>
              </div>
              {!isMobile && (
                <div className="text-sm">
                  <div className="font-medium text-foreground">{profile?.nome_completo}</div>
                  <div className="text-muted-foreground text-xs">{profile?.curso}</div>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="px-4 py-2 border-b border-border flex flex-col">
              <div className="font-medium">{profile?.nome_completo}</div>
              <div className="text-xs text-muted-foreground">{profile?.email}</div>
              <div className="text-xs mt-1 text-primary font-medium">{profile?.curso}</div>
              <div className="text-xs text-muted-foreground">{profile?.semestre}</div>
            </DropdownMenuLabel>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/student/profile')}
            >
              Meu Perfil
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/student/settings')}
            >
              Configurações
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-destructive cursor-pointer flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </div>
  );
};

export default StudentNavbar;
