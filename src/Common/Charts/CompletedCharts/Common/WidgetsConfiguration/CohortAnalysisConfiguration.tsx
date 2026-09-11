import React, { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { useCreateChartMutation, useCreateProgramChartMutation, useLazyGetRootChartQuery, useLayoutUpdateMutation } from "@/store/Api/ChartApi/ChartApi";
import { useLazyGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { toast } from "sonner";
import { useGetUser } from "@/hooks/useGetUser";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import { AssignedByProfile } from "./WidgetCommon";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
  users?: number | string;
};

const CohortAnalysisConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  xAxisValues,
  handleXAxisValueChange,
  numOfXAxisDataSet,
  setNumOfXAxisDataSet,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  onClose,
  onDelete,
  isProgramBuilder = false,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
}: {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  xAxisValues: string[];
  handleXAxisValueChange: (index: number, value: string) => void;
  numOfXAxisDataSet: number;
  setNumOfXAxisDataSet?: React.Dispatch<React.SetStateAction<number>>;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet?: React.Dispatch<React.SetStateAction<number>>;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  onClose?: () => void;
  onDelete?: () => void;
  isProgramBuilder?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
  [key: string]: any;
}) => {
  const projectIdFromSlice = useAppSelector((state) => state.chartSlice.projectId);
  const programIdFromSlice = useAppSelector((state) => state.chartSlice.programId);

  // Aggregation State
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<
    { id: string; title: string; projectName: string }[]
  >([]);

  const [createChart, { isLoading }] = useCreateChartMutation();
  const [createProgramChart, { isLoading: isCreatingProgramChart }] = useCreateProgramChartMutation();
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

    return {
      id: (c.id as string) || chartData?.id,
      title: (c.title as string) || chartData?.title || "Untitled Chart",
      category: categoryKey,
    };
  });

  const filteredRootCharts = rootCharts.filter((c) => c.category === "RETENTION");

  const handleAddMapping = () => {
    if (!yAxisChartId) return;
    const chartToAdd = filteredRootCharts.find((c) => c.id === yAxisChartId);
    if (!chartToAdd || selectedSourceCharts.some((c) => c.id === chartToAdd.id)) return;

    const project = programProjects.find((p) => p.id === yAxisProjectId);

    const newChartObj = {
      id: chartToAdd.id,
      title: chartToAdd.title,
      projectName: project?.name || "Unknown Project",
    };

    setSelectedSourceCharts(prev => [...prev, newChartObj]);
    setYAxisChartId("");
  };

  const handleRemoveSourceChart = (index: number) => {
    setSelectedSourceCharts(prev => prev.filter((_, i) => i !== index));
  };

  const assignedBy = {
    name: name || "Admin User",
    role: role || "Analyst",
    image: profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  const minCohorts = 1;
  const maxCohorts = 99;
  const minPeriods = 2;
  const maxPeriods = 99;

  const handleSetNumOfCohorts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    const clamped = Math.max(minCohorts, Math.min(maxCohorts, value));
    setNumOfLegendDataSet?.(clamped);
    setLegendValues((prev) => {
      const updated = [...prev];
      const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#3b82f6", "#a855f7"];
      while (updated.length < clamped) {
        const i = updated.length;
        updated.push({
          label: `Cohort ${i + 1}`,
          field: `cohort${i + 1}`,
          color: colors[i % colors.length],
          users: 100,
        });
      }
      return updated.slice(0, clamped);
    });
  };

  const handleSetNumOfPeriods = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    const clamped = Math.max(minPeriods, Math.min(maxPeriods, value));
    setNumOfXAxisDataSet?.(clamped);
  };

  const handleSave = async () => {
    if (!widgetTitle) {
      toast.error("Please enter a widget title");
      return;
    }

    const toastId = toast.loading("Saving configuration...");

    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;
    let shiftPayload: any[] = [];
    try {
      if (typeof targetOrder === "number" && !isProgramBuilder && projectIdFromSlice) {
        const existingRes = await getRootChartByProject(projectIdFromSlice).unwrap();
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

    let payload: any;

    if (isProgramBuilder && isValueDetectOn) {
      payload = {
        title: widgetTitle,
        status: "ACTIVE",
        category: "RETENTION",
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
        numberOfDataset: legendValues.length,
        firstFieldDataset: 0,
        lastFieldDataset: 100,
        widgets: legendValues.map((l) => ({
          legendName: l.label || "Cohort",
          color: l.color,
        })),
      };
    } else {
      payload = {
        numberOfDataset: numOfLegendDataSet,
        firstFieldDataset: 0,
        lastFieldDataset: 100,
        widgets: legendValues.map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        title: widgetTitle,
        status: "ACTIVE",
        category: "RETENTION",
        xAxis: JSON.stringify([
          ["Label", ...legendValues.map((l) => l.label)],
          ...xAxisValues.map((label) => [
            label,
            ...Array(numOfLegendDataSet).fill(0),
          ]),
        ]),
        // Conditional fields based on builder type
        ...(isProgramBuilder
          ? {
            programid: programIdFromSlice,
            projectnumber: 1,
            order: targetOrder,
            width: layoutW !== undefined ? Number(layoutW) : 10,
            height: layoutH !== undefined ? Number(layoutH) : 15,
          }
          : {
            projectId: projectIdFromSlice,
            yAxis: JSON.stringify([]),
            zAxis: JSON.stringify([]),
            rootchart: true,
            roottitle: widgetTitle,
            grouptitle: generateId(),
            order: targetOrder,
            width: layoutW !== undefined ? Number(layoutW) : 10,
            height: layoutH !== undefined ? Number(layoutH) : 15,
          }
        ),
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
        toast.success("Cohort Analysis saved successfully", { id: toastId });
        onDelete?.();
        onClose?.();
      }
    } catch {
      toast.error("Failed to save configuration", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-tight">Cohort Analysis</h2>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium whitespace-nowrap">Configure retention metrics</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Widget Title */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            placeholder="e.g. Retention Cohort Survival"
          />
        </div>

        {/* Aggregation Section */}
        {isProgramBuilder && (
          <div className="border-t border-border dark:border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Aggregation</label>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Combine charts from program</p>
              </div>
              <div
                onClick={() => setIsValueDetectOn(!isValueDetectOn)}
                className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${isValueDetectOn ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"}`}
              >
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isValueDetectOn ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>

            {isValueDetectOn && (
              <div className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-border dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Project:</label>
                    <select
                      value={yAxisProjectId}
                      onChange={(e) => {
                        setYAxisProjectId(e.target.value);
                        setYAxisChartId("");
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Select Project</option>
                      {programProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Source Cohort Chart:</label>
                    <select
                      value={yAxisChartId}
                      onChange={(e) => setYAxisChartId(e.target.value)}
                      disabled={!yAxisProjectId || isChartsLoading}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-800 text-gray-700 dark:text-slate-300"
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
                    Add Source
                  </button>
                </div>

                {selectedSourceCharts.map((chart, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 shadow-sm animate-in slide-in-from-left duration-200">
                    <span className="text-[10px] text-gray-700 dark:text-slate-300 truncate font-medium">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{chart.projectName}</span> | {chart.title}
                    </span>
                    <button onClick={() => handleRemoveSourceChart(i)} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors ml-2">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Periods Mapping */}
        {!isValueDetectOn && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Time Periods (X-Axis)</h3>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/30">
                <input
                  type="number"
                  min={minPeriods}
                  max={maxPeriods}
                  value={numOfXAxisDataSet}
                  onChange={handleSetNumOfPeriods}
                  className="w-10 bg-transparent text-xs font-bold text-blue-800 dark:text-blue-300 text-center outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: numOfXAxisDataSet }).map((_, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Period ${idx} label`}
                  value={xAxisValues[idx] || ""}
                  onChange={(e) => handleXAxisValueChange(idx, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-800 rounded-md focus:border-blue-400 outline-none transition-all shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                />
              ))}
            </div>
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

        {/* Cohorts Mapping */}
        <div className="space-y-4 pt-4 border-t border-border dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Cohort Groups (Series)</h3>
            {!isValueDetectOn && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/30">
                <input
                  type="number"
                  min={minCohorts}
                  max={maxCohorts}
                  value={numOfLegendDataSet}
                  onChange={handleSetNumOfCohorts}
                  className="w-10 bg-transparent text-xs font-bold text-blue-800 dark:text-blue-300 text-center outline-none"
                />

              </div>
            )}
          </div>

          <div className="space-y-3">
            {legendValues.map((l, index) => (
              <div key={index} className="p-3 border border-border dark:border-slate-800 rounded-lg bg-gray-50/30 dark:bg-slate-800/20 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors space-y-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: l.color }}>
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    readOnly={isValueDetectOn}
                    placeholder="Cohort Name"
                    value={l.label}
                    onChange={(e) => {
                      const newL = [...legendValues];
                      newL[index].label = e.target.value;
                      newL[index].field = e.target.value.toLowerCase().replace(/\s+/g, "");
                      setLegendValues(newL);
                    }}
                    className={`flex-1 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-800 rounded-md focus:border-blue-400 outline-none shadow-sm text-gray-900 dark:text-slate-100 ${isValueDetectOn ? "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed" : ""}`}
                  />
                </div>
                {!isValueDetectOn && (
                  <div className="flex items-center justify-between pl-9">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Color</span>
                    <input
                      type="color"
                      value={l.color}
                      onChange={(e) => {
                        const newL = [...legendValues];
                        newL[index].color = e.target.value;
                        setLegendValues(newL);
                      }}
                      className="w-6 h-6 rounded-md cursor-pointer border-none p-0"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Owner */}
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

export default CohortAnalysisConfiguration;
