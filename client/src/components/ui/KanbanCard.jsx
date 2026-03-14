import React from 'react';
import GlassCard from './GlassCard';
import Badge from './Badge';

const KanbanCard = ({ item, onClick }) => {
  return (
    <GlassCard 
      className="mb-3 cursor-grab hover:border-orange/50 transition-colors active:cursor-grabbing p-4"
      onClick={() => onClick && onClick(item)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
        {item.score && (
          <Badge variant="orange" className="font-bold">
            {item.score}% Match
          </Badge>
        )}
      </div>
      <div className="text-xs text-gray-400 mb-3">{item.role}</div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{item.experience}</span>
        <span>{item.updatedAt}</span>
      </div>
    </GlassCard>
  );
};

export default KanbanCard;
