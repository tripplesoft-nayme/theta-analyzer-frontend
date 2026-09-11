import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { getFileIcon } from "../utils";
import { FileItem } from "../types";

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  uploadTargetGroup: { id: string; title: string } | null;
  resubmitFile: FileItem | null;
  isUploading: boolean;
  onUpload: (file: File, title: string, description: string, duration?: number, resubmitFileId?: string) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onOpenChange,
  uploadTargetGroup,
  resubmitFile,
  isUploading,
  onUpload,
}) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadDuration, setUploadDuration] = useState("");
  const [hasRemovedOriginal, setHasRemovedOriginal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset local state when modal opens/closes or resubmitFile changes 
  useEffect(() => {
    if (isOpen) {
      setUploadFile(null);
      if (resubmitFile) {
        setUploadTitle(resubmitFile.filename.split(".")[0]);
        setUploadDescription(resubmitFile.description || "");
        setUploadDuration(resubmitFile.duration !== undefined && resubmitFile.duration !== null ? String(resubmitFile.duration) : "");
        setHasRemovedOriginal(false);
      } else {
        setUploadTitle("");
        setUploadDescription("");
        setUploadDuration("");
        setHasRemovedOriginal(false);
      }
    }
  }, [isOpen, resubmitFile]);

  // Manage image/video preview object URL
  useEffect(() => {
    if (!uploadFile) {
      setPreviewUrl(null);
      return;
    }
    console.log(uploadFile);
    if (
      uploadFile.type.startsWith("image/") ||
      uploadFile.type.startsWith("video/")
    ) {
      const url = URL.createObjectURL(uploadFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [uploadFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setUploadFile(selected);
      setUploadTitle(selected.name.split(".")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    const durationNum = uploadDuration ? parseInt(uploadDuration, 10) : undefined;
    await onUpload(uploadFile, uploadTitle, uploadDescription, durationNum, resubmitFile?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col gap-0 animate-in fade-in duration-200">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            {resubmitFile ? "Resubmit File" : "Upload File to Group"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-normal">
            {resubmitFile ? (
              <span>Replacing file in: <span className="text-blue-600 dark:text-blue-400 font-normal">{uploadTargetGroup?.title}</span></span>
            ) : (
              <span>Uploading to: <span className="text-blue-600 dark:text-blue-400 font-normal">{uploadTargetGroup?.title}</span></span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6 pt-2 w-full min-w-0">
          {resubmitFile && !hasRemovedOriginal ? (
            <div className="space-y-3">
              {resubmitFile.notes && (
                <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 rounded-md text-xs text-red-600 dark:text-red-400 font-normal">
                  <AlertCircle className="size-4 shrink-0" />
                  <div>
                    <span className="text-sm font-medium block mb-0.5">Rejection Reason:</span>
                    {resubmitFile.notes}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getFileIcon(resubmitFile.filename)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate font-normal">
                      {resubmitFile.filename}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                      Original File
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setHasRemovedOriginal(true)}
                  className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer"
                >
                  Remove & Replace
                </Button>
              </div>
            </div>
          ) : !uploadFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-md p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/10"
            >
              <Upload className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
              <p className="text-sm font-normal text-slate-700 dark:text-slate-300">
                Click to browse or drag & drop your new file
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-normal">
                Supported formats: image, video, pdf, excel, zip, docx, etc.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 rounded-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                    {getFileIcon(uploadFile.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate font-normal">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                      {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadFile(null)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewUrl && uploadFile && (
                <div className="relative overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-2 max-h-[160px]">
                  {uploadFile.type.startsWith("video/") ? (
                    <video
                      src={previewUrl}
                      controls
                      className="max-w-full max-h-[140px] rounded-md"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Selected file preview"
                      className="max-w-full max-h-[140px] object-contain rounded-md"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm text-slate-700 dark:text-slate-200 font-normal">
              File Title (Optional)
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Enter title for document..."
              className="w-full px-4 h-11 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-normal outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm text-slate-700 dark:text-slate-200 font-normal">
              Duration (Optional)
            </label>
            <input
              type="number"
              value={uploadDuration}
              min={1}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty string (clearing the field)
                if (val === "") { setUploadDuration(""); return; }
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 1) setUploadDuration(String(num));
              }}
              onKeyDown={(e) => {
                // Block minus sign and the 'e' character (scientific notation)
                if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
              placeholder="Enter duration in seconds..."
              className="w-full px-4 h-11 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-normal outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm text-slate-700 dark:text-slate-200 font-normal">
              Description (Optional)
            </label>
            <textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Enter description of the file..."
              className="w-full h-24 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-normal outline-none"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 h-11 text-sm border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-md font-normal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={(resubmitFile && !hasRemovedOriginal) || !uploadFile || isUploading}
              className="px-4 h-11 text-sm bg-btn-primary-gradient border border-[var(--brand-primary,#4881FF)] text-white hover:text-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)] cursor-pointer rounded-md font-normal transition-colors duration-300"
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {resubmitFile ? "Resubmit File" : "Upload File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
