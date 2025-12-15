
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, UserPlus, Heart, ClipboardList } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface StatsCardProps {
  title: string;
  value: string;
  subtext: string;
  variant: 'blue' | 'dark-blue' | 'purple' | 'pink';
}

// Sample data for different charts
const monthlyData = [
  { name: 'Jan', valor: 120 },
  { name: 'Fev', valor: 130 },
  { name: 'Mar', valor: 156 },
  { name: 'Abr', valor: 140 },
  { name: 'Mai', valor: 145 },
  { name: 'Jun', valor: 150 },
];

const docentesData = [
  { name: 'Jan', valor: 30 },
  { name: 'Fev', valor: 35 },
  { name: 'Mar', valor: 42 },
  { name: 'Abr', valor: 38 },
  { name: 'Mai', valor: 40 },
  { name: 'Jun', valor: 41 },
];

const beneficiadosData = [
  { name: 'Crianças', valor: 110 },
  { name: 'Adolescentes', valor: 60 },
  { name: 'Adultos', valor: 45 },
];

const atendimentosData = [
  { name: 'Jan', valor: 240 },
  { name: 'Fev', valor: 260 },
  { name: 'Mar', valor: 324 },
  { name: 'Abr', valor: 290 },
  { name: 'Mai', valor: 300 },
  { name: 'Jun', valor: 310 },
];

const COLORS = ['#5D66D1', '#7B83D8', '#9AA0E0', '#B8BCE8'];

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtext,
  variant 
}) => {
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const cardColor = {
    'blue': 'bg-gradient-to-br from-primary/90 to-primary text-primary-foreground',
    'dark-blue': 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
    'purple': 'bg-gradient-to-br from-primary/80 to-accent text-primary-foreground',
    'pink': 'bg-gradient-to-br from-accent/90 to-accent/70 text-primary-foreground'
  }[variant];

  const getIcon = () => {
    switch (title) {
      case 'Alunos Envolvidos':
        return <Users className="mb-2" size={isMobile ? 20 : 24} />;
      case 'Docentes Envolvidos':
        return <UserPlus className="mb-2" size={isMobile ? 20 : 24} />;
      case 'Pessoas Beneficiadas':
        return <Heart className="mb-2" size={isMobile ? 20 : 24} />;
      case 'Atendimentos':
        return <ClipboardList className="mb-2" size={isMobile ? 20 : 24} />;
      default:
        return null;
    }
  };

  const renderChart = () => {
    switch (title) {
      case 'Alunos Envolvidos':
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#5D66D1" name="Alunos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Docentes Envolvidos':
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={docentesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#5D66D1" name="Docentes" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Pessoas Beneficiadas':
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={beneficiadosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {beneficiadosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Atendimentos':
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={atendimentosData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#5D66D1" name="Atendimentos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  const getDialogDescription = () => {
    switch (title) {
      case 'Alunos Envolvidos':
        return 'Análise do número de alunos envolvidos no projeto ao longo dos meses.';
      case 'Docentes Envolvidos':
        return 'Evolução da participação de docentes nas atividades ao longo dos meses.';
      case 'Pessoas Beneficiadas':
        return 'Distribuição das pessoas beneficiadas por faixa etária.';
      case 'Atendimentos':
        return 'Evolução do número de atendimentos realizados ao longo dos meses.';
      default:
        return '';
    }
  };

  return (
    <>
      <div 
        className={cn(
          "card-stats cursor-pointer hover:scale-[1.02] hover:shadow-glass",
          cardColor
        )}
        onClick={() => setDialogOpen(true)}
      >
        {getIcon()}
        <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 opacity-90 tracking-tight">{title}</h3>
        <span className="text-xl sm:text-2xl md:text-3xl font-bold mb-0 sm:mb-1">{value}</span>
        <span className="text-[10px] sm:text-xs opacity-80">{subtext}</span>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatsCard;
