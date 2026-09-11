/* eslint-disable @typescript-eslint/no-explicit-any */
import { List } from "lucide-react";
import { Card } from "@/components/ui/card";
import BoxContainer from "@/Common/BoxContainer";
import { useGetAllActivityLogsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { formatDate } from "@/Common/Charts/ProjectInfo";
import { BsArrowRight } from "react-icons/bs";
import { Link } from "react-router-dom";

export const ActivityLogSkeleton = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="flex items-start gap-3 animate-pulse">
      <div className="relative min-h-20 flex">
        <div className="size-2.5 rounded-full bg-gray-300 dark:bg-slate-700 shrink-0" />
        <div className="absolute inset-x-1/2 left-1 w-px h-full bg-gray-200 dark:bg-slate-800" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  ));
};

const ActivityLog = () => {
  const { data, isLoading } = useGetAllActivityLogsQuery({});
  const activityData = data?.data ?? [];

  return (
    <BoxContainer className="h-fit flex flex-col">
      <Card className="bg-white dark:bg-slate-900 border-none shadow-none rounded-lg py-0 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <List className="w-5 h-5 dark:text-slate-400" />
            <h4 className="text-xl font-medium text-gray-900 dark:text-slate-100">
              Activity Log
            </h4>
          </div>
        </div>

        {/* Activity Items */}
        <div className="space-y-6 py-4 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <ActivityLogSkeleton />
          ) : activityData.length > 0 ? (
            activityData.slice(0, 3).map((activity: any, index: number) => (
              <div
                key={activity?.id ?? index}
                className="flex items-start gap-3"
              >
                <div className="relative min-h-20 flex">
                  <div className="size-2.5 rounded-full shrink-0 bg-green-600 z-20" />
                  <div className="absolute inset-x-1/2 left-1 w-px h-full border border-gray-200 dark:border-slate-800" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <h5 className="text-[#1D2028] dark:text-slate-100 capitalize">
                        {activity?.actionType ?? "-"}
                      </h5>

                      <p className="text-sm text-[#475569] dark:text-slate-400 mt-1">
                        {activity?.description ?? "-"}
                      </p>

                      <div className="flex flex-col mt-2 text-sm text-[#475569] dark:text-slate-500">
                        <span>
                          {activity?.timestamp
                            ? formatDate(activity.timestamp)
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {activity?.user?.name && (
                      <span className="text-sm text-[#475569] dark:text-slate-500">
                        By {activity.user.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-32 text-gray-500 dark:text-slate-400">
              No Data Found
            </div>
          )}
          {activityData?.length > 5 && (
            <Link
              to="/staff-manager/activity-log"
              className="flex justify-center items-center gap-2 text-blue-500 cursor-pointer hover:text-blue-600 pt-4"
            >
              View full audit trail <BsArrowRight />
            </Link>
          )}
        </div>
      </Card>
    </BoxContainer>
  );
};

export default ActivityLog;
