/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import { useGetStaffEmpStateCartsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import OverDueChart from "./Components/OverDueChart";
import ProjectStatusChart from "./Components/ProjectStatusChart";
import SmUpcomingDeadline from "./Components/SmUpcomingDeadline";
import LatestSubmission from "./Components/LatestSubmission";
import AllProgramProject from "./Components/AllProgramProject";
import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";
import { Card, CardHeader } from "@/components/ui/card";
import ActivityLog from "@/components/staffManager/overview/ActivityLog";

const clientData = [
  {
    title: "Total Assigned Project",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "Since last month",
    link_text: "View all",
    link: "/staff-manager-panel/projects",
    icon: "FolderIcon",
    icon_bg_color: "#069576",
  },
  {
    title: "Submitted for Review",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "Awaiting for approval",
    link_text: "View all",
    link: "/staff-manager-panel/project-review",
    icon: "FolderIcon",
    icon_bg_color: "#069576",
  },
  {
    title: "Returned for Edit",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "0 new clients joined",
    link_text: "View all",
    link: "/staff-manager-panel/projects/status/PROBLEM",
    icon: "LiveProject",
    icon_bg_color: "#756CF5",
  },
  {
    title: "In live",
    value: 0,
    growth: null,
    growth_type: "up",
    description: "Active and published",
    link_text: "View all",
    link: "/staff-manager-panel/projects/status/LIVE",
    icon: "ProjectInDraft",
    icon_bg_color: "#4881FF",
  },
  {
    title: "Submission Overdue",
    value: 0,
    growth: null,
    growth_type: "down",
    description: "Project data have not submitted",
    link_text: "View all",
    link: "/staff-manager-panel/projects/status/OVERDUE",
    icon: "SubmissionOverdue",
    icon_bg_color: "#DA4352",
  },
];

const StaffManagerOverview = () => {
  const { data: staffData, isLoading: staffLoading } =
    useGetStaffEmpStateCartsQuery("");

  const dashboardData = staffData?.data;

  // if (staffError) return <div>Error during Fetching data</div>;

  const processedDashboardData = clientData.map((item, index) => {
    const apiKeys = [
      "totalAssignedProject",
      "submittedForReview",
      "returnedForEdit",
      "liveProjects",
      "overdueProjects",
    ];

    const apiData = dashboardData?.[apiKeys[index]];

    return {
      ...item,
      value: apiData?.count ?? 0,
      growth: item.growth === null ? "" : apiData?.growth ?? 0,
    };
  });

  return (
    <div className="mb-6">
      {staffLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <DashboardPanelStatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5  gap-6">
          {processedDashboardData.map((item) => (
            <DashboardPanelStatsCard key={item.title} item={item} />
          ))}
        </div>
      )}

      <div className="py-6">
        <AllProgramProject limit={4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col gap-6 col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <Card className="w-full border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <h2 className="text-xl font-semibold my-2 text-gray-900 dark:text-slate-100">
                  Top Overdue Projects
                </h2>
              </CardHeader>
              <div className="flex-1">
                <OverDueChart />
              </div>
            </Card>
            <div className="h-full">
              <ProjectStatusChart />
            </div>
          </div>
          <div className="w-full">
            <LatestSubmission />
          </div>
        </div>
        <div className="flex flex-col gap-6 h-full min-h-0">
          <div className="shrink-0">
            <SmUpcomingDeadline />
          </div>
          <div className="flex-1 min-h-0">
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
};
export default StaffManagerOverview;
