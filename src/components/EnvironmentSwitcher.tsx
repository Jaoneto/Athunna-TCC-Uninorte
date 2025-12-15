import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Monitor, GraduationCap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface EnvironmentSwitcherProps {
  className?: string;
}

const EnvironmentSwitcher: React.FC<EnvironmentSwitcherProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStudentEnvironment = location.pathname.startsWith('/student');
  
  const handleSwitchToAdmin = () => {
    navigate('/');
  };
  
  const handleSwitchToStudent = () => {
    navigate('/student');
  };

  const handleOpenInNewTab = (path: string) => {
    window.open(path, '_blank');
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
        >
          {isStudentEnvironment ? (
            <>
              <GraduationCap size={16} />
              <span className="hidden md:inline">Visão Estudante</span>
            </>
          ) : (
            <>
              <Settings size={16} />
              <span className="hidden md:inline">Visão Admin</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Alterar Ambiente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <DropdownMenuItem 
              onClick={handleSwitchToAdmin}
              className={`cursor-pointer ${!isStudentEnvironment ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Settings size={16} className="mr-2" />
              Painel Administrativo
            </DropdownMenuItem>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleOpenInNewTab('/')}>
              Abrir em nova aba
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <DropdownMenuItem 
              onClick={handleSwitchToStudent}
              className={`cursor-pointer ${isStudentEnvironment ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <GraduationCap size={16} className="mr-2" />
              Ambiente do Estudante
            </DropdownMenuItem>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleOpenInNewTab('/student')}>
              Abrir em nova aba
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnvironmentSwitcher;