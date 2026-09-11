import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  /** Total number of items (replaces filteredDataLength / totalPrograms) */
  total: number;
  /** Called when a page is selected */
  onPageChange: (page: number) => void;
  /** Optional label shown after the count, e.g. "Programs" or "Projects" */
  label?: string;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  total,
  onPageChange,
  label,
  className = "",
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  // Smart windowing: first 2, last 1, current ±1, with ellipsis between gaps
  const getPageButtons = (): (number | "...")[] => {
    const buttons: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === 2 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push("...");
      }
    }
    // Remove consecutive ellipses
    return buttons.filter(
      (btn, idx, arr) => !(btn === "..." && arr[idx - 1] === "...")
    );
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}
    >
      {/* Showing X to Y of Z [label] */}
      <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
        Showing {startItem} to {endItem} of{" "}
        <span className="font-semibold text-gray-900 dark:text-slate-100">
          {total}
        </span>
        {label ? ` ${label}` : " items"}
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Prev Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Page Buttons */}
        {getPageButtons().map((btn, idx) =>
          btn === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-400 dark:text-slate-600 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={btn}
              onClick={() => onPageChange(btn)}
              className={`min-w-[36px] h-9 px-2 text-sm rounded-md transition-all font-medium ${
                currentPage === btn
                  ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                  : "border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
            >
              {btn}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
