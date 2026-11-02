import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";

const DashboardCardProjectsSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header / Back button & Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-7 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Grid of project cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default DashboardCardProjectsSkeleton;
