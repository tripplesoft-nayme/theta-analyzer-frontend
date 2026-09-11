/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Layers } from "lucide-react";
import L from "leaflet";
import BaseChartContainer from "../Common/BaseChartContainer";
import { BaseChartProps, LegendValue } from "../Common/chartTypes";
import { parseGeographicMapData } from "../Common/chartUtils";

// Fix for default marker icons in Leaflet with React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/*     TYPES     */

type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  value: number;
  color?: string;
};

/*     HELPERS     */

function ChangeView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  const lastView = useRef({ lat: center[0], lng: center[1], zoom });

  useEffect(() => {
    const hasMoved =
      lastView.current.lat !== center[0] ||
      lastView.current.lng !== center[1] ||
      lastView.current.zoom !== zoom;

    if (hasMoved) {
      map.setView(center, zoom);
      lastView.current = { lat: center[0], lng: center[1], zoom };
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * Watches the Leaflet map container for size changes and triggers a re-tile.
 */
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function MapEvents({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const MapSearch = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&accept-language=en`,
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSelect = (r: any) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    map.flyTo([lat, lon], 13);
    setLocation(lat, lon);
    setResults([]);
    setQuery("");
  };

  return (
    <div
      className="absolute top-2 left-[50px] z-[1000] flex flex-col gap-1 w-[240px]"
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex bg-white dark:bg-slate-900 shadow-md rounded-md p-1 gap-1 border border-slate-200 dark:border-slate-800">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="flex-1 text-[10px] sm:text-xs px-2 py-1 border-none focus:ring-0 outline-none w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSearch();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-[10px] sm:text-xs font-bold rounded-sm transition-colors"
        >
          Search
        </button>
      </div>
      {results.length > 0 && (
        <ul className="max-h-[150px] overflow-y-auto bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 rounded-md divide-y divide-slate-100 dark:divide-slate-800 text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 pointer-events-auto">
          {results.slice(0, 5).map((r, i) => (
            <li
              key={i}
              className="p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors line-clamp-2"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(r);
              }}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Generator for Geographic Map sample data.
 */
const generateMapSampleData = (
  xAxis: string[],
  legends: LegendValue[],
  _numSets: number,
  _start: number,
  _end: number,
): MapPoint[] => {
  const COORDS: Record<string, [number, number]> = {
    "New York": [40.7128, -74.006],
    "New York Hub": [40.7128, -74.006],
    London: [51.5074, -0.1278],
    "London Office": [51.5074, -0.1278],
    Tokyo: [35.6762, 139.6503],
    "Tokyo HQ": [35.6762, 139.6503],
    Sydney: [-33.8688, 151.2093],
    "Sydney Branch": [-33.8688, 151.2093],
    "Cape Town": [-33.9249, 18.4241],
  };

  return xAxis.map((name, idx) => {
    const coords = COORDS[name] || [
      20 + Math.random() * 20,
      Math.random() * 100,
    ];
    return {
      id: String(idx + 1),
      name,
      lat: coords[0],
      lng: coords[1],
      value: 40 + Math.floor(Math.random() * 60),
      color: legends[idx % legends.length]?.color || "#3B82F6",
    };
  });
};

const getMapTierLegends = (tier: any): LegendValue[] => {
  // For Geographic maps, we represent the data as a single collective metric (Value/Activity).
  // Individual locations are handled as labels in the xAxis, so the Excel export
  // should reflect a simple [Location, Value] structure.
  return [
    {
      label:
        tier?.widgets?.[0]?.legendName || tier?.categoryTitle || "Activity",
      field: "value",
      color: tier?.widgets?.[0]?.color || "#3B82F6",
    },
  ];
};

const parseMapTierData = (
  xAxis: any,
  _legends: LegendValue[],
  _title: string,
) => {
  const { points } = parseGeographicMapData({ xAxis });
  return {
    labels: points.map((p: any) => String(p.name || "Unknown")),
    data: points,
  };
};

export default function GeographicMapChart(
  props: BaseChartProps & {
    height?: number;
    onMapClick?: (lat: number, lng: number) => void;
    onPointMove?: (id: string, lat: number, lng: number) => void;
    overlayType?: "choropleth" | "bubble";
    startingZoom?: number;
    center?: [number, number];
  },
) {
  const {
    height: propHeight,
    onMapClick,
    onPointMove,
    isPreview,
    overlayType = "bubble",
    startingZoom = 2,
    center: propsCenter = [20, 0],
    isCreationMode,
  } = props;

  const [mapType, setMapType] = useState<"light" | "dark" | "satellite">(
    "light",
  );

  // Stable ID for the Leaflet map container to prevent 'container reused' errors
  const mapId = useMemo(
    () => `map-${props.chartId || Math.random().toString(36).substring(7)}`,
    [props.chartId],
  );

  /**
   * mapAreaRef points to the flex-1 div that the Leaflet map lives in.
   * We observe its actual rendered height and feed it to Leaflet.
   *
   * Two modes:
   *  - Creation mode (propHeight provided): derive map height by subtracting
   *    the stats cards height (~100px) from the passed prop.
   *  - Grid mode (no propHeight): ResizeObserver on mapAreaRef gives us the
   *    live pixel height of the flex-1 expansion region.
   */
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const [mapAreaHeight, setMapAreaHeight] = useState<number>(
    propHeight ? Math.max(200, propHeight - 200) : 300,
  );

  useEffect(() => {
    if (propHeight) {
      setMapAreaHeight(Math.max(200, propHeight - 200));
      return;
    }
    const el = mapAreaRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) setMapAreaHeight(h);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [propHeight]);

  const tileUrl = useMemo(() => {
    switch (mapType) {
      case "dark":
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      default:
        return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }
  }, [mapType]);

  return (
    <div className="h-full w-full">
      <BaseChartContainer
        {...props}
        category="GEOGRAPHY_GRAPH"
        excelType="grid"
        generatorFunc={generateMapSampleData}
        getTierLegends={getMapTierLegends}
        parseTierData={parseMapTierData}
        showLegend={false}
        disableAddTier={true}
        disableDownload={true}
        renderChildChart={(
          tier: { id: string },
          childProps: BaseChartProps,
        ) => <GeographicMapChart {...childProps} key={tier.id} />}
        customHeaderContent={
          <div className="flex gap-2">
            <button
              onClick={() => setMapType("light")}
              className={`text-[10px] px-2 py-0.5 rounded border ${mapType === "light" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"}`}
            >
              Light
            </button>
            <button
              onClick={() => setMapType("dark")}
              className={`text-[10px] px-2 py-0.5 rounded border ${mapType === "dark" ? "bg-gray-800 dark:bg-slate-700 border-gray-700 dark:border-slate-600 text-white" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"}`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`text-[10px] px-2 py-0.5 rounded border ${mapType === "satellite" ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"}`}
            >
              Satellite
            </button>
          </div>
        }
      >
        {({ chartData }) => {
          const points = (
            Array.isArray(chartData) ? chartData : []
          ) as MapPoint[];
          const center: [number, number] =
            points.length > 0 ? [points[0].lat, points[0].lng] : [20, 0];
          const zoom = 2;

          return (
            <div className="flex flex-col flex-1 min-h-0 gap-4">
              {/*
                Map area: in grid mode this is flex-1 so it fills all
                available vertical space. mapAreaRef measures its px height
                so Leaflet gets an exact number to fill the container.
              */}
              <div
                ref={mapAreaRef}
                className={propHeight ? "" : "flex-1 min-h-[150px]"}
                style={propHeight ? { height: `${mapAreaHeight}px` } : {}}
              >
                <div
                  className="relative rounded-lg overflow-hidden border border-border shadow-inner group z-10 w-full h-full"
                  style={
                    !propHeight ? undefined : { height: `${mapAreaHeight}px` }
                  }
                >
                  {/* Overlay blocks dragging interference */}
                  <div
                    className="absolute inset-0 z-[400] transition-opacity duration-300 opacity-0 bg-transparent hover:opacity-100 flex"
                    style={{ pointerEvents: "none" }}
                  />

                  <MapContainer
                    key={mapId}
                    center={(propsCenter || center) as any}
                    zoom={startingZoom || zoom}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <ChangeView
                      center={(propsCenter || center) as [number, number]}
                      zoom={startingZoom || zoom}
                    />
                    <MapResizeHandler />
                    <MapEvents onMapClick={onMapClick} />
                    {isCreationMode && onMapClick && (
                      <MapSearch
                        setLocation={(lat: number, lng: number) => {
                          onMapClick(lat, lng);
                        }}
                      />
                    )}
                    <TileLayer url={tileUrl} />

                    {overlayType === "bubble"
                      ? points.map((point) => (
                        <CircleMarker
                          key={point.id}
                          center={[point.lat, point.lng]}
                          radius={Math.sqrt(point.value) * 1.5}
                          pathOptions={{
                            fillColor: point.color || "#3B82F6",
                            color: "#FFFFFF",
                            weight: 1,
                            fillOpacity: 0.7,
                          }}
                        >
                          <Popup className="border border-gray-200">
                            <div className="p-1 flex flex-col items-center -mb-4 text-slate-800">
                              <h4 className="font-bold text-sm -mb-2">
                                {point.name}
                              </h4>
                              <p className="text-gray-600">
                                <span className="text-sm font-semibold text-blue-600">
                                  {point.value}
                                </span>
                              </p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      ))
                      : points.map((point) => (
                        <Marker
                          key={point.id}
                          position={[point.lat, point.lng]}
                          draggable={!!onPointMove && !isPreview}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              if (onPointMove)
                                onPointMove(
                                  point.id,
                                  position.lat,
                                  position.lng,
                                );
                            },
                          }}
                        >
                          <Popup>
                            <div className="p-1 text-slate-800">
                              <h4 className="font-bold text-sm">
                                {point.name}
                              </h4>
                              {!isPreview && (
                                <p className="text-[10px] text-gray-500">
                                  Drag to move
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>

                  {/* Floating Overlay Info */}
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded border border-gray-200 dark:border-slate-800 shadow-sm z-[400] text-[10px] pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-700 dark:text-slate-300 font-medium">
                        Activity Level
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 italic">
                      Visualizing global footprint
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats cards — always visible, never clipped */}
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center gap-3 text-left border border-border dark:border-slate-700 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter font-bold">
                      Total Locations
                    </p>
                    <p className="text-lg font-bold text-gray-700 dark:text-slate-200">
                      {points.length}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center gap-3 text-left border border-border dark:border-slate-700 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded text-orange-600 dark:text-orange-400">
                    <Maximize2 size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter font-bold">
                      Avg. Value
                    </p>
                    <p className="text-lg font-bold text-gray-700 dark:text-slate-200">
                      {points.length > 0
                        ? (
                          points.reduce(
                            (acc, p) => acc + (Number(p.value) || 0),
                            0,
                          ) / points.length
                        ).toFixed(1)
                        : "0.0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </BaseChartContainer>
    </div>
  );
}
