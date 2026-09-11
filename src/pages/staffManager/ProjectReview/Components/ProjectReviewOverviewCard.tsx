import { useGetProjectReviewPageCardsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import DashboardStatsCard from "./ProjectReviewStatsCard";
import DashboardPanelStatsCardSkeleton from "@/Common/Skeleton/DashboardPanelStatsCardSkeleton";

export default function ProjectReviewOverviewCard() {
  const { data, isLoading } = useGetProjectReviewPageCardsQuery({});

  const dashboardData = data?.data?.submissions || {};
  const projectOverdue = data?.data?.projectoverdue || 0;

  const cardData = [
    {
      title: "Approved",
      value: dashboardData.APPROVED || 0,
      icon: "Check",
      icon_bg_color: "#069576",
      growth: 0,
      growth_type: "up",
      description: "0 score growth",
    },
    {
      title: "Pending Review",
      value: dashboardData.PENDING || 0,
      icon: "PendingReview",
      icon_bg_color: "#FF974B",
      growth: 0,
      growth_type: "up",
      description: "0 score growth",
    },
    {
      title: "Returned",
      value: dashboardData.REJECTED || 0,
      icon: "LiveProject",
      icon_bg_color: "#4881FF",
      growth: 0,
      growth_type: "down",
      description: "0 new clients joined",
    },
    {
      title: "Overdue",
      value: projectOverdue,
      icon: "SubmissionOverdue",
      icon_bg_color: "#DA4352",
      growth: 0,
      growth_type: "down",
      description: "0 clients left",
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <DashboardPanelStatsCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map((item) => (
            <DashboardStatsCard key={item.title} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
