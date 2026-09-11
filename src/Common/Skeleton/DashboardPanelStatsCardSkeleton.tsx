const DashboardPanelStatsCardSkeleton = () => {
  return (
    <div className="rounded-lg border border-border animate-pulse transition-colors">
      <div className="bg-card rounded-lg p-5 transition-colors">
        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-skeleton-bg w-10 h-10 transition-colors" />
          <div className="h-4 w-32 bg-skeleton-bg rounded transition-colors" />
        </div>

        {/* Value & Growth */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-20 bg-skeleton-bg rounded transition-colors" />
          <div className="h-6 w-14 bg-skeleton-bg rounded transition-colors" />
        </div>
      </div>

      {/* Description & Link */}
      <div className="flex items-center justify-between px-6 py-4 transition-colors">
        <div className="h-3 w-40 bg-skeleton-bg rounded transition-colors" />
        <div className="h-3 w-12 bg-skeleton-bg rounded transition-colors" />
      </div>
    </div>
  );
};

export default DashboardPanelStatsCardSkeleton;
