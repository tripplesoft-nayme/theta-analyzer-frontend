import ContentLoader from "react-content-loader";
import DashboardStatsCard from "@/components/staffEmployee/DashboardStatsCard";
import { useGetProjectReviewPageCardsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";

const iconMap: { [key: string]: string } = {
  APPROVED: "FolderIcon",
  PENDING: "FolderIcon",
  REJECTED: "LiveProject",
  projectoverdue: "ProjectInDraft",
};

export default function DashboardStats() {
  const { data, isLoading } = useGetProjectReviewPageCardsQuery({});

  const dashboardData = data?.data || {};

  const processedDashboardData = Object.keys(dashboardData).map(
    (key: string) => {
      const dataObj = (
        dashboardData as {
          [key: string]: { count: number; growth: number };
        }
      )[key];

      return {
        title: key,
        value: dataObj.count,
        growth: dataObj.growth,
        growth_type: dataObj.growth > 0 ? "up" : "down",
        link_text: "View all",
        icon: iconMap[key] || "FolderIcon",
        icon_bg_color: key === "overdueProjects" ? "#DA4352" : "#069576",
      };
    },
  );

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
