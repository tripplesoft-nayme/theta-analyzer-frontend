import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";

const StatsSectionSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <DashboardPanelStatsCardSkeleton key={i} />
    ))}
  </div>
);

export default StatsSectionSkeleton;
