import { ActivityLogSkeleton } from "@/components/staffManager/overview/ActivityLog";

const ActivityLogCardSkeleton = () => (
  <div className="border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-6">
    {/* header */}
    <div className="flex items-center gap-2 mb-6 animate-pulse">
      <div className="w-5 h-5 rounded bg-gray-200 dark:bg-slate-800" />
      <div className="h-5 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
    </div>
    <div className="space-y-6">
      <ActivityLogSkeleton />
    </div>
  </div>
);

export default ActivityLogCardSkeleton;
