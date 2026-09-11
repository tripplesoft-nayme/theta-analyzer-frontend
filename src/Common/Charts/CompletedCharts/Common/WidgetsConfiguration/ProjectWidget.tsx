import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table,
  Circle,
  // GanttChartSquare,
  Image,
  CircleGauge,
  ChartBarIncreasing,
  Flame,
  ChartArea,
  Gauge,
  Tally4,
  Bubbles,
  ChartScatter,
  Cone,
  ChartColumnBig,
  ChartColumnStacked,
  ChartLine,
  FileChartPie,
  SquareKanban,
  ChartCandlestick,
  Map,
  CalendarDays,
  // SquareChartGantt,
  ChartNoAxesCombined,
  // PanelTopBottomDashed,
  NotepadTextDashed,
  Users,
  Spline,
  Search,
  ChartPie,
  Check,
  ChevronsUpDown,
  Info,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { widgetsData } from "./widgetsData";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

import SelectSkeleton from "@/Common/Skeleton/SelectSkeleton";

import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setProgramId,
  setProjectId,
  setSelectedTemplate,
} from "@/store/Slices/ChartSlice/ChartSlice";
import {
  useGetAllProgramQuery,
  useLazyGetProjectsByProgramIdQuery,
  useGetProgramByIdQuery,
} from "@/store/Api/ProgramApi/ProgramApi";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useDebounce } from "@/hooks/useDebounce";

import {
  useMyTemplatesQuery,
  useApplyTemplateMutation,
  useGetProgramBuilderTemplatesByOwnerQuery,
  useApplyProgramBuilderTemplateMutation,
} from "@/store/Api/ChartApi/chartTemplateApi";
import { toast } from "sonner";

export interface Widget {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  chartInfo?: any;
}

const SESSION_KEY_PROJECT = "chartBuilder_projectId";
const SESSION_KEY_PROGRAM = "chartBuilder_programId";

interface ProjectWidgetProps {
  onWidgetSelect: (widgetId: string) => void;
  onShowInfo?: (widget: Widget | null) => void;
  activeWidgetInfo?: Widget | null;
}

const ProjectWidget: React.FC<ProjectWidgetProps> = ({
  onWidgetSelect,
  onShowInfo,
  activeWidgetInfo
}) => {
  const { pathname } = useLocation();
  const isProgramBuilder = pathname.split("/")[2] === "program-builder";
  const { state } = useLocation();
  const { projectId: defaultProjectId, programId: defaultProgramId } =
    state || {};

  const { programId: reduxProgramId, projectId: reduxProjectId, selectedTemplate } =
    useAppSelector((state) => state.chartSlice);

  // Resolve initial values: locationState → Redux → sessionStorage → ""
  const [selectedProgram, setSelectedProgram] = useState<string>(
    reduxProgramId ||
    defaultProgramId ||
    sessionStorage.getItem(SESSION_KEY_PROGRAM) ||
    "",
  );
  const [selectedProject, setSelectedProject] = useState<string>(
    isProgramBuilder
      ? ""
      : reduxProjectId ||
      defaultProjectId ||
      sessionStorage.getItem(SESSION_KEY_PROJECT) ||
      "",
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [openProgram, setOpenProgram] = useState(false);
  const [openProject, setOpenProject] = useState(false);
  const [openTemplate, setOpenTemplate] = useState(false);

  useEffect(() => {
    if (!selectedTemplate) {
      setSelectedTemplateId("");
    }
  }, [selectedTemplate]);

  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId;

  const projectTemplatesQuery = useMyTemplatesQuery({}, { skip: isProgramBuilder });
  const programTemplatesQuery = useGetProgramBuilderTemplatesByOwnerQuery(userId as string, {
    skip: !isProgramBuilder || !userId
  });

  const templatesRes = isProgramBuilder ? programTemplatesQuery.data : projectTemplatesQuery.data;
  const [, { isLoading: isApplyingProjectTemplate }] = useApplyTemplateMutation();
  const [, { isLoading: isApplyingProgramTemplate }] = useApplyProgramBuilderTemplateMutation();

  const isApplyingTemplate = isApplyingProjectTemplate || isApplyingProgramTemplate;
  const templates = templatesRes?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const iconMap: Record<string, React.ReactNode> = {
    "sample-bar-chart": <ChartColumnBig className="w-5 h-5" />,
    "stacked-bar-chart": <ChartColumnStacked className="w-5 h-5" />,
    "horizontal-bar-chart": <ChartBarIncreasing className="w-5 h-5" />,
    "horizontal-stacked-bar-chart": <ChartBarIncreasing className="w-5 h-5" />,
    "column-chart": <ChartColumnBig className="w-5 h-5" />,
    "line-chart": <LineChartIcon className="w-5 h-5" />,
    "multi-axis-line-chart": <LineChartIcon className="w-5 h-5" />,
    "sparklines-chart": <ChartArea className="w-5 h-5" />,
    "area-chart": <ChartArea className="w-5 h-5" />,
    "spline-area-chart": <ChartArea className="w-5 h-5" />,
    "pie-chart": <PieChartIcon className="w-5 h-5" />,
    "marimekko-chart": <ChartColumnStacked className="w-5 h-5" />,
    "bubble-chart": <Bubbles className="w-5 h-5" />,
    "scatter-chart": <ChartScatter className="w-5 h-5" />,
    "heat-map-chart": <Flame className="w-5 h-5" />,
    "calendar-heatmap-chart": <CalendarDays className="w-5 h-5" />,
    "geographic-map": <Map className="w-5 h-5" />,
    "histogram-chart": <Tally4 className="w-5 h-5" />,
    "pareto-chart": <ChartLine className="w-5 h-5" />,
    "treemap-chart": <Map className="w-5 h-5" />,
    "waterfall-chart": <SquareKanban className="w-5 h-5" />,
    "funnel-chart": <Cone className="w-5 h-5" />,
    "gauge-chart": <Gauge className="w-5 h-5" />,
    "progress-ring": <Circle className="w-5 h-5" />,
    "rag-chart": <ChartLine className="w-5 h-5" />,
    "bullet-chart": <NotepadTextDashed className="w-5 h-5" />,
    kpi: <CircleGauge className="w-5 h-5" />,
    "decomposition-tree": <SquareKanban className="w-5 h-5 rotate-90" />,
    "ribbon-chart": <Spline className="w-5 h-5" />,
    "matrix-table-chart": <Table className="w-5 h-5" />,
    "data-table": <Table className="w-5 h-5" />,
    "radar-chart": <FileChartPie className="w-5 h-5" />,
    "polar-area-chart": <ChartPie className="w-5 h-5" />,
    "candle-chart": <ChartCandlestick className="w-5 h-5" />,
    "combo-chart": <ChartNoAxesCombined className="w-5 h-5" />,
    "logarithmic-chart": <ChartLine className="w-5 h-5" />,
    "box-plot": <ChartCandlestick className="w-5 h-5" />,
    "cohort-analysis": <Users className="w-5 h-5" />,
    "project-information": <Table className="w-5 h-5" />,
    "media-widget": <Image className="w-5 h-5" />,
  };

  const widgets: Widget[] = widgetsData.map((data) => ({
    id: data.id,
    name: data.name,
    description: data.description,
    icon: iconMap[data.id] || <Circle className="w-5 h-5" />,
    chartInfo: data,
  }));

  // Program Search & Pagination State
  const [programSearch, setProgramSearch] = useState("");
  const debouncedProgramSearch = useDebounce(programSearch, 500);
  const [programPage, setProgramPage] = useState(1);
  const [loadedPrograms, setLoadedPrograms] = useState<{ id: string; name: string }[]>([]);

  // Project Search & Pagination State
  const [projectSearch, setProjectSearch] = useState("");
  const debouncedProjectSearch = useDebounce(projectSearch, 500);
  const [projectPage, setProjectPage] = useState(1);
  const [loadedProjects, setLoadedProjects] = useState<{ id: string; name: string }[]>([]);

  // Reset/Clear program states when search query changes
  useEffect(() => {
    setProgramPage(1);
    setLoadedPrograms([]);
  }, [debouncedProgramSearch]);

  // Reset/Clear project states when program changes or search query changes
  useEffect(() => {
    setProjectPage(1);
    setLoadedProjects([]);
  }, [selectedProgram, debouncedProjectSearch]);

  // Reset searches on popover close
  useEffect(() => {
    if (!openProgram) {
      setProgramSearch("");
    }
  }, [openProgram]);

  useEffect(() => {
    if (!openProject) {
      setProjectSearch("");
    }
  }, [openProject]);

  const { data: programData, isLoading } = useGetAllProgramQuery({
    page: programPage,
    limit: 10,
    programName: debouncedProgramSearch,
  });

  const { data: selectedProgramData } = useGetProgramByIdQuery(selectedProgram, {
    skip: !selectedProgram,
  });

  const { data: selectedProjectData } = useGetProjectByIdQuery(selectedProject, {
    skip: isProgramBuilder || !selectedProject,
  });

  const [getLazyProject, { data: lazyProjectData, isLoading: isProjectsLoading, isFetching: projectFetching }] =
    useLazyGetProjectsByProgramIdQuery();

  useEffect(() => {
    if (!isProgramBuilder && selectedProgram) {
      getLazyProject({
        programId: selectedProgram,
        args: {
          page: projectPage,
          limit: 10,
          name: debouncedProjectSearch,
        },
      });
    }
  }, [isProgramBuilder, selectedProgram, projectPage, debouncedProjectSearch, getLazyProject]);

  useEffect(() => {
    if (programData?.data?.data) {
      const newPrograms = programData.data.data.map((item: any) => ({
        id: item.id,
        name: item.programName,
      }));
      setLoadedPrograms((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPrograms.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });
    }
  }, [programData]);

  useEffect(() => {
    if (lazyProjectData?.data?.data) {
      const newProjects = lazyProjectData.data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setLoadedProjects((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newProjects.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });
    }
  }, [lazyProjectData]);

  const hasMorePrograms = programData?.data?.meta
    ? programPage < programData.data.meta.totalPages
    : false;

  const hasMoreProjects = lazyProjectData?.data?.meta
    ? projectPage < lazyProjectData.data.meta.totalPages
    : false;

  const displayProgramName =
    loadedPrograms.find((p) => p.id === selectedProgram)?.name ||
    selectedProgramData?.data?.programName ||
    "Add program or select";

  const displayProjectName =
    loadedProjects.find((p) => p.id === selectedProject)?.name ||
    selectedProjectData?.data?.name ||
    "Select project";
  const dispatch = useAppDispatch();

  // Sync with location state when it changes
  useEffect(() => {
    if (defaultProgramId) {
      setSelectedProgram(defaultProgramId);
      dispatch(setProgramId(defaultProgramId));
      sessionStorage.setItem(SESSION_KEY_PROGRAM, defaultProgramId);
    }
    if (defaultProjectId) {
      setSelectedProject(defaultProjectId);
      dispatch(setProjectId(defaultProjectId));
      sessionStorage.setItem(SESSION_KEY_PROJECT, defaultProjectId);
    }
  }, [defaultProgramId, defaultProjectId, dispatch]);

  // Sync component state with Redux state changes
  useEffect(() => {
    if (reduxProgramId !== selectedProgram) {
      setSelectedProgram(reduxProgramId || "");
    }
  }, [reduxProgramId]);

  useEffect(() => {
    if (reduxProjectId !== selectedProject) {
      setSelectedProject(reduxProjectId || "");
    }
  }, [reduxProjectId]);

  const handleProgramSelect = (val: string) => {
    setSelectedProgram(val);
    dispatch(setProgramId(val));
    sessionStorage.setItem(SESSION_KEY_PROGRAM, val);

    // Reset project when program changes
    setSelectedProject("");
    dispatch(setProjectId(""));
    sessionStorage.removeItem(SESSION_KEY_PROJECT);
    setOpenProgram(false);
  };

  const handleProjectSelect = (val: string) => {
    setSelectedProject(val);
    dispatch(setProjectId(val));
    if (val) sessionStorage.setItem(SESSION_KEY_PROJECT, val);
    else sessionStorage.removeItem(SESSION_KEY_PROJECT);
    setOpenProject(false);
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setOpenTemplate(false);

    if (!templateId) {
      dispatch(setSelectedTemplate(null));
      return;
    }

    const targetId = isProgramBuilder ? selectedProgram : selectedProject;
    if (!targetId) {
      toast.error(`Please select a ${isProgramBuilder ? "program" : "project"} first`);
      setSelectedTemplateId("");
      return;
    }

    const template = templates.find((t: any) => t.id === templateId);
    if (template) {
      let chartData = [];
      try {
        chartData = JSON.parse(template.data);
      } catch (err) {
        console.error("Failed to parse template data", err);
      }

      // Make all value property to 0 on x axis ["", 0,0] like this
      const modifiedCharts = chartData.map((chart: any) => {
        let newXAxis = chart.xAxis;
        if (Array.isArray(chart.xAxis)) {
          newXAxis = chart.xAxis.map((row: any, idx: number) => {
            if (idx === 0) return row;
            if (Array.isArray(row)) {
              return ["", ...row.slice(1).map(() => 0)];
            }
            return row;
          });
        } else if (chart.xAxis && typeof chart.xAxis === "object") {
          const clearValues = (node: any) => {
            if (!node) return;
            if (node.value1 !== undefined) node.value1 = 0;
            if (node.value2 !== undefined) node.value2 = 0;
            if (node.children && Array.isArray(node.children)) {
              node.children.forEach(clearValues);
            }
          };
          newXAxis = JSON.parse(JSON.stringify(chart.xAxis));
          clearValues(newXAxis);
        }

        return {
          ...chart,
          xAxis: newXAxis,
        };
      });

      // Dispatch to Redux for previewing instead of applying
      dispatch(setSelectedTemplate({
        ...template,
        modifiedCharts
      }));
    }
  };

  const filteredAndSortedWidgets = React.useMemo(() => {
    return widgets
      .filter((w) => {
        if (isProgramBuilder && w.id === "project-information")
          return false;
        return (
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [widgets, searchTerm, isProgramBuilder]);

  useEffect(() => {
    setFocusedIndex(searchTerm ? 0 : -1);
  }, [searchTerm]);

  useEffect(() => {
    if (focusedIndex >= 0 && filteredAndSortedWidgets[focusedIndex]) {
      const el = document.getElementById(`widget_item_${filteredAndSortedWidgets[focusedIndex].id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex, filteredAndSortedWidgets]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredAndSortedWidgets.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const widget = filteredAndSortedWidgets[focusedIndex];
      if (widget) {
        onWidgetSelect(widget.id);
      }
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 h-screen flex flex-col sticky top-5 transition-all duration-300 rounded-lg ${isMinimized ? "w-16 min-w-[64px]" : "max-w-[312px] min-w-[312px]"}`}
    >
      <div
        className={`flex items-center ${isMinimized ? "justify-center border-b border-border dark:border-slate-800 py-4" : "justify-end px-3 pt-3"}`}
      >
        <div
          className={`flex items-center w-full text-lg font-semibold text-primary-text dark:text-slate-100 ${isMinimized ? "justify-center" : "p-2 justify-between"}`}
        >
          {!isMinimized && "Widget Library"}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md text-gray-500 dark:text-slate-400 transition-colors"
            title={
              isMinimized ? "Expand Widget Library" : "Collapse Widget Library"
            }
          >
            {isMinimized ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </div>

      {isMinimized ? (
        <div
          className="flex-1 flex flex-col items-center justify-center relative opacity-40 hover:opacity-100 transition-opacity cursor-pointer delay-100"
          onClick={() => setIsMinimized(false)}
        >
          <span className="text-xs font-bold text-gray-900 dark:text-slate-100 tracking-[0.2em] uppercase origin-center -rotate-90 whitespace-nowrap absolute">
            Widget Library
          </span>
        </div>
      ) : (
        <>
          {isLoading ? (
            <SelectSkeleton />
          ) : (
            <div className="px-4 pt-4">
              <label className="block text-sm font-medium text-website-color-darkGray dark:text-slate-400 mb-2">
                Program Name*
              </label>
              <div className="relative">
                <Popover open={openProgram} onOpenChange={setOpenProgram}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProgram}
                      className="w-full justify-between bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-800 text-gray-500 dark:text-slate-300 font-normal hover:bg-gray-50 dark:hover:bg-slate-800 h-10"
                    >
                      {displayProgramName}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width]! p-0 z-[100] ">
                    <Command shouldFilter={false} className="dark:bg-slate-900">
                      <CommandInput
                        placeholder="Search program..."
                        value={programSearch}
                        onValueChange={(val) => setProgramSearch(val)}
                        className="h-9"
                      />
                      <CommandList>
                        {loadedPrograms.length === 0 && !isLoading && (
                          <CommandEmpty>No program found.</CommandEmpty>
                        )}
                        <CommandGroup>
                          {loadedPrograms.map((program: { id: string; name: string }) => (
                            <CommandItem
                              key={program.id}
                              value={program.name}
                              onSelect={() => handleProgramSelect(program.id)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProgram === program.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {program.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {hasMorePrograms && (
                          <div className="p-1 text-center border-t border-gray-100 dark:border-slate-800">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs text-blue-600 hover:text-blue-700 h-8"
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
              </div>
            </div>
          )}

          {!isProgramBuilder &&
            (isProjectsLoading || projectFetching ? (
              <SelectSkeleton />
            ) : (
              <div className="px-4 pt-4">
                <label className="block text-sm font-medium text-website-color-darkGray dark:text-slate-400 mb-2">
                  Project Name*
                </label>
                <div className="relative">
                  <Popover open={openProject} onOpenChange={setOpenProject}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedProgram}
                        aria-expanded={openProject}
                        className="w-full justify-between bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-800 text-gray-500 dark:text-slate-300 font-normal hover:bg-gray-50 dark:hover:bg-slate-800 h-10 disabled:opacity-50"
                      >
                        {displayProjectName}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width]! p-0 z-[100]">
                      <Command shouldFilter={false} className="dark:bg-slate-900">
                        <CommandInput
                          placeholder="Search project..."
                          value={projectSearch}
                          onValueChange={(val) => setProjectSearch(val)}
                          className="h-9"
                        />
                        <CommandList>
                          {loadedProjects.length === 0 && !isProjectsLoading && !projectFetching && (
                            <CommandEmpty>No project found.</CommandEmpty>
                          )}
                          <CommandGroup>
                            {loadedProjects.map((project: { id: string; name: string }) => (
                              <CommandItem
                                key={project.id}
                                value={project.name}
                                onSelect={() => handleProjectSelect(project.id)}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProject === project.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {project.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {hasMoreProjects && (
                            <div className="p-1 text-center border-t border-gray-100 dark:border-slate-800">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-blue-600 hover:text-blue-700 h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectPage((prev) => prev + 1);
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
                </div>
              </div>
            ))}

          <div className="px-4 pt-4">
            <label className="block text-sm font-medium text-website-color-darkGray dark:text-slate-400 mb-2">
              Use Template
            </label>
            <div className="relative">
              <Popover open={openTemplate} onOpenChange={setOpenTemplate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isApplyingTemplate}
                    aria-expanded={openTemplate}
                    className="w-full justify-between bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-800 text-gray-500 dark:text-slate-300 font-normal hover:bg-gray-50 dark:hover:bg-slate-800 h-10 disabled:opacity-50"
                  >
                    {isApplyingTemplate
                      ? "Applying..."
                      : selectedTemplateId
                        ? templates?.find((t: any) => t.id === selectedTemplateId)?.name
                        : "Template name"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[100]">
                  <Command className="dark:bg-slate-900 border dark:border-slate-800">
                    <CommandInput placeholder="Search template..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No template found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => handleTemplateSelect("")}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedTemplateId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          None
                        </CommandItem>
                        {templates?.map((template: any) => (
                          <CommandItem
                            key={template.id}
                            value={template.name}
                            onSelect={() => handleTemplateSelect(template.id)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTemplateId === template.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {template.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="">
              <div className="flex items-start justify-between">
                <div className="">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-1">

                  </h2>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Click or Drag widgets to add to the canvas
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-lg text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-4">
              <div className="flex flex-col gap-3 py-1">
                {filteredAndSortedWidgets.map((widget, idx) => {
                  const isFocused = idx === focusedIndex;

                  return (
                    <div
                      key={widget.name}
                      id={`widget_item_${widget.id}_${idx}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData("widgetId", widget.id);
                        setTimeout(() => setDraggingId(widget.id), 0);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => {
                        setFocusedIndex(idx);
                        onWidgetSelect(widget.id);
                      }}
                      className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border border-gray-200 dark:border-slate-800 group relative ${draggingId === widget.id
                        ? "opacity-40 scale-95 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 shadow-inner"
                        : isFocused
                          ? " shadow-md transform"
                          : "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="mt-0.5 text-gray-600 dark:text-slate-400 shrink-0">
                        {widget.icon}
                      </div>
                      <div className="ml-3 flex-1 relative min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                            {widget.name}
                          </h3>
                          {(() => {
                            // const infoIcon = (
                            //   <button
                            //     type="button"
                            //     onClick={(e) => e.stopPropagation()}
                            //     className="text-gray-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors shrink-0 outline-none"
                            //   >
                            //     <Info className="w-4 h-4" />
                            //   </button>
                            // );

                            // const content = (
                            //   <div className="text-sm space-y-4">
                            //     <div className="flex flex-col gap-1">
                            //       <span className="font-semibold text-slate-800 dark:text-slate-200">Type</span>
                            //       <span className="text-slate-600 dark:text-slate-400">{widget.chartInfo?.primaryDataType}</span>
                            //     </div>
                            //     <div className="flex flex-col gap-1">
                            //       <span className="font-semibold text-slate-800 dark:text-slate-200">Best for</span>
                            //       <span className="text-slate-600 dark:text-slate-400">{widget.chartInfo?.bestUsedFor}</span>
                            //     </div>
                            //     {widget.chartInfo?.useCases?.length > 0 && (
                            //       <div className="flex flex-col gap-1.5">
                            //         <span className="font-semibold text-slate-800 dark:text-slate-200">Use Cases</span>
                            //         <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                            //           {widget.chartInfo.useCases.map((uc: string, i: number) => (
                            //             <li key={i}>{uc}</li>
                            //           ))}
                            //         </ul>
                            //       </div>
                            //     )}
                            //     <div className="flex flex-col gap-1">
                            //       <span className="font-semibold text-slate-800 dark:text-slate-200">Accepts</span>
                            //       <span className="text-slate-600 dark:text-slate-400">{widget.chartInfo?.dataAccepted?.join(", ")}</span>
                            //     </div>
                            //     <div className="flex flex-col gap-1">
                            //       <span className="font-semibold text-slate-800 dark:text-slate-200">Processes</span>
                            //       <span className="text-slate-600 dark:text-slate-400">{widget.chartInfo?.processes}</span>
                            //     </div>
                            //   </div>
                            // );

                            return (
                              <span onClick={(e) => e.stopPropagation()}>
                                <TooltipProvider>
                                  <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onShowInfo?.(activeWidgetInfo?.id === widget.id ? null : widget);
                                        }}
                                        className={`text-gray-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors shrink-0 outline-none ${activeWidgetInfo?.id === widget.id ? "text-blue-500 dark:text-blue-400" : ""
                                          }`}
                                      >
                                        <Info className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      className="bg-popover text-popover-foreground max-w-xs p-4 space-y-3 z-[9999] shadow-xl border border-border rounded-xl"
                                    >
                                      <div>
                                        <h4 className="font-semibold text-sm mb-1">{widget.name}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{widget.chartInfo?.description}</p>
                                      </div>
                                      <div className="text-xs space-y-2.5">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-semibold text-foreground">Type</span>
                                          <span className="text-muted-foreground">{widget.chartInfo?.primaryDataType}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-semibold text-foreground">Best for</span>
                                          <span className="text-muted-foreground">{widget.chartInfo?.bestUsedFor}</span>
                                        </div>
                                        {widget.chartInfo?.useCases?.length > 0 && (
                                          <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-foreground">Use Cases</span>
                                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                              {widget.chartInfo.useCases.map((uc: string, i: number) => (
                                                <li key={i}>{uc}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-semibold text-foreground">Accepts</span>
                                          <span className="text-muted-foreground">{widget.chartInfo?.dataAccepted?.join(", ")}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-semibold text-foreground">Processes</span>
                                          <span className="text-muted-foreground">{widget.chartInfo?.processes}</span>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs mt-1 text-gray-500 dark:text-slate-400 line-clamp-2">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className=" py-6 border-t border-gray-200 dark:border-slate-800">
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                Click on widgets to add them to your dashboard. Click on a
                placed widget to configure it.
              </p>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default ProjectWidget;
