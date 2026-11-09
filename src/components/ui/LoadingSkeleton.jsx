import React from 'react';

export function CardSkeletonGrid({ count = 3, cols = 'md:grid-cols-3' }) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 bg-slate-200 rounded-md" />
            <div className="h-5 w-20 bg-slate-100 rounded-md" />
          </div>
          <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="p-6 space-y-3 animate-pulse">
      <div className="h-9 w-full bg-slate-100 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between px-4 gap-4"
        >
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded hidden sm:block" />
          <div className="h-7 w-20 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
