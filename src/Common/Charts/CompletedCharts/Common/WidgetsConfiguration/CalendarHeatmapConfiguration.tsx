/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateChartMutation, useCreateProgramChartMutation, useLazyGetRootChartQuery, useLayoutUpdateMutation } from "@/store/Api/ChartApi/ChartApi";
import { toast } from "sonner";
import { useGetUser } from "@/hooks/useGetUser";
import type { LegendValue } from "../chartTypes";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { AssignedByProfile } from "./WidgetCommon";

type CalendarHeatmapConfigurationProps = {
  widgedName: string;
  widgetTitle: string;
  setWidgetTitle: (title: string) => void;
  legendValues: LegendValue[];
  setLegendValues: (values: LegendValue[]) => void;
  yAxis?: string;
  setYAxis?: (yAxis: string) => void;
  onClose: () => void;
  onDelete?: () => void;
  isProgramBuilder?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
  showLegend?: boolean;
  setShowLegend?: (val: boolean) => void;
};

type HeatmapFormValues = {
  widgetTitle: string;
  selectedYear: string;
  legendName: string;
  legendColor: string;
};

const CalendarHeatmapConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  legendValues,
  setLegendValues,
  onClose,
  onDelete,
  yAxis,
  setYAxis,
  isProgramBuilder = false,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
  showLegend,
  setShowLegend,
}: CalendarHeatmapConfigurationProps) => {
  const { projectId: reduxProjectId, programId: reduxProgramId } = useAppSelector(
    (state) => state.chartSlice,
  );
  const projectId = isProgramBuilder ? undefined : reduxProjectId;
  const programId = isProgramBuilder ? reduxProgramId : undefined;

  const [createChart, { isLoading: isProjectLoading }] = useCreateChartMutation();
  const [createProgramChart, { isLoading: isProgramLoading }] =
    useCreateProgramChartMutation();
  const [getRootChartByProject] = useLazyGetRootChartQuery();
  const [layoutUpdate] = useLayoutUpdateMutation();
  const isLoading = isProjectLoading || isProgramLoading;

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
  const dispatch = useAppDispatch();

  // Helper: safely parse yAxis regardless of whether it arrives as a string or object
  const parseYAxis = (raw: any): { year?: string } => {
    if (!raw) return {};
    if (typeof raw === 'object') return raw as { year?: string };
    try { return JSON.parse(raw); } catch { return {}; }
  };

  // Year Selection initial state
  const initialYear = (() => {
    const parsed = parseYAxis(yAxis);
    return parsed.year || new Date().getFullYear().toString();
  })();

  const years = Array.from({ length: 2099 - 1971 + 1 }, (_, i) =>
    (1971 + i).toString(),
  );

  const { register, handleSubmit, watch, reset } = useForm<HeatmapFormValues>({
    defaultValues: {
      widgetTitle: widgetTitle || "Activity Calendar",
      selectedYear: initialYear,
      legendName: legendValues[0]?.label || "Activity",
      legendColor: legendValues[0]?.color || "#216e39",
    },
  });

  // Re-sync form when the panel opens for an existing widget
  // (react-hook-form defaultValues are only applied on initial mount)
  useEffect(() => {
    const parsed = parseYAxis(yAxis);
    const savedYear = parsed.year || new Date().getFullYear().toString();
    reset((prev) => ({
      ...prev,
      widgetTitle: widgetTitle || prev.widgetTitle,
      selectedYear: savedYear,
      legendName: legendValues[0]?.label || prev.legendName,
      legendColor: legendValues[0]?.color || prev.legendColor,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yAxis]);

  const formValues = watch();

  // Debounced parent sync for live preview
  useEffect(() => {
    const handler = setTimeout(() => {
      setWidgetTitle(formValues.widgetTitle);

      const prevYear = parseYAxis(yAxis).year;

      if (formValues.selectedYear && formValues.selectedYear !== prevYear) {
        setYAxis?.(JSON.stringify({ year: formValues.selectedYear }));
      }

      setLegendValues([
        {
          label: formValues.legendName,
          field: formValues.legendName.toLowerCase().replace(/\s+/g, ""),
          color: formValues.legendColor,
        },
      ]);
    }, 400);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formValues.widgetTitle,
    formValues.selectedYear,
    formValues.legendName,
    formValues.legendColor,
  ]);

  const handleSaveChanges = async (data: HeatmapFormValues) => {
    if (isProgramBuilder && !programId) {
      toast.error("Program ID is missing");
      return;
    }
    if (!isProgramBuilder && !projectId) {
      toast.error("Project ID is missing");
      return;
    }

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

    const year = Number(data.selectedYear) || new Date().getFullYear();
    const legendLabel = data.legendName || "Legend";

    const payload: any = {
      numberOfDataset: 1,
      firstFieldDataset: 0,
      lastFieldDataset: 100,
      widgets: [
        {
          legendName: data.legendName || "Activity",
          color: data.legendColor,
        },
      ],
      title: data.widgetTitle,
      status: "ACTIVE",
      category: "CALENDAR_HEATMAP",
      xAxis: (() => {
        const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const rows: any[][] = [["Label", legendLabel]];
        const end = new Date(year, 11, 31);
        for (
          let d = new Date(year, 0, 1);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dayName = DAYS_SHORT[d.getDay()];
          rows.push([`${dd}-${mm}-${year},${dayName}`, 0]);
        }
        // In Program Builder, we include the year metadata in the xAxis JSON wrapper
        // since yAxis is often excluded/prohibited.
        if (isProgramBuilder) {
          return JSON.stringify({
            data: rows,
            year: data.selectedYear,
          });
        }
        return JSON.stringify(rows);
      })(),
    };

    if (isProgramBuilder) {
      payload.programid = programId;
      payload.order = 1;
      payload.width = "100%";
      payload.height = "400px";
      payload.projectnumber = 1;
      payload.order = targetOrder;
      payload.width = layoutW !== undefined ? Number(layoutW) : 10;
      payload.height = layoutH !== undefined ? Number(layoutH) : 15;
    } else {
      payload.yAxis = JSON.stringify({ year: data.selectedYear });
      payload.zAxis = JSON.stringify({});
      payload.projectId = projectId;
      payload.rootchart = true;
      payload.roottitle = data.widgetTitle;
      payload.grouptitle = data.widgetTitle;
      payload.order = targetOrder;
      payload.width = layoutW !== undefined ? Number(layoutW) : 10;
      payload.height = layoutH !== undefined ? Number(layoutH) : 15;
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
      const mutation = isProgramBuilder ? createProgramChart : createChart;
      await mutation(payload).unwrap();
      toast.success(
        `${isProgramBuilder ? "Program" : "Project"} Heatmap saved`,
        { id: toastId },
      );
      dispatch(setWidgetConfig({ id: "calendar-heatmap", config: null }));
      onDelete?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save configuration", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start max-h-[calc(100vh-80px)] bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Configuration</h2>
        <button
          onClick={onClose}
          type="button"
          className="text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content Form */}
      <form
        id="calendar-heatmap-form"
        onSubmit={handleSubmit(handleSaveChanges)}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar flex flex-col"
      >
        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter widget title"
            className="w-full px-2.5 py-2 text-xs border border-gray-300 dark:border-slate-800 rounded bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            {...register("widgetTitle", { required: true })}
          />
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
            Select Year <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-2.5 py-2 text-xs border border-gray-300 dark:border-slate-800 rounded bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            {...register("selectedYear")}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Legend Settings Header */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/50 pb-1">
            Display Settings
          </h3>
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

          <div className="space-y-3 mb-4 last:mb-0">
            {/* Legend Name Input */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase truncate w-24">
                Legend Name:
              </label>
              <input
                type="text"
                placeholder="Enter name"
                className="flex-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                {...register("legendName")}
              />
            </div>

            {/* Color Selection */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase truncate w-24">
                Legend Color:
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent"
                  {...register("legendColor")}
                />
                <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 uppercase">
                  {formValues.legendColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned By Section - Matches Screenshot exactly */}
        <AssignedByProfile assignedBy={{ name, role, image: profileImage }} />
      </form>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-800 shrink-0 mt-auto bg-white dark:bg-slate-900">
        <button
          onClick={onClose}
          type="button"
          className="px-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="calendar-heatmap-form"
          disabled={isLoading}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default CalendarHeatmapConfiguration;
