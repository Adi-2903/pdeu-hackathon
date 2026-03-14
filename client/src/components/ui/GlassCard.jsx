import React from 'react';

const GlassCard = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`glass-panel rounded-2xl ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
