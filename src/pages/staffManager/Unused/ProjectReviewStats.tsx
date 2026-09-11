import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import { useGetProjectReviewPageCardsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { FaSpinner } from "react-icons/fa";

const ProjectReviewStats = () => {
  const stats = [
    {
      key: "APPROVED",
      title: "Approved",
      value: 0,
      growth: "",
      growth_type: "up",
      description: "Approved submissions",
      link_text: "View all",
      icon: "Check",
      icon_bg_color: "#059669",
    },
    {
      key: "PENDING",
      title: "Pending Review",
      value: 0,
      growth: "",
      growth_type: "up",
      description: "Pending submissions",
      link_text: "View all",
      icon: "PendingReview",
      icon_bg_color: "#069576",
    },
    {
      key: "REJECTED",
      title: "Returned",
      value: 0,
      growth: "",
      growth_type: "up",
      description: "Returned submissions",
      link_text: "View all",
      icon: "ProjectInDraft",
      icon_bg_color: "#4881FF",
    },
    {
      key: "OVERDUE",
      title: "Overdue",
      value: 0,
      growth: "",
      growth_type: "down",
      description: "Overdue projects",
      link_text: "View all",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DC2626",
    },
  ];

  const {
    data: staffData,
    isLoading,
    error,
  } = useGetProjectReviewPageCardsQuery("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <FaSpinner className="animate-spin" size={24} />
      </div>
    );
  }

  if (error) return <div>Error during fetching data</div>;

  const dashboardData = staffData?.data;

  const processedDashboardData = stats.map((item) => {
    if (item.key === "OVERDUE") {
      return {
        ...item,
        value: `${dashboardData?.projectoverdue ?? 0}%`,
      };
    }

    return {
      ...item,
      value:
        dashboardData?.submissions?.[
          item.key as "APPROVED" | "PENDING" | "REJECTED"
        ] ?? item.value,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
      {processedDashboardData.map((item, index) => (
        <DashboardPanelStatsCard key={index} item={item} />
      ))}
      
    </div>
  );
};

export default ProjectReviewStats;
