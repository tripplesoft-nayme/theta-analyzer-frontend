import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useGetProjectFilesQuery, useGetProgramFilesQuery, useDeleteFileGroupMutation } from "@/store/Api/Files/FilesApi";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  Trash2,
  Edit,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileAudio,
  File as FileIcon
} from "lucide-react";
import FilesPreviewSkeleton from "@/Common/Skeleton/Common/MediaWidget/FilesPreviewSkeleton";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { setMediaWidgetInitialData, hideWidget, setSelectedWidgets } from "@/store/Slices/ChartSlice/ChartSlice";

const formatFileSize = (bytes?: number) => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileConfig = (filename: string = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return {
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800/30",
        icon: FileText,
        gradient: "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10",
        label: "PDF Document"
      };
    case "xlsx":
    case "xls":
    case "csv":
      return {
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
        borderColor: "border-emerald-200 dark:border-emerald-800/30",
        icon: FileSpreadsheet,
        gradient: "from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10",
        label: "Excel Spreadsheet"
      };
    case "doc":
    case "docx":
      return {
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800/30",
        icon: FileText,
        gradient: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10",
        label: "Word Document"
      };
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return {
        color: "text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800/30",
        icon: FileArchive,
        gradient: "from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10",
        label: "Compressed Archive"
      };
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
      return {
        color: "text-violet-500",
        bgColor: "bg-violet-50 dark:bg-violet-950/20",
        borderColor: "border-violet-200 dark:border-violet-800/30",
        icon: FileAudio,
        gradient: "from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/10",
        label: "Audio File"
      };
    case "json":
    case "js":
    case "ts":
    case "tsx":
    case "html":
    case "css":
      return {
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
        borderColor: "border-yellow-200 dark:border-yellow-800/30",
        icon: FileCode,
        gradient: "from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/10",
        label: "Code File"
      };
    default:
      return {
        color: "text-slate-500",
        bgColor: "bg-slate-50 dark:bg-slate-950/20",
        borderColor: "border-slate-200 dark:border-slate-800/30",
        icon: FileIcon,
        gradient: "from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/10",
        label: "Project File"
      };
  }
};

interface FilesPreviewProps {
  projectId?: string;
  programId?: string;
  isProgramBuilder?: boolean;
  isPreview?: boolean;
  files?: any[];
  isLoading?: boolean;
  isError?: boolean;
  title?: string;
  onDelete?: () => void;
  groupId?: string;
  height?: number;
}

const FilesPreview: React.FC<FilesPreviewProps> = ({
  projectId,
  programId,
  isProgramBuilder,
  isPreview,
  files: propsFiles,
  isLoading: propsIsLoading,
  isError: propsIsError,
  title,
  onDelete,
  groupId,
}) => {
  const projectQuery = useGetProjectFilesQuery(projectId as string, {
    skip: isProgramBuilder || !projectId || !!propsFiles,
  });
  const programQuery = useGetProgramFilesQuery(programId as string, {
    skip: !isProgramBuilder || !programId || !!propsFiles,
  });

  const query = isProgramBuilder ? programQuery : projectQuery;

  const [deleteFileGroup] = useDeleteFileGroupMutation();

  const dispatch = useAppDispatch();
  const { selectedWidgets } = useAppSelector((state) => state.chartSlice);

  const files = useMemo(() => {
    const apiData = query.data?.data || [];
    const extractedFiles = Array.isArray(apiData)
      ? (apiData.length > 0 && apiData[0].files ? apiData.flatMap((g: any) => g.files || []) : apiData)
      : [];

    const rawFiles = propsFiles || extractedFiles;
    return Array.isArray(rawFiles) ? rawFiles.filter((f: any) => {
      const name = f.filename || f.name || "";
      return !name.startsWith(".~lock.");
    }) : [];
  }, [propsFiles, query.data]);
  const isLoading = propsIsLoading !== undefined ? propsIsLoading : query.isLoading;
  const isError = propsIsError !== undefined ? propsIsError : query.isError;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  // Maintain a cache of loaded URLs to bypass showing loaders for cached images
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // Reset loading and error states whenever the active file changes
  useEffect(() => {
    const activeUrl = files[currentIndex]?.url;
    if (activeUrl) {
      if (loadedUrls.includes(activeUrl)) {
        setImageLoading(false);
        setImageError(false);
      } else {
        setImageLoading(true);
        setImageError(false);
      }
    }
  }, [files, currentIndex, loadedUrls]);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Auto-slide effect
  useEffect(() => {
    if (files.length <= 1 || isHovered || showFullPreview) {
      setProgress(0);
      return;
    }

    const currentFile = files[currentIndex];
    const slideDuration = currentFile?.duration ? Number(currentFile.duration) : 5;
    const durationInMs = slideDuration * 1000;
    const intervalTime = 50;

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / durationInMs) * 100, 100);
      setProgress(pct);

      if (elapsed >= durationInMs) {
        clearInterval(interval);
        setCurrentIndex((prev) => (prev + 1) % files.length);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [files, currentIndex, isHovered, showFullPreview]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };


  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => {
    const nextZoom = Math.max(zoomLevel - 0.25, 0.5);
    setZoomLevel(nextZoom);
    if (nextZoom <= 1) setPanPos({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(files[currentIndex].url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = files[currentIndex].filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to opening in new tab if blob fetch fails
      window.open(files[currentIndex].url, '_blank');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPan(true);
    setStartPanPos({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPan || zoomLevel <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setPanPos({
      x: e.clientX - startPanPos.x,
      y: e.clientY - startPanPos.y,
    });
  };

  const handleMouseUp = () => {
    setIsDraggingPan(false);
  };

  if (isLoading) {
    return <FilesPreviewSkeleton />;
  }

  if (isError || files.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/30 dark:bg-slate-800/30 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 p-6 text-center group">
        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
          <ImageIcon className="text-gray-300 dark:text-slate-600 w-6 h-6" />
        </div>
        <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 tracking-tight">No Media Available</h4>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 max-w-[160px] leading-relaxed">
          Upload files to see a preview of your project media here.
        </p>
      </div>
    );
  }


  const currentFile = files[currentIndex];
  const isImage = currentFile?.fileType?.startsWith("image/");
  const isVideo = currentFile?.fileType?.startsWith("video/");

  const renderProgressCircle = () => {
    return (
      <div
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-2xl pointer-events-auto cursor-pointer hover:bg-black/75 transition-colors"
      >
        <span className="text-[10px] font-bold text-white/90 select-none">
          {currentIndex + 1} / {files.length}
        </span>
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="14"
              cy="14"
              r="11"
              className="stroke-white/20 fill-none"
              strokeWidth="2"
            />
            <circle
              cx="14"
              cy="14"
              r="11"
              className="stroke-yellow-400 fill-none transition-all duration-75 ease-linear"
              strokeWidth="2"
              strokeDasharray={69.12}
              strokeDashoffset={69.12 - (progress / 100) * 69.12}
            />
          </svg>
          {(() => {
            if (files.length <= 1) {
              return <span className="absolute text-[8px] font-extrabold text-yellow-400 select-none">1/1</span>;
            }
            if (isHovered || showFullPreview) {
              return (
                <div className="absolute flex gap-[2px] items-center justify-center">
                  <div className="w-[1.5px] h-1.5 bg-yellow-400 rounded-xs" />
                  <div className="w-[1.5px] h-1.5 bg-yellow-400 rounded-xs" />
                </div>
              );
            }
            const currentDuration = currentFile?.duration ? Number(currentFile.duration) : 5;
            const remainingSeconds = Math.max(0, Math.ceil(((100 - progress) / 100) * currentDuration));
            return (
              <span className="absolute text-[8px] font-extrabold text-yellow-400 select-none">
                {remainingSeconds}s
              </span>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes bounce-bar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.2); }
        }
        .animate-bounce-bar {
          animation: bounce-bar 0.9s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
      <div
        className="relative w-full h-full rounded-lg overflow-hidden group/container shadow-xl cursor-pointer border border-gray-200 dark:border-slate-800"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowFullPreview(true)}
      >
        {/* Dynamic Title Overlay */}
        {title && (
          <div className="absolute top-4 left-4 z-40 pointer-events-none">
            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold text-white tracking-wide border border-white/10 shadow-lg uppercase">
              {title}
            </span>
          </div>
        )}

        {/* Floating Options Menu Button on Hover */}
        {!isPreview && onDelete && (
          <div
            ref={menuRef}
            className="absolute top-4 right-4 z-45"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 group-hover/container:opacity-100 transition-opacity duration-300 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white border border-white/15 shadow-lg"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (groupId) {
                      // 1. Hide the current widget
                      dispatch(hideWidget(`file-group-${groupId}`));

                      // 2. Pre-populate initial edit files data
                      dispatch(setMediaWidgetInitialData({
                        files,
                        title: title || "Media Widget",
                        groupId,
                      }));

                      // 3. Open a new media widget in creation/config mode
                      const uniqueId = `media-widget_edit_${Date.now()}`;
                      dispatch(setSelectedWidgets([...selectedWidgets, uniqueId]));
                    }
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-left text-sm font-medium transition-colors"
                >
                  <Edit size={14} className="text-blue-500" />
                  Edit
                </button>
                <div className="h-[1px] bg-gray-100 dark:bg-slate-800 my-1" />
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (groupId) {
                      try {
                        await deleteFileGroup({ id: groupId }).unwrap();
                        toast.success("Widget deleted successfully");
                      } catch (err) {
                        toast.error("Failed to delete widget");
                        console.error("Delete widget error:", err);
                      }
                    }
                    if (onDelete) onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 dark:hover:bg-rose-950/30 text-red-600 dark:text-rose-400 rounded text-left text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Widget
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {isImage ? (
            <>
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/55 dark:bg-slate-900/55 backdrop-blur-xs z-10 transition-opacity duration-300">
                  <div className="flex items-center gap-1 h-8 justify-center mb-2.5">
                    <div className="w-1 h-6 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.1s" }} />
                    <div className="w-1 h-6 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1 h-6 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.3s" }} />
                    <div className="w-1 h-6 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 tracking-wide uppercase">
                    Loading Media...
                  </span>
                </div>
              )}
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-slate-900/80 p-6 text-center z-10">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mb-3 border border-red-200 dark:border-red-900/50 shadow-sm">
                    <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-400 mb-1 tracking-tight">Failed to Load</h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 max-w-[160px] leading-relaxed truncate">
                    {currentFile.filename}
                  </p>
                </div>
              ) : (
                <img
                  src={currentFile.url}
                  alt={currentFile.filename}
                  onLoad={() => {
                    const activeUrl = currentFile?.url;
                    if (activeUrl && !loadedUrls.includes(activeUrl)) {
                      setLoadedUrls((prev) => [...prev, activeUrl]);
                    }
                    setImageLoading(false);
                    setImageError(false);
                  }}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  className={`w-full h-full object-fill transition-all duration-500 hover:scale-102 ${imageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                />
              )}
            </>
          ) : isVideo ? (
            <video
              src={currentFile.url}
              className="w-full h-full object-cover"
              controls={false}
              autoPlay
              muted
              loop
            />
          ) : (
            (() => {
              const config = getFileConfig(currentFile.filename);
              const Icon = config.icon;
              return (
                <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br ${config.gradient} transition-colors duration-300`}>
                  <div className={`w-16 h-16 ${config.bgColor} ${config.borderColor} border rounded-2xl flex items-center justify-center shadow-lg mb-3.5 transform hover:scale-105 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${config.color}`} />
                  </div>
                  <div className="max-w-[85%] flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 px-2 word-break break-all leading-snug">
                      {currentFile.filename}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                        {config.label}
                      </span>
                      {currentFile.size && (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                          {formatFileSize(currentFile.size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Navigation Arrows - Hover only */}
          {files.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 group-hover/container:opacity-100 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full text-white border border-white/10 transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 group-hover/container:opacity-100 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full text-white border border-white/10 transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Dark Overlay Gradient - Always Visible */}
        {/* <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 via-black/10 to-transparent pointer-events-none" /> */}


        {/* Default State: filename + dots only — minimal gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 group-hover:opacity-0 group-hover/container:opacity-0 pointer-events-none">
          <div className="bg-linear-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
            <div className="flex items-end justify-between">
              {/* <h2 className="text-white text-base font-medium tracking-tight leading-tight drop-shadow-lg truncate flex-1 min-w-0 pr-3">
                {currentFile.filename.split('.')[0]}
              </h2> */}
              {/* Navigation Circle Progress - Default */}
              <div className="flex items-center justify-end shrink-0 mb-0.5 w-full">
                {renderProgressCircle()}
              </div>
            </div>
          </div>
        </div>

        {/* Hover State: full details panel — slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover/container:opacity-100 group-hover:translate-y-0 group-hover/container:translate-y-0 transition-all duration-300 ease-out">
          <div className="bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
              {/* Title, Description & Meta */}
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-white text-sm sm:text-base font-medium tracking-tight leading-tight drop-shadow-lg truncate">
                  {currentFile.filename.split('.')[0]}
                </h2>
                <p className="text-white/80 text-xs font-normal leading-relaxed drop-shadow-md line-clamp-2 max-w-xl">
                  {currentFile.description || "Project media asset"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded text-[9px] sm:text-[10px] font-medium text-white uppercase tracking-widest border border-white/10">
                    {currentFile.fileType.split("/")[1]}
                  </span>
                  <span className="text-white/60 text-[9px] sm:text-[10px] font-medium uppercase tracking-widest">
                    {Math.round(currentFile.size / 1024)} KB
                  </span>
                </div>
              </div>

              {/* Navigation Circle Progress - Hover */}
              <div className="flex items-center mb-1 shrink-0">
                {renderProgressCircle()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal Overlay - Portalled to body to prevent grid drag interference */}
      {showFullPreview && createPortal(
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none"
          onClick={() => setShowFullPreview(false)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header Area - Top Left Title & Top Right Controls */}
          <div className="absolute top-0 left-0 right-0 p-10 flex items-start justify-between z-100 pointer-events-none bg-linear-to-b from-black/30 via-black/10 to-transparent">
            <div className="flex flex-col gap-2 pointer-events-auto">
              <h3 className="text-white text-3xl font-medium tracking-tight drop-shadow-2xl">{currentFile.filename}</h3>
              <div className="flex gap-4">
                <span className="text-white/40 uppercase text-xs font-bold tracking-widest">
                  {currentIndex + 1} / {files.length}
                </span>
                <span className="text-white/40 uppercase text-xs font-bold tracking-widest border-l border-white/20 pl-4">
                  {currentFile.fileType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pointer-events-auto">
              {/* Zoom Controls */}
              <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 overflow-hidden shadow-2xl">
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                  className="p-3 text-white hover:bg-white/20 transition-colors border-r border-white/10"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="px-4 text-white text-xs font-bold w-16 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                  className="p-3 text-white hover:bg-white/20 transition-colors"
                >
                  <ZoomIn size={20} />
                </button>
              </div>

              {/* Download Button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="p-3 bg-black/40 backdrop-blur-md hover:bg-white/20 rounded-full text-white border border-white/10 transition-all shadow-2xl"
                title="Download"
              >
                <Download size={20} />
              </button>

              {/* Close Button */}
              <button
                className="p-3 bg-black/40 backdrop-blur-md hover:bg-white/20 rounded-full text-white border border-white/10 transition-all shadow-2xl"
                onClick={() => setShowFullPreview(false)}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Large Media Content */}
          <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomLevel})`,
                transition: isDraggingPan ? "none" : "transform 0.2s ease-out"
              }}
              className="flex items-center justify-center pointer-events-none"
            >
              {isImage ? (
                <>
                  {imageLoading && !imageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                      <div className="flex items-center gap-1.5 h-12 justify-center mb-3">
                        <div className="w-1.5 h-10 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.1s" }} />
                        <div className="w-1.5 h-10 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.2s" }} />
                        <div className="w-1.5 h-10 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.3s" }} />
                        <div className="w-1.5 h-10 bg-yellow-400 rounded-full animate-bounce-bar" style={{ animationDelay: "0.4s" }} />
                      </div>
                      <span className="text-xs font-bold text-white/80 tracking-widest uppercase">
                        Loading Asset...
                      </span>
                    </div>
                  )}
                  {imageError ? (
                    <div className="flex flex-col items-center gap-4 bg-black/40 p-12 rounded-lg border border-white/10 backdrop-blur-md pointer-events-auto">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                        <X className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Failed to load media</h3>
                      <p className="text-sm text-white/60 max-w-sm text-center">
                        The requested asset "{currentFile.filename}" could not be retrieved from the server.
                      </p>
                    </div>
                  ) : (
                    <img
                      src={currentFile.url}
                      alt={currentFile.filename}
                      onLoad={() => {
                        const activeUrl = currentFile?.url;
                        if (activeUrl && !loadedUrls.includes(activeUrl)) {
                          setLoadedUrls((prev) => [...prev, activeUrl]);
                        }
                        setImageLoading(false);
                        setImageError(false);
                      }}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                      className={`max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl select-none transition-all duration-500 ${imageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                      draggable="false"
                    />
                  )}
                </>
              ) : isVideo ? (
                <div className="pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
                  <video
                    src={currentFile.url}
                    className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl"
                    controls
                    autoPlay
                  />
                </div>
              ) : (
                (() => {
                  const config = getFileConfig(currentFile.filename);
                  const Icon = config.icon;
                  return (
                    <div className="bg-slate-900/80 p-12 rounded-2xl flex flex-col items-center gap-6 backdrop-blur-xl border border-slate-700/50 shadow-2xl pointer-events-auto max-w-md w-full text-center">
                      <div className={`w-24 h-24 ${config.bgColor} ${config.borderColor} border rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                        <Icon className={`w-12 h-12 ${config.color}`} />
                      </div>
                      <div className="flex flex-col items-center gap-2 w-full">
                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-3 px-4 break-all">
                          {currentFile.filename}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            {config.label}
                          </span>
                          {currentFile.size && (
                            <span className="text-[11px] font-bold text-slate-400">
                              {formatFileSize(currentFile.size)}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={currentFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 border border-blue-500 w-full"
                      >
                        <Download size={16} />
                        Download File
                      </a>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Navigation in Modal - Fixed on ends and smaller */}
            {files.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full text-white border border-white/10 transition-all shadow-2xl"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full text-white border border-white/10 transition-all shadow-2xl"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>, document.body)}
    </>
  );
};

export default FilesPreview;
