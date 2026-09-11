import { useState } from "react";
import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import KPIWidgetConfig from "./KPIWidgetConfig";

interface KPISettings {
  showIndex: boolean;
  showFooter: boolean;
  showFooterLabel: boolean;
  showFooterButton: boolean;
}

interface StatsItem {
  title: string;
  value: string | number;
  growth: string;
  growth_type: "up" | "down" | string;
  description: string;
  link_text: string;
  icon: string;
  icon_bg_color: string;
  config?: KPISettings;
}

interface ProjectStatsProps {
  activeWidget: string;
  config?: KPISettings;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  activeWidget,
  config: globalConfig, // Rename to avoid confusion
}) => {
  const [activeCardTitle, setActiveCardTitle] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsItem[]>([
    {
      title: "Total Project",
      value: 56,
      growth: "+5%",
      growth_type: "up",
      description: "24 programs running this month",
      link_text: "View all",
      icon: "FolderIcon",
      icon_bg_color: "#059669",
      config: {
        showIndex: true,
        showFooter: true,
        showFooterLabel: true,
        showFooterButton: true,
      },
    },
    {
      title: "Live Project",
      value: 36,
      growth: "+2%",
      growth_type: "up",
      description: "150 new users joined",
      link_text: "View all",
      icon: "LiveProject",
      icon_bg_color: "#7C3AED",
      config: {
        showIndex: true,
        showFooter: true,
        showFooterLabel: true,
        showFooterButton: true,
      },
    },
    {
      title: "Project in draft",
      value: 15,
      growth: "+1.1%",
      growth_type: "up",
      description: "5 new clients joined",
      link_text: "View all",
      icon: "ProjectInDraft",
      icon_bg_color: "#2563EB",
      config: {
        showIndex: true,
        showFooter: true,
        showFooterLabel: true,
        showFooterButton: true,
      },
    },
    {
      title: "Pending Review",
      value: 75,
      growth: "+5%",
      growth_type: "up",
      description: "25 score growth",
      link_text: "View all",
      icon: "PendingReview",
      icon_bg_color: "#059669",
      config: {
        showIndex: true,
        showFooter: true,
        showFooterLabel: true,
        showFooterButton: true,
      },
    },
    {
      title: "Submission Overdue",
      value: "7.8%",
      growth: "",
      growth_type: "down",
      description: "50 Clients left",
      link_text: "View all",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DC2626",
      config: {
        showIndex: true,
        showFooter: true,
        showFooterLabel: true,
        showFooterButton: true,
      },
    },
  ]);

  const visibleStats =
    activeWidget === "KPI widget"
      ? stats
      : stats.filter((item) => item.title !== "Submission Overdue");

  const handleUpdateStat = (title: string, updatedStat: StatsItem) => {
    setStats((prev) =>
      prev.map((item) => (item.title === title ? updatedStat : item)),
    );
  };

  const handleDeleteStat = (title: string) => {
    setStats((prev) => prev.filter((item) => item.title !== title));
    if (activeCardTitle === title) setActiveCardTitle(null);
  };

  const handleCopyStat = (item: StatsItem) => {
    navigator.clipboard.writeText(`${item.title}: ${item.value}`);
  };

  return (
    <div className="flex gap-4 w-full">
      {/* Grid Area */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 cursor-pointer flex-1 transition-all`}
      >
        {visibleStats.map((item, index) => (
          <DashboardPanelStatsCard
            key={index}
            item={item}
            showIndex={item.config?.showIndex ?? globalConfig?.showIndex}
            showFooter={item.config?.showFooter ?? globalConfig?.showFooter}
            showFooterLabel={
              item.config?.showFooterLabel ?? globalConfig?.showFooterLabel
            }
            showFooterButton={
              item.config?.showFooterButton ?? globalConfig?.showFooterButton
            }
            onToggleWidget={() =>
              setActiveCardTitle(activeCardTitle === item.title ? null : item.title)
            }
            onDelete={() => handleDeleteStat(item.title)}
            onCopy={() => handleCopyStat(item)}
          />
        ))}
      </div>

      {/* Configuration Panel - Rendered Inline */}
      {activeCardTitle !== null && (
        <div className="min-w-[320px] max-w-[320px]">
          {(() => {
            const activeItem = stats.find((s) => s.title === activeCardTitle);
            if (!activeItem) return null;

            return (
              <KPIWidgetConfig
                config={
                  activeItem.config || {
                    showIndex: true,
                    showFooter: true,
                    showFooterLabel: true,
                    showFooterButton: true,
                  }
                }
                setConfig={(newConfig) => {
                  const currentConfig = activeItem.config || {
                    showIndex: true,
                    showFooter: true,
                    showFooterLabel: true,
                    showFooterButton: true,
                  };
                  const updatedFn =
                    typeof newConfig === "function"
                      ? newConfig(currentConfig)
                      : newConfig;
                  handleUpdateStat(activeItem.title, {
                    ...activeItem,
                    config: updatedFn,
                  });
                }}
                data={activeItem}
                onUpdateData={(newData) =>
                  handleUpdateStat(activeItem.title, {
                    ...activeItem,
                    ...newData,
                  })
                }
                onClose={() => setActiveCardTitle(null)}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ProjectStats;
