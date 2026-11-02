import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";

const StaffManagerAllProgramSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex md:flex-row flex-col justify-between items-center gap-3 px-6 py-4 border-gray-200 dark:border-slate-800 border-b">
          <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-64 bg-gray-200 dark:bg-slate-800 rounded-md" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-800 rounded-md" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="p-6">
          <SkeletonLoading count={10} height="h-12" direction="vertical" />
        </div>
      </div>
    </div>
  );
};

export default StaffManagerAllProgramSkeleton;
