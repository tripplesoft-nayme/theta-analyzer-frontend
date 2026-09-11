import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";

const SmUpcomingDeadlineSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
    {/* header */}
    <div className="flex items-center justify-between pb-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-gray-200 dark:bg-slate-800" />
        <div className="h-5 w-36 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-9 w-32 bg-gray-200 dark:bg-slate-800 rounded-md" />
    </div>
    <SkeletonLoading />
  </div>
);

export default SmUpcomingDeadlineSkeleton;
