/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import type { LegendValue } from "./chartTypes";
import { ListFilter } from "lucide-react";

type HeaderProps = {
  effectiveLegendValues: LegendValue[];
  children?: React.ReactNode;
};

export const ChartLegendHeader = ({
  effectiveLegendValues,
  children,
}: HeaderProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        // approx 1 line height threshold (e.g. 28px)
        const isOver = containerRef.current.scrollHeight > 28;
        setIsOverflowing(isOver);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [effectiveLegendValues]);

  return (
    <div className="flex flex-1 items-center gap-3 relative justify-end min-w-0">
      {/* Invisible measuring container - always occupies the same layout structure/width in the background but invisible */}
      <div
        ref={containerRef}
        className="absolute left-0 right-0 flex flex-wrap gap-x-3 gap-y-2 justify-end max-h-[20px] overflow-hidden min-w-0 opacity-0 pointer-events-none"
        style={{ visibility: "hidden" }}
      >
        {effectiveLegendValues.map((l) =>
          l.label ? (
            <div key={l.field} className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-2.5 h-2.5" />
              <span>{l.label}</span>
            </div>
          ) : null,
        )}
      </div>

      {/* LEGEND LIST (MAX 1 LINE, ONLY IF NOT OVERFLOWING) */}
      {!isOverflowing && (
        <div className="flex flex-wrap gap-x-3 gap-y-2 justify-end max-h-[20px] overflow-hidden min-w-0">
          {effectiveLegendValues.map((l) =>
            l.label ? (
              <div key={l.field} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0 border border-white dark:border-slate-800"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 whitespace-nowrap">
                  {l.label}
                </span>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* MORE ICON (ONLY IF OVERFLOWING) */}
      {isOverflowing && (
        <div
          className="relative shrink-0"
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
        >
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/50 px-2 py-1.5 rounded-md border border-border dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <ListFilter size={14} className="text-gray-500 dark:text-slate-400" />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 tracking-normal">
              {effectiveLegendValues.length} Legends
            </span>
          </div>

          {/* POPOVER (Bridged with a transparent padding to prevent premature closing) */}
          {showPopover && (
            <div className="absolute right-0 top-full pt-2 z-[1000] animate-in fade-in zoom-in duration-200">
              <div className="w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-gray-50 dark:border-slate-800 pb-2">
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    All Legends
                  </h4>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                    {effectiveLegendValues.length} Total
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {effectiveLegendValues.map((l) => (
                    <div
                      key={l.field}
                      className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 truncate">
                        {l.label || "Untitled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export const ChartChildTierFooter = ({
  childTiers,
}: {
  childTiers?: any[];
}) => {
  if (!childTiers || childTiers.length === 0) return undefined;

  return (
    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium cursor-pointer transition-all">
      Click chart to view {childTiers.length} child tier
      {childTiers.length > 1 ? "s" : ""}
    </p>
  );
};
