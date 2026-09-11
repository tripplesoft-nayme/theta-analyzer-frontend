import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  Eye,
  FolderOpen,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetProjectFilesByGroupQuery } from "@/store/Api/Files/FilesApi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getFileExtension, getFileIcon } from "@/pages/staffEmployee/Files/utils";
import { GroupedFileItem, FileItem } from "@/pages/staffEmployee/Files/types";
import { GroupPreviewModal } from "@/pages/staffEmployee/Files/Components/GroupPreviewModal";
import { FilePreviewModal } from "@/pages/staffEmployee/Files/Components/FilePreviewModal";

const FileTab: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: groupedFilesRes, isLoading } = useGetProjectFilesByGroupQuery(
    projectId as string,
    { skip: !projectId }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewGroup, setPreviewGroup] = useState<GroupedFileItem | null>(null);

  const groupedFilesData: GroupedFileItem[] = useMemo(() => {
    const apiGroups: GroupedFileItem[] =
      groupedFilesRes?.data?.data || groupedFilesRes?.data || [];
    return apiGroups.map((group) => ({
      ...group,
      groupInfo: {
        ...group.groupInfo,
        status: ((group.groupInfo as any).status || "").toLowerCase(),
      },
      files: group.files.map((file) => ({
        ...file,
        status: (file.status || "pending").toLowerCase() as
          | "approved"
          | "pending"
          | "rejected"
          | "resubmitted",
        notes: (file as any).rejectedNote || file.notes || "",
      })),
    }));
  }, [groupedFilesRes]);

  const uniqueFileTypes = useMemo(() => {
    const types = new Set<string>();
    groupedFilesData.forEach((group) => {
      group.files.forEach((file) => {
        const ext = getFileExtension(file.filename, file.fileType);
        if (ext && ext !== "unknown") types.add(ext);
      });
    });
    return Array.from(types).sort();
  }, [groupedFilesData]);

  const filteredGroupedData = useMemo(() => {
    if (!searchQuery.trim() && !selectedFileType) return groupedFilesData;
    return groupedFilesData
      .map((group) => ({
        ...group,
        files: group.files.filter((file) => {
          const matchesSearch =
            !searchQuery ||
            file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.description?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesType =
            !selectedFileType ||
            getFileExtension(file.filename, file.fileType) === selectedFileType;
          return matchesSearch && matchesType;
        }),
      }))
      .filter((group) => group.files.length > 0);
  }, [groupedFilesData, searchQuery, selectedFileType]);

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleDownloadFile = (file: FileItem) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFiles = groupedFilesData.reduce((acc, g) => acc + g.files.length, 0);

  return (
    <div className="space-y-4 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Files</h2>
          {totalFiles > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
              {totalFiles} files
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 dark:text-white placeholder:text-slate-400 w-52 font-normal"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="appearance-none pl-9 pr-8 h-9 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 dark:text-slate-300 cursor-pointer font-normal"
            >
              <option value="">All Types</option>
              {uniqueFileTypes.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredGroupedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No files found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-normal">
            {searchQuery || selectedFileType
              ? "Try adjusting your search or filter."
              : "No file groups have been uploaded yet."}
          </p>
        </div>
      )}

      {/* Groups */}
      {!isLoading &&
        filteredGroupedData.map((group) => {
          const groupId = group.groupInfo?.id;
          const isCollapsed = collapsedGroups.has(groupId);
          const fileCount = group.files.length;

          return (
            <div
              key={groupId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(groupId)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {group.groupInfo?.groupTitle || "Unnamed Group"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium shrink-0">
                    {fileCount} {fileCount === 1 ? "file" : "files"}
                  </span>
                </div>
                {fileCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewGroup(group)}
                    className="flex items-center gap-1.5 h-8 px-3 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer font-normal"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Group
                  </button>
                )}
              </div>

              {/* Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          File Name & Title
                        </th>
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          Description
                        </th>
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          File Type
                        </th>
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          Upload Date
                        </th>
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          Upload Time
                        </th>
                        <th className="px-5 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          File Size
                        </th>
                        <th className="px-5 py-3 text-right text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {group.files.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-6 text-center text-xs text-slate-400 italic font-normal"
                          >
                            No files in this group.
                          </td>
                        </tr>
                      ) : (
                        group.files.map((file) => {
                          const ext = getFileExtension(file.filename, file.fileType);
                          const uploadTime = file.uploadAt || file.createdAt;
                          return (
                            <tr
                              key={file.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    {getFileIcon(file.filename, file.fileType)}
                                  </div>
                                  <span
                                    className="text-sm text-slate-900 dark:text-white truncate block max-w-[200px] font-normal cursor-pointer"
                                    title={file.filename}
                                  >
                                    {file.filename}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate font-normal">
                                {file.description || "-"}
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-[10px] uppercase px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 font-normal">
                                  {ext}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    "text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center",
                                    file.status === "approved" &&
                                    "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
                                    file.status === "pending" &&
                                    "bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
                                    file.status === "rejected" &&
                                    "bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400",
                                    file.status === "resubmitted" &&
                                    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  )}
                                >
                                  {file.status
                                    ? file.status.charAt(0).toUpperCase() + file.status.slice(1)
                                    : "Pending"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-normal">
                                {uploadTime ? format(new Date(uploadTime), "dd-MM-yyyy") : "-"}
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-normal">
                                {uploadTime ? format(new Date(uploadTime), "hh:mm:ss a") : "-"}
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-normal">
                                {file.size ? (file.size / 1024).toFixed(1) + " KB" : "-"}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile(file)}
                                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                                    title="Preview file"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(file)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors cursor-pointer"
                                    title="Download file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

      {/* File Preview Modal */}
      <FilePreviewModal
        previewFile={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownloadFile}
      />

      {/* Group Preview Modal (read-only, no manager actions) */}
      <GroupPreviewModal
        previewGroup={previewGroup}
        onClose={() => setPreviewGroup(null)}
        onDownload={handleDownloadFile}
      />
    </div>
  );
};

export default FileTab;
