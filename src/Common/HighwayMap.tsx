/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Project {
  id: string | number;
  name: string;
  latitude?: string | number;
  longitude?: string | number;
  lat?: number;
  lng?: number;
  location?: string;
  progress?: number;
  status?: string;
  [key: string]: any;
}

interface HighwayMapProps {
  projects?: Project[];
  title?: string;
  detailsLinkPrefix?: string;
  height?: string;
  className?: string;
}

const HighwayMap: React.FC<HighwayMapProps> = ({
  projects: providedProjects,
  title,
  detailsLinkPrefix = "project-details/",
  height = "550px",
  className = "mb-10",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null,
  );

  const displayProjects = React.useMemo(() => {
    const list = Array.isArray(providedProjects) ? providedProjects : [];
    return list
      .map((p) => ({
        ...p,
        lat: parseFloat((p.lat ?? p.latitude ?? 0).toString()),
        lng: parseFloat((p.lng ?? p.longitude ?? 0).toString()),
      }))
      .filter((p) => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0);
  }, [providedProjects]);

  useEffect(() => {
    if (displayProjects.length > 0 && !selectedProject) {
      setSelectedProject(displayProjects[0]);
    }
  }, [displayProjects, selectedProject]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initializeMap = () => {
      const L = (window as any).L;
      if (!L || mapInstanceRef.current) return;

      const container = L.DomUtil.get(mapRef.current);
      if (container != null) {
        container._leaflet_id = null;
      }

      const center: [number, number] =
        displayProjects.length > 0
          ? [displayProjects[0].lat, displayProjects[0].lng]
          : [23.7461, 90.3779];

      const mapInstance = L.map(mapRef.current, {
        zoomControl: false,
      }).setView(center, displayProjects.length > 1 ? 12 : 15);

      L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: '<div style="background-color: #E53935; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.3s ease;"><div style="width: 12px; height: 12px; background-color: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      displayProjects.forEach((project) => {
        const marker = L.marker([project.lat, project.lng], {
          icon: customIcon,
        }).addTo(mapInstance);

        marker.on("click", () => {
          setSelectedProject(project);
        });
      });

      mapInstanceRef.current = mapInstance;

      if (displayProjects.length > 1) {
        const bounds = L.latLngBounds(
          displayProjects.map((p) => [p.lat, p.lng]),
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
        script.onload = initializeMap;
        document.body.appendChild(script);
      }
    } else {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [displayProjects]);

  return (
    <div
      className={`w-full rounded-xl bg-white dark:bg-slate-900 flex flex-col overflow-hidden shadow-sm border border-border dark:border-slate-800 ${className}`}
      style={{ height }}
    >
      <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-50 dark:border-slate-800 z-10">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
          {title || "Project Locations"}
        </h1>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full z-0"></div>

        {selectedProject && (
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-xl p-5 w-72 z-10 border border-white/20 dark:border-slate-800 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">
                  {selectedProject.name}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5 mb-4 pl-5">
              <p className="text-xs text-gray-600 dark:text-slate-400 font-medium line-clamp-2">
                {selectedProject.location || selectedProject.programName || "No location provided"}
              </p>
              {selectedProject.status && (
                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {selectedProject.status.replace("_", " ")}
                </div>
              )}
            </div>

            <div className="">
              <Link
                to={detailsLinkPrefix.endsWith("/") ? `${detailsLinkPrefix}${selectedProject.id}` : `${detailsLinkPrefix}/${selectedProject.id}`}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 group transition-colors"
              >
                View Project Details
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="absolute -top-3 -right-3 w-16 h-16 bg-white dark:bg-slate-900 rounded-full shadow-xl flex items-center justify-center border-4 border-gray-50/50 dark:border-slate-800">
              <div className="relative w-12 h-12">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#F3F4F6"
                    strokeWidth="4"
                    fill="none"
                    className="dark:stroke-slate-800"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - (selectedProject.progress || 0) / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                    {Math.round(selectedProject.progress || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighwayMap;
