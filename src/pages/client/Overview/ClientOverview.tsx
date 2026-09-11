import ActivityLog from "@/pages/client/Overview/Components/ActivityLog";
import ProjectStatusDonutChart from "./Components/ProjectStatusDonutChart";
import ProjectTimelineColumnChart from "./Components/ProjectTimelineColumnChart";
import { useGetOverviewStackQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";
import ProjectOverdueBarChart from "./Components/ProjectOverdueBarChart";
import LatestSubmission from "./Components/LatestSubmission/LatestSubmission";
import AllProgramProject from "./Components/AllProgramProjects/AllProgramProjects";
import UpcomingDeadline from "./Components/UpcomingDeadline";
import ClientPanelStatsCard from "./Components/ClientPanelStatsCard";

const ClientOverview = () => {
  const { data: overview, isLoading } = useGetOverviewStackQuery({});

  const totalProgram = overview?.data?.totalProgram?.total || 0;
  const programThisMonth = overview?.data?.totalProgram?.thisMonth || 0;
  const totalProgramGrowth = overview?.data?.totalProgram?.growth || 0;

  const totalProject = overview?.data?.totalProject?.total || 0;
  const projectThisMonth = overview?.data?.totalProject?.thisMonth || 0;
  const totalProjectGrowth = overview?.data?.totalProject?.growth || 0;

  const liveProject = overview?.data?.liveProject?.total || 0;
  const liveProjectThisMonth = overview?.data?.liveProject?.thisMonth || 0;
  const liveProjectGrowth = overview?.data?.liveProject?.growth || 0;

  const draftProject = overview?.data?.draftProject?.total || 0;
  const draftProjectThisMonth = overview?.data?.draftProject?.thisMonth || 0;
  const draftProjectGrowth = overview?.data?.draftProject?.growth || 0;

  const pendingReview = overview?.data?.pendingReview?.total || 0;
  const pendingReviewGrowth = overview?.data?.pendingReview?.growth || 0;

  const submitOverdue = overview?.data?.submissionOverdue?.overdueCount || 0;
  const projectOverduePercentage =
    overview?.data?.submissionOverdue?.percentage || 0;
  const formatGrowth = (
    value: number
  ): { growth: string | undefined; growth_type: "up" | "down" } => {
    if (value === 0) return { growth: "0%", growth_type: "up" };
    if (value > 0) return { growth: `+${value}%`, growth_type: "up" };
    return { growth: `${value}%`, growth_type: "down" };
  };

  const clientData = [
    {
      title: "Total Program",
      value: totalProgram,
      ...formatGrowth(totalProgramGrowth),
      description: `${programThisMonth} program Running this month`,
      link_text: "View all",
      icon: "FolderIcon",
      icon_bg_color: "#069576",
    },
    {
      title: "Total Project",
      value: totalProject,
      ...formatGrowth(totalProjectGrowth),
      description: `${projectThisMonth} project Running this month`,
      link_text: "View all",
      icon: "FolderIcon",
      icon_bg_color: "#069576",
    },
    {
      title: "Live Project",
      value: liveProject,
      ...formatGrowth(liveProjectGrowth),
      description: `${liveProjectThisMonth} New user joined`,
      link_text: "View all",
      icon: "LiveProject",
      icon_bg_color: "#756CF5",
    },
    {
      title: "Project in draft",
      value: draftProject,
      ...formatGrowth(draftProjectGrowth),
      description: `${draftProjectThisMonth} new clients joined`,
      link_text: "View all",
      icon: "ProjectInDraft",
      icon_bg_color: "#4881FF",
    },
    {
      title: "Pending Review",
      value: pendingReview,
      ...formatGrowth(pendingReviewGrowth),
      description: `${pendingReviewGrowth} score growth`,
      link_text: "View all",
      icon: "PendingReview",
      icon_bg_color: "#069576",
    },
    {
      title: "Project Overdue",
      value: submitOverdue,
      growth: undefined,
      growth_type: "down" as const,
      description: `${projectOverduePercentage}% of projects are overdue`,
      link_text: "View all",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DA4352",
    },
  ];

  return (
    <div className="pb-4">
      {/* Icon and Home */}

      <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
            <DashboardPanelStatsCardSkeleton key={index} />
          ))
          : clientData.map((item) => (
            <ClientPanelStatsCard key={item.title} item={item} />
          ))}
      </div>

      <div className="py-6">
        <AllProgramProject />
      </div>
      <div className="grid xl:grid-cols-3 w-full gap-6 ">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-full">
              <ProjectOverdueBarChart />
            </div>
            <div className="h-full">
              <ProjectStatusDonutChart />
            </div>
          </div>
          <ProjectTimelineColumnChart />
          <div className="my-6">
            <LatestSubmission />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="shrink-0">
            <UpcomingDeadline />
          </div>
          <div className="">
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientOverview;
