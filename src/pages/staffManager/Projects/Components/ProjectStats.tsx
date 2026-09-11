import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";
import { useGetProjectPageStateCartsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";

const ProjectStats = () => {
  const stats = [
    {
      title: "Total Projects",
      value: 85,
      growth: "",
      growth_type: "up",
      // description: "4 Overdue",
      link: "/staff-manager-panel/projects/",
      link_text: "View all projeect",
      icon: "FolderIcon",
      icon_bg_color: "#069576",
    },
    {
      title: "Assigned Stuff",
      value: 3,
      growth: "",
      growth_type: "",
      // description: "7 new clients joined",
      link: "/staff-manager-panel/projects/",
      link_text: "View report ",
      icon: "SubmissionOverdue",
      icon_bg_color: "#4881FF",
    },
    {
      title: "Program Completion",
      value: 14,
      growth: "",
      growth_type: "",
      // description: "",
      link: "/staff-manager-panel/projects/status/COMPLETED",
      link_text: "View detailed Process",
      icon: "Check",
      icon_bg_color: "#069576 ",
    },
    {
      title: "Pending Review",
      value: 13,
      growth: "",
      growth_type: "",
      // description: "1 Urgent 4 Standard",
      link: "/staff-manager-panel/projects/status/PENDING",
      link_text: "Review submission",
      icon: "PendingReview",
      icon_bg_color: "#DA4352",
    },
  ];

  const {
    data: staffData,
    isLoading,
    error,
  } = useGetProjectPageStateCartsQuery("");

  const dashboardData = staffData?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardPanelStatsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) return <div>Error during Fetching data</div>;

  const apiKeys = [
    "totalProjects",
    "assignedStaff",
    "programCompletion",
    "pendingReviews",
  ] as const;

  const processedDashboardData = stats.map((item, index) => ({
    ...item,
    value: dashboardData?.[apiKeys[index]] ?? item.value,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
      {processedDashboardData.map((item, index) => (
        <DashboardPanelStatsCard key={index} item={item} />
      ))}
    </div>
  );
};

export default ProjectStats;
