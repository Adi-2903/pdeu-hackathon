import React from 'react';

const OrangeProgressBar = ({ progress, className = '', label }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm font-medium text-orange">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-glass-border">
        <div 
          className="bg-orange h-2.5 rounded-full transition-all duration-500 ease-out shadow-[var(--orange-glow)]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default OrangeProgressBar;
