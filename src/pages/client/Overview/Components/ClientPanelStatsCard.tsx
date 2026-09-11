import {
  CircleCheckBig,
  ClockAlert,
  Files,
  FileWarning,
  Folders,
  Radio,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { JSX, useState } from "react";
import { FaChartPie, FaUsers } from "react-icons/fa";
import { IClientPanelStats } from "@/types";
import { useLocation } from "react-router-dom";

interface IProps {
  item: IClientPanelStats;
}

const ClientPanelStatsCard = ({ item }: IProps) => {
  const {
    title,
    value,
    growth = "",
    description,
    growth_type,
    // link_text,
    icon,
    icon_bg_color,
  } = item;
  const [iconType] = useState(icon);

  const IconCollection: Record<string, JSX.Element> = {
    FolderIcon: <Folders />,
    LiveProject: <Radio />,
    PendingReview: <FileWarning />,
    SubmissionOverdue: <ClockAlert />,
    ProjectInDraft: <Files />,
    Check: <CircleCheckBig />,
    Users: <FaUsers />,
    Chart: <FaChartPie />,
  };

  const IconElement = Object.keys(IconCollection).includes(iconType as string)
    ? IconCollection[iconType as string]
    : null;

  // getting path
  const location = useLocation();

  // Get the path after the domain name (e.g., '/products/5')
  const currentPathname = location.pathname;
  const isInStaffManager =
    currentPathname === "/staff-manager-panel/project-review/all-projects";

  return (
    <div className="h-full">
      <div
        className={`${growth_type === "up"
          ? "bg-[#EBFFF2] dark:bg-emerald-500/5 text-green-600 dark:text-emerald-400"
          : growth_type === "down"
            ? "bg-[#FDF4F5] dark:bg-rose-500/5 text-red-600 dark:text-rose-400"
            : "bg-[#F8FAFC] dark:bg-slate-800/20 text-slate-600 dark:text-slate-400"
          } rounded-lg flex flex-col justify-between h-full border border-[#CAD2DB] dark:border-slate-800 transform transition-transform duration-300 hover:scale-102 overflow-hidden`}
      >
        <div className="bg-white dark:bg-slate-900 shadow-xs shadow-gray-100 dark:shadow-none rounded-lg p-5 flex-1">
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 border border-[#CAD2DB] dark:border-slate-800 rounded-xl text-[28px] text-white"
              style={{ backgroundColor: icon_bg_color }}
            >
              {IconElement}
            </div>

            <h3 className="text-gray-700 dark:text-slate-200 font-semibold text-lg">{title}</h3>
          </div>

          {/* Value and growth */}
          <div className="flex items-center justify-between overflow-hidden">
            <span className="text-4xl font-medium text-gray-900 dark:text-slate-100 w-2/3 overflow-hidden">
              {value}
              {title === "Overdue" && "%"}
            </span>

            {(() => {
              if (title.toLowerCase().includes("overdue")) {
                return null;
              }

              const hasGrowth = growth !== undefined && growth !== null && growth !== "";

              return (
                hasGrowth && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${growth_type === "up"
                      ? "bg-green-100 dark:bg-emerald-500/10 text-[#169E7B] dark:text-emerald-400"
                      : growth_type === "down"
                        ? "bg-red-100 dark:bg-rose-500/10 text-red-600 dark:text-rose-400"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                      }`}
                  >
                    {(() => {
                      const clean = growth.toString().replace(/[+\-%]/g, "").trim();
                      const isNegative = growth.toString().startsWith("-") || growth_type === "down";
                      return (isNegative ? "-" : "+") + clean + "%";
                    })()}
                    {growth_type === "up" && <TrendingUp className=" size-4" />}
                    {growth_type === "down" && <TrendingDown className=" size-4" />}
                  </span>
                )
              );
            })()}
          </div>
        </div>
        {/* Description & Link */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 px-6 py-4">
          {!isInStaffManager && (
            <>
              <span className="">{description || "\u00A0"}</span>
              {/* <Link to={`#`} className="text-blue-500 no-underline font-medium">
                {link_text} &rarr;
              </Link> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClientPanelStatsCard;
