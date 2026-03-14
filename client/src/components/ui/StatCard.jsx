import React from 'react';
import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon, change, positive = true, subtitle }) => {
  return (
    <GlassCard className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="p-2 bg-orange/10 rounded-lg text-orange">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {(change || subtitle) && (
          <div className="text-xs flex items-center">
            {change && (
              <span className={`font-medium mr-2 ${positive ? 'text-green-400' : 'text-red-400'}`}>
                {positive ? '+' : ''}{change}
              </span>
            )}
            <span className="text-gray-500">{subtitle}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
