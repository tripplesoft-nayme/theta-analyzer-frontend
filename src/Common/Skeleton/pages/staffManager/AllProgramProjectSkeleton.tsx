import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";

const AllProgramProjectSkeleton = () => (
  <div className="pb-6">
    {/* header toolbar */}
    <div className="flex items-center justify-between pb-6 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
    {/* 4 project card skeletons — same grid as board view */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default AllProgramProjectSkeleton;
