
const ConfigurationSkeleton = () => {
  return (
    <div className="max-w-78 min-w-78 h-full bg-card border border-border rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="h-4 w-40 bg-skeleton-bg rounded transition-colors" />
        <div className="h-4 w-4 bg-skeleton-bg rounded transition-colors" />
      </div>

      {/* Content Skeleton */}
      <div className="px-4 py-4 space-y-6 overflow-y-auto flex-1">
        {/* Title Field */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-skeleton-bg rounded transition-colors" />
          <div className="h-8 w-full bg-skeleton-bg rounded transition-colors" />
        </div>

        {/* Section 1 */}
        <div className="space-y-3 pt-2">
          <div className="h-3 w-32 bg-skeleton-bg rounded transition-colors" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3 border border-border rounded-md bg-muted/20 space-y-3">
                <div className="h-3 w-full bg-skeleton-bg rounded transition-colors" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-skeleton-bg rounded transition-colors" />
                  <div className="h-8 bg-skeleton-bg rounded transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 pt-2">
          <div className="h-3 w-24 bg-skeleton-bg rounded transition-colors" />
          <div className="h-16 w-full bg-skeleton-bg rounded-lg transition-colors" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2 shrink-0 bg-muted/10">
        <div className="flex-1 h-8 bg-skeleton-bg rounded-md transition-colors" />
        <div className="flex-1 h-8 bg-skeleton-bg rounded-md transition-colors" />
      </div>
    </div>
  );
};

export default ConfigurationSkeleton;
