import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, FileText, Download, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileItem, GroupedFileItem } from "../types";
import { getFileExtension, getFileIcon } from "../utils";

interface GroupPreviewModalProps {
  previewGroup: GroupedFileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
  isManager?: boolean;
  isProjectReview?: boolean;
  onApproveFile?: (fileId: string) => void;
  onRejectFile?: (file: FileItem) => void;
  onApproveGroup?: (groupId: string) => void;
  onRejectGroup?: (groupInfo: any) => void;
}

export const GroupPreviewModal: React.FC<GroupPreviewModalProps> = ({
  previewGroup,
  onClose,
  onDownload,
  isManager,
  isProjectReview,
  onApproveFile,
  onRejectFile,
  onApproveGroup,
  onRejectGroup,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (previewGroup) {
      setActiveIndex(0);
    }
  }, [previewGroup?.groupInfo?.id]);

  return (
    <Dialog open={!!previewGroup} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        <DialogHeader className="pb-3 border-b border-slate-150 dark:border-slate-800 pr-6 sm:pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-lg text-slate-900 dark:text-white font-semibold">
                Group: {previewGroup?.groupInfo.groupTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-normal mt-1">
                Previewing all files within this folder group. Use navigation controls to browse items.
              </DialogDescription>
            </div>
            {isManager && isProjectReview && previewGroup && previewGroup.groupInfo && (
              <div className="flex gap-2">
                {(previewGroup.groupInfo as any).status !== "approved" && (previewGroup.groupInfo as any).status !== "rejected" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { onClose(); onApproveGroup?.(previewGroup.groupInfo.id); }}
                      className="h-8 px-3 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 rounded-md cursor-pointer font-normal"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve Group
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { onRejectGroup?.(previewGroup.groupInfo); }}
                      className="h-8 px-3 text-xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 rounded-md cursor-pointer font-normal"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Reject Group
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {previewGroup && previewGroup.files.length > 0 ? (
          <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center min-h-[360px] relative">
            {/* Carousel navigation overlay */}
            <div className="w-full flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? previewGroup.files.length - 1 : prev - 1
                  )
                }
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-855 border border-slate-200 dark:border-slate-800 rounded-full transition-all shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 min-w-0 flex flex-col items-center justify-center max-w-[640px]">
                {(() => {
                  const currentFile = previewGroup.files[activeIndex];
                  if (!currentFile) return null;
                  const ext = getFileExtension(currentFile.filename, currentFile.fileType);

                  return (
                    <div className="w-full space-y-4 flex flex-col items-center">
                      {currentFile.fileType?.startsWith("image/") ||
                        ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext) ? (
                        <div className="relative group w-full h-[370px] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-2">
                          <img
                            src={currentFile.url}
                            alt={currentFile.filename}
                            className="max-w-full max-h-full object-contain rounded-md"
                            onError={(e: any) => {
                              e.target.src =
                                "https://placehold.co/600x400/png?text=Preview+Not+Available";
                            }}
                          />
                        </div>
                      ) : currentFile.fileType?.startsWith("video/") || ["mp4", "webm", "ogg"].includes(ext) ? (
                        <div className="relative group w-full h-[370px] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-black flex items-center justify-center">
                          <video
                            src={currentFile.url}
                            controls
                            className="max-w-full max-h-full object-contain"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : ext === "pdf" ? (
                        <div className="w-full h-[370px] rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center p-6 text-center">
                          <FileText className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">PDF Document</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-normal">
                            Review PDF details or download the document to read.
                          </p>
                        </div>
                      ) : (
                        <div className="w-full h-[370px] rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-12 h-12 rounded bg-blue-500/10 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                            {getFileIcon(currentFile.filename, currentFile.fileType)}
                          </div>
                          <p className="text-sm text-slate-855 dark:text-slate-200 font-semibold">
                            {ext.toUpperCase()} File
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-normal">No inline preview available.</p>
                        </div>
                      )}

                      <div className="w-full bg-slate-50 dark:bg-slate-955 rounded-md p-3 border border-slate-100 dark:border-slate-855 space-y-1 text-xs">
                        <div className="w-full flex flex-col items-center gap-1">
                          <div className="flex items-center justify-between w-full dark:border-slate-800 dark:bg-slate-900">
                            <h4
                              className="text-sm text-slate-900 dark:text-white truncate font-semibold cursor-help max-w-[300px]"
                              title={currentFile.filename}
                            >
                              {currentFile.filename}
                            </h4>
                            {currentFile.status === "approved" && (
                              <div className="h-7 px-2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-medium flex items-center shrink-0">
                                <Check className="w-3 h-3 mr-1" /> Approved
                              </div>
                            )}
                            {currentFile.status === "rejected" && (
                              <div className="h-7 px-2 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-medium flex items-center shrink-0">
                                <X className="w-3 h-3 mr-1" /> Rejected
                              </div>
                            )}
                            {isManager && isProjectReview && currentFile.status !== "approved" && currentFile.status !== "rejected" && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onApproveFile?.(currentFile.id)}
                                  className="h-7 px-2 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 rounded cursor-pointer font-normal transition-colors"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { onRejectFile?.(currentFile); }}
                                  className="h-7 px-2 text-[10px] bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 rounded cursor-pointer font-normal transition-colors"
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-center italic font-normal h-5 truncate">
                          {currentFile.description ? `"${currentFile.description}"` : "\u00A0"}
                        </p>

                        <div className="flex justify-between items-center text-xs pt-1 text-slate-500 font-normal">
                          <span>Size: {(currentFile.size / 1024).toFixed(1)} KB</span>
                          <span className="text-xs text-slate-400 font-normal uppercase">
                            File {activeIndex + 1} of {previewGroup.files.length}
                          </span>
                          <span>
                            Uploaded:{" "}
                            {format(new Date(currentFile.uploadAt || currentFile.createdAt), "dd-MM-yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === previewGroup.files.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-855 border border-slate-200 dark:border-slate-800 rounded-full transition-all shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Indicator dots */}
            <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
              {previewGroup.files.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all cursor-pointer",
                    idx === activeIndex
                      ? "bg-blue-600 dark:bg-blue-400 w-6"
                      : "bg-slate-200 dark:bg-slate-800"
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 italic font-normal">No files in this group.</div>
        )}

        <DialogFooter className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-between sm:justify-between items-center w-full">
          <div className="text-xs text-slate-400 hidden sm:inline font-normal">
            Folder Group contains {previewGroup?.files.length} total document{previewGroup?.files.length !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-2 justify-end w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 h-11 border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-md font-normal"
            >
              Close
            </Button>

            {previewGroup && previewGroup.files[activeIndex] && (
              <Button
                onClick={() => onDownload(previewGroup.files[activeIndex])}
                className="px-4 h-11 bg-btn-primary-gradient border border-[var(--brand-primary,#4881FF)] text-white hover:text-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)] cursor-pointer rounded-md font-normal transition-colors duration-300"
              >
                <Download className="w-4 h-4 mr-2" /> Download File
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
