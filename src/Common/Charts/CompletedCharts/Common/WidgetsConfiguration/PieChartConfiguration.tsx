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
import { useMemo } from "react";
import { AssignedByProfile } from "./WidgetCommon";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

interface PieChartConfigurationProps {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet: React.Dispatch<React.SetStateAction<number>>;
  legendValues: LegendValue[];
  setLegendValues: React.Dispatch<React.SetStateAction<LegendValue[]>>;
  onClose?: () => void;
  onDelete?: () => void;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
}

const PieChartConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  onClose,
  onDelete,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
}: PieChartConfigurationProps) => {
  const projectIdFromSlice = useAppSelector(
    (state) => state.chartSlice.projectId,
  );
  const location = useLocation();

  // -- detect Program Builder context ----------------------------------------
  const isProgramBuilder =
    location.pathname.split("/")[2] === "program-builder";

  const programIdFromSlice = useAppSelector(
    (state) => state.chartSlice.programId,
  );

  // -- Aggregation state -------------------------------
  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");

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
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<
    { id: string; title: string; legends: { label: string; color: string }[] }[]
  >([]);

  const [createProgramChart, { isLoading: isPublishingProgram }] =
    useCreateProgramChartMutation();
  const [createChart, { isLoading: isPublishingProject }] =
    useCreateChartMutation();
  const [layoutUpdate] = useLayoutUpdateMutation();

  const [
    getProjectsByProgram,
    { data: programProjectsData },
  ] = useLazyGetProjectsByProgramIdQuery();

  const [
    getRootChartByProject,
    { data: projectChartsData, isLoading: isChartsLoading },
  ] = useLazyGetRootChartQuery();

  const isLoading = isPublishingProgram || isPublishingProject;

  // Fetch projects when entering program-builder context
  useEffect(() => {
    if (isProgramBuilder && programIdFromSlice) {
      getProjectsByProgram({ programId: programIdFromSlice });
    }
  }, [isProgramBuilder, programIdFromSlice, getProjectsByProgram]);

  // Fetch root charts when a project is selected
  useEffect(() => {
    if (isProgramBuilder && yAxisProjectId) {
      getRootChartByProject(yAxisProjectId);
    }
  }, [isProgramBuilder, yAxisProjectId, getRootChartByProject]);

  // Response mapping logic
  type RawApiItem = Record<string, unknown>;

  const programProjects =
    (programProjectsData?.data?.data as RawApiItem[] | undefined)?.map((p) => ({
      id: p.id as string,
      name: p.name as string,
    })) ?? [];

  const rootCharts = ((projectChartsData?.data ?? []) as RawApiItem[]).map(
    (c) => {
      const categoryKey = (c.category as string)?.toUpperCase();
      const chartProperty = chartTypes[categoryKey];
      const chartData = (
        chartProperty && c[chartProperty] ? c[chartProperty] : (c.sampleChart || c.sampleBarChart || c)
      ) as any;
      let apiWidgets = chartData?.widgets || c?.widgets || [];

      return {
        id: (c.id as string) || chartData?.id,
        title: (c.title as string) || chartData?.title || "Untitled Chart",
        widgets: apiWidgets,
        category: categoryKey,
      };
    },
  );

  const filteredRootCharts = useMemo(() => {
    // For Pie aggregation, we prioritize other Pie charts or Ring charts
    return rootCharts.filter((c) => c.category === "PIE" || c.category === "RING");
  }, [rootCharts]);

  const recalculateIntersection = (charts: typeof selectedSourceCharts) => {
    if (charts.length === 0) {
      setLegendValues([]);
      setNumOfLegendDataSet(0);
      return;
    }

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
        color: firstOccurrence?.color || colors[idx % colors.length],
      };
    });

    setLegendValues(updatedLegends);
    setNumOfLegendDataSet(updatedLegends.length);
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

    const newSelectedCharts = [
      ...selectedSourceCharts,
      {
        id: chartToAdd.id,
        title: chartToAdd.title,
        legends: chartToAdd.widgets.map((w: any) => ({
          label: w.legendName || w.label,
          color: w.color,
        })),
      },
    ];

    setSelectedSourceCharts(newSelectedCharts);
    recalculateIntersection(newSelectedCharts);
    toast.success(`Broadcasting Data: "${chartToAdd.title}"`);
    setYAxisChartId("");
  };

  const handleRemoveSourceChart = (index: number) => {
    const newCharts = [...selectedSourceCharts];
    newCharts.splice(index, 1);
    setSelectedSourceCharts(newCharts);
    recalculateIntersection(newCharts);
  };

  const colors = [
    "#13A490", "#35B6EE", "#6F78F9", "#F26419", "#F6AE2D",
    "#862BB0", "#D72638", "#3F88C5", "#44BBA4", "#FF9505",
  ];

  const handleToggleValueDetect = () => {
    setIsValueDetectOn((prev) => !prev);
  };

  const { name, role, profileImage } = useGetUser();

  const assignedBy = {
    name: name || "Admin User",
    role: role || "Analyst",
    image: profileImage || "",
  };

  const minSlices = 1;

  const handleSetNumOfSlices = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < minSlices) {
      toast.error(`Please enter a valid number`);
      return;
    }

    setNumOfLegendDataSet(value);
    setLegendValues((prev) => {
      const updated = [...prev];
      while (updated.length < value) {
        const i = updated.length;
        updated.push({
          label: `Slice ${i + 1}`,
          field: `slice${i + 1}`,
          color: colors[i % colors.length],
        });
      }
      return updated.slice(0, value);
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
      updated[index] = { ...updated[index], color: color };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!widgetTitle) {
      toast.error("Please enter a widget title");
      return;
    }

    const toastId = toast.loading("Saving Pie Chart...");

    const xAxisData = [
      ["Label", ...legendValues.map((l) => l.label)],
      ["Value", ...Array(legendValues.length).fill(0)],
    ];

    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;

    let shiftPayload: any[] = [];
    try {
      if (typeof targetOrder === "number" && !isProgramBuilder) {
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

    const payload: any = {
      numberOfDataset: numOfLegendDataSet,
      firstFieldDataset: 0,
      lastFieldDataset: 100,
      widgets: legendValues.map((l) => ({
        legendName: l.label,
        color: l.color,
      })),
      title: widgetTitle,
      status: "ACTIVE",
      category: "PIE",
      width: layoutW !== undefined ? Number(layoutW) : 10,
      height: layoutH !== undefined ? Number(layoutH) : 15,
      order: targetOrder,
      showWidget: showLegendState,
    };

    if (onSaveOverride) {
      toast.dismiss(toastId);
      onSaveOverride(payload);
      return;
    }

    if (isProgramBuilder) {
      payload.programid = programIdFromSlice;
      payload.projectnumber = isValueDetectOn ? 1 : numOfLegendDataSet;

      if (isValueDetectOn) {
        payload.similervalueDitects = [
          {
            chartlist: selectedSourceCharts.map((c) => c.id),
            legentName: legendValues.map((l) => l.label),
          },
        ];
      } else {
        payload.xAxis = JSON.stringify(xAxisData);
      }
    } else {
      payload.xAxis = JSON.stringify(xAxisData);
      payload.projectId = projectIdFromSlice;
      payload.rootchart = true;
      payload.roottitle = widgetTitle;
      payload.grouptitle = generateId();
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
        toast.success("Pie Chart saved successfully", { id: toastId });
        onDelete?.();
        onClose?.();
      }
    } catch (error) {
      console.error("Failed to save pie chart:", error);
      toast.error("Failed to save Pie Chart", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto
    self-start flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-xl flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase">Pie Configuration</h2>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Define your data aggregation or manual slices</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 dark:text-slate-500">
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
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Aggregation Toggle (Program Builder Only) */}
        {isProgramBuilder && (
          <div className="p-3 bg-blue-50/50 dark:bg-slate-800/30 rounded-lg border border-blue-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-blue-700 dark:text-blue-400">DATA AGGREGATION</label>
              <div
                onClick={handleToggleValueDetect}
                className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${isValueDetectOn ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"}`}
              >
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isValueDetectOn ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>

            {isValueDetectOn && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Project</label>
                  <select
                    value={yAxisProjectId}
                    onChange={(e) => {
                      setYAxisProjectId(e.target.value);
                      setYAxisChartId("");
                    }}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Select Project</option>
                    {programProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Source Chart (Pie/Ring)</label>
                  <select
                    value={yAxisChartId}
                    onChange={(e) => setYAxisChartId(e.target.value)}
                    disabled={!yAxisProjectId || isChartsLoading}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">{isChartsLoading ? "Loading..." : "Select Chart"}</option>
                    {filteredRootCharts.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleAddMapping}
                  disabled={!yAxisChartId}
                  className="w-full py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Aggregate Source
                </button>

                {selectedSourceCharts.length > 0 && (
                  <div className="pt-2 space-y-2">
                    {selectedSourceCharts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-gray-700 dark:text-slate-300 truncate font-medium">{c.title}</span>
                        <button onClick={() => handleRemoveSourceChart(i)} className="text-gray-400 dark:text-slate-500 hover:text-red-500">
                          <X size={12} />
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

        {/* Manual Configuration / Data Slices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
            <h3 className="text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Configuration Slices</h3>
            {!isValueDetectOn && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">SLICES:</span>
                <input
                  type="number"
                  min={minSlices}
                  value={numOfLegendDataSet}
                  onChange={handleSetNumOfSlices}
                  className="w-10 py-0.5 border border-gray-200 dark:border-slate-800 rounded text-xs text-center font-bold text-blue-600 dark:text-blue-400 outline-none bg-white dark:bg-slate-900"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {legendValues.map((l, index) => (
              <div key={index} className="p-3 border border-border dark:border-slate-800 rounded-lg bg-gray-50/30 dark:bg-slate-800/30 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0" style={{ backgroundColor: l.color }}>
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    readOnly={isValueDetectOn}
                    placeholder="Slice Name"
                    value={l.label}
                    onChange={(e) => handleSliceLabelChange(index, e.target.value)}
                    className={`flex-1 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs border border-gray-200 dark:border-slate-800 rounded shadow-sm outline-none focus:border-blue-400 text-gray-900 dark:text-slate-100 ${isValueDetectOn ? "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-500 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div className="flex items-center justify-between pl-9">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly={isValueDetectOn}
                      value={l.color}
                      onChange={(e) => handleSliceColorChange(index, e.target.value)}
                      className="w-16 text-[10px] font-mono text-gray-500 dark:text-slate-400 bg-transparent text-right outline-none"
                    />
                    <input
                      type="color"
                      disabled={isValueDetectOn}
                      value={l.color}
                      onChange={(e) => handleSliceColorChange(index, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-none shadow-sm bg-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile Section */}
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

export default PieChartConfiguration;
