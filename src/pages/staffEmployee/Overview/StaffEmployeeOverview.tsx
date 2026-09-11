import AllProgramProject from "./Components/AllProgramProject";
import UpcomingDeadline from "./Components/UpcomingDeadline";
import LatestSubmission from "./Components/LatestSubmissions";
import OverDueChart from "./Components/OverdueChart";
import ProjectStatusChart from "./Components/ProjectStatusChart";
import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";
import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import { useGetStaffEmployeeOverviewCardsQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import { Card, CardHeader } from "@/components/ui/card";

const clientData = [
  {
    title: "Total Assigned Project",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "Since last month",
    link_text: "View all",
    link: "/staff-employee-panel/projects",
    icon: "FolderIcon",
    icon_bg_color: "#4881FF",
  },
  {
    title: "Submitted for Review",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "Awaiting for approval",
    link_text: "View all",
    link: "/staff-employee-panel/project-review",
    icon: "FolderIcon",
    icon_bg_color: "#069576",
  },
  {
    title: "Returned for Edit",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "3 new file returned",
    link_text: "View all",
    link: "/staff-employee-panel/projects/status/PROBLEM",
    icon: "LiveProject",
    icon_bg_color: "#F5B31A",
  },
  {
    title: "In live",
    value: 0,
    growth: 0,
    growth_type: "up",
    description: "Active and published",
    link_text: "View all",
    link: "/staff-employee-panel/projects/status/LIVE",
    icon: "ProjectInDraft",
    icon_bg_color: "#169E7B",
  },
  {
    title: "Submission Overdue",
    value: 0,
    growth: null,
    growth_type: "down",
    description: "Project data haven't submitted",
    link_text: "View all",
    link: "/staff-employee-panel/projects/status/OVERDUE",
    icon: "SubmissionOverdue",
    icon_bg_color: "#DA4352",
  },
];
const StaffEmployeeOverview = () => {
  const { data: staffData, isLoading: staffLoading } =
    useGetStaffEmployeeOverviewCardsQuery("");

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
      growth: apiData?.growth ?? 0,
    };
  });

  return (
    <div className="mb-10">
      {staffLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <DashboardPanelStatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {processedDashboardData.map((item) => (
            <DashboardPanelStatsCard key={item.title} item={item} />
          ))}
        </div>
      )}

      <div className="pt-6">
        <AllProgramProject limit={4} showViewAll={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="space-y-6 col-span-1 lg:col-span-2 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="w-full border-[#E2E8F0] dark:border-slate-800 dark:bg-slate-900 shadow-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <h2 className="text-xl font-semibold dark:text-slate-100 mt-2 truncate">
                  Top Overdue Projects
                </h2>
              </CardHeader>
              <OverDueChart />
            </Card>

            <div className="w-full overflow-hidden">
              <ProjectStatusChart />
            </div>
          </div>
        </div>
        <div className="space-y-6 h-full col-span-1 w-full overflow-hidden">
          <UpcomingDeadline />
          {/* <ActivityLog /> */}
        </div>
      </div>
      <LatestSubmission />
    </div>
  );
};
export default StaffEmployeeOverview;
