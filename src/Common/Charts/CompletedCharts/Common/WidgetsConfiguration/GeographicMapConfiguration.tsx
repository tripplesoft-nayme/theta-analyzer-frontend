import React from "react";
import { X, Plus, Trash2, MapPin } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useCreateChartMutation,
  useCreateProgramChartMutation,
  useLazyGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { toast } from "sonner";

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  value: number;
  color?: string;
};

const GeographicMapConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  points,
  setPoints,
  overlayType,
  setOverlayType,
  startingZoom,
  setStartingZoom,
  pickingId,
  setPickingId,
  onClose,
  onDelete,
  isProgramBuilder = false,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
}: {
  widgetTitle: string;
  setWidgetTitle: React.Dispatch<React.SetStateAction<string>>;
  points: MapPoint[];
  setPoints: React.Dispatch<React.SetStateAction<MapPoint[]>>;
  overlayType: "choropleth" | "bubble";
  setOverlayType: React.Dispatch<React.SetStateAction<"choropleth" | "bubble">>;
  startingZoom: number;
  setStartingZoom: React.Dispatch<React.SetStateAction<number>>;
  pickingId: string | null;
  setPickingId: React.Dispatch<React.SetStateAction<string | null>>;
  onClose?: () => void;
  onDelete?: () => void;
  isProgramBuilder?: boolean;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
}) => {
  const { projectId: reduxProjectId, programId: reduxProgramId } =
    useAppSelector((state) => state.chartSlice);
  const projectId = isProgramBuilder ? undefined : reduxProjectId;
  const programId = isProgramBuilder ? reduxProgramId : undefined;
  const [createChart, { isLoading: isProjectLoading }] =
    useCreateChartMutation();
  const [createProgramChart, { isLoading: isProgramLoading }] =
    useCreateProgramChartMutation();
  const [getRootChartByProject] = useLazyGetRootChartQuery();
  const [layoutUpdate] = useLayoutUpdateMutation();
  const isLoading = isProjectLoading || isProgramLoading;

  const handleAddPoint = () => {
    const newPoint: MapPoint = {
      id: crypto.randomUUID(),
      name: "New Place",
      lat: 0,
      lng: 0,
      value: 50,
      color: "#3B82F6",
    };
    setPoints([...points, newPoint]);
  };

  const handleUpdatePoint = (id: string, updates: Partial<MapPoint>) => {
    setPoints(points.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (isProgramBuilder && !programId) {
      toast.error("Program ID is missing");
      return;
    }
    if (!isProgramBuilder && !projectId) {
      toast.error("Project ID is missing");
      return;
    }

    const toastId = toast.loading("Saving map configuration...");

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

    const payload: any = {
      numberOfDataset: points.length,
      firstFieldDataset: startingZoom,
      lastFieldDataset: 0,
      widgets: points.map((p) => ({
        legendName: p.name,
        color: p.color,
      })),
      title: widgetTitle,
      status: "ACTIVE",
      category: "GEOGRAPHY_GRAPH",
      // Storing complexity in xAxis for maps.
      // For Program Builder, we also include overlayType here and exclude yAxis.
      xAxis: JSON.stringify({
        points,
        ...(isProgramBuilder && { overlayType }),
      }),
    };

    if (isProgramBuilder) {
      payload.programid = programId;
      payload.order = 1;
      payload.width = "12";
      payload.height = "400";
      payload.projectnumber = 1;
    } else {
      payload.grouptitle = "Geography";
      payload.yAxis = JSON.stringify({ overlayType });
      payload.zAxis = JSON.stringify({});
      payload.projectId = projectId;
      payload.width = layoutW !== undefined ? Number(layoutW) : 10;
      payload.height = layoutH !== undefined ? Number(layoutH) : 15;
      payload.order = targetOrder;
    }

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
      const res = await mutation(payload).unwrap();
      if (res?.success) {
        toast.success(
          `${isProgramBuilder ? "Program" : "Project"} Map saved`,
          { id: toastId },
        );
        onClose?.();
        onDelete?.();
      }
    } catch {
      toast.error("Failed to save map", { id: toastId });
    }
  };

  return (
    <div className="max-w-78 min-w-78 h-auto self-start bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600 dark:text-blue-400" /> Map Settings
        </h2>
        <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 uppercase tracking-wide">
            Widget Title
          </label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded focus:border-blue-500 focus:outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Global Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1 uppercase">
              Zoom Level
            </label>
            <input
              type="number"
              min={1}
              max={18}
              value={startingZoom}
              onChange={(e) => setStartingZoom(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1 uppercase">
              Overlay
            </label>
            <select
              value={overlayType}
              onChange={(e) =>
                setOverlayType(e.target.value as "bubble" | "choropleth")
              }
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
            >
              <option value="bubble">Bubble</option>
              <option value="choropleth">Choropleth</option>
            </select>
          </div>
        </div>

        {/* Locations List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
              Locations
            </h3>
            <button
              onClick={handleAddPoint}
              className="flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/40 transition-colors"
            >
              <Plus size={12} /> Add Location
            </button>
          </div>

          <div className="space-y-3">
            {points.map((point) => (
              <div
                key={point.id}
                className="p-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50/50 dark:bg-slate-800/50 space-y-2.5"
              >
                {/* Header: Name and Delete button */}
                <div className="flex items-center justify-between gap-2 border-b border-gray-200/50 dark:border-slate-700/50 pb-1.5">
                  <input
                    type="text"
                    value={point.name}
                    onChange={(e) =>
                      handleUpdatePoint(point.id, { name: e.target.value })
                    }
                    className="flex-1 text-xs font-semibold bg-transparent hover:border-gray-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-slate-100"
                    placeholder="Location Name"
                  />
                  <button
                    onClick={() => handleRemovePoint(point.id)}
                    className="text-red-400 dark:text-rose-400 hover:text-red-600 dark:hover:text-rose-300 p-1 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded shrink-0"
                    title="Remove Location"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Coordinates: Lat and Lng inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 dark:text-slate-500 block">Lat</label>
                    <input
                      type="number"
                      value={point.lat}
                      onChange={(e) =>
                        handleUpdatePoint(point.id, {
                          lat: Number(e.target.value),
                        })
                      }
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 dark:text-slate-500 block">Lng</label>
                    <input
                      type="number"
                      value={point.lng}
                      onChange={(e) =>
                        handleUpdatePoint(point.id, {
                          lng: Number(e.target.value),
                        })
                      }
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Action: Pick Spot button */}
                <div>
                  <button
                    onClick={() =>
                      setPickingId(pickingId === point.id ? null : point.id)
                    }
                    className={`w-full flex items-center justify-center gap-1.5 py-1 rounded border text-[10px] font-medium transition-all ${pickingId === point.id
                        ? "bg-orange-500 border-orange-600 text-white shadow-inner animate-pulse"
                        : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      }`}
                    title="Capture coordinates by clicking the map"
                  >
                    <MapPin size={12} />{" "}
                    {pickingId === point.id ? "Picking Spot..." : "Pick Spot on Map"}
                  </button>
                </div>

                {/* Value and Color */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-border dark:border-slate-800/40">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 dark:text-slate-500 block mb-0.5">Value</label>
                    <input
                      type="number"
                      value={point.value}
                      onChange={(e) =>
                        handleUpdatePoint(point.id, {
                          value: Number(e.target.value),
                        })
                      }
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <label className="text-[10px] text-gray-400 dark:text-slate-500 block mb-0.5">
                      Color
                    </label>
                    <input
                      type="color"
                      value={point.color}
                      onChange={(e) =>
                        handleUpdatePoint(point.id, { color: e.target.value })
                      }
                      className="w-6 h-6 border border-gray-200 dark:border-slate-800 rounded cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

export default GeographicMapConfiguration;
