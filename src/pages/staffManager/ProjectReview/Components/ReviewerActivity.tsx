/* eslint-disable @typescript-eslint/no-explicit-any */

import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";
import { useGetAllReviewProjectsReviewerActivityQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { useGetDashboardReviewActivityQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import { useGetEmployeeDashboardActivityQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import { useSelector } from "react-redux";
import { ArrowRight, Filter, List } from "lucide-react";

const ReviewerActivity = () => {
  const role = useSelector((state: any) => state.auth.user?.role);
  const normalizedRole = role?.toLowerCase();

  const isClient = normalizedRole === "client";
  const isEmployee = normalizedRole === "employee";

  const {
    data: clientData,
    isLoading: isClientLoading,
    error: clientError,
  } = useGetDashboardReviewActivityQuery({}, { skip: !isClient });

  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    error: employeeError,
  } = useGetEmployeeDashboardActivityQuery({}, { skip: !isEmployee });

  const {
    data: managerData,
    isLoading: isManagerLoading,
    error: managerError,
  } = useGetAllReviewProjectsReviewerActivityQuery(
    {},
    { skip: isClient || isEmployee }
  );

  const data = isClient ? clientData : isEmployee ? employeeData : managerData;
  const isLoading = isClient ? isClientLoading : isEmployee ? isEmployeeLoading : isManagerLoading;
  const error = isClient ? clientError : isEmployee ? employeeError : managerError;

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 text-sm text-red-500">
        Failed to load reviewer activity
      </div>
    );
  }

  // Safely extract the activity list from any likely structure
  let activities: any[] = [];
  if (data) {
    if (data.data) {
      if (Array.isArray(data.data)) {
        activities = data.data;
      } else if (typeof data.data === "object") {
        const employees = data.data.employees ?? [];
        const managers = data.data.managers ?? [];
        if (employees.length > 0 || managers.length > 0) {
          activities = [...employees, ...managers];
        } else {
          const firstArrayKey = Object.keys(data.data).find(key => Array.isArray((data.data as any)[key]));
          if (firstArrayKey) {
            activities = (data.data as any)[firstArrayKey];
          }
        }
      }
    } else if (Array.isArray(data)) {
      activities = data;
    } else if (typeof data === "object") {
      const employees = data.employees ?? [];
      const managers = data.managers ?? [];
      if (employees.length > 0 || managers.length > 0) {
        activities = [...employees, ...managers];
      } else {
        const firstArrayKey = Object.keys(data).find(key => Array.isArray((data as any)[key]));
        if (firstArrayKey) {
          activities = (data as any)[firstArrayKey];
        }
      }
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg pb-8 border border-gray-200 dark:border-slate-800 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <List size={20} className="text-gray-500 dark:text-slate-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Reviewer Activity
          </h3>
        </div>
        {activities.length > 0 && (
          <button className="text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 p-1 rounded-md transition-colors">
            <Filter size={22} />
          </button>
        )}
      </div>

      {/* Activity List */}
      {isLoading ? (
        <SkeletonLoading count={1} height="h-20" />
      ) : (
        <div className="relative space-y-3">
          {activities.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-slate-500 text-center py-4">
              Not yet any reviewer activity found
            </p>
          )}

          {(() => {
            const visibleActivities = activities.slice(0, 5);
            return visibleActivities.map((item: any, index: number) => {
              const empName = item.employee?.name || item.manager?.name || item.user?.name || item.name || "User";
              let empImage = item.employee?.profileImage || item.manager?.profileImage || item.user?.profileImage || item.profileImage;
              if (!empImage || empImage === "default.png") {
                empImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}`;
              }
              const approved = item.statusSummary?.APPROVED ?? item.statusSummary?.approved ?? item.approved ?? 0;
              const pending = item.statusSummary?.PENDING ?? item.statusSummary?.pending ?? item.pending ?? 0;
              const rejected = item.statusSummary?.REJECTED ?? item.statusSummary?.rejected ?? item.rejected ?? 0;
              const totalSubmissions = item.totalSubmissions ?? item.totalReviews ?? item.total ?? (approved + pending + rejected);

              return (
                <div key={index} className="relative flex gap-6 pb-4 last:pb-0">
                  {/* Timeline Line & Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 z-10 ${index % 2 === 0 ? "bg-[#10B981]" : "bg-[#EF4444]"
                        }`}
                    />
                    <div className="w-0.5 bg-gray-300 dark:bg-slate-700 h-full absolute top-4 left-[5px] z-0" />
                  </div>

                  {/* Content Container */}
                  <div className="flex-1">
                    {/* User Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={empImage}
                        alt={empName}
                        className="w-7 h-7 rounded-full object-cover border border-border dark:border-slate-800"
                      />
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                        {empName}
                      </span>
                    </div>

                    {/* Status Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-full text-[10px] font-semibold">
                        {approved} Approved
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-[10px] font-semibold">
                        {pending} In Review
                      </span>
                      <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-full text-[10px] font-semibold">
                        {rejected} Returned
                      </span>
                    </div>

                    {/* Total Submissions */}
                    <div className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">
                      Total submissions : {totalSubmissions}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* View All Footer */}
      {activities.length > 5 && (
        <button className="w-full flex items-center justify-center gap-2 pt-3 mt-1 text-blue-600 dark:text-blue-400 font-bold text-xs hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          View All Activity <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};

export default ReviewerActivity;
