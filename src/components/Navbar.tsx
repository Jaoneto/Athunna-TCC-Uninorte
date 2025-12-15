
import React, { useState } from 'react';
import { Search, MoreVertical, Menu, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Notifications from './Notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import EnvironmentSwitcher from './EnvironmentSwitcher';
import athunnaIcon from '@/assets/athunna-icon.png';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  userName?: string;
  avatarUrl?: string;
  onToggleSidebar?: () => void;
}

interface User {
  name: string;
  email: string;
  role: string;
}

const Navbar: React.FC<NavbarProps> = ({ userName: propUserName, avatarUrl, onToggleSidebar }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleMenuClick = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const displayName = authUser?.user_metadata?.nome_completo || propUserName || 'Usuário';
  
  return (
    <div className="h-16 glass-card border-b border-border/50 flex items-center justify-between px-4 md:px-6 shadow-athunna-sm">
      {isMobile && (
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMenuClick} 
            className="p-2 -ml-2 rounded-lg hover:bg-accent/50 focus:outline-none transition-athunna" 
            aria-label="Toggle Menu"
          >
            <Menu size={20} className="text-foreground/60" />
          </button>
          <img src={athunnaIcon} alt="Athunna" className="w-8 h-8" />
          <span className="text-primary font-bold text-lg tracking-tight">Athunna</span>
        </div>
      )}
      
      <div className={`flex-1 flex items-center ${isMobile ? 'justify-end' : ''}`}>
        {!isMobile && (
          <div className="relative w-64">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-athunna"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Notifications />
        
        {/* Environment Switcher apenas para Admin */}
        {isAdmin && <EnvironmentSwitcher />}
        
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-accent/50 transition-athunna">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-muted">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
              <MoreVertical size={20} className="text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48 glass-card border-border/50">
            <DropdownMenuLabel className="px-4 py-2 border-b border-border/50 flex flex-col">
              <div className="font-semibold text-foreground">{displayName}</div>
              <div className="text-xs text-muted-foreground">{authUser?.email}</div>
              <div className="text-xs mt-1 uppercase text-primary font-medium">{authUser?.user_metadata?.tipo_perfil}</div>
            </DropdownMenuLabel>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              Perfil
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              Configurações
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
