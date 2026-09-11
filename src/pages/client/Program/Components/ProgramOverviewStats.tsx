import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";

interface ProgramOverviewStatsProps {
  overviewData?: any;
}

const ProgramOverviewStats = ({ overviewData }: ProgramOverviewStatsProps) => {
  const data = overviewData?.data || overviewData || {};

  const getGrowthString = (val: any) => {
    if (val === undefined || val === null) return "";
    if (typeof val === "string") return val;
    return `${val >= 0 ? "+" : ""}${val}%`;
  };

  const getPercentString = (val: any) => {
    if (val === undefined || val === null) return "0%";
    if (typeof val === "string") {
      return val.endsWith("%") ? val : `${val}%`;
    }
    return `${val}%`;
  };

  const getGrowthType = (val: any) => {
    if (val === undefined || val === null) return "neutral";
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return "neutral";
    if (num > 0) return "up";
    if (num < 0) return "down";
    return "neutral";
  };

  const totalProjects = data.totalProject?.total || 0;
  const completedProjects = data.programCompletion?.total || 0;
  const completionPercent = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const stats = [
    {
      title: "Total Project",
      value: data.totalProject?.total ?? 0,
      growth: getGrowthString(data.totalProject?.percentage),
      growth_type: getGrowthType(data.totalProject?.percentage),
      description: `${data.overdue?.total ?? 0} Overdue`,
      link_text: "View all project",
      icon: "FolderIcon",
      icon_bg_color: "#059669",
    },
    {
      title: "Assigned Staff",
      value: data.assignedStaff?.total ?? 0,
      growth: getGrowthString(data.assignedStaff?.percentage),
      growth_type: getGrowthType(data.assignedStaff?.percentage),
      description: `${data.assignedStaff?.thisMonth ?? 0} this month`,
      link_text: "View all",
      icon: "Users",
      icon_bg_color: "#4881FF",
    },
    {
      title: "Program Completion",
      value: getPercentString(completionPercent),
      growth: getGrowthString(data.programCompletion?.percentage),
      growth_type: getGrowthType(data.programCompletion?.percentage),
      description: `${data.programCompletion?.total ?? 0} Completed`,
      link_text: "View all",
      icon: "Chart",
      icon_bg_color: "#059669",
    },
    {
      title: "Overdue",
      value: data.overdue?.total ?? 0,
      growth: getGrowthString(data.overdue?.percentage),
      growth_type: getGrowthType(data.overdue?.percentage),
      description: "Projects past deadline",
      link_text: "View all",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DC2626",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer mb-6">
      {stats.map((item, index) => (
        <DashboardPanelStatsCard key={index} item={item} />
      ))}
    </div>
  );
};

export default ProgramOverviewStats;
