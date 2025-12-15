
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DetailCard from './DetailCard';
import SalesChart from './SalesChart';
import OrdersChart from './OrdersChart';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    metrics: {
      label: string;
      value: string;
    }[];
    chartType: 'sales' | 'orders';
    chartLegend?: {
      label: string;
      color: string;
    }[];
  };
  showAddButton?: boolean;
  addButtonLink?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  showAddButton = false, 
  addButtonLink = "/events" 
}) => {
  const renderChart = () => {
    if (project.chartType === 'sales') {
      return (
        <div>
          {project.chartLegend && (
            <div className="flex items-center gap-8 mb-2">
              {project.chartLegend.map((legend, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`w-3 h-1 ${legend.color} rounded`}></span>
                  <span className="text-sm text-gray-600">{legend.label}</span>
                </div>
              ))}
            </div>
          )}
          <SalesChart />
        </div>
      );
    }
    return <OrdersChart />;
  };

  return (
    <div className="mb-6 md:mb-8">
      {showAddButton && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Direcionamento</h3>
          <Link to={addButtonLink}>
            <Button variant="ghost" size="icon" className="rounded-full bg-[#5D5FEF] text-white hover:bg-[#4D4FE5]">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      )}
      
      <DetailCard 
        title={project.title}
        description={project.description}
        metrics={project.metrics}
        chart={renderChart()}
      />
    </div>
  );
};

export default ProjectCard;
