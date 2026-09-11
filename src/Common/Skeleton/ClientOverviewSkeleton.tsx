import DashboardPanelStatsCardSkeleton from "./DashboardPanelStatsCardSkeleton";
import { DonutChartSkeleton } from "./DonutChartSkeleton";
import BoxContainer from "@/Common/BoxContainer";

const ClientOverviewSkeleton = () => {
  return (
    <div className="animate-pulse w-full space-y-6">
      {/* 1. Stats Cards Grid */}
      <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <DashboardPanelStatsCardSkeleton key={index} />
        ))}
      </div>

      {/* 2. AllProgramProject Skeleton */}
      <BoxContainer className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-9 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-3.5 w-24 bg-gray-150 dark:bg-slate-850 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-3 w-5/6 bg-gray-150 dark:bg-slate-850 rounded" />
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <div className="h-3.5 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-3.5 w-8 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="w-full h-2 bg-gray-150 dark:bg-slate-850 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </BoxContainer>

      {/* 3. Charts Grid */}
      <div className="grid xl:grid-cols-3 w-full gap-6">
        <div className="space-y-6 xl:col-span-2">
          {/* Overdue and Donut */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center justify-center">
            {/* ProjectOverdueBarChart Skeleton */}
            <BoxContainer className="h-[432px]">
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded mb-6" />
              <div className="space-y-4">
                {[75, 45, 60, 30, 50].map((width, index) => (
                  <div key={index} className="space-y-1">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div
                      className="h-7 bg-gray-200 dark:bg-slate-800 rounded-md"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ))}
              </div>
            </BoxContainer>

            {/* ProjectStatusDonutChart Skeleton */}
            <div className="h-[432px] w-full">
              <DonutChartSkeleton />
            </div>
          </div>

          {/* ProjectTimelineColumnChart Skeleton */}
          <BoxContainer className="h-[380px]">
            <div className="h-6 w-56 bg-gray-200 dark:bg-slate-800 rounded mb-6" />
            
            <div className="w-full h-[300px] flex flex-col">
              {/* Legend */}
              <div className="flex gap-4 text-xs font-semibold justify-end mr-6 mb-6 select-none">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400/40 dark:bg-blue-500/30" />
                  <span className="text-gray-400 dark:text-slate-500">Timeline Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-400/40 dark:bg-emerald-500/30" />
                  <span className="text-gray-400 dark:text-slate-500">Saved Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400/40 dark:bg-rose-500/30" />
                  <span className="text-gray-400 dark:text-slate-500">Overdue Days</span>
                </div>
              </div>

              {/* Graph Body */}
              <div className="relative w-full flex-1 flex">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-xs text-gray-400 dark:text-slate-500 h-full pr-4 pb-6 text-right select-none w-8 font-medium">
                  <span>40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>
                {/* Gridlines and Bars Container */}
                <div className="relative flex-1 h-full border-b border-gray-200 dark:border-slate-800 pb-6">
                  {/* Horizontal gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-slate-800/60" />
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-slate-800/60" />
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-slate-800/60" />
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-slate-800/60" />
                    <div className="w-full" />
                  </div>
                  {/* Columns */}
                  <div className="absolute inset-0 flex items-end justify-between px-6 z-10 pb-6">
                    {[
                      { timeline: 12, saved: 0, overdue: 18 },
                      { timeline: 0, saved: 0, overdue: 0 },
                      { timeline: 0, saved: 0, overdue: 0 },
                      { timeline: 0, saved: 0, overdue: 0 },
                      { timeline: 0, saved: 0, overdue: 0 },
                      { timeline: 0, saved: 0, overdue: 0 },
                      { timeline: 57, saved: 0, overdue: 3 },
                      { timeline: 78, saved: 12, overdue: 0 },
                    ].map((item, i) => {
                      const total = item.timeline + item.saved + item.overdue;
                      return (
                        <div key={i} className="flex flex-col items-center justify-end w-8 h-full relative">
                          {total > 0 && (
                            <div className="w-full flex flex-col justify-end" style={{ height: `${total}%` }}>
                              {item.overdue > 0 && (
                                <div
                                  className="w-full bg-rose-400/40 dark:bg-rose-500/30 rounded-t-sm"
                                  style={{ height: `${(item.overdue / total) * 100}%` }}
                                />
                              )}
                              {item.saved > 0 && (
                                <div
                                  className="w-full bg-emerald-400/40 dark:bg-emerald-500/30"
                                  style={{ height: `${(item.saved / total) * 100}%` }}
                                />
                              )}
                              {item.timeline > 0 && (
                                <div
                                  className="w-full bg-blue-400/40 dark:bg-blue-500/30 rounded-b-sm"
                                  style={{ height: `${(item.timeline / total) * 100}%` }}
                                />
                              )}
                            </div>
                          )}
                          {/* X-axis text placeholder absolutely positioned below container border */}
                          <div className="absolute top-full h-3 w-12 bg-gray-150 dark:bg-slate-800 rounded mt-2 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </BoxContainer>
        </div>

        <div className="grid grid-rows-2 gap-6 h-full min-h-0">
          {/* Upcoming Deadline Skeleton */}
          <BoxContainer className="h-full flex flex-col">
            <div className="h-6 w-44 bg-gray-200 dark:bg-slate-800 rounded mb-6" />
            <div className="space-y-4 flex-1 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-150 dark:border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-56 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="flex gap-2 mt-3">
                    {Array.from({ length: 3 }).map((__, j) => (
                      <div key={j} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </BoxContainer>

          {/* Activity Log Skeleton */}
          <BoxContainer className="h-full flex flex-col">
            <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-6" />
            <div className="space-y-6 py-2 flex-1 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="relative min-h-[70px] flex flex-col items-center">
                    <div className="size-2.5 rounded-full bg-gray-300 dark:bg-slate-700 shrink-0" />
                    <div className="w-px h-full bg-gray-200 dark:bg-slate-800 mt-1" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </BoxContainer>
        </div>
      </div>

      {/* 4. Latest Submission Skeleton */}
      <BoxContainer className="p-0!">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
          <div className="h-6 w-44 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                {["Submission", "Project", "Submitted By", "Date", "Status", "Action"].map((_, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 w-16 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-150 dark:border-slate-800">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-slate-800 w-2/3 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-slate-800 w-1/2 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-slate-800 w-2/3 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-slate-800 w-1/3 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-slate-800 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 dark:bg-slate-800 w-8 rounded-md" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BoxContainer>
    </div>
  );
};

export default ClientOverviewSkeleton;
