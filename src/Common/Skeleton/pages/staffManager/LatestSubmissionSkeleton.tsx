import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";

const LatestSubmissionSkeleton = () => (
  <div className="border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-6">
    {/* header */}
    <div className="flex items-center justify-between pb-4 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
    </div>
    <SkeletonLoading count={5} height="h-12" direction="vertical" />
  </div>
);

export default LatestSubmissionSkeleton;
