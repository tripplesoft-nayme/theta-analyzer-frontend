import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import { useGetSubmissionsStatsQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import { useGetEmployeeDashboardActivityQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";
import { useLocation } from "react-router-dom";

const ProjectReviewStats = () => {
  const location = useLocation();
  const isEmployee = location.pathname.includes("/staff-employee-panel");

  const { data: clientStatsData, isLoading: isClientLoading, error: clientError } = useGetSubmissionsStatsQuery({}, { skip: isEmployee });
  const { data: employeeStatsData, isLoading: isEmployeeLoading, error: employeeError } = useGetEmployeeDashboardActivityQuery(undefined, { skip: !isEmployee });

  const isLoading = isEmployee ? isEmployeeLoading : isClientLoading;
  const error = isEmployee ? employeeError : clientError;
  const statsData = isEmployee ? employeeStatsData : clientStatsData;

  const defaultStats = [
    {
      key: "approved",
      title: "Approved",
      value: 0,
      growth: "0%",
      growth_type: "up" as const,
      description: "0 score growth",
      link_text: "View all",
      icon: "Check",
      icon_bg_color: "#059669",
    },
    {
      key: "pending",
      title: "Pending Review",
      value: 0,
      growth: "0%",
      growth_type: "up" as const,
      description: "0 score growth",
      link_text: "View all",
      icon: "PendingReview",
      icon_bg_color: "#069576",
    },
    {
      key: "rejected",
      title: "Returned",
      value: 0,
      growth: "0%",
      growth_type: "up" as const,
      description: "0 score growth",
      link_text: "View all",
      icon: "ProjectInDraft",
      icon_bg_color: "#4881FF",
    },
    {
      key: "resubmitted",
      title: "Resubmitted",
      value: 0,
      growth: "0%",
      growth_type: "up" as const,
      description: "0 score growth",
      link_text: "View all",
      icon: "LiveProject",
      icon_bg_color: "#DC2626",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardPanelStatsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4 font-semibold">
        Error fetching submission statistics.
      </div>
    );
  }

  const submissions = statsData?.data || {};

  const processedStats = defaultStats.map((item) => {
    let total = 0;
    let growth = "0%";
    let growth_type: "up" | "down" = "up";
    let description = "0 score growth";

    if (isEmployee) {
      // statsData?.data is an array of employee activity objects
      const employeeActivity = Array.isArray(statsData?.data) ? statsData?.data?.[0] : null;
      const statusSummary = employeeActivity?.statusSummary || {};
      const totalSubmissions = employeeActivity?.totalSubmissions || 0;

      const mapping: Record<string, string> = {
        approved: "APPROVED",
        pending: "PENDING",
        rejected: "REJECTED",
        resubmitted: "RESUBMITTED",
      };

      const countKey = mapping[item.key] || item.key;
      total = statusSummary[countKey] ?? 0;
      const pct = totalSubmissions > 0 ? Math.round((total / totalSubmissions) * 100) : 0;
      growth = `${pct}`;
      growth_type = "up";
      description = `${pct}% of total`;
    } else {
      const itemData = submissions[item.key as keyof typeof submissions] || {};
      total = itemData.total !== undefined ? itemData.total : 0;
      const growthVal = itemData.growth !== undefined ? itemData.growth : 0;
      const scoreGrowth = itemData.scoreGrowth !== undefined ? itemData.scoreGrowth : 0;

      growth = `${growthVal >= 0 ? "+" : ""}${growthVal}`;
      growth_type = growthVal >= 0 ? ("up" as const) : ("down" as const);
      description = `${scoreGrowth} score growth`;
    }

    return {
      ...item,
      value: total,
      growth,
      growth_type,
      description,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
      {processedStats.map((item, index) => (
        <DashboardPanelStatsCard key={index} item={item} />
      ))}
    </div>
  );
};

export default ProjectReviewStats;
