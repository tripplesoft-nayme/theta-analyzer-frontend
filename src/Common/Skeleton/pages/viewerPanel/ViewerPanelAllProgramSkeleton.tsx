import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";

const ViewerPanelAllProgramSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col xl:flex-row items-center justify-between pb-6 gap-4">
        <div className="h-7 w-32 bg-gray-250 dark:bg-slate-800 rounded" />
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
          <div className="h-10 w-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          <div className="h-10 w-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          <div className="h-10 w-28 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          <div className="h-10 w-32 bg-gray-100 dark:bg-slate-800 border border-[#CAD2DB] dark:border-slate-800 rounded-md" />
        </div>
      </div>

      {/* Grid containing Project Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default ViewerPanelAllProgramSkeleton;
