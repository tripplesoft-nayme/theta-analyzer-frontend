import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { useCreateChartMutation } from "@/store/Api/ChartApi/ChartApi";
import { toast } from "sonner";
import { useGetUser } from "@/hooks/useGetUser";
import { useLocation } from "react-router-dom";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import {
  useCreateProgramChartMutation,
  useLazyGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useLazyGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";
import { extractLegendsFromXAxis } from "@/Common/Charts/CompletedCharts/Common/chartUtils";
import { Trash2 } from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { AssignedByProfile } from "./WidgetCommon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

const DEFAULT_COLORS = [
  "#13A490",
  "#35B6EE",
  "#6F78F9",
  "#F26419",
  "#F6AE2D",
  "#862BB0",
  "#D72638",
  "#3F88C5",
  "#44BBA4",
  "#FF9505",
];

interface WidgetConfigurationProps {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet: React.Dispatch<React.SetStateAction<number>>;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  onClose?: () => void;
  onDelete?: () => void;
  widgetCategory?: string;
  startingRange?: number;
  setStartingRange?: (val: number) => void;
  endingRange?: number;
  setEndingRange?: (val: number) => void;
  isProgramBuilder?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
}

const WidgetForChartModuleThree = ({
  widgetTitle,
  setWidgetTitle,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  onClose,
  onDelete,
  widgetCategory = "PIE",
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  isProgramBuilder = false,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
}: WidgetConfigurationProps) => {
  const [projectId, setProjectId] = useState<string>("");
  const projectIdFromSlice = useAppSelector(
    (state) => state.chartSlice.projectId,
  );
  const programIdFromSlice = useAppSelector(
    (state) => state.chartSlice.programId,
  );
  const location = useLocation();
  const projectIdFromState = location.state?.projectId;
  const dispatch = useAppDispatch();

  const [showLegendState, setShowLegendState] = useState(
    showLegend !== undefined ? showLegend : true
  );

  useEffect(() => {
    if (showLegend !== undefined) {
      setShowLegendState(showLegend);
    }
  }, [showLegend]);

  const handleToggleLegend = () => {
    const nextVal = !showLegendState;
    setShowLegendState(nextVal);
    setShowLegend?.(nextVal);
  };

  // Aggregation State
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<
    { id: string; title: string; projectName: string; legends: { label: string; color: string }[] }[]
  >([]);

  const [createChart, { isLoading }] = useCreateChartMutation();
  const [createProgramChart, { isLoading: isCreatingProgramChart }] = useCreateProgramChartMutation();
  const [getProjectsByProgram, { data: programProjectsData }] = useLazyGetProjectsByProgramIdQuery();
  const [getRootChartByProject, { data: projectChartsData, isLoading: isChartsLoading }] = useLazyGetRootChartQuery();
  const [layoutUpdate] = useLayoutUpdateMutation();
  const { name, role, profileImage } = useGetUser();

  useEffect(() => {
    if (projectIdFromSlice) {
      setProjectId(projectIdFromSlice);
    } else if (projectIdFromState) {
      setProjectId(projectIdFromState);
    }
  }, [projectIdFromSlice, projectIdFromState]);

  useEffect(() => {
    if (isProgramBuilder && programIdFromSlice) {
      getProjectsByProgram({ programId: programIdFromSlice });
    }
  }, [isProgramBuilder, programIdFromSlice, getProjectsByProgram]);

  useEffect(() => {
    if (yAxisProjectId) {
      getRootChartByProject(yAxisProjectId);
    }
  }, [yAxisProjectId, getRootChartByProject]);

  const programProjects = (programProjectsData?.data?.data as any[] | undefined)?.map((p) => ({
    id: p.id as string,
    name: p.name as string,
  })) ?? [];

  const rootCharts = ((projectChartsData?.data ?? []) as any[]).map((c) => {
    const categoryKey = (c.category as string)?.toUpperCase();
    const chartProperty = chartTypes[categoryKey];
    const chartData = (chartProperty && c[chartProperty] ? c[chartProperty] : (c.sampleChart || c.sampleBarChart || c)) as any;
    let apiWidgets = chartData?.widgets || c?.widgets || [];

    return {
      id: (c.id as string) || chartData?.id,
      title: (c.title as string) || chartData?.title || "Untitled Chart",
      xAxis: c.xAxis || chartData?.xAxis,
      widgets: apiWidgets,
      category: categoryKey,
    };
  });

  const filteredRootCharts = rootCharts.filter((c) => c.category === widgetCategory);

  const recalculateIntersection = (charts: typeof selectedSourceCharts) => {
    if (charts.length === 0) return;

    let commonLabels: string[] = [];
    charts.forEach((chart, idx) => {
      const labels = chart.legends.map((l) => l.label);
      if (idx === 0) {
        commonLabels = labels;
      } else {
        commonLabels = commonLabels.filter((label) => labels.includes(label));
      }
    });

    const updatedLegends: LegendValue[] = commonLabels.map((label, idx) => {
      const firstOccurrence = charts[0].legends.find((l) => l.label === label);
      return {
        label,
        field: label.toLowerCase().replace(/\s+/g, ""),
        color: firstOccurrence?.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      };
    });

    setLegendValues(updatedLegends);
    setNumOfLegendDataSet(updatedLegends.length);
  };

  const handleAddMapping = () => {
    if (!yAxisChartId) return;
    const chartToAdd = filteredRootCharts.find((c) => c.id === yAxisChartId);
    if (!chartToAdd || selectedSourceCharts.some((c) => c.id === chartToAdd.id)) return;

    const project = programProjects.find((p) => p.id === yAxisProjectId);
    const apiLegends = chartToAdd.widgets && chartToAdd.widgets.length > 0
      ? chartToAdd.widgets.map((w: any) => ({
        label: w.legendName || w.label,
        color: w.color,
      }))
      : extractLegendsFromXAxis(chartToAdd.xAxis).map((label: string) => ({
        label,
        color: undefined,
      }));

    const newChartObj = {
      id: chartToAdd.id,
      title: chartToAdd.title,
      projectName: project?.name || "Unknown Project",
      legends: apiLegends.map((l: any, idx: number) => ({
        label: l.label,
        color: l.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      })),
    };

    const newSelectedCharts = [...selectedSourceCharts, newChartObj];
    setSelectedSourceCharts(newSelectedCharts);
    recalculateIntersection(newSelectedCharts);
    setYAxisChartId("");
  };

  const handleRemoveSourceChart = (index: number) => {
    const newCharts = [...selectedSourceCharts];
    newCharts.splice(index, 1);
    setSelectedSourceCharts(newCharts);
    recalculateIntersection(newCharts);
  };

  const minSlices = 1;
  const maxSlices = 99;

  const handleSetNumOfSlices = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    const clamped = Math.max(minSlices, Math.min(maxSlices, value));

    setNumOfLegendDataSet(clamped);
    setLegendValues((prev) => {
      const updated = [...prev];
      while (updated.length < clamped) {
        const i = updated.length;
        updated.push({
          label: `Slice ${i + 1}`,
          field: `slice${i + 1}`,
          color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        });
      }
      return updated.slice(0, clamped);
    });
  };

  const handleSliceLabelChange = (index: number, value: string) => {
    setLegendValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        label: value,
        field: value.toLowerCase().replace(/\s+/g, ""),
      };
      return updated;
    });
  };

  const handleSliceColorChange = (index: number, color: string) => {
    setLegendValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        color: color,
      };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!widgetTitle) {
      toast.error("Please enter a widget title");
      return;
    }

    const toastId = toast.loading(`Creating ${widgetCategory} Chart...`);

    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;
    let shiftPayload: any[] = [];
    try {
      if (typeof targetOrder === "number" && !isProgramBuilder && projectId) {
        const existingRes = await getRootChartByProject(projectId).unwrap();
        const existingCharts = existingRes?.data || existingRes || [];
        if (Array.isArray(existingCharts)) {
          existingCharts.forEach((c: any) => {
            const currentOrder = typeof c.order === "number" ? c.order : 0;
            if (currentOrder >= targetOrder) {
              let rawHeight = c.height ? Number(c.height) : 15;
              if (rawHeight >= 50) {
                rawHeight = Math.max(1, Math.round((rawHeight + 8) / 28));
              }
              shiftPayload.push({
                id: c.id,
                height: rawHeight,
                width: c.width ? Number(c.width) : 10,
                order: currentOrder + 1,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("Failed to calculate chart shift payload", err);
    }

    const xAxisData =
      widgetCategory === "BULLET"
        ? [
          ["Label", "Current", "Target"],
          ...legendValues.map((l) => [l.label, 0, 0]),
        ]
        : [
          ["Label", ...legendValues.map((l) => l.label)],
          ["Value", ...Array(legendValues.length).fill(0)],
        ];

    let payload: any;

    if (isProgramBuilder) {
      if (isValueDetectOn) {
        payload = {
          title: widgetTitle,
          status: "ACTIVE",
          category: widgetCategory,
          programid: programIdFromSlice,
          projectnumber: 1,
          order: 1,
          width: "100%",
          height: "400px",
          similervalueDitects: [
            {
              chartlist: selectedSourceCharts.map((c) => c.id),
              legentName: legendValues.map((l) => l.label),
            },
          ],
          numberOfDataset: numOfLegendDataSet,
          firstFieldDataset: startingRange ?? 0,
          lastFieldDataset: endingRange ?? 100,
          widgets: legendValues.map((l) => ({
            legendName: l.label,
            color: l.color,
          })),
        };
      } else {
        // Normal Program Builder Chart
        payload = {
          title: widgetTitle,
          status: "ACTIVE",
          category: widgetCategory,
          programid: programIdFromSlice,
          projectnumber: 1,
          numberOfDataset: numOfLegendDataSet,
          firstFieldDataset: startingRange ?? 0,
          lastFieldDataset: endingRange ?? 100,
          widgets: legendValues.map((l) => ({
            legendName: l.label,
            color: l.color,
          })),
          xAxis: JSON.stringify(xAxisData),
          // yAxis, zAxis, rootchart, roottitle, grouptitle removed for program builder
        };
      }
    } else {
      // Standard Project Builder
      payload = {
        numberOfDataset: numOfLegendDataSet,
        firstFieldDataset: startingRange ?? 0,
        lastFieldDataset: endingRange ?? 100,
        widgets: legendValues.map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        title: widgetTitle,
        status: "ACTIVE",
        category: widgetCategory,
        xAxis: JSON.stringify(xAxisData),
        yAxis: JSON.stringify({}),
        zAxis: JSON.stringify({}),
        projectId: projectId,
        rootchart: true,
        roottitle: widgetTitle,
        grouptitle: generateId(),
      };
    }

    payload.width = layoutW !== undefined ? Number(layoutW) : 10;
    payload.height = layoutH !== undefined ? Number(layoutH) : 15;
    payload.order = targetOrder;
    payload.showWidget = showLegendState;

    if (onSaveOverride) {
      toast.dismiss(toastId);
      onSaveOverride(payload);
      return;
    }

    try {
      if (shiftPayload.length > 0) {
        try {
          await layoutUpdate(shiftPayload).unwrap();
        } catch (layoutErr) {
          console.error("Failed to update bulk layout order shifting", layoutErr);
        }
      }
      const res = isProgramBuilder
        ? await createProgramChart(payload).unwrap()
        : await createChart(payload).unwrap();

      if (res?.success) {
        toast.success(`${widgetCategory} Chart created successfully`, { id: toastId });
        dispatch(setWidgetConfig({ id: widgetCategory.toLowerCase().replace("_", "-") + "-chart", config: null }));
        onDelete?.();
        onClose?.();
      }
    } catch (error) {
      console.error("Failed to create chart:", error);
      toast.error(`Failed to create ${widgetCategory} Chart`, { id: toastId });
    }
  };

  const assignedBy = {
    name: name || "Admin User",
    role: role || "Analyst",
    image:
      profileImage ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800/50 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-tight">
            {widgetCategory === "TREEMAP"
              ? "Treemap Chart Config"
              : widgetCategory === "POLAR_AREA"
                ? "Polar Area Chart Config"
                : widgetCategory === "BULLET"
                  ? "Bullet Chart Config"
                  : widgetCategory === "FUNNEL"
                    ? "Funnel Chart Config"
                    : widgetCategory === "PARETO"
                      ? "Pareto Chart Config"
                      : "Pie Chart Config"}
          </h2>
          <p className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">
            Define your data{" "}
            {widgetCategory === "FUNNEL"
              ? "stages"
              : widgetCategory === "PARETO"
                ? "categories"
                : "slices"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 dark:text-slate-500 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-6">
        {/* Widget Title */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            placeholder={`e.g. ${widgetCategory === "FUNNEL" ? "Sales Funnel" : "Sales Distribution"}`}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Data Aggregation Section (Program Builder) */}
        {isProgramBuilder && widgetCategory !== "BULLET" && (
          <div className="border-t border-border dark:border-slate-800/50 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Data Aggregation
                </label>
                <p className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">Aggregate charts across program</p>
              </div>
              <div
                onClick={() => setIsValueDetectOn(!isValueDetectOn)}
                className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${isValueDetectOn ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"
                  }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isValueDetectOn ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </div>
            </div>

            {isValueDetectOn && (
              <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-slate-800/50 animate-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Project:</label>
                    <select
                      value={yAxisProjectId}
                      onChange={(e) => {
                        setYAxisProjectId(e.target.value);
                        setYAxisChartId("");
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500"
                    >
                      <option value="">Select Project</option>
                      {programProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Source {widgetCategory} Chart:</label>
                    <select
                      value={yAxisChartId}
                      onChange={(e) => setYAxisChartId(e.target.value)}
                      disabled={!yAxisProjectId || isChartsLoading}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-800/50 disabled:text-gray-400 dark:disabled:text-slate-600"
                    >
                      <option value="">{isChartsLoading ? "Loading charts..." : "Select Chart"}</option>
                      {filteredRootCharts.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMapping}
                    disabled={!yAxisChartId}
                    className="w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 uppercase transition-all"
                  >
                    Add Data Source
                  </button>
                </div>

                {selectedSourceCharts.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Selected Sources:</p>
                    {selectedSourceCharts.map((chart, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800/50 shadow-sm animate-in slide-in-from-left duration-200" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-5 h-5 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-100 dark:border-blue-800/50">
                            {i + 1}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[11px] text-gray-700 dark:text-slate-200 truncate cursor-help">
                                  <span className="font-bold">
                                    {chart.projectName}
                                  </span>{" "}
                                  | {chart.title}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-[10px]">
                                  {chart.projectName} | {chart.title}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <button onClick={() => handleRemoveSourceChart(i)} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors ml-2">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scale Range (Optional) */}
        {widgetCategory !== "FUNNEL" && setStartingRange && setEndingRange && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Scale Range
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-tight">
                  Min Value
                </label>
                <input
                  type="number"
                  value={startingRange}
                  onChange={(e) => setStartingRange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-tight">
                  Max Value
                </label>
                <input
                  type="number"
                  value={endingRange}
                  onChange={(e) => setEndingRange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Legend Display Setting */}
        {!["TABLE", "MATRIXTABLE", "DECOMPOSITION_TREE", "GEOGRAPHY_GRAPH", "PROJECT_INFORMATION", "MEDIA_WIDGET"].includes(widgetCategory) && (
          <div className="space-y-1.5 p-3 border border-border dark:border-slate-800/50 rounded-lg bg-gray-50/30 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">
                Show Legend
              </label>
              <div className="relative inline-block w-10 h-5">
                <div
                  onClick={handleToggleLegend}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${showLegendState ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showLegendState ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Item Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              {widgetCategory === "FUNNEL"
                ? "Funnel Stages"
                : widgetCategory === "PARETO"
                  ? "Pareto Categories"
                  : "Data Slices"}
            </h3>
            {!isValueDetectOn && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">
                <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                  Total:
                </span>
                <input
                  type="number"
                  min={minSlices}
                  max={maxSlices}
                  value={numOfLegendDataSet}
                  onChange={handleSetNumOfSlices}
                  className="w-10 bg-transparent text-xs font-bold text-blue-800 dark:text-blue-300 text-center outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {legendValues.map((l, index) => (
              <div
                key={index}
                className="p-3 border border-border dark:border-slate-800/50 rounded-lg bg-gray-50/30 dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white shadow-sm"
                    style={{ backgroundColor: l.color }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    readOnly={isValueDetectOn}
                    placeholder={`${widgetCategory === "FUNNEL" ? "Stage" : "Slice"} ${index + 1} name`}
                    value={l.label}
                    onChange={(e) => handleSliceLabelChange(index, e.target.value)}
                    className={`flex-1 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-md focus:border-blue-400 outline-none transition-all shadow-sm group-hover:border-gray-300 dark:group-hover:border-slate-700 ${isValueDetectOn ? "bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div className="flex items-center justify-between pl-9">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tighter">
                    Hex Color
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={l.color}
                      onChange={(e) =>
                        handleSliceColorChange(index, e.target.value)
                      }
                      className="w-16 text-[10px] font-mono text-gray-500 dark:text-slate-500 bg-transparent outline-none text-right"
                    />
                    <input
                      type="color"
                      value={l.color}
                      onChange={(e) =>
                        handleSliceColorChange(index, e.target.value)
                      }
                      className="w-6 h-6 rounded-md cursor-pointer border-none p-0 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accountable Owner Section */}
        <AssignedByProfile assignedBy={assignedBy} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-800 shrink-0 mt-auto bg-white dark:bg-slate-900">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || isCreatingProgramChart}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading || isCreatingProgramChart ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default WidgetForChartModuleThree;
