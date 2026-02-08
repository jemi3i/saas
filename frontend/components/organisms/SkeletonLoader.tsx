
import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonLoaderProps {
  variant?: 'table' | 'cards' | 'dashboard';
  rows?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'table', rows = 5 }) => {
  if (variant === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-full mb-6" />
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-xl bg-card">
            <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-8 w-20 bg-muted rounded-lg hidden md:block" />
            <div className="h-8 w-12 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4 h-80 bg-muted rounded-2xl" />
        <div className="lg:col-span-3 h-80 bg-muted rounded-2xl" />
      </div>
    </div>
  );
};

export default SkeletonLoader;
