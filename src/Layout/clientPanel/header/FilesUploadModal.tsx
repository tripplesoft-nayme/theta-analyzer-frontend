import React, { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useBulkUploadProjectFilesMutation } from "@/store/Api/Files/FilesApi";
import PrimaryButton from "@/Common/PrimaryButton";

interface FilesUploadModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

interface FileWithMetadata {
  file: File;
  title: string;
  description: string;
}

const FilesUploadModal: React.FC<FilesUploadModalProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [bulkUpload, { isLoading }] = useBulkUploadProjectFilesMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newFileEntries = files.map(file => ({
      file,
      title: file?.name?.split('.')[0] || "Untitled",
      description: ""
    }));

    setSelectedFiles(prev => [...prev, ...newFileEntries]);

    // Generate previews for images
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => [...prev, ""]); // Placeholder for non-images
      }
    });
  };

  const updateMetadata = (index: number, field: 'title' | 'description', value: string) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    setPreviews(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    const formData = new FormData();

    // Append all files to the 'files' key
    selectedFiles.forEach((entry) => {
      if (entry?.file) {
        formData.append("files", entry.file);
      }
    });

    // Append stringified metadata
    const metadata = selectedFiles
      .filter((entry) => entry?.file)
      .map((entry) => ({
        filename: entry.file.name,
        fileType: entry.file.type,
        title: entry.title,
        description: entry.description,
        size: entry.file.size,
      }));
    formData.append("metadata", JSON.stringify(metadata));

    try {
      await bulkUpload({ projectId, body: formData }).unwrap();
      toast.success("Files uploaded successfully");
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload files");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Upload Project Files
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Add resources or documents with descriptions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900 dark:text-slate-200">
                Click or drag files here
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Documents, images, and spreadsheets up to 10MB
              </p>
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-3">
                {selectedFiles.map((entry, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-50 dark:bg-slate-800/40 border border-border dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 transition-all hover:border-gray-200 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 border border-border dark:border-slate-800">
                        {previews[index] ? (
                          <img
                            src={previews[index]}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : entry?.file?.type?.startsWith("image/") ? (
                          <ImageIcon className="text-gray-400" size={24} />
                        ) : (
                          <FileText className="text-blue-500" size={24} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
                              {entry?.file?.name}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold">
                              {entry?.file?.size ? (entry.file.size / 1024).toFixed(1) : "0"} KB
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Title</label>
                            <input
                              type="text"
                              value={entry.title}
                              onChange={(e) => updateMetadata(index, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 transition-all dark:text-slate-200"
                              placeholder="File title"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Description</label>
                            <input
                              type="text"
                              value={entry.description}
                              onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 transition-all dark:text-slate-200"
                              placeholder="Add a description"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <PrimaryButton
            title={isLoading ? "Uploading..." : "Upload All Files"}
            leftIcon={isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            type="Primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isLoading}
            className="min-w-[160px]"
          />
        </div>
      </div>
    </div>
  );
};

export default FilesUploadModal;
