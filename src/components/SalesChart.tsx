
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const data = [
  { name: 'Jan', offline: 400, online: 600 },
  { name: 'Feb', offline: 300, online: 500 },
  { name: 'Mar', offline: 200, online: 700 },
  { name: 'Apr', offline: 600, online: 400 },
  { name: 'May', offline: 800, online: 700 },
  { name: 'Jun', offline: 500, online: 800 },
  { name: 'Jul', offline: 400, online: 200 },
];

const SalesChart: React.FC = () => {
  return (
    <div className="w-full h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="offline" fill="#6B96FF" radius={[4, 4, 0, 0]} />
          <Bar dataKey="online" fill="#4450C3" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
