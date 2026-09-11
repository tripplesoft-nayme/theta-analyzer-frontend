import React from "react";
import { format } from "date-fns";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileItem } from "../types";
import { getFileExtension, getFileIcon } from "../utils";

interface FilePreviewModalProps {
  previewFile: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  previewFile,
  onClose,
  onDownload,
}) => {
  return (
    <Dialog open={!!previewFile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200">
        <DialogHeader className="pb-3 border-b border-slate-150 dark:border-slate-800">
          <DialogTitle
            className="text-lg truncate pr-6 text-slate-900 dark:text-white font-semibold cursor-help"
            title={previewFile?.filename}
          >
            {previewFile?.filename}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-normal">
            Preview individual file details and attachments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center justify-center min-h-[300px]">
          {previewFile && (
            <>
              {previewFile.fileType?.startsWith("image/") ||
                ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(getFileExtension(previewFile.filename, previewFile.fileType)) ? (
                <div className="relative group w-full h-[320px] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-2">
                  <img
                    src={previewFile.url}
                    alt={previewFile.filename}
                    className="max-w-full max-h-full object-contain rounded-md"
                    onError={(e: any) => {
                      e.target.src = "https://placehold.co/600x400/png?text=Preview+Not+Available";
                    }}
                  />
                </div>
              ) : getFileExtension(previewFile.filename, previewFile.fileType) === "pdf" ? (
                <div className="w-full h-[320px] rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">PDF Document</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm font-normal">
                    For security and compatibility, we recommend downloading PDF files to view them directly in your reader.
                  </p>
                </div>
              ) : ["mp4", "webm", "ogg", "mov", "mkv", "avi", "wmv", "flv", "3gp", "quicktime"].includes(getFileExtension(previewFile.filename, previewFile.fileType)) || previewFile.fileType?.startsWith("video/") ? (
                <div className="w-full h-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center p-6 text-center">
                  <video
                    src={previewFile.url}
                    controls
                    className="max-w-full h-full rounded-md"
                  />
                </div>
              ) : (
                <div className="w-full h-[320px] rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    {getFileIcon(previewFile.filename, previewFile.fileType)}
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">
                    {getFileExtension(previewFile.filename, previewFile.fileType).toUpperCase()} Document
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-normal">
                    No inline preview available for this file type.
                  </p>
                </div>
              )}

              {/* Metadata Details Card */}
              <div className="w-full mt-6 bg-slate-50 dark:bg-slate-955 rounded-md p-4 border border-slate-100 dark:border-slate-855 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-normal">Description:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-normal">
                    {previewFile.description || "No description provided."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-normal">File Size:</span>
                  <span className="text-slate-775 dark:text-slate-300 font-normal">
                    {(previewFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-normal">Upload Date:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-normal">
                    {format(new Date(previewFile.uploadAt || previewFile.createdAt), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-150 dark:border-slate-800 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 h-11 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-md font-normal shadow-none!"
          >
            Close
          </Button>
          {previewFile && (
            <Button
              onClick={() => onDownload(previewFile)}
              className="px-4 h-11 bg-btn-primary-gradient border border-[var(--brand-primary,#4881FF)] text-white hover:text-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)] cursor-pointer rounded-md font-normal transition-colors duration-300"
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
