import { useState, useEffect, useRef } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Trash2, Download, Pencil } from "lucide-react";
import { MdOutlineWidgets } from "react-icons/md";
import { GoPlus } from "react-icons/go";
import { useLocation } from "react-router-dom";
// import { useLocation } from "react-router-dom";

type MenuActions = {
  onCopy?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onAddTier?: () => void;
  onToggleWidget?: () => void;
  onEdit?: () => void;
};

type Props = {
  title: string;
  groupTitle?: string;
  subtitle?: string;
  children: React.ReactNode;
  onChartDelete?: () => void;
  footer?: React.ReactNode;
  menuActions: MenuActions;
  isDownloading?: boolean;
  tierLevel?: number;
  onHeaderClick?: () => void;
  customHeaderContent?: React.ReactNode; // For extra icons/text in header
  className?: string;
  isPreview?: boolean;
};

const ChartCardWrapper = ({
  title,
  groupTitle,
  subtitle,
  children,
  // onChartDelete,
  footer,
  menuActions,
  isDownloading = false,
  tierLevel = 0,
  onHeaderClick,
  customHeaderContent,
  className = "",
  isPreview = false,
}: Props) => {
  // const location = useLocation()
  // const isProgramBuilder = location.pathname.includes("program-builder")
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isProgramBuilder = location.pathname.includes("program-builder");
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopover]);

  const handleAction = (action?: () => void) => {
    if (action) {
      action();
    }
    setShowPopover(false);
  };

  const hasCustomHeight = className.includes("h-fit") || className.includes("h-auto") || className.includes("h-") || className.includes("min-h-");
  const heightClass = hasCustomHeight ? "" : "h-full";

  return (
    <div
      className={`w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 ${heightClass} flex flex-col ${onHeaderClick ? "cursor-pointer" : ""
        } ${className}`}
      onClick={() => {
        if (onHeaderClick) {
          onHeaderClick();
        }
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 shrink-0 gap-4">
        <div className="flex flex-col min-w-0">
          {groupTitle && (
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">
              {groupTitle}
            </p>
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="flex flex-1 items-center justify-end gap-4 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {customHeaderContent}

          {/* MENU 3-DOTS */}
          {!isPreview && (
            <div
              className="relative border-l border-border dark:border-slate-800 pl-4 ml-1 shrink-0"
              ref={popoverRef}
            >
              <button
                className="p-2 border border-gray-200 dark:border-slate-800 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors "
                onClick={() => setShowPopover(!showPopover)}
              >
                <BsThreeDots size={18} />
              </button>

              {showPopover && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg  p-2 z-999">
                  {/* COPY */}
                  {/* {menuActions.onCopy && (
                    <button
                      onClick={() => handleAction(menuActions.onCopy)}
                      className="w-full flex gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded text-left items-center dark:text-slate-200"
                    >
                      <Copy size={18} /> Copy
                    </button>
                  )} */}

                  {/* EDIT */}
                  {menuActions.onEdit && (
                    <button
                      onClick={() => handleAction(menuActions.onEdit)}
                      className="w-full flex gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded text-left items-center text-blue-500 dark:text-blue-400 font-medium"
                    >
                      <Pencil size={18} /> Edit
                    </button>
                  )}

                  {/* DOWNLOAD - Only for Root */}
                  {tierLevel === 0 && menuActions.onDownload && (
                    <button
                      onClick={() => handleAction(menuActions.onDownload)}
                      disabled={isDownloading}
                      className="w-full flex gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded text-left items-center dark:text-slate-200"
                    >
                      <Download size={18} />{" "}
                      {isDownloading ? "Downloading..." : "Download"}
                    </button>
                  )}

                  {/* DELETE */}
                  {menuActions.onDelete && (
                    <button
                      onClick={() => handleAction(menuActions.onDelete)}
                      className="w-full flex gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded text-red-600 dark:text-rose-400 text-left items-center"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  )}

                  {/* WIDGET TOGGLE */}
                  {menuActions.onToggleWidget && (
                    <button
                      onClick={() => handleAction(menuActions.onToggleWidget)}
                      className="w-full flex gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded text-left items-center dark:text-slate-200"
                    >
                      <MdOutlineWidgets size={18} /> Widget
                    </button>
                  )}

                  {/* ADD TIER */}
                  {!isProgramBuilder && menuActions.onAddTier && (
                    <button
                      onClick={() => handleAction(menuActions.onAddTier)}
                      className="w-full flex gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded text-left items-center dark:text-slate-200"
                    >
                      <GoPlus size={18} /> Add Tier
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 w-full min-h-0 flex flex-col">{children}</div>

      {/* FOOTER */}
      {footer && <div className="mt-4 text-center shrink-0">{footer}</div>}
    </div>
  );
};

export default ChartCardWrapper;
