
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 500 },
  { name: 'May', value: 400 },
  { name: 'Jun', value: 600 },
  { name: 'Jul', value: 300 },
];

const OrdersChart: React.FC = () => {
  return (
    <div className="w-full h-[70px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#5D5FEF" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersChart;
