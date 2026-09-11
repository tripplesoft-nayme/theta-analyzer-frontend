import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTheme } from "@/Common/theme-provider";


import BoxContainer from "@/Common/BoxContainer";
import { useGetAllProgramQuery, useGetProgramByIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { useLazyGetTimelineQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ProgramSelectSkeleton = () => {
  return <div className="w-56 h-10 rounded-xl bg-slate-100 animate-pulse" />;
};

interface TimelineProject {
  id: string;
  name: string;
  timelineDays: number;
  savedDays: number;
  overdueDays: number;
}

interface Program {
  id: string;
  programName: string;
}

const ProjectTimelineColumnChart = () => {
  const { theme } = useTheme();
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [programSearch, setProgramSearch] = useState("");
  const debouncedSearch = useDebounce(programSearch, 500);
  const [programPage, setProgramPage] = useState(1);
  const [loadedPrograms, setLoadedPrograms] = useState<Program[]>([]);
  const [openProgram, setOpenProgram] = useState(false);

  const { data: programRes, isLoading: programLoading } = useGetAllProgramQuery({
    page: programPage,
    limit: 10,
    programName: debouncedSearch,
  });

  const { data: selectedProgramData } = useGetProgramByIdQuery(selectedProgramId, {
    skip: !selectedProgramId,
  });

  const [getTimeline, { data: timelineRes, isFetching }] =
    useLazyGetTimelineQuery();

  const projectData = useMemo(() => (timelineRes?.data?.projects as TimelineProject[]) ?? [], [timelineRes]);

  // Reset/Clear program states when search query changes
  useEffect(() => {
    setProgramPage(1);
    setLoadedPrograms([]);
  }, [debouncedSearch]);

  // Reset search when popover closes
  useEffect(() => {
    if (!openProgram) {
      setProgramSearch("");
    }
  }, [openProgram]);

  // Accumulate programs
  useEffect(() => {
    if (programRes?.data?.data) {
      const newPrograms = programRes.data.data.map((item: any) => ({
        id: item.id,
        programName: item.programName,
      }));
      setLoadedPrograms((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPrograms.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });
    }
  }, [programRes]);

  /* ---------- Default Program Selection ---------- */
  useEffect(() => {
    if (!selectedProgramId && loadedPrograms.length > 0) {
      setSelectedProgramId(loadedPrograms[0].id);
    }
  }, [loadedPrograms, selectedProgramId]);

  const hasMorePrograms = programRes?.data?.meta
    ? programPage < programRes.data.meta.totalPages
    : false;

  const displayProgramName =
    loadedPrograms.find((p) => p.id === selectedProgramId)?.programName ||
    selectedProgramData?.data?.programName ||
    "Select Program";

  /* ---------- fetch timeline on program change ---------- */
  useEffect(() => {
    if (!selectedProgramId) return;
    getTimeline({ programId: selectedProgramId });
  }, [selectedProgramId, getTimeline]);

  /* ---------- chart data ---------- */
  const chartState = useMemo(() => {
    const categories = projectData.map((p) => p.name);

    return {
      series: [
        {
          name: "Timeline Days",
          data: projectData.map((p) => p.timelineDays ?? 0),
        },
        {
          name: "Saved Days",
          data: projectData.map((p) => p.savedDays ?? 0),
        },
        {
          name: "Overdue Days",
          data: projectData.map((p) => p.overdueDays ?? 0),
        },
      ],
      options: {
        chart: {
          type: "bar",
          stacked: true,
          toolbar: { show: false },
          zoom: { enabled: false },
          fontFamily: "'Inter', sans-serif",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
          background: "transparent",
        },
        theme: {
          mode: theme as "light" | "dark",
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            borderRadiusApplication: "end",
            borderRadiusWhenStacked: "all",
            columnWidth: "35%",
          },
        },
        dataLabels: { enabled: false },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        grid: {
          borderColor: theme === "dark" ? "#1e293b" : "#cbd5e1",
          strokeDashArray: 4,
          padding: {
            left: 20,
            right: 20,
          },
        },
        xaxis: {
          categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: theme === "dark" ? "#94a3b8" : "#64748b",
              fontSize: "12px",
              fontWeight: 500,
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: theme === "dark" ? "#94a3b8" : "#64748b",
              fontSize: "12px",
              fontWeight: 500,
            },
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "right",
          markers: { shape: "circle", offsetY: 0 },
          fontSize: "13px",
          fontWeight: 600,
          itemMargin: { horizontal: 15, vertical: 10 },
          labels: { colors: theme === "dark" ? "#94a3b8" : "#64748B" },
        },
        colors: ["#3B82F6", "#10B981", "#EF4444"],
        tooltip: {
          theme: theme as "light" | "dark",
          y: {
            formatter: (val: number) => `${val} days`,
          },
        },
        noData: {
          text: "No timeline data available",
          style: {
            color: "#94A3B8",
            fontSize: "14px",
          },
        },
      } as ApexOptions,
    };
  }, [projectData]);

  return (
    <BoxContainer className="relative overflow-hidden group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-start gap-3.5">
          <div>
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 tracking-tight">
              Project Timeline
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {programLoading && loadedPrograms.length === 0 ? (
            <ProgramSelectSkeleton />
          ) : (
            <Popover open={openProgram} onOpenChange={setOpenProgram}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProgram}
                  className="w-56 justify-between bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[13px] h-10 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg shadow-none"
                >
                  <span className="truncate">{displayProgramName}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0 z-[100] rounded-xl overflow-hidden border dark:border-slate-800 shadow-2xl">
                <Command shouldFilter={false} className="dark:bg-slate-900">
                  <CommandInput
                    placeholder="Search program..."
                    value={programSearch}
                    onValueChange={(val) => setProgramSearch(val)}
                    className="h-9 text-[13px]"
                  />
                  <CommandList className="max-h-60">
                    {loadedPrograms.length === 0 && !programLoading && (
                      <CommandEmpty className="text-xs text-slate-400 py-3 text-center">No program found.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {loadedPrograms.map((program) => (
                        <CommandItem
                          key={program.id}
                          value={program.programName}
                          onSelect={() => {
                            setSelectedProgramId(program.id);
                            setOpenProgram(false);
                          }}
                          className="cursor-pointer text-[13px] rounded-lg py-2"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-blue-500",
                              selectedProgramId === program.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{program.programName}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {hasMorePrograms && (
                      <div className="p-1 text-center border-t border-gray-100 dark:border-slate-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-blue-600 hover:text-blue-700 h-8 font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProgramPage((prev) => prev + 1);
                          }}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {isFetching ? (
        <div className="w-full h-[350px] flex flex-col animate-pulse">
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
      ) : (
        <div className="relative z-10">
          <Chart
            options={chartState.options}
            series={chartState.series}
            type="bar"
            height={350}
          />
        </div>
      )}
    </BoxContainer>
  );
};

export default ProjectTimelineColumnChart;
