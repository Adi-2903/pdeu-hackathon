"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SourceData {
  name: string;
  count: number;
}

export function SourceBreakdownChart({ data }: { data: SourceData[] }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc'
            }}
          />
          <Bar dataKey="count" fill="#7F77DD" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
