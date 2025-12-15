
import React from 'react';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Award, 
  Trophy,
  MessageSquare,
  History,
  Star,
  User,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useLocation } from 'react-router-dom';
import athunnaIcon from '@/assets/athunna-icon.png';

interface StudentSidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  onToggle: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed, mobileOpen = false, onToggle }) => {
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
            "fixed left-0 top-0 h-full bg-sidebar w-[220px] shadow-lg transform transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <img src={athunnaIcon} alt="Athunna" className="w-8 h-8" />
              <span className="text-primary font-bold text-xl">Athunna</span>
            </div>
            <button 
              onClick={onToggle} 
              className="p-1 rounded-md hover:bg-sidebar-accent"
            >
              <X size={20} className="text-sidebar-foreground" />
            </button>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-64px)] p-2">
            <StudentSidebarItems collapsed={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 w-[220px]",
      collapsed && "w-[60px]"
    )}>
      <div className="flex items-center p-4 justify-center">
        {!collapsed ? (
          <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
            <img src={athunnaIcon} alt="Athunna" className="w-8 h-8" />
            <span className="text-primary font-bold text-xl">Athunna</span>
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
        <StudentSidebarItems collapsed={collapsed} />
      </div>
    </div>
  );
};

interface StudentSidebarItemsProps {
  collapsed: boolean;
}

const StudentSidebarItems: React.FC<StudentSidebarItemsProps> = ({ collapsed }) => {
  const location = useLocation();
  return (
    <>
      <StudentSidebarItem icon={<Home size={20} />} text="Início" active={location.pathname === "/student"} collapsed={collapsed} to="/student" />
      <StudentSidebarItem icon={<Calendar size={20} />} text="Eventos Disponíveis" active={location.pathname === "/student/events"} collapsed={collapsed} to="/student/events" />
      <StudentSidebarItem icon={<BookOpen size={20} />} text="Minhas Atividades" active={location.pathname === "/student/activities"} collapsed={collapsed} to="/student/activities" />
      <StudentSidebarItem icon={<Award size={20} />} text="Certificados" active={location.pathname === "/student/certificates"} collapsed={collapsed} to="/student/certificates" />
      <StudentSidebarItem icon={<Trophy size={20} />} text="Ranking" active={location.pathname === "/student/ranking"} collapsed={collapsed} to="/student/ranking" />
      <StudentSidebarItem icon={<Star size={20} />} text="Avaliações" active={location.pathname === "/student/feedback"} collapsed={collapsed} to="/student/feedback" />
      <StudentSidebarItem icon={<MessageSquare size={20} />} text="Comunidade" active={location.pathname === "/student/community"} collapsed={collapsed} to="/student/community" />
      <StudentSidebarItem icon={<History size={20} />} text="Histórico" active={location.pathname === "/student/history"} collapsed={collapsed} to="/student/history" />
      <StudentSidebarItem icon={<User size={20} />} text="Perfil" active={location.pathname === "/student/profile"} collapsed={collapsed} to="/student/profile" />
    </>
  );
};

interface StudentSidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  collapsed: boolean;
  to: string;
}

const StudentSidebarItem: React.FC<StudentSidebarItemProps> = ({ icon, text, active = false, collapsed, to }) => {
  return (
    <Link to={to} className="no-underline">
      <div className={cn(
        "sidebar-item flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer mb-1",
        active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}>
        <div className={cn(collapsed && "mx-auto")}>{icon}</div>
        {!collapsed && <span className="text-sm font-medium">{text}</span>}
      </div>
    </Link>
  );
};

export default StudentSidebar;
