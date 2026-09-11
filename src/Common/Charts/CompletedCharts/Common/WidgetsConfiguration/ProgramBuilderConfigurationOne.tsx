import {
  useEffect,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { X, Trash2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useCreateProgramChartMutation,
  useLazyGetRootChartQuery,
  useLazyGetProgramBuilderChartQuery,
  useUpdateBulkProgramChartMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useLazyGetProjectsByProgramIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { toast } from "sonner";
import { useGetUser } from "@/hooks/useGetUser";
import { chartTypes } from "@/Common/Charts/CompletedCharts/Common/ChartCategory";
import {
  extractLegendsFromXAxis,
} from "@/Common/Charts/CompletedCharts/Common/chartUtils";
import { DebouncedInput, LegendValue, AssignedByProfile } from "./WidgetCommon";

const DEFAULT_COLORS = [
  "#13A490",
  "#35B6EE",
  "#6F78F9",
  "#F26419",
  "#E91E8C",
  "#FFB800",
  "#7C3AED",
  "#10B981",
];

const ProgramBuilderConfigurationOne = ({
  widgedName,
  widgetTitle,
  widgetCategory,
  setWidgetTitle,
  numOfXAxisDataSet,
  handleSetNumOfXAxisDataSet,
  xAxisValues,
  handleXAxisValueChange,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  onClose,
  onDelete,
  isRestricted,
  onSaveOverride,
  layoutW,
  layoutH,
  orderIndex,
  showLegend,
  setShowLegend,
}: {
  widgedName: string;
  widgetTitle: string;
  widgetCategory: string;
  setWidgetTitle: Dispatch<SetStateAction<string>>;
  numOfXAxisDataSet: number;
  handleSetNumOfXAxisDataSet: (e: ChangeEvent<HTMLInputElement>) => void;
  xAxisValues: string[];
  handleXAxisValueChange: (index: number, value: string) => void;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet: Dispatch<SetStateAction<number>>;
  legendValues: LegendValue[];
  setLegendValues: Dispatch<SetStateAction<LegendValue[]>>;
  startingRange: number;
  setStartingRange: Dispatch<SetStateAction<number>>;
  endingRange: number;
  setEndingRange: Dispatch<SetStateAction<number>>;
  onClose?: () => void;
  onDelete?: () => void;
  isRestricted?: boolean;
  onSaveOverride?: (payload: any) => void;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
}) => {
  const isLegendLocked = isRestricted;
  const { name, role, profileImage, loading } = useGetUser();
  const programIdFromSlice = useAppSelector(
    (state) => state?.chartSlice?.programId
  );

  const [yAxisProjectId, setYAxisProjectId] = useState<string>("");
  const [yAxisChartId, setYAxisChartId] = useState<string>("");
  const [isValueDetectOn, setIsValueDetectOn] = useState(false);
  // const [showFilter, setShowFilter] = useState(false);
  const [filter] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cutoffDetails, setCutoffDetails] = useState<{
    lostFromCurrent: string[];
    ignoredFromNew: string[];
    newChart: any;
  } | null>(null);

  const [createProgramChart, { isLoading }] = useCreateProgramChartMutation();
  const [getProgramBuilderCharts] = useLazyGetProgramBuilderChartQuery();
  const [updateBulkProgramChart] = useUpdateBulkProgramChartMutation();

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


  // Selected source charts for aggregation
  const [selectedSourceCharts, setSelectedSourceCharts] = useState<
    { id: string; title: string; projectName: string; legends: { label: string; color: string }[] }[]
  >([]);

  const handleToggleDataAggregation = () => {
    setIsValueDetectOn((prev) => !prev);
    // Optionally reset something here if needed, but following instructions to not hide fields
  };

  const [getProjectsByProgram, { data: programProjectsData }] =
    useLazyGetProjectsByProgramIdQuery();
  const [
    getRootChartByProject,
    { data: projectChartsData, isLoading: isChartsLoading },
  ] = useLazyGetRootChartQuery();

  useEffect(() => {
    if (programIdFromSlice)
      getProjectsByProgram({ programId: programIdFromSlice });
  }, [programIdFromSlice, getProjectsByProgram]);

  useEffect(() => {
    if (yAxisProjectId) getRootChartByProject(yAxisProjectId);
  }, [yAxisProjectId, getRootChartByProject]);

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
        xAxis: c.xAxis || chartData?.xAxis,
        widgets: apiWidgets,
        category: categoryKey,
      };
    },
  );

  const filteredRootCharts = useMemo(() => {
    return rootCharts.filter((c) => {
      if (widgetCategory === "PIE" || widgetCategory === "RING") {
        return c.category === "PIE" || c.category === "RING";
      }
      return c.category === widgetCategory;
    });
  }, [rootCharts, widgetCategory]);

  const recalculateIntersection = (charts: typeof selectedSourceCharts) => {
    if (charts.length === 0) {
      setLegendValues([]);
      setNumOfLegendDataSet(0);
      handleSetNumOfXAxisDataSet({ target: { value: "0" } } as any);
      return;
    }

    // Logic to find common legends across all selected charts
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

    // Update X-Axis labels with chart titles
    handleSetNumOfXAxisDataSet({
      target: { value: String(charts.length) },
    } as any);
    charts.forEach((chart, idx) => {
      handleXAxisValueChange(idx, chart.title);
    });
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

    const apiLegends =
      chartToAdd.widgets && chartToAdd.widgets.length > 0
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

    // Calculate intersection impact
    if (selectedSourceCharts.length > 0) {
      // Get current common labels
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
        setCutoffDetails({
          lostFromCurrent,
          ignoredFromNew,
          newChart: newChartObj,
        });
        setShowConfirmModal(true);
        return;
      }
    }

    const newSelectedCharts = [...selectedSourceCharts, newChartObj];
    setSelectedSourceCharts(newSelectedCharts);
    recalculateIntersection(newSelectedCharts);
    toast.success(`Broadcasting Data: "${chartToAdd.title}"`);
    setYAxisChartId("");
  };

  const confirmAddWithCutoff = () => {
    if (!cutoffDetails) return;
    const newSelectedCharts = [...selectedSourceCharts, cutoffDetails.newChart];
    setSelectedSourceCharts(newSelectedCharts);
    recalculateIntersection(newSelectedCharts);
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

  const assignedBy = {
    name: !loading && name,
    role: !loading && role,
    image: !loading && profileImage,
  };
  const handleRemoveLegend = (index: number) => {
    if (isLegendLocked) return;
    if (numOfLegendDataSet <= 1) {
      toast.error(`At least 1 legend required`);
      return;
    }
    setLegendValues((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setNumOfLegendDataSet((p) => p - 1);
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
      updated[index] = { ...updated[index], color: color };
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    if (!programIdFromSlice) {
      toast.error("Something went wrong with program data");
      return;
    }

    if (!widgetCategory) {
      toast.error(`Please select a widget category`);
      return;
    }

    if (numOfXAxisDataSet < 1) {
      toast.error(`Please add at least 1 data source`);
      return;
    }

    const toastId = toast.loading("Creating chart...");
    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;

    let shiftPayload: any[] = [];
    try {
      const existingRes = await getProgramBuilderCharts(programIdFromSlice).unwrap();
      const existingCharts = existingRes?.data || existingRes || [];
      if (Array.isArray(existingCharts)) {
        existingCharts.forEach((c: any) => {
          const currentOrder = typeof c.order === "number" ? c.order : 0;
          if (currentOrder >= targetOrder) {
            let rawHeight = c.height ? Number(c.height) : (isValueDetectOn ? 20 : 15);
            if (rawHeight >= 50) {
              rawHeight = Math.max(1, Math.round((rawHeight + 8) / 28));
            }
            shiftPayload.push({
              ...c,
              height: rawHeight,
              width: c.width ? Number(c.width) : 10,
              order: currentOrder + 1,
            });
          }
        });
      }
    } catch (err) {
      console.error("Failed to calculate program chart shift payload", err);
    }

    let payload: any;

    if (isValueDetectOn) {
      // VALUE DETECT MODE PAYLOAD
      payload = {
        title: widgetTitle || "Similar Value Comparison Chart",
        status: "ACTIVE",
        category: widgetCategory,
        programid: programIdFromSlice,
        projectnumber: 1, // As per payload example provided
        order: targetOrder,
        width: layoutW !== undefined ? String(layoutW) : "10%",
        height: layoutH !== undefined ? String(layoutH) : "20",
        similervalueDitects: [
          {
            chartlist: selectedSourceCharts.map((c) => c.id),
            legentName: legendValues.map((l) => l.label),
          },
        ],
        numberOfDataset: numOfLegendDataSet,
        firstFieldDataset: startingRange,
        lastFieldDataset: endingRange,
        widgets: legendValues.map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        showWidget: showLegendState,
      };
    } else {
      // NORMAL PROGRAM CHART PAYLOAD
      payload = {
        numberOfDataset: numOfLegendDataSet,
        firstFieldDataset: startingRange,
        lastFieldDataset: endingRange,
        widgets: legendValues.map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        filter_By: filter || "string",
        title: widgetTitle,
        status: "ACTIVE",
        category: widgetCategory,
        programid: programIdFromSlice,
        projectnumber: numOfXAxisDataSet,
        xAxis: JSON.stringify([
          ["Label", ...legendValues.map((l) => l.label)],
          ...xAxisValues.map((label) => [
            label,
            ...Array(numOfLegendDataSet).fill(0),
          ]),
        ]),
        order: targetOrder,
        width: layoutW !== undefined ? Number(layoutW) : 10,
        height: layoutH !== undefined ? Number(layoutH) : 15,
        showWidget: showLegendState,
      };
    }

    if (onSaveOverride) {
      const { programid, projectnumber, ...updatePayload } = payload;
      updatePayload.width = layoutW !== undefined ? Number(layoutW) : 10;
      updatePayload.height = layoutH !== undefined ? Number(layoutH) : (isValueDetectOn ? 20 : 15);
      updatePayload.order = targetOrder;
      toast.dismiss(toastId);
      onSaveOverride(updatePayload);
      return;
    }

    try {
      if (shiftPayload.length > 0) {
        try {
          await updateBulkProgramChart({ updates: shiftPayload }).unwrap();
        } catch (layoutErr) {
          console.error("Failed to update program bulk layout order shifting", layoutErr);
        }
      }
      const finalPayload = {
        ...payload,
        width: payload.width !== undefined ? String(payload.width) : undefined,
        height: payload.height !== undefined ? String(payload.height) : undefined,
      };
      const res = await createProgramChart(finalPayload).unwrap();
      if (res?.success) {
        toast.success("Program chart created successfully", { id: toastId });
        onDelete?.();
        onClose?.();
      }
    } catch {
      toast.error("Failed to create program chart", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800/50 rounded-lg shadow-lg overflow-hidden font-sans relative">
      {/* Confirmation Modal Overlay */}
      {showConfirmModal && cutoffDetails && (
        <div className="absolute inset-0 z-100 bg-white/95 flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2 uppercase tracking-wide">
              Legend Mismatch Detected
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-500 mb-6 leading-relaxed px-4">
              Adding this chart will cause some legends to be excluded from the analysis to maintain data consistency.
            </p>

            <div className="space-y-4 text-left bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-border dark:border-slate-800/50 max-h-[250px] overflow-y-auto scrollbar-hide">
              {cutoffDetails.lostFromCurrent.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1.5 grayscale opacity-70">
                    Sacrificed from current set:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cutoffDetails.lostFromCurrent.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-[10px] text-gray-600 dark:text-slate-400 font-medium">
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
                      <span key={l} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-[10px] text-gray-600 dark:text-slate-400 font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-6 border-t border-border dark:border-slate-800/50">
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
              className="w-full py-2.5 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-500 text-xs font-bold rounded-lg border border-border dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Program Configuration
        </h2>
        <button onClick={onClose} className="text-gray-500 dark:text-slate-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        <a href="#" className="text-xs text-blue-600  ">
          {widgedName} Widget Details
        </a>

        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 mt-5">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <DebouncedInput
            type="text"
            value={widgetTitle}
            onChange={(e: any) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none"
          />
        </div>

        {/* X-Axis Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Data Configuration
          </h3>

          {!isValueDetectOn && (
            <div className="flex items-center mb-3">
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                Number of Data sets:
              </label>
              <input
                type="number"
                min={1}
                defaultValue={numOfXAxisDataSet}
                onChange={handleSetNumOfXAxisDataSet}
                className="w-12 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none"
              />
            </div>
          )}

          <div className="mb-2">
            <label className="block text-xs text-gray-700 dark:text-slate-200 mb-1.5">
              Input {numOfXAxisDataSet >= 2 && "all"} field Data:
            </label>
            <div className="space-y-2">
              {Array.from({ length: numOfXAxisDataSet }).map((_, index) => (
                <DebouncedInput
                  key={index}
                  type="text"
                  required
                  readOnly={isValueDetectOn}
                  placeholder={`Enter label for field ${index + 1}`}
                  value={xAxisValues[index] || ""}
                  onChange={(e: any) =>
                    !isValueDetectOn &&
                    handleXAxisValueChange(index, e.target.value)
                  }
                  className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-sm focus:outline-none ${isValueDetectOn
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : ""
                    }`}
                />
              ))}
              {numOfXAxisDataSet === 0 && (
                <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">
                  No data fields added yet.
                </p>
              )}
            </div>
          </div>
        </div>



        {/* Data Aggregation Section */}
        <div className="border-t border-border dark:border-slate-800/50 pt-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-xs font-semibold text-blue-600 uppercase">
                Data Aggregation
              </label>
            </div>
            <div
              onClick={handleToggleDataAggregation}
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
            <div className="space-y-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
              <div className="space-y-3">
                {/* Project Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                    Project:
                  </label>
                  <select
                    value={yAxisProjectId}
                    onChange={(e) => {
                      setYAxisProjectId(e.target.value);
                      setYAxisChartId("");
                    }}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Project</option>
                    {programProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Chart Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                    Source Chart {`(${widgetCategory})`}:
                  </label>
                  <select
                    value={yAxisChartId}
                    onChange={(e) => setYAxisChartId(e.target.value)}
                    disabled={!yAxisProjectId || isChartsLoading}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  >
                    <option value="">
                      {isChartsLoading ? "Loading charts..." : "Select Chart"}
                    </option>
                    {filteredRootCharts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddMapping}
                  disabled={!yAxisChartId}
                  className="w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 uppercase mt-2"
                >
                  Add Data Source
                </button>
              </div>

              {/* List of Added Charts */}
              {selectedSourceCharts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                    Selected Sources:
                  </p>
                  {selectedSourceCharts.map((chart, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800 shadow-sm"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-4 h-4 flex items-center justify-center bg-blue-100 text-blue-600 rounded text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-[11px] text-gray-700 dark:text-slate-200 truncate">
                          <span className="font-bold">{chart.projectName}</span> | {chart.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSourceChart(i)}
                        className="text-gray-300 hover:text-red-500"
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

        {/* Range Section */}
        {widgetCategory !== "SPARKLINE" && (
          <div className="space-y-2">
            <div
              className="flex items-center"
              title={widgetCategory === "MARIMEKKO" ? "Marimekko chart range is always fixed at 0% to 100%" : undefined}
            >
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                1st field Data:
              </label>
              <DebouncedInput
                type="number"
                min={0}
                onChange={(e: any) => setStartingRange(Math.max(0, Number(e.target.value)))}
                value={widgetCategory === "MARIMEKKO" ? 0 : startingRange}
                disabled={widgetCategory === "MARIMEKKO"}
                className={`w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none ${
                  widgetCategory === "MARIMEKKO" ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900" : ""
                }`}
              />
            </div>

            <div
              className="flex items-center"
              title={widgetCategory === "MARIMEKKO" ? "Marimekko chart range is always fixed at 0% to 100%" : undefined}
            >
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                Last field Data:
              </label>
              <DebouncedInput
                type="number"
                min={0}
                onChange={(e: any) => setEndingRange(Math.max(0, Number(e.target.value)))}
                value={widgetCategory === "MARIMEKKO" ? 100 : endingRange}
                disabled={widgetCategory === "MARIMEKKO"}
                className={`w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none ${
                  widgetCategory === "MARIMEKKO" ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900" : ""
                }`}
              />
            </div>
          </div>
        )}

        {/* Display Settings */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Display Settings
          </h3>
          {!["TABLE", "MATRIXTABLE", "DECOMPOSITION_TREE", "GEOGRAPHY_GRAPH", "PROJECT_INFORMATION", "MEDIA_WIDGET"].includes(widgetCategory) && (
            <div className="flex items-center justify-between py-2 mb-3 border-b border-gray-100 dark:border-slate-800">
              <label className="text-xs font-medium text-gray-700 dark:text-slate-200">
                Show Legend
              </label>
              <div className="relative inline-block w-10 h-5">
                <div
                  onClick={handleToggleLegend}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${
                    showLegendState ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                      showLegendState ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
          {!isValueDetectOn && (
            <div className="flex items-center mb-3">
              <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                Number of Legend sets:
              </label>
              <input
                type="number"
                min={1}
                value={numOfLegendDataSet}
                onChange={(e) => {
                  if (isLegendLocked) return;
                  const val = parseInt(e.target.value);
                  setNumOfLegendDataSet(val);
                  setLegendValues((prev) => {
                    const next = [...prev];
                    while (next.length < val)
                      next.push({ label: "", field: "", color: "#000000" });
                    return next.slice(0, val);
                  });
                }}
                readOnly={isLegendLocked}
                disabled={isLegendLocked}
                className={`w-12 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none bg-transparent text-gray-900 dark:text-slate-100 ${isLegendLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
          )}

          {legendValues.map((l, index) => (
            <div key={index} className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1">
                  {!isValueDetectOn && !isLegendLocked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLegend(index)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <label className="text-xs text-gray-700 dark:text-slate-200">
                    {index + 1}
                    {index === 0
                      ? "st"
                      : index === 1
                        ? "nd"
                        : index === 2
                          ? "rd"
                          : "th"}{" "}
                    Legend:
                  </label>
                </div>
                <DebouncedInput
                  type="text"
                  readOnly={isValueDetectOn}
                  placeholder="Enter name here"
                  value={l.label || ""}
                  onChange={(e: any) =>
                    !isValueDetectOn &&
                    handleLegendLabelChange(index, e.target.value)
                  }
                  className={`w-[50%] px-2 py-1 text-xs border border-gray-300 rounded-sm ${isValueDetectOn
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : ""
                    }`}
                />
              </div>

              <div className="flex items-center">
                <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                  {index + 1}
                  {index === 0
                    ? "st"
                    : index === 1
                      ? "nd"
                      : index === 2
                        ? "rd"
                        : "th"}{" "}
                  Legend Color:
                </label>
                <div className="flex items-center gap-2">
                  <DebouncedInput
                    type="text"
                    readOnly={isValueDetectOn}
                    value={l.color || "#000000"}
                    onChange={(e: any) =>
                      !isValueDetectOn &&
                      handleLegendColorChange(index, e.target.value)
                    }
                    className={`text-xs px-2 py-1 border border-gray-200 rounded-sm w-22 ${isValueDetectOn
                      ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                      : ""
                      }`}
                  />
                  <input
                    type="color"
                    disabled={isValueDetectOn}
                    value={l.color || "#000000"}
                    onChange={(e) =>
                      !isValueDetectOn &&
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="w-14 h-6 rounded-md border border-gray-200 dark:border-slate-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
          {legendValues.length === 0 && isValueDetectOn && (
            <p className="text-[10px] text-gray-400 dark:text-slate-500 italic text-center py-2">
              No legends synchronized. Add source charts to populate.
            </p>
          )}
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
          onClick={handleSaveChanges}
          disabled={isLoading}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProgramBuilderConfigurationOne;
