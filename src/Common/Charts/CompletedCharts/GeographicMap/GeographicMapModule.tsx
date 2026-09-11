import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useMemo, useRef, useEffect, Suspense } from "react";
const GeographicMapChart = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/GeographicMap/GeographicMapChart"));
const GeographicMapConfiguration = lazyWithRetry(() => import("../Common/WidgetsConfiguration/GeographicMapConfiguration"));
import GeographicMapChartSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/GeographicMap/GeographicMapChartSkeleton";
import GeographicMapConfigurationSkeleton from "@/Common/Skeleton/Common/Charts/CompletedCharts/GeographicMap/GeographicMapConfigurationSkeleton";
import { MapPoint } from "../Common/WidgetsConfiguration/GeographicMapConfiguration";
import { useWidgetConfig } from "@/hooks/useWidgetConfig";

type GeographicMapModuleProps = {
  onDelete?: () => void;
  chartName?: string;
  isPreview?: boolean;
  isProgramBuilder?: boolean;
  height?: number;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
};

const GeographicMapModule = ({
  onDelete,
  chartName,
  isPreview = false,
  isProgramBuilder = false,
  height,
  layoutW,
  layoutH,
  orderIndex,
}: GeographicMapModuleProps) => {
  const [widgetTitle, setWidgetTitle] = useState("Global Footprint");
  const widgetIdRef = useRef(chartName ?? "widget-fallback");
  const widgetId = widgetIdRef.current;
  const { showWidget, handleToggleWidget, handleCloseWidget } = useWidgetConfig(widgetId, isPreview ?? false);

  // Track the actual rendered container height so Leaflet gets live pixel values.
  // Only use ResizeObserver in saved/grid mode (no height prop).
  // In creation mode the parent explicitly sizes us via the height prop.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(height ?? 600);

  useEffect(() => {
    if (height) return; // Static height provided — no observer needed
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) setContainerHeight(h);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [height]);

  const [points, setPoints] = useState<MapPoint[]>([
    { id: "1", name: "New York Hub", lat: 40.7128, lng: -74.006, value: 85, color: "#4F46E5" },
    { id: "2", name: "London Office", lat: 51.5074, lng: -0.1278, value: 70, color: "#10B981" },
    { id: "3", name: "Tokyo HQ", lat: 35.6762, lng: 139.6503, value: 98, color: "#F59E0B" },
    { id: "4", name: "Sydney Branch", lat: -33.8688, lng: 151.2093, value: 50, color: "#EF4444" },
    { id: "5", name: "Cape Town", lat: -33.9249, lng: 18.4241, value: 65, color: "#8B5CF6" },
  ]);

  const [overlayType, setOverlayType] = useState<"choropleth" | "bubble">("bubble");
  const [startingZoom, setStartingZoom] = useState<number>(2);
  const [pickingId, setPickingId] = useState<string | null>(null);

  const defaultCenter = useMemo<[number, number]>(() => [20, 0], []);


  const handleMapClick = async (lat: number, lng: number) => {
    if (!isPreview && pickingId) {
      const targetId = pickingId;
      setPoints((prev) =>
        prev.map((p) => (p.id === targetId ? { ...p, lat, lng } : p)),
      );
      setPickingId(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};
          const spotName =
            address.tourism ||
            address.amenity ||
            address.historic ||
            address.shop ||
            address.office ||
            address.building ||
            address.aeroway ||
            address.railway ||
            address.highway ||
            address.road ||
            address.pedestrian ||
            address.neighbourhood ||
            address.suburb ||
            "";

          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            address.state ||
            address.country ||
            "";

          let resolvedName = "";
          if (spotName && cityName) {
            resolvedName = `${spotName}, ${cityName}`;
          } else if (cityName) {
            resolvedName = cityName;
          } else if (spotName) {
            resolvedName = spotName;
          } else {
            resolvedName = `Spot (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          }

          setPoints((prev) =>
            prev.map((p) => (p.id === targetId ? { ...p, name: resolvedName } : p)),
          );
        }
      } catch (error) {
        console.error("Failed to reverse geocode:", error);
      }
    }
  };

  const handlePointMove = (id: string, lat: number, lng: number) => {
    if (!isPreview) {
      setPoints((prev) =>
        prev.map((p) => (p.id === id ? { ...p, lat, lng } : p)),
      );
    }
  };

  // In creation mode: use the prop directly.
  // In grid mode: use the live observed container height.
  const effectiveHeight = height ?? containerHeight;
  // const effectiveHeight = height ?? (showWidget ? Math.max(600, containerHeight) : containerHeight);
  return (
    <div className="flex items-stretch gap-4 h-full w-full">
      <div
        ref={containerRef}
        className="flex-1 min-w-0 h-full min-h-0 sticky top-5"
        style={height ? { height: `${height}px` } : { height: "100%" }}
      >
        <Suspense fallback={<GeographicMapChartSkeleton />}>
          <GeographicMapChart
            widgetTitle={widgetTitle}
            groupTitle="Geography"
            allUploadedData={points}
            overlayType={overlayType}
            startingZoom={startingZoom}
            center={defaultCenter}
            onToggleWidget={handleToggleWidget}
            onDelete={onDelete}
            onMapClick={handleMapClick}
            onPointMove={handlePointMove}
            height={effectiveHeight}
            isPreview={isPreview}
            isProgramBuilder={isProgramBuilder}
            isCreationMode={true}
          />
        </Suspense>
      </div>
      {showWidget && (
        <Suspense fallback={<GeographicMapConfigurationSkeleton />}>
          <GeographicMapConfiguration
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            points={points}
            setPoints={setPoints}
            overlayType={overlayType}
            setOverlayType={setOverlayType}
            startingZoom={startingZoom}
            setStartingZoom={setStartingZoom}
            pickingId={pickingId}
            setPickingId={setPickingId}
            isProgramBuilder={isProgramBuilder}
            onClose={() => {
              handleCloseWidget();
              setPickingId(null);
            }}
            onDelete={onDelete}
            layoutW={layoutW}
            layoutH={layoutH}
            orderIndex={orderIndex}
          />
        </Suspense>
      )}
    </div>
  );
};

export default GeographicMapModule;
