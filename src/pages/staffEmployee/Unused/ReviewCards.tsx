import ContentLoader from "react-content-loader";
import DashboardStatsCard from "@/components/staffEmployee/DashboardStatsCard";
import { useGetStaffEmployeeSubmissionStatusQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";

export default function ReviewCards() {
  const { data, isLoading } = useGetStaffEmployeeSubmissionStatusQuery({});

  const dashboardData = data?.data?.counts || {};

  const processedDashboardData = [
    {
      title: "Submitted for Review",
      value: dashboardData.submitted,
      description: "Awaiting for approval",
      icon: "FolderIcon",
      icon_bg_color: "#069576",
      growth_type: "up",
    },
    {
      title: "Returned for Edit",
      value: dashboardData.returned,
      description: "Awaiting for your edit",
      icon: "ProjectInDraft",
      icon_bg_color: "#F5B31A",
      growth_type: "up",
    },
    {
      title: "In Live",
      value: dashboardData.live,
      description: "Active and published",
      icon: "LiveProject",
      icon_bg_color: "#069576",
      growth_type: "up",
    },
    {
      title: "Submission Overdue",
      value: dashboardData.overdue,
      description: "Project data haven't submitted",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DA4352",
      growth_type: "down",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 my-6">
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
          <ContentLoader
            height="300"
            width="300"
            viewBox="0 0 265 230"
            key={index}
          >
            <rect x="15" y="50" rx="2" ry="2" width="350" height="150" />
            <rect x="15" y="230" rx="2" ry="2" width="170" height="20" />
            <rect x="60" y="230" rx="2" ry="2" width="170" height="20" />
          </ContentLoader>
        ))
        : processedDashboardData.map((item) => (
          <DashboardStatsCard key={item.title} item={item} />
        ))}
    </div>
  );
}
