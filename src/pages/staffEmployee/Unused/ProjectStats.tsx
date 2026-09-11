import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";

const ProjectStats = () => {
  const stats = [
    {
      title: "Total Project",
      value: 0,
      growth: "",
      growth_type: "up",
      description: "",
      link_text: "",
      icon: "FolderIcon",
      icon_bg_color: "#059669",
    },
    {
      title: "Assigned Stuff",
      value: 0,
      growth: "",
      growth_type: "",
      description: "",
      link_text: "",
      icon: "Users",
      icon_bg_color: "#4881FF",
    },
    {
      title: "Program Completion",
      value: 0,
      growth: "",
      growth_type: "",
      description: "",
      link_text: "",
      icon: "Chart",
      icon_bg_color: "#059669",
    },
    {
      title: "Overdue",
      value: 0,
      growth: "",
      growth_type: "",
      description: "",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DC2626",
    },
  ];

  return (
    <div className="grid grid-cols- sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
      {stats.map((item, index) => (
        <DashboardPanelStatsCard key={index} item={item} />
      ))}
    </div>
  );
};

export default ProjectStats;
