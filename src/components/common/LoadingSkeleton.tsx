import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-paper-2 rounded-card border border-rule overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="h-48 bg-paper-3" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-rule rounded-sm w-3/4" />
          <div className="h-3 bg-paper-3 rounded-sm w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-rule rounded-sm w-1/3" />
          <div className="h-8 bg-paper-3 rounded-control w-full" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
