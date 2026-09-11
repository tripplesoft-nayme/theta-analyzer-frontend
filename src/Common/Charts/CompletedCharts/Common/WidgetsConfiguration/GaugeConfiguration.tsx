import React, { useEffect, useState, useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateChartMutation, useCreateProgramChartMutation, useLazyGetRootChartQuery, useLayoutUpdateMutation } from "@/store/Api/ChartApi/ChartApi";
import { useAppSelector } from "@/hooks/useRedux";
import { useGetUser } from "@/hooks/useGetUser";
import { useLocation } from "react-router-dom";
import { useLazyGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";
import { AssignedByProfile } from "./WidgetCommon";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

interface GaugeConfigurationProps {
  widgetTitle: string;
  setWidgetTitle: (val: string) => void;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  startingRange: number;
  setStartingRange: (val: number) => void;
  endingRange: number;
  setEndingRange: (val: number) => void;
  onClose: () => void;
  onDelete?: () => void;
  projectId?: string;
  isValueDetectOn: boolean;
  setIsValueDetectOn: (val: boolean) => void;
  selectedSourceCharts: any[];
  setSelectedSourceCharts: (charts: any[]) => void;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
}

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ef4444"];

const GaugeConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  legendValues,
  setLegendValues,
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  onClose,
  onDelete,
  projectId: projectIdProp,
  isValueDetectOn,
  setIsValueDetectOn,
  selectedSourceCharts,
  setSelectedSourceCharts,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
}: GaugeConfigurationProps) => {
  const { projectId: storeProjectId, programId: programIdFromSlice } = useAppSelector((state) => state.chartSlice);
  const location = useLocation();
  const isProgramBuilder = location.pathname.split("/")[2] === "program-builder";
  const projectId = projectIdProp || storeProjectId;
  const { name, role, profileImage, loading } = useGetUser();

  const assignedBy = {
    name: !loading && name,
    role: !loading && role,
    image: !loading && profileImage,
  };

  const [createChart, { isLoading: isProjectLoading }] = useCreateChartMutation();
  const [createProgramChart, { isLoading: isProgramLoading }] = useCreateProgramChartMutation();
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
  const isLoading = isProjectLoading || isProgramLoading;

  // Aggregation States
  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cutoffDetails, setCutoffDetails] = useState<{
    lostFromCurrent: string[];
    ignoredFromNew: string[];
    newChart: any;
  } | null>(null);

  const [getProjectsByProgram, { data: programProjectsData }] = useLazyGetProjectsByProgramIdQuery();
  const [getRootChartByProject, { data: projectChartsData, isLoading: isChartsLoading }] = useLazyGetRootChartQuery();

  useEffect(() => {
    if (isProgramBuilder && programIdFromSlice) {
      getProjectsByProgram({ programId: programIdFromSlice });
    }
  }, [isProgramBuilder, programIdFromSlice, getProjectsByProgram]);

  useEffect(() => {
    if (isProgramBuilder && yAxisProjectId) {
      getRootChartByProject(yAxisProjectId);
    }
  }, [isProgramBuilder, yAxisProjectId, getRootChartByProject]);

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
      widgets: apiWidgets,
      category: categoryKey,
    };
  });

  const filteredRootCharts = useMemo(() => {
    return rootCharts.filter((c) => c.category === "GAUGE" || c.category === "RING" || c.category === "PIE");
  }, [rootCharts]);

  const handleLegendLabelChange = (value: string) => {
    setLegendValues((prev) => [
      {
        ...prev[0],
        label: value,
        field: value.toLowerCase().replace(/\s+/g, ""),
      },
    ]);
  };

  const handleLegendColorChange = (color: string) => {
    setLegendValues((prev) => [
      {
        ...prev[0],
        color: color,
      },
    ]);
  };

  const recalculateIntersection = (charts: typeof selectedSourceCharts) => {
    if (charts.length === 0) {
      setLegendValues([{ label: "Performance", field: "performance", color: "#8D79F6" }]);
      return;
    }
    let commonLabels: string[] = [];
    charts.forEach((chart, idx) => {
      const labels = chart.legends.map((l: any) => l.label);
      if (idx === 0) commonLabels = labels;
      else commonLabels = commonLabels.filter((l: string) => labels.includes(l));
    });

    // For Gauge, we usually care about the primary legend
    const updatedLegends: LegendValue[] = commonLabels.slice(0, 1).map((label, idx) => {
      const firstOccur = charts[0].legends.find((l: any) => l.label === label);
      return {
        label,
        field: label.toLowerCase().replace(/\s+/g, ""),
        color: firstOccur?.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      };
    });

    if (updatedLegends.length > 0) {
      setLegendValues(updatedLegends);
    }
  };

  const handleAddMapping = () => {
    if (!yAxisChartId) {
      toast.error("Please select a chart first");
      return;
    }
    const chartToAdd = filteredRootCharts.find((c) => c.id === yAxisChartId);
    if (!chartToAdd) return;
    if (selectedSourceCharts.some((c) => c.id === chartToAdd.id)) {
      toast.error("Chart already added");
      return;
    }
    const project = programProjects.find((p) => p.id === yAxisProjectId);
    const newChartObj = {
      id: chartToAdd.id,
      title: chartToAdd.title,
      projectName: project?.name || "Unknown Project",
      legends: chartToAdd.widgets.map((w: any) => ({
        label: w.legendName || w.label,
        color: w.color || DEFAULT_COLORS[0],
      })),
    };

    if (selectedSourceCharts.length > 0) {
      let currentCommon: string[] = [];
      selectedSourceCharts.forEach((chart, idx) => {
        const labels = chart.legends.map((l: any) => l.label);
        if (idx === 0) currentCommon = labels;
        else currentCommon = currentCommon.filter((l: string) => labels.includes(l));
      });
      const newLabels = newChartObj.legends.map((l: any) => l.label);
      const nextCommon = currentCommon.filter((l: string) => newLabels.includes(l));
      const lostFromCurrent = currentCommon.filter((l: string) => !nextCommon.includes(l));
      const ignoredFromNew = newLabels.filter((l: string) => !nextCommon.includes(l));

      if (lostFromCurrent.length > 0 || ignoredFromNew.length > 0) {
        setCutoffDetails({ lostFromCurrent, ignoredFromNew, newChart: newChartObj });
        setShowConfirmModal(true);
        return;
      }
    }
    const newSelected = [...selectedSourceCharts, newChartObj];
    setSelectedSourceCharts(newSelected);
    recalculateIntersection(newSelected);
    toast.success(`Broadcasting Data: "${chartToAdd.title}"`);
    setYAxisChartId("");
  };

  const confirmAddWithCutoff = () => {
    if (!cutoffDetails) return;
    const newSelected = [...selectedSourceCharts, cutoffDetails.newChart];
    setSelectedSourceCharts(newSelected);
    recalculateIntersection(newSelected);
    toast.success(`Broadcasting Data: "${cutoffDetails.newChart.title}"`);
    setYAxisChartId("");
    setShowConfirmModal(false);
    setCutoffDetails(null);
  };

  const handleRemoveSourceChart = (index: number) => {
    const newCharts = [...selectedSourceCharts];
    newCharts.splice(index, 1);
    setSelectedSourceCharts(newCharts);
    recalculateIntersection(newCharts);
  };

  const handleSave = async () => {
    if (!isProgramBuilder && !projectId) {
      toast.error("Please select a project");
      return;
    }

    if (!widgetTitle) {
      toast.error("Please enter a widget title");
      return;
    }

    if (!legendValues[0]?.label) {
      toast.error("Please enter a legend name");
      return;
    }

    const toastId = toast.loading(isProgramBuilder ? "Creating program gauge chart..." : "Creating gauge chart...");

    const xAxisData = [
      ["Label", legendValues[0].label],
      ["Value", 0], // Initialize with 0 value
    ];

    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;

    let shiftPayload: any[] = [];
    try {
      if (typeof targetOrder === "number" && !isProgramBuilder) {
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

    const payload: any = {
      numberOfDataset: 1,
      firstFieldDataset: startingRange,
      lastFieldDataset: endingRange,
      widgets: [
        {
          legendName: legendValues[0].label,
          color: legendValues[0].color,
        },
      ],
      title: widgetTitle,
      status: "ACTIVE",
      category: "GAUGE",
      xAxis: JSON.stringify(xAxisData),
      yAxis: JSON.stringify({}),
      zAxis: JSON.stringify({}),
      grouptitle: widgetTitle + "_" + Date.now(),
      width: layoutW !== undefined ? Number(layoutW) : 10,
      height: layoutH !== undefined ? Number(layoutH) : 15,
      order: targetOrder,
    };

    payload.showWidget = showLegendState;

    if (onSaveOverride) {
      toast.dismiss(toastId);
      onSaveOverride(payload);
      return;
    }

    if (isProgramBuilder) {
      payload.programid = programIdFromSlice;
      payload.projectnumber = isValueDetectOn ? 1 : legendValues.length;

      // Remove axis and group data for program builder
      delete payload.yAxis;
      delete payload.zAxis;
      delete payload.grouptitle;

      if (isValueDetectOn) {
        payload.similervalueDitects = [
          {
            chartlist: selectedSourceCharts.map((c) => c.id),
            legentName: legendValues.map((l) => l.label),
          },
        ];
        delete payload.xAxis;
      }
    } else {
      payload.projectId = projectId;
      payload.rootchart = true;
      payload.roottitle = widgetTitle;
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
        toast.success(isProgramBuilder ? "Program Gauge chart created successfully" : "Gauge chart created successfully", { id: toastId });
        onDelete?.();
        onClose();
      }
    } catch {
      toast.error("Failed to create gauge chart", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg flex flex-col h-auto self-start overflow-hidden relative">
      {/* Confirmation Modal Overlay */}
      {showConfirmModal && cutoffDetails && (
        <div className="absolute inset-0 z-110 bg-white/95 dark:bg-slate-900/95 flex flex-col p-6 animate-in fade-in duration-200 shadow-2xl">
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100 dark:border-yellow-900/30">
              <span className="text-2xl">??</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2 uppercase tracking-wide">
              Legend Mismatch Detected
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-6 leading-relaxed px-4">
              Adding this chart will cause some legends to be excluded from the analysis to maintain data consistency.
            </p>

            <div className="space-y-4 text-left bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-slate-800 max-h-[200px] overflow-y-auto scrollbar-hide shadow-inner">
              {cutoffDetails.lostFromCurrent.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1.5 grayscale opacity-70">
                    Sacrificed from current set:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cutoffDetails.lostFromCurrent.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-[10px] text-gray-600 dark:text-slate-300 font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cutoffDetails.ignoredFromNew.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">
                    Not pulled from "{cutoffDetails.newChart.title}":
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cutoffDetails.ignoredFromNew.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-[10px] text-gray-600 dark:text-slate-300 font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-6 border-t border-border dark:border-slate-800">
            <button
              onClick={confirmAddWithCutoff}
              className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
              Confirm and Continue
            </button>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setCutoffDetails(null);
              }}
              className="w-full py-2.5 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs font-bold rounded-lg border border-border dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-slate-800">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-sm">Gauge Configuration</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X size={16} className="text-gray-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Widget Title */}
        <div>
          <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
            Widget Title
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            placeholder="Enter title..."
          />
        </div>

        {/* Range Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
              Minimum
            </label>
            <input
              type="number"
              min={0}
              value={startingRange}
              onChange={(e) => setStartingRange(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
              Maximum
            </label>
            <input
              type="number"
              min={0}
              value={endingRange}
              onChange={(e) => setEndingRange(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Aggregation Toggle (Program Builder Only) */}
        {isProgramBuilder && (
          <div className="border-t border-border dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Data Aggregation</label>
                <p className="text-[9px] text-gray-400 dark:text-slate-500 italic">Pull from multiple projects</p>
              </div>
              <div
                onClick={() => setIsValueDetectOn(!isValueDetectOn)}
                className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${isValueDetectOn ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"}`}
              >
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isValueDetectOn ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>

            {isValueDetectOn && (
              <div className="space-y-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Select Project</label>
                  <select
                    value={yAxisProjectId}
                    onChange={(e) => {
                      setYAxisProjectId(e.target.value);
                      setYAxisChartId("");
                    }}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Choose Project...</option>
                    {programProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Source Chart</label>
                  <select
                    value={yAxisChartId}
                    onChange={(e) => setYAxisChartId(e.target.value)}
                    disabled={!yAxisProjectId || isChartsLoading}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-xs outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">{isChartsLoading ? "Loading charts..." : "Select Chart"}</option>
                    {filteredRootCharts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddMapping}
                  disabled={!yAxisChartId}
                  className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  Add Aggregate Source
                </button>

                {selectedSourceCharts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                      Selected Sources:
                    </p>
                    {selectedSourceCharts.map((chart, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800 shadow-sm group/item"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-4 h-4 flex items-center justify-center bg-blue-100 text-blue-600 rounded text-[10px] font-bold">
                            {i + 1}
                          </span>
                          <span className="text-[10px] text-gray-600 dark:text-slate-400 truncate">
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{chart.projectName}</span> | {chart.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveSourceChart(i)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                        >
                          <Trash2 size={12} />
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

        {/* Legend Name */}
        <div>
          <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
            Legend Name
          </label>
          <input
            type="text"
            readOnly={isValueDetectOn}
            value={legendValues[0]?.label || ""}
            onChange={(e) => handleLegendLabelChange(e.target.value)}
            className={`w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 ${isValueDetectOn ? "opacity-50 !bg-gray-50 dark:!bg-slate-800 text-gray-500" : ""}`}
            placeholder="e.g. Performance Score"
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
            Gauge Color
          </label>
          <div className="flex items-center gap-3 p-2 border border-border dark:border-slate-800 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
            <input
              type="color"
              disabled={isValueDetectOn}
              value={legendValues[0]?.color || "#8D79F6"}
              onChange={(e) => handleLegendColorChange(e.target.value)}
              className={`w-10 h-8 rounded border border-gray-200 dark:border-slate-700 cursor-pointer overflow-hidden bg-transparent ${isValueDetectOn ? "opacity-50" : ""}`}
            />
            <input
              type="text"
              readOnly={isValueDetectOn}
              value={legendValues[0]?.color || "#8D79F6"}
              onChange={(e) => handleLegendColorChange(e.target.value)}
              className="flex-1 bg-transparent border-none text-[11px] font-mono text-gray-600 dark:text-slate-400 focus:outline-none uppercase"
            />
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
          disabled={isLoading}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default GaugeConfiguration;
