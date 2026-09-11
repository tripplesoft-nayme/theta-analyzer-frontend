/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BoxPlotData } from "../../BoxWhiskerplot/BoxPlotChartModule";
import { toast } from "sonner";
import {
  useCreateChartMutation,
  useCreateProgramChartMutation,
  useLazyGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useAppSelector } from "@/hooks/useRedux";
import { useLocation } from "react-router-dom";
import { useGetUser } from "@/hooks/useGetUser";
import { useLazyGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import { AssignedByProfile } from "./WidgetCommon";

/** Parse a saved xAxis JSON string back into BoxPlotData[] */
const parseBoxPlotDataFromXAxis = (xAxisStr: string | undefined): BoxPlotData[] => {
  if (!xAxisStr) return [];
  try {
    const parsed = typeof xAxisStr === "string" ? JSON.parse(xAxisStr) : xAxisStr;
    if (!Array.isArray(parsed) || parsed.length < 2) return [];
    const colors = ["#8D79F6", "#35B6EE", "#13A490", "#F26419", "#6F78F9", "#E63946"];
    return parsed.slice(1).map((row: any[], idx) => ({
      x: String(row[0] ?? `Group ${idx + 1}`),
      min: Number(row[1]) || 0,
      q1: Number(row[2]) || 0,
      median: Number(row[3]) || 0,
      q3: Number(row[4]) || 0,
      max: Number(row[5]) || 0,
      outliers: Array.isArray(row[6]) ? row[6] : [],
      color: String(row[7] || colors[idx % colors.length]),
    }));
  } catch {
    return [];
  }
};

const BoxPlotChartConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  data: dataProp,
  setData: setDataProp,
  onClose,
  onDelete,
  isProgramBuilder: isProgramBuilderProp = false,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
  xAxis: xAxisProp,
  onLivePreviewUpdate,
}: {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  data?: BoxPlotData[];
  setData?: React.Dispatch<React.SetStateAction<BoxPlotData[]>>;
  onClose?: () => void;
  onDelete?: () => void;
  isProgramBuilder?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
  // Extra props forwarded by BaseChartContainer in edit mode
  xAxis?: string;
  /** Callback to push live data to the chart preview (edit mode only) */
  onLivePreviewUpdate?: (data: any[]) => void;
  [key: string]: any;
}) => {
  // In edit mode (onSaveOverride), derive initial data from the saved xAxis.
  // In creation mode, use the dataProp passed from BoxPlotChartModule.
  const initialData = React.useMemo(() => {
    if (onSaveOverride && xAxisProp) {
      const parsed = parseBoxPlotDataFromXAxis(xAxisProp);
      if (parsed.length > 0) return parsed;
    }
    return dataProp ?? [
      { x: "Group A", min: 10, q1: 20, median: 35, q3: 50, max: 70, outliers: [5, 85] },
      { x: "Group B", min: 15, q1: 25, median: 40, q3: 55, max: 75, outliers: [8, 90] },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [internalData, setInternalData] = React.useState<BoxPlotData[]>(initialData);

  // Use external data/setData if provided (creation mode), otherwise use internal state (edit mode)
  const data = dataProp !== undefined ? dataProp : internalData;
  const setData = setDataProp !== undefined ? setDataProp : setInternalData;

  // Push live data to the chart preview whenever internalData changes (edit mode only)
  useEffect(() => {
    if (onLivePreviewUpdate) {
      onLivePreviewUpdate(internalData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalData]);
  const location = useLocation();
  const isProgramBuilder = isProgramBuilderProp || location.pathname.includes("program-builder");

  const projectId = useAppSelector((state) => state.chartSlice.projectId);
  const programId = useAppSelector((state) => state.chartSlice.programId);
  const [createChart, { isLoading: isSaving }] = useCreateChartMutation();
  const [createProgramChart, { isLoading: isSavingProgram }] = useCreateProgramChartMutation();
  const [getProjectsByProgram, { data: programProjectsData }] = useLazyGetProjectsByProgramIdQuery();
  const [getRootChartByProject, { data: projectChartsData, isLoading: isChartsLoading }] = useLazyGetRootChartQuery();
  const [layoutUpdate] = useLayoutUpdateMutation();

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
  const { name, role, profileImage } = useGetUser();

  // Aggregation State
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<
    { id: string; title: string; projectName: string; xAxis: string[] }[]
  >([]);

  useEffect(() => {
    if (isProgramBuilder && programId) {
      getProjectsByProgram({ programId });
    }
  }, [isProgramBuilder, programId, getProjectsByProgram]);

  useEffect(() => {
    if (yAxisProjectId) {
      getRootChartByProject(yAxisProjectId);
    }
  }, [yAxisProjectId, getRootChartByProject]);

  const programProjects = (programProjectsData?.data?.data as any[] | undefined)?.map((p) => ({
    id: p.id,
    name: p.name,
  })) ?? [];

  const rootCharts = ((projectChartsData?.data ?? []) as any[]).map((c) => {
    const categoryKey = (c.category as string)?.toUpperCase();
    const chartProperty = chartTypes[categoryKey];
    const chartData = (chartProperty && c[chartProperty] ? c[chartProperty] : (c.sampleChart || c.sampleBarChart || c)) as any;

    return {
      id: (c.id as string) || chartData?.id,
      title: (c.title as string) || chartData?.title || "Untitled Chart",
      xAxis: c.xAxis || chartData?.xAxis,
      category: categoryKey,
    };
  });

  const filteredRootCharts = rootCharts.filter((c) => c.category === "BOX_WHISKER");

  const recalculateIntersection = (charts: typeof selectedSourceCharts) => {
    if (charts.length === 0) return;

    let commonCategoriesLocal: string[] = [];
    charts.forEach((chart, idx) => {
      let labels: string[] = [];
      try {
        const parsed = typeof chart.xAxis === "string" ? JSON.parse(chart.xAxis) : chart.xAxis;
        if (Array.isArray(parsed)) {
          labels = parsed.slice(1).map((row: any) => String(row[0]));
        }
      } catch (e) {
        labels = [];
      }

      if (idx === 0) {
        commonCategoriesLocal = labels;
      } else {
        commonCategoriesLocal = commonCategoriesLocal.filter((cat) => labels.includes(cat));
      }
    });

    if (commonCategoriesLocal.length > 0) {
      setData(
        commonCategoriesLocal.map((cat) => ({
          x: cat,
          min: 10,
          q1: 20,
          median: 35,
          q3: 50,
          max: 70,
          outliers: [],
        }))
      );
    } else {
      setData([]);
    }
  };

  const handleAddMapping = () => {
    if (!yAxisChartId) return;
    const chartToAdd = filteredRootCharts.find((c) => c.id === yAxisChartId);
    if (!chartToAdd || selectedSourceCharts.some((c) => c.id === chartToAdd.id)) return;

    const project = programProjects.find((p) => p.id === yAxisProjectId);

    let labels: string[] = [];
    try {
      const parsed = typeof chartToAdd.xAxis === "string" ? JSON.parse(chartToAdd.xAxis) : chartToAdd.xAxis;
      if (Array.isArray(parsed)) {
        labels = parsed.slice(1).map((row: any) => row[0]);
      }
    } catch (e) {
      labels = [];
    }

    const newChartObj = {
      id: chartToAdd.id,
      title: chartToAdd.title,
      projectName: project?.name || "Unknown Project",
      xAxis: labels,
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

  const assignedBy = {
    name: name || "Admin User",
    role: role || "Analyst",
    image: profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };
  const fileInputRef = useRef<HTMLInputElement>(0 as any);

  const calculateStatistics = (numbers: number[]): Omit<BoxPlotData, "x"> => {
    if (numbers.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };

    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;

    const getPercentile = (p: number) => {
      const pos = (n - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
        return sorted[base];
      }
    };

    const q1 = getPercentile(0.25);
    const median = getPercentile(0.5);
    const q3 = getPercentile(0.75);

    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    const remaining = sorted.filter(v => v >= lowerFence && v <= upperFence);
    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);

    return {
      min: remaining.length > 0 ? remaining[0] : sorted[0],
      q1,
      median,
      q3,
      max: remaining.length > 0 ? remaining[remaining.length - 1] : sorted[sorted.length - 1],
      outliers
    };
  };

  const handleAddBox = () => {
    setData([
      ...data,
      { x: `Group ${data.length + 1}`, min: 0, q1: 10, median: 20, q3: 30, max: 40, outliers: [] },
    ]);
  };

  const handleRemoveBox = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleDataChange = (index: number, field: keyof BoxPlotData | "rawData", rawValue: string) => {
    const updatedData = [...data];
    if (field === "rawData") {
      const values = rawValue.split(",").map(v => Number(v.trim())).filter(v => !isNaN(v));
      if (values.length > 0) {
        const stats = calculateStatistics(values);
        updatedData[index] = { ...updatedData[index], ...stats };
      }
    } else if (field === "x") {
      updatedData[index] = { ...updatedData[index], [field]: rawValue };
    } else {
      const numValue = Number(rawValue);
      if (rawValue === "") {
        (updatedData[index] as any)[field] = 0;
      } else if (!isNaN(numValue)) {
        (updatedData[index] as any)[field] = numValue;
      }
    }
    setData(updatedData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const binaryStr = evt.target?.result;
      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const groupMap: Record<string, number[]> = {};

      rawData.forEach((row, idx) => {
        if (idx === 0 && (String(row[0]).toLowerCase() === "label" || String(row[0]).toLowerCase() === "group")) return;
        if (!row[0] || row[1] === undefined) return;
        const label = String(row[0]);
        const val = Number(row[1]);
        if (!isNaN(val)) {
          if (!groupMap[label]) groupMap[label] = [];
          groupMap[label].push(val);
        }
      });

      const newData: BoxPlotData[] = Object.entries(groupMap).map(([label, numbers]) => {
        const stats = calculateStatistics(numbers);
        return {
          x: label,
          ...stats,
        };
      });

      if (newData.length > 0) {
        setData(newData);
        toast.success(`Processed ${newData.length} groups from file`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async () => {
    if (!widgetTitle) return toast.error("Please enter widget title");

    const toastId = toast.loading("Saving configuration...");

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

    const colors = ["#8D79F6", "#35B6EE", "#13A490", "#F26419", "#6F78F9", "#E63946"];

    const headerRow = ["Label", "min", "q1", "median", "q3", "max", "outliers"];
    const dataRows = data.map((d) => [
      d.x,
      d.min,
      d.q1,
      d.median,
      d.q3,
      d.max,
      d.outliers || [],
    ]);

    const headers = ["min", "q1", "median", "q3", "max", "outliers"];
    const widgets = headers.map((h, idx) => ({
      legendName: h,
      color: colors[idx % colors.length],
    }));

    const payload: any = {
      firstFieldDataset: 0,
      lastFieldDataset: 100,
      widgets: widgets,
      title: widgetTitle,
      status: "ACTIVE",
      category: "BOX_WHISKER",
      xAxis: JSON.stringify([headerRow, ...dataRows]),
      yAxis: JSON.stringify({}),
      zAxis: JSON.stringify({}),
      projectId,
      rootchart: true,
      roottitle: widgetTitle,
      grouptitle: generateId(),
      width: layoutW !== undefined ? Number(layoutW) : 10,
      height: layoutH !== undefined ? Number(layoutH) : 15,
      order: targetOrder,
    };

    if (isProgramBuilder) {
      payload.programid = programId;
      payload.projectnumber = 1; // Standard for program builder charts
      payload.order = 1;
      payload.width = "100%";
      payload.height = "300px";
      delete payload.projectId;
      delete payload.yAxis;
      delete payload.zAxis;
      delete payload.rootchart;
      delete payload.roottitle;
      delete payload.grouptitle;

      if (isValueDetectOn) {
        delete payload.xAxis; // XAxis is NOT passed in value detect mode
        payload.similervalueDitects = [
          {
            chartlist: selectedSourceCharts.map((c) => c.id),
            legentName: ["min", "q1", "median", "q3", "max", "outliers"],
          },
        ];
      }
    } else {
      payload.width = layoutW !== undefined ? Number(layoutW) : 10;
      payload.height = layoutH !== undefined ? Number(layoutH) : 15;
      payload.order = targetOrder;
    }

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
        toast.success(`Box & Whisker Plot ${isProgramBuilder ? "Program " : ""}saved successfully`, { id: toastId });
        onDelete?.();
        onClose?.();
      }
    } catch {
      toast.error("Failed to save configuration", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-slate-800 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          Box Whisker Configuration
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
        />
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Data Aggregation Section (Program Builder) */}
        {isProgramBuilder && (
          <div className="border-t border-border dark:border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Data Aggregation
                </label>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Aggregate charts across program</p>
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
              <div className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-border dark:border-slate-800">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Project:</label>
                    <select
                      value={yAxisProjectId}
                      onChange={(e) => {
                        setYAxisProjectId(e.target.value);
                        setYAxisChartId("");
                      }}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-xs outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Select Project</option>
                      {programProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Source Chart:</label>
                    <select
                      value={yAxisChartId}
                      onChange={(e) => setYAxisChartId(e.target.value)}
                      disabled={!yAxisProjectId || isChartsLoading}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-xs outline-none focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500 text-gray-900 dark:text-slate-100"
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
                    className="w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 uppercase transition-all"
                  >
                    Add Data Source
                  </button>
                </div>

                {selectedSourceCharts.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Selected Sources:</p>
                    {selectedSourceCharts.map((chart, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-border dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] text-gray-700 dark:text-slate-300 truncate">
                            <span className="font-bold">{chart.projectName}</span> | {chart.title}
                          </span>
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

        {/* Legend Display Setting */}
        <div className="space-y-1.5 p-3 border border-border dark:border-slate-800 rounded-lg bg-gray-50/30 dark:bg-slate-800/30">
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

        {/* Data Points (Boxes) */}
        <div>
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Data Series (Boxes)
            </h3>
            <button
              onClick={handleAddBox}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Add Box"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {(isValueDetectOn
              ? ["min", "q1", "median", "q3", "max", "outliers"]
              : (data as any[])
            ).map((item, index) => {
              const label = typeof item === 'string' ? item : item.x;
              const box = typeof item === 'string' ? { x: item } : item;

              return (
                <div key={index} className="p-3 border border-border dark:border-slate-800 rounded-md bg-gray-50/50 dark:bg-slate-800/20 relative shadow-sm hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
                  {!isValueDetectOn && (
                    <button
                      onClick={() => handleRemoveBox(index)}
                      className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        readOnly={isValueDetectOn}
                        value={label}
                        onChange={(e) => handleDataChange(index, "x", e.target.value)}
                        className={`w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 ${isValueDetectOn ? "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400" : ""}`}
                        placeholder="Group Name"
                      />
                    </div>

                    {!isValueDetectOn && (
                      <>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-blue-500 dark:text-blue-400 uppercase font-bold mb-0.5">
                            Raw Values (Calculate)
                          </label>
                          <input
                            type="text"
                            onChange={(e) => handleDataChange(index, "rawData", e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-blue-200 dark:border-blue-900 rounded focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                            placeholder="e.g. 10, 20, 30, 40, 50"
                          />
                        </div>

                        <div className="block">
                          <label className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold mb-1">Min</label>
                          <input
                            type="number"
                            value={(box as any).min}
                            onChange={(e) => handleDataChange(index, "min", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="block">
                          <label className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold mb-1">Max</label>
                          <input
                            type="number"
                            value={(box as any).max}
                            onChange={(e) => handleDataChange(index, "max", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="block">
                          <label className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold mb-1">Q1</label>
                          <input
                            type="number"
                            value={(box as any).q1}
                            onChange={(e) => handleDataChange(index, "q1", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="block">
                          <label className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold mb-1">Q3</label>
                          <input
                            type="number"
                            value={(box as any).q3}
                            onChange={(e) => handleDataChange(index, "q3", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">
                            Median
                          </label>
                          <input
                            type="number"
                            value={(box as any).median}
                            onChange={(e) => handleDataChange(index, "median", e.target.value)}
                            className="w-full px-2 py-1 text-xs border-green-200 dark:border-green-900 border rounded focus:outline-none font-bold outline-green-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned By */}
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
          disabled={isSaving || isSavingProgram}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving || isSavingProgram ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default BoxPlotChartConfiguration;
