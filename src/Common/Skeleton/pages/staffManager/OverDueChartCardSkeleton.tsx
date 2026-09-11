import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";

const OverDueChartCardSkeleton = () => (
  <div className="w-full border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg flex flex-col">
    {/* CardHeader */}
    <div className="flex flex-row items-center justify-between space-y-0 px-6 py-4 animate-pulse">
      <div className="h-6 w-44 bg-gray-200 dark:bg-slate-800 rounded" />
    </div>
    {/* same SkeletonLoading the component renders */}
    <div className="flex-1 px-4 pb-4 animate-pulse">
      <SkeletonLoading />
    </div>
  </div>
);

export default OverDueChartCardSkeleton;
