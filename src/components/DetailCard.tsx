
import React from 'react';

interface DetailCardProps {
  title: string;
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
  chart?: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ 
  title, 
  description, 
  metrics,
  chart
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">{metric.label}</span>
            <span className="text-xl font-bold text-[#5D5FEF]">{metric.value}</span>
          </div>
        ))}
      </div>
      
      {chart && <div className="mt-4">{chart}</div>}
    </div>
  );
};

export default DetailCard;
