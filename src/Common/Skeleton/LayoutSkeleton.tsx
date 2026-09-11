import React from "react";

interface LayoutSkeletonProps {
  children?: React.ReactNode;
}

const LayoutSkeleton: React.FC<LayoutSkeletonProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar Skeleton */}
      <div className="w-[296px] bg-slate-50 dark:bg-slate-900 border-r border-border dark:border-slate-800 hidden xl:flex flex-col p-6 space-y-8 animate-pulse">
        {/* Logo Placeholder */}
        <div className="h-10 w-32 bg-skeleton-bg rounded-md" />

        {/* Navigation Items Placeholder */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 bg-skeleton-bg rounded" />
              <div className="h-4 w-3/4 bg-skeleton-bg rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 px-4 md:px-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="py-6">
          <div className="h-[48px] w-full bg-skeleton-bg rounded-lg" />
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutSkeleton;
