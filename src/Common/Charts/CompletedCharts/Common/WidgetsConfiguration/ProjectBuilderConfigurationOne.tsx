import { useEffect, Dispatch, SetStateAction, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useCreateChartMutation,
  useLazyGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { toast } from "sonner";
import { useGetUser } from "@/hooks/useGetUser";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import { DebouncedInput, LegendValue, AssignedByProfile } from "./WidgetCommon";

const ProjectBuilderConfigurationOne = ({
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
  startingRange = 0,
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
  handleSetNumOfXAxisDataSet: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const projectIdFromSlice = useAppSelector(
    (state) => state?.chartSlice?.projectId,
  );

  const [createChart, { isLoading }] = useCreateChartMutation();
  const [getRootChartByProject] = useLazyGetRootChartQuery();
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
  // const [filter, setFilter] = useState<string>("");
  // const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (projectIdFromSlice) {
      getRootChartByProject(projectIdFromSlice);
    }
  }, [projectIdFromSlice, getRootChartByProject]);

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

  const assignedBy = {
    name: !loading && name,
    role: !loading && role,
    image: !loading && profileImage,
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
    if (!projectIdFromSlice) {
      toast.error("Please select a project");
      return;
    }

    if (numOfXAxisDataSet < 1) {
      toast.error(`Please add at least 1 X-Axis value`);
      return;
    }

    const toastId = toast.loading("Creating chart...");
    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;

    let shiftPayload: any[] = [];
    try {
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
    } catch (err) {
      console.error("Failed to calculate chart shift payload", err);
    }

    const payload = {
      numberOfDataset: numOfLegendDataSet,
      firstFieldDataset: startingRange,
      lastFieldDataset: endingRange,
      widgets: legendValues.map((l) => ({
        legendName: l.label,
        color: l.color,
      })),
      // filter_By: filter || "string",
      title: widgetTitle,
      status: "ACTIVE",
      category: widgetCategory,
      xAxis: JSON.stringify([
        ["Label", ...legendValues.map((l) => l.label)],
        ...xAxisValues.map((label) => [
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
  };
  return (
    <div className="max-w-78 min-w-78 h-auto self-start flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800/50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Widget Configuration
        </h2>
        <button onClick={onClose} className="text-gray-500 dark:text-slate-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        <p className="text-xs text-blue-600">
          {widgedName === "Samplebar Chart" ? "Bar Chart" : widgedName} Widget Details
        </p>

        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 mt-5">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <DebouncedInput
            type="text"
            value={widgetTitle}
            onChange={(e: any) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none bg-transparent text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* X-Axis Section */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Data Mapping for X-Axis
          </h3>

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
                  placeholder={`Enter ${index + 1}${index === 0
                    ? "st"
                    : index === 1
                      ? "nd"
                      : index === 2
                        ? "rd"
                        : "th"
                    } field name here...`}
                  value={xAxisValues[index] || ""}
                  onChange={(e: any) =>
                    handleXAxisValueChange(index, e.target.value)
                  }
                  className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none bg-transparent text-gray-900 dark:text-slate-100`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {/* <div className="flex items-center justify-between py-2">
          <label className="text-xs font-medium text-gray-700 dark:text-slate-200">
            Show Filter
          </label>
          <div className="relative inline-block w-10 h-5">
            <div
              onClick={() => setShowFilter(!showFilter)}
              className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${
                showFilter ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                  showFilter ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        {showFilter && (
          <div className="flex items-center">
            <label className="text-xs text-gray-700 dark:text-slate-200 flex-1">Filter By:</label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pr-12 pl-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-sm text-sm text-gray-500 dark:text-slate-500 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="onTime">On time</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )} */}

        {/* Range Section */}
        {widgetCategory !== "SPARKLINE" && (
          <div className="space-y-2">
            <div
              className="flex items-center"
              title={widgetCategory === "MARIMEKKO" ? "" : undefined}
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
                className={`w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none ${widgetCategory === "MARIMEKKO" ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900" : ""
                  }`}
              />
            </div>

            <div
              className="flex items-center"
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
                className={`w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none ${widgetCategory === "MARIMEKKO" ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900" : ""
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
          )}
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

          {Array.from({ length: numOfLegendDataSet }).map((_, index) => (
            <div key={index} className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1">
                  {!isLegendLocked && (
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
                  placeholder="Enter name here"
                  value={legendValues[index]?.label || ""}
                  onChange={(e: any) =>
                    handleLegendLabelChange(index, e.target.value)
                  }
                  className="w-[50%] px-2 py-1 text-xs border border-gray-300 dark:border-slate-800 rounded-sm bg-transparent text-gray-900 dark:text-slate-100"
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
                    value={legendValues[index]?.color || "#000000"}
                    onChange={(e: any) =>
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="text-xs px-2 py-1 border border-gray-200 dark:border-slate-800 rounded-sm w-22 bg-transparent text-gray-900 dark:text-slate-100"
                  />
                  <input
                    type="color"
                    value={legendValues[index]?.color || "#000000"}
                    onChange={(e) =>
                      handleLegendColorChange(index, e.target.value)
                    }
                    className="w-14 h-6 rounded-md border border-gray-200 dark:border-slate-800 cursor-pointer"
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
          disabled={isLoading}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          onClick={handleSaveChanges}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProjectBuilderConfigurationOne;
