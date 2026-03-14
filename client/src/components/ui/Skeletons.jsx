import React from 'react';
import GlassCard from './GlassCard';

export const ShimmerCard = ({ className = '' }) => {
  return (
    <GlassCard className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#FF6B00]/10 to-transparent"></div>
      
      {/* Avatar & Header Skeleton */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/80"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/80 rounded w-1/3"></div>
          <div className="h-3 bg-white/50 rounded w-1/4"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-2 bg-white/60 rounded w-full"></div>
        <div className="h-2 bg-white/60 rounded w-5/6"></div>
        <div className="h-2 bg-white/60 rounded w-4/6"></div>
      </div>
      
      {/* Tags Skeleton */}
      <div className="flex space-x-2 mt-6">
        <div className="h-6 w-16 bg-white/80 rounded-md"></div>
        <div className="h-6 w-20 bg-white/80 rounded-md"></div>
        <div className="h-6 w-14 bg-white/80 rounded-md"></div>
      </div>
    </GlassCard>
  );
};

export const ShimmerTable = ({ rows = 5 }) => {
  return (
    <div className="w-full">
       {[...Array(rows)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4 p-4 border-b border-glass-border/40 relative overflow-hidden bg-[#F5F5F7]/30">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent"></div>
           <div className="w-8 h-8 rounded-full bg-white/80"></div>
           <div className="flex-1 h-3 bg-white/80 rounded"></div>
           <div className="w-24 h-5 bg-white/60 rounded-full"></div>
           <div className="w-32 h-3 bg-white/60 rounded"></div>
           <div className="flex space-x-2">
             <div className="w-6 h-6 bg-white/80 rounded"></div>
             <div className="w-6 h-6 bg-white/80 rounded"></div>
           </div>
         </div>
       ))}
    </div>
  );
};
