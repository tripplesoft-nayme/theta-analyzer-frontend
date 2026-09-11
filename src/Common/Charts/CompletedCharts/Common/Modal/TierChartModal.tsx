import React from "react";
import { X, ArrowLeft, BarChart3 } from "lucide-react";

interface TierChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  tierLevel: number;
  title?: string;
  breadcrumbs?: { name: string; id: string; level: number }[];
  onBreadcrumbClick?: (index: number) => void;
}

const TierChartModal: React.FC<TierChartModalProps> = ({
  isOpen,
  onClose,
  children,
  tierLevel,
  title,
  breadcrumbs = [],
  onBreadcrumbClick,
}) => {
  if (!isOpen) return null;

  const zIndex = 50 + tierLevel * 10;
  const currentBreadcrumbIndex = breadcrumbs.length - 1;
  const parentBreadcrumb =
    breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

  const handleBack = () => {
    if (parentBreadcrumb && onBreadcrumbClick) {
      onBreadcrumbClick(currentBreadcrumbIndex - 1);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200"
      style={{ zIndex }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-slate-400"
          >
            <ArrowLeft size={20} />
          </button>

          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors text-red-500 group"
          >
            <X
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>

        {/* Breadcrumb / Context Bar */}
        <div className="px-8 py-3 bg-white dark:bg-slate-900 border-b border-gray-50 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <BarChart3 size={16} className="text-blue-500" />
          <div className="flex items-center gap-2 text-sm font-medium">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id || index}>
                {index > 0 && <span className="text-gray-300 dark:text-slate-700">/</span>}
                <button
                  onClick={() => onBreadcrumbClick?.(index)}
                  disabled={index === breadcrumbs.length - 1}
                  className={`transition-colors ${index === breadcrumbs.length - 1
                      ? "text-blue-600 dark:text-blue-400 cursor-default"
                      : "text-gray-500 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"
                    }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TierChartModal;
