/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { JSX, useEffect, useRef, useState } from "react";
import { FaChartPie, FaUsers } from "react-icons/fa";
import { IClientPanelStats } from "@/types";
import { useLocation } from "react-router-dom";

interface IProps {
  item: IClientPanelStats;
  showIndex?: boolean; // Controls Growth/Trend display based on "Show Index" config
  showFooter?: boolean;
  showFooterLabel?: boolean;
  showFooterButton?: boolean;
  onToggleWidget?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

import { BsThreeDots } from "react-icons/bs";
import { MdOutlineWidgets } from "react-icons/md";
import { Copy, Trash2 } from "lucide-react";

const DashboardPanelStatsCard = ({
  item,
  showIndex = true,
  showFooter = true,
  showFooterLabel = true,
  // showFooterButton = true,
  onToggleWidget,
  onDelete,
  onCopy,
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  // ... (keeping other state)

  const {
    title,
    value,
    growth = "",
    description,
    growth_type,
    icon,
    icon_bg_color,
  } = item;
  const [iconType] = useState(icon);

  // ... (keeping icon logic same)

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
  const currentPathname = location.pathname;
  const isInStaffManager =
    currentPathname === "/staff-manager-panel/project-review/all-projects";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !(ref.current as any).contains(event.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <div className="w-full h-full">
      <div
        className={`${growth_type === "down"
          ? "bg-[#FDF4F5] dark:bg-rose-500/5 text-red-600 dark:text-rose-400"
          : "bg-[#EBFFF2] dark:bg-emerald-500/5 text-green-600 dark:text-emerald-400"
          } rounded-lg flex flex-col justify-between h-full border border-[#CAD2DB] dark:border-slate-800 transform transition-transform duration-300 hover:scale-102 relative`}
      >
        {/* Menu Button - Absolute Top Right */}
        {(currentPathname.split("/").pop() === "project-builder" ||
          currentPathname.split("/").pop() === "program-builder") && (
            <div ref={ref as any} className="absolute right-2 top-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopover(!showPopover);
                }}
                className="p-1 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <BsThreeDots />
              </button>
              {showPopover && (
                <div className="absolute right-0 top-6 w-32 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded shadow-lg py-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleWidget) onToggleWidget();
                      setShowPopover(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-left"
                  >
                    <MdOutlineWidgets size={16} /> Widget
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCopy) onCopy();
                      setShowPopover(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Copy size={16} /> Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete();
                      setShowPopover(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-rose-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}

        <div className="bg-white dark:bg-slate-900 shadow-xs shadow-gray-100 dark:shadow-none rounded-lg p-5 flex-1">
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 border border-[#CAD2DB] dark:border-slate-800 rounded-xl text-[28px] text-white"
              style={{ backgroundColor: icon_bg_color }}
            >
              {IconElement}
            </div>

            <h3 className="text-gray-700 dark:text-slate-200 font-semibold text-xl">{title}</h3>
          </div>

          {/* Value and growth */}
          <div className="flex items-center justify-between overflow-hidden">
            <span className="text-4xl font-medium text-gray-900 dark:text-slate-100 w-2/3 overflow-hidden">
              {value}
              {title === "Overdue" && Number.isFinite(Number(value)) && "%"}
            </span>

            {(() => {
              if (title.toLowerCase().includes("overdue")) {
                return null;
              }

              const getGrowthNumber = (val: string | number) => {
                if (typeof val === "number") return val;
                const cleaned = val.toString().replace(/[+%]/g, "").trim();
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
              };
              const growthNum = getGrowthNumber(growth);
              const hasGrowth = growth !== undefined && growth !== null && growth !== "";

              return (
                showIndex && hasGrowth && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${growthNum > 0
                      ? "bg-green-100 dark:bg-emerald-500/10 text-[#169E7B] dark:text-emerald-400"
                      : growthNum < 0
                        ? "bg-red-100 dark:bg-rose-500/10 text-red-600 dark:text-rose-400"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                      }`}
                  >
                    {(() => {
                      const clean = growth.toString().replace(/[+\-%]/g, "").trim();
                      const isNegative = growth.toString().startsWith("-") || growthNum < 0;
                      return (isNegative ? "-" : "+") + clean + "%";
                    })()}
                    {growthNum > 0 && <TrendingUp className=" size-4" />}
                    {growthNum < 0 && <TrendingDown className=" size-4" />}
                  </span>
                )
              );
            })()}
          </div>
        </div>
        {/* Description & Link */}
        {showFooter && (
          <div className="flex items-center justify-between text-sm text-gray-700 dark:text-slate-400 px-6 py-4">
            {!isInStaffManager && (
              <>
                {showFooterLabel && (
                  <span className="">{description || "\u00A0"}</span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardPanelStatsCard;
