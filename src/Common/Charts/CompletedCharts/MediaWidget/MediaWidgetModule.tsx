import React, { useState, useRef, useEffect } from "react";
import { Upload, X, ChevronLeft, ChevronRight, Save, Play, Loader2, FileText, Loader2Icon } from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useBulkUploadProjectFilesMutation,
  useBulkUploadProgramFilesMutation,
  useUpdateFileMetadataMutation,
  useGetProjectFilesQuery,
  useGetProgramFilesQuery,
  useUpdateFileGroupMutation,
  useDeleteFileMutation,
} from "@/store/Api/Files/FilesApi";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { setMediaWidgetInitialData, resetHiddenWidgets } from "@/store/Slices/ChartSlice/ChartSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video" | string;
  name: string;
  title?: string;
  description?: string;
  duration?: number;
  isNew?: boolean;
  fileObject?: File;
}

interface MediaWidgetModuleProps {
  chartName?: string;
  onDelete?: () => void;
  onSaveSuccess?: () => void;
  height?: number;
  className?: string;
  isPreview?: boolean;
  projectId?: string;
  programId?: string;
  isProgramBuilder?: boolean;
}

const MediaWidgetModule: React.FC<MediaWidgetModuleProps> = ({
  chartName,
  onDelete,
  onSaveSuccess,
  height = 700,
  className,
  isPreview = false,
  projectId,
  programId,
  isProgramBuilder = false,
}) => {
  const isImageFile = (type: string) => type?.startsWith("image/") || type === "image";
  const isVideoFile = (type: string) => type?.startsWith("video/") || type === "video";

  const dispatch = useAppDispatch();
  const { mediaWidgetInitialData } = useAppSelector((state) => state.chartSlice);

  const isEditMode = !!chartName?.includes("_edit_");
  const groupId = isEditMode ? mediaWidgetInitialData?.groupId : undefined;

  const [groupTitle, setGroupTitleState] = useState<string>(() => {
    return (isEditMode && mediaWidgetInitialData?.title) || "Media Widget";
  });

  const [files, setFiles] = useState<MediaFile[]>(() => {
    if (isEditMode && mediaWidgetInitialData?.files) {
      return mediaWidgetInitialData.files.map((f: any) => ({
        id: f.id,
        url: f.url,
        type: f.fileType || f.type || "image/png",
        name: f.filename || f.name,
        title: f.title || f.filename || f.name,
        description: f.description || "",
        duration: f.duration || 5,
        isNew: false,
      }));
    }
    return [];
  });

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    return isEditMode && mediaWidgetInitialData?.files && mediaWidgetInitialData.files.length > 0 ? 0 : -1;
  });

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // API Mutations
  const [uploadProjectFiles, { isLoading: isProjectUploading }] = useBulkUploadProjectFilesMutation();
  const [uploadProgramFiles, { isLoading: isProgramUploading }] = useBulkUploadProgramFilesMutation();
  const [, { isLoading: isUpdating }] = useUpdateFileMetadataMutation();
  const [updateFileGroup, { isLoading: isUpdatingGroup }] = useUpdateFileGroupMutation();
  const [deleteFile] = useDeleteFileMutation();

  // Fetch existing files
  const shouldSkipQuery = isProgramBuilder || !projectId || !!mediaWidgetInitialData || (!isEditMode && !isPreview);
  const { data: projectFiles, isLoading: isProjectLoading } = useGetProjectFilesQuery(projectId as string, { skip: shouldSkipQuery });

  const shouldSkipProgramQuery = !isProgramBuilder || !programId || !!mediaWidgetInitialData || (!isEditMode && !isPreview);
  const { data: programFiles, isLoading: isProgramLoading } = useGetProgramFilesQuery(programId as string, { skip: shouldSkipProgramQuery });

  // Sync with API data
  useEffect(() => {
    if (mediaWidgetInitialData) return;
    if (!isEditMode && !isPreview) return;
    const apiFiles = isProgramBuilder ? programFiles : projectFiles;
    if (apiFiles && Array.isArray(apiFiles)) {
      const mapped = apiFiles.map((f: any) => ({
        id: f.id,
        url: f.url,
        type: f.type,
        name: f.name,
        title: f.title || f.name,
        description: f.description || "",
        isNew: false,
      }));

      setFiles((prev) => {
        const localNewFiles = prev.filter((f) => f.isNew);
        // Only update if there's a difference to avoid infinite loops
        return [...mapped, ...localNewFiles];
      });

      if (mapped.length > 0 && selectedIndex === -1) setSelectedIndex(0);
    }
  }, [projectFiles, programFiles, projectId, programId, isEditMode, isPreview]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const totalAllowed = 10 - files.length;
    if (totalAllowed <= 0) {
      toast.error("A maximum of 10 files are allowed per Media Widget.");
      return;
    }

    let filesToProcess = selectedFiles;
    if (selectedFiles.length > totalAllowed) {
      toast.warning(`Only ${totalAllowed} more file(s) can be added (Maximum of 10).`);
      filesToProcess = selectedFiles.slice(0, totalAllowed);
    }

    const newFiles: MediaFile[] = [];

    filesToProcess.forEach((file) => {
      // Check for duplicates (by name and size)
      const isDuplicate = files.some(
        (f) => f.name === file.name && (f.fileObject ? f.fileObject.size === file.size : true)
      );

      if (isDuplicate) {
        toast.warning(`${file.name} is already added.`);
        return;
      }

      const url = URL.createObjectURL(file);
      newFiles.push({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        type: file.type || "other",
        name: file.name,
        title: file.name.split(".")[0],
        description: "",
        duration: 5,
        isNew: true,
        fileObject: file,
      });
    });

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      setSelectedIndex(files.length + newFiles.length - 1);
      toast.success(`${newFiles.length} file(s) added to queue.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const updateFileData = (id: string, updates: Partial<MediaFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].isNew) URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });

    if (selectedIndex === index) {
      setSelectedIndex(files.length > 1 ? Math.max(0, index - 1) : -1);
    } else if (selectedIndex > index) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  const navigateMedia = (direction: "left" | "right") => {
    if (files.length === 0) return;
    let nextIndex = 0;
    if (direction === "left") {
      nextIndex = selectedIndex > 0 ? selectedIndex - 1 : files.length - 1;
    } else {
      nextIndex = selectedIndex < files.length - 1 ? selectedIndex + 1 : 0;
    }
    setSelectedIndex(nextIndex);

    if (sliderRef.current) {
      const itemWidth = 112;
      const targetScroll = (nextIndex + 1) * itemWidth;
      sliderRef.current.scrollTo({
        left: targetScroll - itemWidth,
        behavior: "smooth",
      });
    }
  };

  const handleSave = async () => {
    if (files.length === 0) {
      toast.error("Nothing to save.");
      return;
    }

    if (!projectId && !programId) {
      toast.error("Resource ID missing. Cannot save.");
      return;
    }

    try {
      const newAssets = files.filter((f) => f && f.isNew && f.fileObject);
      const formData = new FormData();

      // Append new files to the 'files' key in FormData
      newAssets.forEach((asset) => {
        if (asset.fileObject) {
          formData.append("files", asset.fileObject);
        }
      });

      const promises: Promise<any>[] = [];

      if (groupId) {
        if (mediaWidgetInitialData?.files) {
          // Delete any files that were removed from the initial list
          const initialFileIds = mediaWidgetInitialData.files.map((f: any) => f.id);
          const currentFileIds = files.map((f) => f.id);
          const deletedFileIds = initialFileIds.filter((id: string) => !currentFileIds.includes(id));

          deletedFileIds.forEach((fileId: string) => {
            promises.push(deleteFile(fileId).unwrap());
          });
        }

        // Update group title and existing files metadata in one call
        promises.push(
          updateFileGroup({
            id: groupId,
            body: {
              groupId,
              groupTitle,
              files: files.filter((f) => !f.isNew).map((f) => ({
                id: f.id,
                title: f.title,
                description: f.description,
                duration: f.duration,
              })),
            },
          }).unwrap()
        );
      }

      // Compile metadata
      const metadata = [
        {
          groupInfo: groupId ? { groupId, groupTitle } : {
            groupTitle: groupTitle,
            width: 10,
            height: 18,
            order: 0,
          },
          files: (groupId ? files.filter((f) => f.isNew) : files).map((f) => ({
            filename: f.name,
            description: f.description || "",
            title: f.title || f.name,
            duration: f.duration || 5,
          })),
        },
      ];

      formData.append("metadata", JSON.stringify(metadata));

      // Hit upload API if we have new assets or if we are creating a new group
      if (newAssets.length > 0 || !groupId) {
        if (isProgramBuilder) {
          promises.push(uploadProgramFiles({ programId: programId as string, body: formData }).unwrap());
        } else {
          promises.push(uploadProjectFiles({ projectId: projectId as string, body: formData }).unwrap());
        }
      }

      await Promise.all(promises);

      toast.success("Assets synchronized successfully!");

      if (groupId) {
        // Clean up hidden state if editing an existing group
        dispatch(resetHiddenWidgets());
        dispatch(setMediaWidgetInitialData(null));
      }

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Failed to synchronize media files.");
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.isNew) URL.revokeObjectURL(file.url);
      });
    };
  }, []);

  const currentFile = selectedIndex >= 0 ? files[selectedIndex] : null;
  const isSyncing = isProjectUploading || isProgramUploading || isUpdating || isProjectLoading || isProgramLoading || isUpdatingGroup;

  const handleClose = () => {
    dispatch(resetHiddenWidgets());
    dispatch(setMediaWidgetInitialData(null));
    if (onDelete) onDelete();
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn(
          "bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-border dark:border-slate-800 flex flex-col overflow-hidden relative group/widget w-full h-full min-w-0 min-h-0",
          className
        )}
        style={{ height }}
      >
        {/* Main Preview Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex-1 min-h-0 min-w-0 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center relative group/preview overflow-hidden transition-all duration-300",
            isDragging && "bg-blue-50/50 dark:bg-blue-900/30"
          )}
        >
          {isDragging && (
            <div className="absolute inset-0 z-[60] border-4 border-dashed border-blue-400 bg-blue-50/40 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] pointer-events-none">
              <Upload className="w-12 h-12 text-blue-600 animate-bounce" />
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Drop to Upload</p>
            </div>
          )}
          {isSyncing && (
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">Synchronizing Media...</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentFile ? (
              <m.div
                key={currentFile.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center min-w-0 min-h-0"
              >
                <div className="flex-1 w-full h-full flex items-center justify-center p-4">
                  {isImageFile(currentFile.type) ? (
                    <img
                      src={currentFile.url}
                      alt={currentFile.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                  ) : isVideoFile(currentFile.type) ? (
                    <video
                      src={currentFile.url}
                      controls
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 bg-slate-100/80 dark:bg-slate-800/80 p-8 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30">
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{currentFile.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mt-1">
                          {currentFile.type?.split("/")[1] || currentFile.type || "Document"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Preview Button */}
                {!isPreview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(-1);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-black dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-white rounded-full shadow-lg backdrop-blur-md transition-all z-20"
                  >
                    <X size={16} />
                  </button>
                )}
              </m.div>
            ) : (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500 p-8 text-center cursor-pointer group/empty"
                onClick={handleUploadClick}
              >
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-2 bg-white dark:bg-slate-800 shadow-sm transition-all group-hover/empty:border-blue-400 dark:group-hover/empty:border-blue-500 group-hover/empty:bg-blue-50/30 dark:group-hover/empty:bg-blue-900/30 group-hover/empty:scale-105">
                  <Upload size={32} className="text-slate-300 dark:text-slate-600 group-hover/empty:text-blue-500 dark:group-hover/empty:text-blue-400 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 group-hover/empty:text-blue-600 dark:group-hover/empty:text-blue-400 transition-colors">
                    Drag & Drop Media
                  </p>
                  <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] opacity-80 group-hover/empty:opacity-100">
                    or click to browse library
                  </p>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Media Settings Section */}
        {!isPreview && (
          <div className="flex-none bg-white dark:bg-slate-900 border-t border-border dark:border-slate-800 p-4 space-y-3 shadow-sm z-10 transition-all duration-300">
            {/* Widget/Group Title */}
            <div className="space-y-1.5 max-w-sm">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Widget Title
              </label>
              <input
                type="text"
                value={groupTitle}
                onChange={(e) => setGroupTitleState(e.target.value)}
                placeholder="Enter widget title..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="flex gap-4">
              <div className={cn("flex-1 space-y-1.5 transition-opacity", !currentFile && "opacity-50")}>

                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Asset Title
                </label>

                <input
                  type="text"
                  disabled={!currentFile}
                  value={currentFile?.title || ""}
                  onChange={(e) => currentFile && updateFileData(currentFile.id, { title: e.target.value })}
                  placeholder={currentFile ? "Name of your asset..." : "Select an asset to edit..."}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold text-slate-800 dark:text-slate-200 disabled:cursor-not-allowed"
                />
              </div>
              <div className={cn("flex-1 space-y-1.5 transition-opacity", !currentFile && "opacity-50")}>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Description
                </label>
                <input
                  type="text"
                  disabled={!currentFile}
                  value={currentFile?.description || ""}
                  onChange={(e) => currentFile && updateFileData(currentFile.id, { description: e.target.value })}
                  placeholder={currentFile ? "Add some context..." : "No asset selected..."}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold text-slate-800 dark:text-slate-200 disabled:cursor-not-allowed"
                />
              </div>
              {currentFile && (
                <div className={cn("w-24 space-y-1.5 transition-opacity")}>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Duration (s)
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={!currentFile}
                    value={currentFile?.duration || 5}
                    onChange={(e) => currentFile && updateFileData(currentFile.id, { duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold text-slate-800 dark:text-slate-200 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Repository Section */}
        <div className="flex-none h-[170px] bg-white dark:bg-slate-900 px-6 pt-2 flex flex-col border-t border-border dark:border-slate-800 min-w-0 transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5 min-w-0">
            <div className="flex items-center gap-2">
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigateMedia("left")} className="p-0.5 px-1 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200 border border-border dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all text-[8px] font-bold">
                <ChevronLeft size={12} />
              </button>
              <button onClick={() => navigateMedia("right")} className="p-0.5 px-1 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200 border border-border dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all text-[8px] font-bold">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 h-18 mb-1">
            <div onClick={handleUploadClick} className="shrink-0 w-26 h-16 rounded-lg border-2 border-dashed border-blue-100 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all group/upload">
              <Upload size={10} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Upload</span>
            </div>

            <div className="flex-1 min-w-0 h-full relative overflow-hidden">
              <div ref={sliderRef} className="absolute inset-0 overflow-x-auto scrollbar-hide flex items-center gap-3 py-0.5 scroll-smooth">
                {files.map((file, index) => (
                  <m.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "shrink-0 w-26 h-16 rounded-lg cursor-pointer relative overflow-hidden transition-all border group/item shadow-sm",
                      selectedIndex === index ? "border-2 border-blue-500 shadow-blue-500/10" : "border-border dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                    )}
                  >
                    <button onClick={(e) => { e.stopPropagation(); setDeleteIndex(index); }} className="absolute top-1 right-1 p-0.5 bg-black/40 hover:bg-red-500 text-white rounded-full opacity-0 group-hover/item:opacity-100 transition-all z-20">
                      <X size={14} />
                    </button>
                    {isImageFile(file.type) ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-90 group-hover/item:opacity-100 transition-opacity" />
                    ) : isVideoFile(file.type) ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <Play size={10} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700">
                        <FileText size={18} className="text-blue-500 dark:text-blue-400" />
                        <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 truncate max-w-full">
                          {file.type?.split("/")[1] || file.type || "DOC"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[7.5px] font-bold text-white truncate tracking-wide">{file.title || file.name}</p>
                    </div>
                    {selectedIndex === index && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                  </m.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto py-3 flex items-center justify-between border-t border-gray-50 dark:border-slate-800 mb-1">
            <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{files.length} ASSETS</div>
            <div className="flex items-center gap-3">
              <button onClick={handleClose} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold uppercase rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">CLOSE</button>
              <button
                onClick={handleSave}
                disabled={files.length === 0 || isSyncing}
                className="flex items-center gap-2 px-12 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-[11px] font-semibold uppercase rounded-lg  transition-all active:scale-95 min-w-[120px] cursor-pointer justify-center"
              >
                {isSyncing ? <Loader2Icon size={14} className="animate-spin" /> : <Save size={14} />}
                {isSyncing ? (groupId ? "UPDATING..." : "SAVING...") : (groupId ? "UPDATE FILES" : "SAVE")}
              </button>
            </div>
          </div>
        </div>
        <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
          <AlertDialogContent className="z-[9999] bg-white dark:bg-slate-900 border border-border dark:border-slate-800 max-w-sm p-8 rounded-lg flex flex-col items-center gap-6">
            {/* SweetAlert Exclamation Icon */}
            <div className="w-20 h-20 rounded-full border-4 border-amber-200 dark:border-amber-800 flex items-center justify-center">
              <span className="text-amber-400 dark:text-amber-500 text-5xl font-light select-none leading-none">!</span>
            </div>

            <div className="space-y-2 text-center w-full">
              <h3 className="text-2xl font-normal text-slate-700 dark:text-slate-100">
                Are you sure?
              </h3>
              <p className="text-sm font-normal text-slate-400 dark:text-slate-500">
                You won't be able to revert this!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <AlertDialogAction
                onClick={() => {
                  if (deleteIndex !== null) {
                    removeFile(deleteIndex);
                    setDeleteIndex(null);
                  }
                }}
                className="px-5 py-2 bg-[#2c88d9] hover:bg-[#2574b9] text-white font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer border-none"
              >
                Yes, delete it!
              </AlertDialogAction>

              <AlertDialogCancel
                className="px-5 py-2 bg-[#dd3333] hover:bg-[#bd2b2b] text-white hover:text-white font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer border-none"
              >
                Cancel
              </AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
        <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </div>
    </LazyMotion>
  );
};

export default MediaWidgetModule;
