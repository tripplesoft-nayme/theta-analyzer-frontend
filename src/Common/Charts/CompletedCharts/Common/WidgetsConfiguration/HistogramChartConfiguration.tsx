import React, { useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  useCreateChartMutation,
  useCreateProgramChartMutation,
  useLazyGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useAppSelector } from "@/hooks/useRedux";
import { useGetUser } from "@/hooks/useGetUser";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import { toast } from "sonner";
import { DebouncedInput, AssignedByProfile } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/WidgetCommon";

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

const DEFAULT_COLORS = [
  "#8D79F6",
  "#13A490",
  "#35B6EE",
  "#F26419",
  "#E91E8C",
  "#FFB800",
  "#7C3AED",
  "#10B981",
];

const HistogramChartConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  binCount,
  setBinCount,
  startingRange,
  setStartingRange,
  endingRange,
  setEndingRange,
  numOfLegendDataSet,
  setNumOfLegendDataSet,
  legendValues,
  setLegendValues,
  onClose,
  onDelete,
  isProgramBuilder: isProgramBuilderProp = false,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
}: {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  binCount: number;
  setBinCount: React.Dispatch<React.SetStateAction<number>>;
  startingRange: number;
  setStartingRange: React.Dispatch<React.SetStateAction<number>>;
  endingRange: number;
  setEndingRange: React.Dispatch<React.SetStateAction<number>>;
  numOfLegendDataSet: number;
  setNumOfLegendDataSet: React.Dispatch<React.SetStateAction<number>>;
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
}) => {
  const [localNumOfLegend, setLocalNumOfLegend] = React.useState(numOfLegendDataSet);

  const [showLegendState, setShowLegendState] = React.useState(
    showLegend !== undefined ? showLegend : true
  );

  useEffect(() => {
    setLocalNumOfLegend(numOfLegendDataSet);
  }, [numOfLegendDataSet]);

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

  const { pathname } = useLocation();
  const isProgramBuilderFromPath = pathname.split("/")[2] === "program-builder";
  const isProgramBuilder = isProgramBuilderProp || isProgramBuilderFromPath;

  const { name, role, profileImage, loading } = useGetUser();
  const assignedBy = {
    name: !loading && name,
    role: !loading && role,
    image: !loading && profileImage,
  };

  /* -- Project builder -- */
  const projectIdFromSlice = useAppSelector(
    (state) => state?.chartSlice?.projectId,
  );
  const [createChart, { isLoading: isCreatingProject }] =
    useCreateChartMutation();

  /* -- Program builder -- */
  const programIdFromSlice = useAppSelector(
    (state) => state?.chartSlice?.programId,
  );
  const [createProgramChart, { isLoading: isCreatingProgram }] =
    useCreateProgramChartMutation();
  const [getRootChartByProject] = useLazyGetRootChartQuery();
  const [layoutUpdate] = useLayoutUpdateMutation();

  // Removed filter state

  /* -- Legend helpers -- */
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
      updated[index] = { ...updated[index], color };
      return updated;
    });
  };

  const handleRemoveLegend = (index: number) => {
    if (numOfLegendDataSet <= 1) {
      toast.error("At least 1 legend required");
      return;
    }
    setLegendValues((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setNumOfLegendDataSet((p) => p - 1);
  };

  /* -- Legend helpers -- */

  /* -- Save -- */
  const isLoading = isCreatingProject || isCreatingProgram;

  const handleSaveChanges = async () => {
    if (!legendValues[0]?.label) {
      toast.error("Please fill in the label for legend 1");
      return;
    }

    const binWidth = Math.max(1, Math.round(binCount || 10));
    const calculatedNumberOfDataset = Math.max(
      1,
      Math.ceil((endingRange - startingRange) / binWidth),
    );
    const generatedXAxisLabels: string[] = [];
    for (
      let cur = startingRange;
      cur < endingRange;
      cur += binWidth
    ) {
      generatedXAxisLabels.push(
        `${cur}-${Math.min(cur + binWidth, endingRange)}`,
      );
    }

    const toastId = toast.loading("Creating chart...");

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

    if (isProgramBuilder) {
      if (!programIdFromSlice) {
        toast.dismiss(toastId);
        toast.error("Something went wrong with program data");
        return;
      }

      const payload = {
        numberOfDataset: calculatedNumberOfDataset,
        firstFieldDataset: startingRange,
        lastFieldDataset: endingRange,
        widgets: legendValues.map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        // filter_By: showFilter ? filter : "string",
        title: widgetTitle,
        status: "ACTIVE",
        category: "HISTOGRAM",
        programid: programIdFromSlice,
        projectnumber: calculatedNumberOfDataset,
        xAxis: JSON.stringify([
          ["Label", ...legendValues.map((l) => l.label)],
          ...generatedXAxisLabels.map((label) => [
            label,
            ...Array(numOfLegendDataSet).fill(0),
          ]),
        ]),
        order: targetOrder,
        width: layoutW !== undefined ? Number(layoutW) : 10,
        height: layoutH !== undefined ? Number(layoutH) : 15,
        showWidget: showLegendState,
      };

      if (onSaveOverride) {
        toast.dismiss(toastId);
        onSaveOverride(payload);
        return;
      }
      try {
        const res = await createProgramChart(payload).unwrap();
        if (res?.success) {
          toast.success("Chart created successfully", { id: toastId });
          onDelete?.();
          onClose?.();
        }
      } catch {
        toast.error("Chart creation failed", { id: toastId });
      }
    } else {
      if (!projectIdFromSlice) {
        toast.dismiss(toastId);
        toast.error("Please select a project");
        return;
      }
      const payload = {
        numberOfDataset: calculatedNumberOfDataset,
        firstFieldDataset: startingRange,
        lastFieldDataset: endingRange,
        widgets: legendValues.map((l) => ({
          legendName: l.label,
          color: l.color,
        })),
        // showLegend,
        title: widgetTitle,
        status: "ACTIVE",
        category: "HISTOGRAM",
        xAxis: JSON.stringify([
          ["Label", ...legendValues.map((l) => l.label)],
          ...generatedXAxisLabels.map((label) => [
            label,
            ...Array(numOfLegendDataSet).fill(0),
          ]),
        ]),
        yAxis: JSON.stringify([]),
        zAxis: JSON.stringify([]),
        projectId: projectIdFromSlice,
        rootchart: true,
        roottitle: widgetTitle,
        grouptitle: generateId(),
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

      try {
        if (shiftPayload.length > 0) {
          try {
            await layoutUpdate(shiftPayload).unwrap();
          } catch (layoutErr) {
            console.error("Failed to update bulk layout order shifting", layoutErr);
          }
        }
        const res = await createChart(payload).unwrap();
        if (res?.success) {
          toast.success("Chart created successfully", { id: toastId });
          onDelete?.();
          onClose?.();
        }
      } catch {
        toast.error("Chart creation failed", { id: toastId });
      }
    }
  };

  const ordinalSuffix = (i: number) =>
    i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th";

  return (
    <div className="max-w-78 min-w-78 h-auto self-start flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          {isProgramBuilder ? "Program Configuration" : "Widget Configuration"}
        </h2>
        <button onClick={onClose} className="text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
        <a href="#" className="text-xs text-blue-600 dark:text-blue-400  ">
          Histogram Chart Widget Details
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
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Histogram Data Configuration */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
            Histogram Data Configuration
          </h3>

          <div className="flex items-center mb-2">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">Bin Range:</label>
            <input
              type="number"
              min={1}
              value={binCount}
              onChange={(e) => setBinCount(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center mb-2">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
              First Field Dataset:
            </label>
            <input
              type="number"
              value={startingRange}
              onChange={(e) => setStartingRange(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center mb-2">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
              Last Field Dataset:
            </label>
            <input
              type="number"
              value={endingRange}
              onChange={(e) => setEndingRange(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Removed Display Settings / Filter Section */}

        <div className="border-t border-border dark:border-slate-800 pt-3">
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Legend Configuration
          </h3>
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

          {/* Number of legends */}
          <div className="flex items-center mb-3">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
              Number of Legend sets:
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={localNumOfLegend}
              onChange={(e) => {
                const rawValue = e.target.value;
                setLocalNumOfLegend(rawValue as any);
                const val = parseInt(rawValue);
                if (isNaN(val) || val < 1 || val > 15) return;

                setNumOfLegendDataSet(val);
                setLegendValues((prev) => {
                  const next = [...prev];
                  while (next.length < val)
                    next.push({
                      label: "",
                      field: "",
                      color:
                        DEFAULT_COLORS[next.length % DEFAULT_COLORS.length],
                    });
                  return next.slice(0, val);
                });
              }}
              className="w-12 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>

          {legendValues.map((l, index) => (
            <div key={index} className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveLegend(index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  <label className="text-xs text-gray-700 dark:text-slate-200">
                    {index + 1}
                    {ordinalSuffix(index)} Legend:
                  </label>
                </div>
                <DebouncedInput
                  type="text"
                  placeholder="Enter name here"
                  value={l.label || ""}
                  onChange={(e: any) =>
                    handleLegendLabelChange(index, e.target.value)
                  }
                  className="w-[50%] px-2 py-1 text-xs border border-gray-300 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center">
                <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">
                  {index + 1}
                  {ordinalSuffix(index)} Legend Color:
                </label>
                <div className="flex items-center gap-2">
                  <DebouncedInput
                    type="text"
                    value={l.color || "#000000"}
                    onChange={(e: any) =>
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="text-xs px-2 py-1 border border-gray-200 dark:border-slate-800 rounded-sm w-22 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                  <input
                    type="color"
                    value={l.color || "#000000"}
                    onChange={(e) =>
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="w-14 h-6 rounded-md border border-gray-200 dark:border-slate-800 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
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

export default HistogramChartConfiguration;
