import ProjectCardSkeleton from "../../ProjectCardSkeleton";

const StaffEmployeeProjectsSkeleton = () => {
  return (
    <div className="pb-6 animate-pulse">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 gap-4 border-b border-border dark:border-slate-800 mb-6">
        <div className="h-7 w-32 bg-gray-250 dark:bg-slate-800 rounded" />
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Search bar */}
          <div className="h-11 w-56 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          {/* View Toggles */}
          <div className="h-11 w-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          <div className="h-11 w-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          {/* Sort By selector */}
          <div className="h-11 w-28 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
        </div>
      </div>

      {/* Grid containing Project Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default StaffEmployeeProjectsSkeleton;
