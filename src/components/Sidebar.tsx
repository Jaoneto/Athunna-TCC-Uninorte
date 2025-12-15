
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  ChartBar, 
  Users, 
  Sparkles, 
  FileText, 
  BookOpen,
  Menu,
  CalendarPlus,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  History,
  Building2,
  Star,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import athunnaIcon from '@/assets/athunna-icon.png';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen = false, onToggle }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  if (isMobile) {
    return (
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggle}
      >
        <div 
          className={cn(
            "fixed left-0 top-0 h-full glass-sidebar w-[220px] shadow-athunna-xl transform transition-all duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <img src={athunnaIcon} alt="Athunna" className="w-8 h-8" />
              <span className="text-primary font-bold text-xl tracking-tight">Athunna</span>
            </div>
            <button 
              onClick={onToggle} 
              className="p-1.5 rounded-lg hover:bg-accent/50 transition-athunna"
            >
              <X size={20} className="text-foreground/60" />
            </button>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-64px)] p-2">
            <SidebarItems collapsed={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-screen glass-sidebar transition-all duration-300 w-[220px]",
      collapsed && "w-[60px]"
    )}>
      <div className="flex items-center p-4 justify-center">
        {!collapsed ? (
          <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
            <img src={athunnaIcon} alt="Athunna" className="w-8 h-8" />
            <span className="text-primary font-bold text-xl tracking-tight">Athunna</span>
          </div>
        ) : (
          <img 
            src={athunnaIcon} 
            alt="Athunna" 
            className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={onToggle}
          />
        )}
      </div>

      <div className="mt-4 px-2 overflow-y-auto h-[calc(100%-64px)]">
        <SidebarItems collapsed={collapsed} />
      </div>
    </div>
  );
};

interface SidebarItemsProps {
  collapsed: boolean;
}

const SidebarItems: React.FC<SidebarItemsProps> = ({ collapsed }) => {
  const location = useLocation();
  const { isAdmin, isProfessor } = useUserProfile();
  
  return (
    <>
      <SidebarItem icon={<LayoutDashboard size={20} />} text="Painel" active={location.pathname === "/"} collapsed={collapsed} to="/" />
      <SidebarItem icon={<Calendar size={20} />} text="Cronograma" active={location.pathname === "/events"} collapsed={collapsed} to="/events" />
      <SidebarItem icon={<CalendarPlus size={20} />} text="Cadastrar Evento" active={location.pathname === "/new-event"} collapsed={collapsed} to="/new-event" />
      <SidebarItem icon={<History size={20} />} text="Eventos Anteriores" active={location.pathname === "/past-events"} collapsed={collapsed} to="/past-events" />
      <SidebarItem icon={<Users size={20} />} text="Participantes" active={location.pathname === "/participants"} collapsed={collapsed} to="/participants" />
      <SidebarItem icon={<Users size={20} />} text="Lista Participantes" active={location.pathname === "/participants-list"} collapsed={collapsed} to="/participants-list" />
      
      {/* Atividades - Oficinas, Workshops e Palestras */}
      <SidebarItem icon={<Sparkles size={20} />} text="Oficinas" active={location.pathname === "/activities"} collapsed={collapsed} to="/activities" />
      <SidebarItem icon={<BookOpen size={20} />} text="Workshops" active={location.pathname === "/workshops"} collapsed={collapsed} to="/workshops" />
      <SidebarItem icon={<MessageSquare size={20} />} text="Palestras" active={location.pathname === "/lectures"} collapsed={collapsed} to="/lectures" />
      
      {/* Indicadores apenas para admin */}
      {isAdmin && (
        <SidebarItem icon={<ChartBar size={20} />} text="Indicadores" active={location.pathname === "/indicators"} collapsed={collapsed} to="/indicators" />
      )}
      
      <SidebarItem icon={<FileText size={20} />} text="Relatórios" active={location.pathname === "/reports"} collapsed={collapsed} to="/reports" />
      <SidebarItem icon={<Star size={20} />} text="Avaliações" active={location.pathname === "/feedback"} collapsed={collapsed} to="/feedback" />
      <SidebarItem icon={<MessageSquare size={20} />} text="Comunidade" active={location.pathname === "/community"} collapsed={collapsed} to="/community" />
      
      {/* Mostrar Instituições e Usuários do Sistema apenas para administradores */}
      {isAdmin && (
        <>
          <SidebarItem icon={<Building2 size={20} />} text="Instituições" active={location.pathname === "/institutions"} collapsed={collapsed} to="/institutions" />
          <SidebarItem icon={<Users size={20} />} text="Usuários do Sistema" active={location.pathname === "/system-users"} collapsed={collapsed} to="/system-users" />
          <SidebarItem icon={<BarChart3 size={20} />} text="Estatísticas Usuários" active={location.pathname === "/user-stats"} collapsed={collapsed} to="/user-stats" />
        </>
      )}
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  collapsed: boolean;
  to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active = false, collapsed, to }) => {
  return (
    <Link to={to} className="no-underline">
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-athunna cursor-pointer mb-1",
        active 
          ? "bg-primary text-primary-foreground shadow-athunna-sm" 
          : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
      )}>
        <div className={cn(collapsed && "mx-auto")}>{icon}</div>
        {!collapsed && <span className="text-sm font-medium">{text}</span>}
      </div>
    </Link>
  );
};

export default Sidebar;
