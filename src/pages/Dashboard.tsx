import React from 'react';
import HeaderSection from '../components/HeaderSection';
import StatsCard from '../components/StatsCard';
import ProjectCard from '../components/ProjectCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStats } from '@/hooks/useStats';
import { useUserProfile } from '@/hooks/useUserProfile';

// Mock data para projetos - futuramente será dinâmico com base nos eventos
const projectsData = [
  {
    id: 'down-day',
    title: 'Relatório de Atividades',
    description: 'Montar projeto voltado para a realização de minicursos e oficinas para ofertar a jovens e adultos com Síndrome de Down, com vistas ao crescimento pessoal e desenvolvimento de habilidades.',
    metrics: [],
    chartType: 'sales' as const,
    chartLegend: [
      { label: 'Oficinas', color: 'bg-blue-400' },
      { label: 'Minicursos', color: 'bg-indigo-700' }
    ]
  },
  {
    id: 'projeto-detalhes',
    title: 'Detalhes do Projeto',
    description: 'O projeto tem como principal objetivo promover, no mês em que é comemorado o Dia Internacional da Síndrome de Down, diversas atividades para jovens com Síndrome de Down como forma de incentivar a inclusão social.',
    metrics: [
      { label: "Oficinas", value: "12" },
      { label: "Minicursos", value: "8" },
      { label: "Unidades", value: "6" },
      { label: "Cursos envolvidos", value: "14" },
    ],
    chartType: 'orders' as const
  }
];

const Dashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { stats, loading } = useStats();
  const { profile } = useUserProfile();

  return (
    <div className="p-4 md:p-6 pb-8">
      <HeaderSection userName={profile?.nome_completo || "Usuário"} alerts={3} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatsCard 
          title="Alunos Envolvidos" 
          value={loading ? "..." : stats.totalStudents.toString()} 
          subtext="Total cadastrados" 
          variant="blue" 
        />
        <StatsCard 
          title="Docentes Envolvidos" 
          value={loading ? "..." : stats.totalProfessors.toString()} 
          subtext="Total cadastrados" 
          variant="dark-blue" 
        />
        <StatsCard 
          title="Pessoas Beneficiadas" 
          value={loading ? "..." : stats.totalBeneficiaries.toString()} 
          subtext="Total de inscrições" 
          variant="purple" 
        />
        <StatsCard 
          title="Atividades" 
          value={loading ? "..." : stats.totalActivities.toString()} 
          subtext="Total cadastradas" 
          variant="pink" 
        />
      </div>

      {/* Renderização dinâmica dos projetos */}
      {projectsData.map((project, index) => (
        <ProjectCard 
          key={project.id}
          project={project}
          showAddButton={index === 0}
          addButtonLink="/events"
        />
      ))}
    </div>
  );
};

export default Dashboard;
