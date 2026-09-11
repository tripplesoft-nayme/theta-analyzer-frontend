import React, { useEffect, useState, useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useCreateChartMutation,
  useCreateProgramChartMutation,
  useLazyGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useLazyGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { toast } from "sonner";
import { useGetUser } from "@/hooks/useGetUser";
import { useLocation } from "react-router-dom";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";

import type { LegendValue } from "../chartTypes";
import { AssignedByProfile } from "./WidgetCommon";

const ComboChartConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  numOfXAxisDataSet,
  handleSetNumOfXAxisDataSet,
  xAxisValues,
  handleXAxisValueChange,
  legendValues,
  setLegendValues,
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  onClose,
  onDelete,
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
}: {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  numOfXAxisDataSet: number;
  handleSetNumOfXAxisDataSet: (e: React.ChangeEvent<HTMLInputElement>) => void;
  xAxisValues: string[];
  handleXAxisValueChange: (index: number, value: string) => void;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  startingRange: number;
  setStartingRange: React.Dispatch<React.SetStateAction<number>>;
  endingRange: number;
  setEndingRange: React.Dispatch<React.SetStateAction<number>>;
  onClose?: () => void;
  onDelete?: () => void;
  isValueDetectOn: boolean;
  setIsValueDetectOn: (val: boolean) => void;
  selectedSourceCharts: { id: string; title: string; projectName: string; legends: { label: string; color: string }[] }[];
  setSelectedSourceCharts: (charts: any[]) => void;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
}) => {
  const { name, role, profileImage } = useGetUser();
  const projectIdFromSlice = useAppSelector(
    (state) => state?.chartSlice?.projectId,
  );

  const location = useLocation();
  const [projectId, setProjectId] = useState<string>("");
  const projectIdFromState = location.state?.projectId;

  useEffect(() => {
    if (projectIdFromSlice) {
      setProjectId(projectIdFromSlice);
    } else if (projectIdFromState) {
      setProjectId(projectIdFromState);
    }
  }, [projectIdFromSlice, projectIdFromState]);

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

  const assignedBy = {
    name: name || "Admin User",
    role: role || "Analyst",
    image: profileImage || "",
  };

  // Aggregation Logic (Adapted from ProgressRing)
  const DEFAULT_COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];
  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cutoffDetails, setCutoffDetails] = useState<{
    lostFromCurrent: string[];
    ignoredFromNew: string[];
    newChart: any;
  } | null>(null);

  const programIdFromSlice = useAppSelector((state) => state.chartSlice.programId);
  const isProgramBuilder = location.pathname.split("/")[2] === "program-builder";

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

  const programProjects = (programProjectsData as any)?.data?.data?.map((p: any) => ({
    id: p.id as string,
    name: p.name as string,
  })) ?? [];

  const rootCharts = ((projectChartsData as any)?.data ?? []).map((c: any) => {
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
    return rootCharts.filter((c: any) => c.category === "COMBO");
  }, [rootCharts]);

  const recalculateIntersection = (charts: typeof selectedSourceCharts) => {
    if (charts.length === 0) {
      setLegendValues([
        { label: "Revenue", field: "revenue", color: "#3b82f6", type: "bar" },
        { label: "Target", field: "target", color: "#ec4899", type: "line" },
      ]);
      return;
    }
    let commonLabels: string[] = [];
    charts.forEach((chart, idx) => {
      const labels = chart.legends.map((l) => l.label);
      if (idx === 0) commonLabels = labels;
      else commonLabels = commonLabels.filter((l: string) => labels.includes(l));
    });

    const updatedLegends: LegendValue[] = commonLabels.slice(0, 2).map((label, idx) => {
      const firstOccur = charts[0].legends.find((l) => l.label === label);
      return {
        label,
        field: label.toLowerCase().replace(/\s+/g, ""),
        color: firstOccur?.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        type: idx === 0 ? "bar" : "line",
      };
    });
    setLegendValues(updatedLegends);
  };

  const handleAddMapping = () => {
    if (!yAxisChartId) {
      toast.error("Please select a chart first");
      return;
    }
    const chartToAdd = filteredRootCharts.find((c: any) => c.id === yAxisChartId);
    if (!chartToAdd) return;
    if (selectedSourceCharts.some((c: any) => c.id === chartToAdd.id)) {
      toast.error("Chart already added");
      return;
    }
    const project = programProjects.find((p: any) => p.id === yAxisProjectId);
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
        const labels = chart.legends.map((l) => l.label);
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
    toast.success(`Aggregating Data: "${chartToAdd.title}"`);
    setYAxisChartId("");
  };

  const confirmAddWithCutoff = () => {
    if (!cutoffDetails) return;
    const newSelected = [...selectedSourceCharts, cutoffDetails.newChart];
    setSelectedSourceCharts(newSelected);
    recalculateIntersection(newSelected);
    toast.success(`Aggregating Data: "${cutoffDetails.newChart.title}"`);
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

  const handleLegendLabelChange = (index: number, value: string) => {
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

  const handleLegendColorChange = (index: number, color: string) => {
    setLegendValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        color: color,
      };
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    if (isProgramBuilder && !programIdFromSlice) {
      toast.error("Program context missing");
      return;
    }
    if (!isProgramBuilder && !projectId) {
      toast.error("Please select a project");
      return;
    }

    // Validation
    if (!legendValues[0]?.label || !legendValues[1]?.label) {
      toast.error("Please fill in both legend labels");
      return;
    }

    if (!isValueDetectOn) {
      for (let i = 0; i < numOfXAxisDataSet; i++) {
        if (!xAxisValues[i]) {
          toast.error(`Please fill in the value for X-Axis field ${i + 1}`);
          return;
        }
      }
    }

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

    const toastId = toast.loading("Saving combo chart...");
    let payload: any;
    if (isProgramBuilder) {
      payload = {
        numberOfDataset: 2,
        firstFieldDataset: startingRange,
        lastFieldDataset: endingRange,
        widgets: legendValues.slice(0, 2).map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        title: widgetTitle,
        status: "ACTIVE",
        category: "COMBO",
        programid: programIdFromSlice,
        projectnumber: isValueDetectOn ? 1 : 2,
      };

      if (isValueDetectOn) {
        payload.similervalueDitects = [
          {
            chartlist: selectedSourceCharts.map((c) => c.id),
            legentName: legendValues.map((l) => l.label),
          },
        ];
      } else {
        payload.xAxis = JSON.stringify([
          ["Label", ...legendValues.slice(0, 2).map((l) => l.label)],
          ...xAxisValues.map((label) => [label, 0, 0]),
        ]);
      }
      payload.width = layoutW !== undefined ? Number(layoutW) : 10;
      payload.height = layoutH !== undefined ? Number(layoutH) : 15;
      payload.order = targetOrder;
    } else {
      // Standard Project Builder
      payload = {
        numberOfDataset: 2,
        firstFieldDataset: startingRange,
        lastFieldDataset: endingRange,
        widgets: legendValues.slice(0, 2).map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        title: widgetTitle,
        status: "ACTIVE",
        category: "COMBO",
        xAxis: JSON.stringify([
          ["Label", ...legendValues.slice(0, 2).map((l) => l.label)],
          ...xAxisValues.map((label) => [label, 0, 0]),
        ]),
        yAxis: JSON.stringify([]),
        zAxis: JSON.stringify([]),
        projectId: projectId,
        rootchart: true,
        roottitle: widgetTitle,
        grouptitle: generateId(),
        width: layoutW !== undefined ? Number(layoutW) : 10,
        height: layoutH !== undefined ? Number(layoutH) : 15,
        order: targetOrder,
      };
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
        toast.success("Combo chart saved successfully", { id: toastId });
        onDelete?.();
        onClose?.();
      }
    } catch (error) {
      console.error("Failed to save combo chart:", error);
      toast.error("Chart saving failed", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-300 relative font-sans">
      {/* Confirmation Modal Overlay */}
      {showConfirmModal && cutoffDetails && (
        <div className="absolute inset-0 z-[110] bg-white/95 dark:bg-slate-900/95 flex flex-col p-6 animate-in fade-in duration-200 shadow-2xl">
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100 dark:border-yellow-900/30">
              <span className="text-2xl">??</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2 uppercase tracking-wide">
              Legend Mismatch Detected
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-6 leading-relaxed px-4">
              Adding this chart will cause some legends to be excluded from aggregation to maintain consistency.
            </p>

            <div className="space-y-4 text-left bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-slate-800 max-h-[200px] overflow-y-auto scrollbar-hide shadow-inner">
              {cutoffDetails.lostFromCurrent.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1.5 grayscale opacity-70">
                    Dropped from current set:
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
                    Ignored from "{cutoffDetails.newChart.title}":
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Combo Configuration</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5 mt-2 uppercase tracking-wider">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-300 dark:placeholder:text-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            placeholder="e.g. Sales vs Target"
          />
        </div>

        {/* Aggregation Toggle (Program Builder Only) */}
        {isProgramBuilder && (
          <div className="border-t border-border dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Data Aggregation</label>
                <p className="text-[9px] text-gray-500 dark:text-slate-400 font-medium italic">Pull from multiple projects</p>
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
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Select Project</label>
                  <select
                    value={yAxisProjectId}
                    onChange={(e) => {
                      setYAxisProjectId(e.target.value);
                      setYAxisChartId("");
                    }}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Choose Project...</option>
                    {programProjects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Source Combo Chart</label>
                  <select
                    value={yAxisChartId}
                    onChange={(e) => setYAxisChartId(e.target.value)}
                    disabled={!yAxisProjectId || isChartsLoading}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">{isChartsLoading ? "Loading charts..." : "Select Chart"}</option>
                    {filteredRootCharts.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddMapping}
                  disabled={!yAxisChartId}
                  className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/10 transition-all active:scale-95"
                >
                  Add Aggregate Source
                </button>

                {selectedSourceCharts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                      Selected Sources ({selectedSourceCharts.length}):
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
                          <span className="text-[11px] text-gray-700 dark:text-slate-300 truncate font-medium">
                            <span className="font-bold text-blue-800 dark:text-blue-400">{chart.projectName}</span> | {chart.title}
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

        {!isValueDetectOn && (
          <div>
            <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
              X-Axis Configuration
            </h3>
            <div className="flex items-center mb-3">
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1 font-medium">Number of Data Fields:</label>
              <input
                type="number"
                min={1}
                max={99}
                defaultValue={numOfXAxisDataSet}
                onChange={handleSetNumOfXAxisDataSet}
                className="w-12 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-2 px-1">
              {Array.from({ length: numOfXAxisDataSet }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Category ${index + 1} Label`}
                  value={xAxisValues[index] || ""}
                  onChange={(e) => handleXAxisValueChange(index, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
            Scale Range
          </h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">Min Value:</label>
              <input
                type="number"
                value={startingRange}
                onChange={(e) => setStartingRange(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center">
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">Max Value:</label>
              <input
                type="number"
                value={endingRange}
                onChange={(e) => setEndingRange(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Legend Configuration
            </h3>
            {isValueDetectOn && (
              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                Aggregated
              </span>
            )}
          </div>
          <div className="flex items-center justify-between py-2 mb-3 border-b border-gray-100 dark:border-slate-800">
            <label className="text-xs font-medium text-gray-700 dark:text-slate-200">
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
          <div className="space-y-4">
            {/* 1st Legend - Bar */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tight">1st Legend (BAR)</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Bar Legend Label"
                readOnly={isValueDetectOn}
                value={legendValues[0]?.label || ""}
                onChange={(e) => handleLegendLabelChange(0, e.target.value)}
                className={`w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded mb-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-slate-100 ${isValueDetectOn ? "opacity-60 bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-900"}`}
              />
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <input
                    type="color"
                    disabled={isValueDetectOn}
                    value={legendValues[0]?.color || "#3b82f6"}
                    onChange={(e) => handleLegendColorChange(0, e.target.value)}
                    className="w-10 h-7 rounded-md cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  readOnly={isValueDetectOn}
                  value={legendValues[0]?.color || "#3b82f6"}
                  onChange={(e) => handleLegendColorChange(0, e.target.value)}
                  className="flex-1 px-2.5 py-1 text-[11px] font-mono border border-gray-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 uppercase"
                />
              </div>
            </div>

            {/* 2nd Legend - Line */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-0.5 bg-pink-500 rounded-full" />
                  <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tight">2nd Legend (LINE)</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Line Legend Label"
                readOnly={isValueDetectOn}
                value={legendValues[1]?.label || ""}
                onChange={(e) => handleLegendLabelChange(1, e.target.value)}
                className={`w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded mb-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-slate-100 ${isValueDetectOn ? "opacity-60 bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-900"}`}
              />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    disabled={isValueDetectOn}
                    value={legendValues[1]?.color || "#ec4899"}
                    onChange={(e) => handleLegendColorChange(1, e.target.value)}
                    className="w-10 h-7 rounded-md cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  readOnly={isValueDetectOn}
                  value={legendValues[1]?.color || "#ec4899"}
                  onChange={(e) => handleLegendColorChange(1, e.target.value)}
                  className="flex-1 px-2.5 py-1 text-[11px] font-mono border border-gray-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <AssignedByProfile assignedBy={assignedBy} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky bottom-0">
        <button onClick={onClose} className="px-5 py-2 text-xs font-bold border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-slate-300">
          Cancel
        </button>
        <button
          disabled={isLoading}
          onClick={handleSaveChanges}
          className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Combo"}
        </button>
      </div>
    </div>
  );
};

export default ComboChartConfiguration;
