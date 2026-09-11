import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useLocation, useParams } from "react-router-dom";
import { useGetAllProgramQuery } from "@/store/Api/ProgramApi/ProgramApi";
import {
  FileText,
  Download,
  Plus,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// RTK Query API Hooks
import {
  useGetEmployeeAllProjectsQuery,
} from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import {
  useGetProjectFilesByGroupQuery,
  useSubmitProjectFileMutation,
  useRejectFileMutation,
  usePublishFileMutation,
  useDeleteFileGroupMutation,
} from "@/store/Api/Files/FilesApi";
import { useEmployeeId } from "@/hooks/useEmployeeId";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSubmitReviewTrigger, clearResubmitTrigger } from "@/store/Slices/FileSlice/FileSlice";


// Reusable Components
import { Button } from "@/components/ui/button";


// Decomposed Child Components
import { ProgramProjectSelector } from "./Components/ProgramProjectSelector";
import { UploadModal } from "./Components/UploadModal";
import { FilePreviewModal } from "./Components/FilePreviewModal";
import { GroupPreviewModal } from "./Components/GroupPreviewModal";
import { SubmitReviewModal } from "./Components/SubmitReviewModal";
import { SuccessModal } from "./Components/SuccessModal";

// Types & Helpers
import { FileItem, GroupedFileItem } from "./types";
import { getFileExtension, getFileIcon } from "./utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const StaffEmployeeFiles = () => {
  const employeeId = useEmployeeId();
  const dispatch = useAppDispatch();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const { pathname } = useLocation();

  const isProjectReview = pathname.includes("project-review");
  const isManager = pathname.includes("staff-manager-panel") || pathname.includes("manager");

  // Selected Program and Project States from URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProgramId = searchParams.get("programId");
  const selectedProjectId = routeProjectId || searchParams.get("projectId");

  // Redux triggers from header buttons
  const { submitReviewTriggered, resubmitTriggered } = useAppSelector((state) => state.file);

  // Search & Filter
  const [searchQuery, _] = useState("");


  // Rejection modal states for manager review
  const [isManagerRejectOpen, setIsManagerRejectOpen] = useState(false);
  const [managerRejectNotes, setManagerRejectNotes] = useState("");
  const [managerRejectTarget, setManagerRejectTarget] = useState<"file" | "group">("file");
  const [rejectFileId, setRejectFileId] = useState<string | null>(null);
  const [rejectGroupId, setRejectGroupId] = useState<string | null>(null);

  // Dialog / Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetGroup, setUploadTargetGroup] = useState<{ id: string; title: string } | null>(null);
  const [resubmitFile, setResubmitFile] = useState<FileItem | null>(null);

  // File Previews
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewGroup, setPreviewGroup] = useState<GroupedFileItem | null>(null);

  // Submit/Resubmit Review Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<string | null>(null);


  // Fetch all programs
  const { data: allProgramsRes } = useGetAllProgramQuery({});

  const programs = useMemo(() => {
    const raw = allProgramsRes?.data?.data || allProgramsRes?.data || [];
    return Array.isArray(raw) ? raw.map((p: any) => ({
      id: p.id,
      name: p.programName || p.name || "Default Program",
    })) : [];
  }, [allProgramsRes]);

  // Fetch projects of the employee
  const { data: employeeProjectsRes } = useGetEmployeeAllProjectsQuery({
    employeeId: employeeId || "",
  });

  const projectsList = useMemo(() => {
    return employeeProjectsRes?.data?.projects?.data || [];
  }, [employeeProjectsRes]);

  // Filter projects belonging to the selected program
  const filteredProjectsList = useMemo(() => {
    if (!selectedProgramId) return [];
    return projectsList.filter((p: any) => {
      const pId = p.programId || p.program?.id;
      return pId === selectedProgramId;
    });
  }, [projectsList, selectedProgramId]);

  const selectedProject = useMemo(() => {
    return projectsList.find((p: any) => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  // Fetch Grouped Files of the Selected Project
  const {
    data: groupedFilesRes,
    isLoading: isGroupedFilesLoading,
    refetch: refetchGroupedFiles,
  } = useGetProjectFilesByGroupQuery(selectedProjectId as string, {
    skip: !selectedProjectId,
  });

  // Mutations
  const [submitProjectFile, { isLoading: isUploadingApi }] = useSubmitProjectFileMutation();
  const [rejectFile] = useRejectFileMutation();
  const [publishFile] = usePublishFileMutation();
  const [deleteFileGroup] = useDeleteFileGroupMutation();

  const apiGroups = useMemo(() => {
    return (groupedFilesRes?.data?.data || groupedFilesRes?.data || []) as any[];
  }, [groupedFilesRes]);

  // Combine API files and locally uploaded recent files
  const groupedFilesData: GroupedFileItem[] = useMemo(() => {
    const apiGroups: GroupedFileItem[] = groupedFilesRes?.data?.data || groupedFilesRes?.data || [];
    // Normalise all statuses to lowercase to match our type expectations
    return apiGroups.map((group) => ({
      ...group,
      groupInfo: {
        ...group.groupInfo,
        status: ((group.groupInfo as any).status || "").toLowerCase(),
      },
      files: group.files.map((file) => ({
        ...file,
        status: ((file.status || "pending").toLowerCase()) as "approved" | "pending" | "rejected" | "resubmitted",
        notes: (file as any).rejectedNote || file.notes || "",
      })),
    }));
  }, [groupedFilesRes]);

  // Filter grouped files by search query
  const filteredGroupedData = useMemo(() => {
    if (!searchQuery.trim()) return groupedFilesData;
    const query = searchQuery.toLowerCase();

    return groupedFilesData
      .map((group) => {
        const filteredFiles = group.files.filter(
          (file) =>
            file.filename?.toLowerCase().includes(query) ||
            file.description?.toLowerCase().includes(query)
        );
        return { ...group, files: filteredFiles };
      })
      .filter((group) => group.files.length > 0);
  }, [groupedFilesData, searchQuery]);

  // Listen to employee header buttons triggers from Redux
  // Sync previewGroup when data updates (e.g. after approve/reject)
  useEffect(() => {
    setPreviewGroup((prev) => {
      if (!prev) return prev;
      const updated = groupedFilesData.find((g) => g.groupInfo?.id === prev.groupInfo?.id);
      return updated ? updated : prev;
    });
  }, [groupedFilesData]);

  useEffect(() => {
    if (submitReviewTriggered) {
      if (!selectedProjectId) {
        toast.error("Please select a project first.");
        dispatch(clearSubmitReviewTrigger());
        return;
      }
      setIsResubmitting(false);
      setIsSubmitModalOpen(true);
      dispatch(clearSubmitReviewTrigger());
    }
  }, [submitReviewTriggered, selectedProjectId, dispatch]);

  useEffect(() => {
    if (resubmitTriggered) {
      if (!selectedProjectId) {
        toast.error("Please select a project first.");
        dispatch(clearResubmitTrigger());
        return;
      }
      setIsResubmitting(true);
      setIsSubmitModalOpen(true);
      dispatch(clearResubmitTrigger());
    }
  }, [resubmitTriggered, selectedProjectId, dispatch]);

  // Handle File Upload to Group
  const triggerGroupUpload = (groupId: string, groupTitle: string) => {
    setUploadTargetGroup({ id: groupId, title: groupTitle });
    setResubmitFile(null);
    setIsUploadOpen(true);
  };

  const handleResubmitClick = (file: FileItem, groupInfo: { id: string; groupTitle: string }) => {
    setResubmitFile(file);
    setUploadTargetGroup({ id: groupInfo.id, title: groupInfo.groupTitle });
    setIsUploadOpen(true);
  };

  const handleApproveFile = async (fileId: string) => {
    const toastId = toast.loading("Approving file...");
    try {
      await publishFile({ fileId }).unwrap();
      toast.success("File approved successfully", { id: toastId });
      refetchGroupedFiles();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to approve file", { id: toastId });
    }
  };

  const handleApproveGroup = async (groupId: string) => {
    const targetGroup = groupedFilesData.find((g) => g.groupInfo?.id === groupId);
    if (targetGroup) {
      const toastId = toast.loading("Approving folder group...");
      try {
        await Promise.all(
          targetGroup.files.map((file) => publishFile({ fileId: file.id }).unwrap())
        );
        toast.success("Folder group approved successfully", { id: toastId });
        refetchGroupedFiles();
      } catch (error: any) {
        console.error(error);
        toast.error(error?.data?.message || "Failed to approve folder group", { id: toastId });
      }
    } else {
      toast.error("Group not found");
    }
  };

  const triggerDeleteGroup = (groupId: string) => {
    setDeleteConfirmGroupId(groupId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteGroup = async () => {
    if (!deleteConfirmGroupId) return;
    const toastId = toast.loading("Deleting folder group...");
    setIsDeleteConfirmOpen(false);
    try {
      await deleteFileGroup({ id: deleteConfirmGroupId }).unwrap();
      toast.success("Folder group deleted successfully", { id: toastId });
      refetchGroupedFiles();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to delete folder group", { id: toastId });
    }
  };

  const handleRejectFileClick = (file: FileItem) => {
    setRejectFileId(file.id);
    setManagerRejectTarget("file");
    setManagerRejectNotes("");
    setIsManagerRejectOpen(true);
  };

  const handleRejectGroupClick = (groupInfo: any) => {
    setRejectGroupId(groupInfo.id);
    setManagerRejectTarget("group");
    setManagerRejectNotes("");
    setIsManagerRejectOpen(true);
  };

  const handleConfirmManagerReject = async () => {
    if (managerRejectTarget === "file" && rejectFileId) {
      const toastId = toast.loading("Rejecting file...");
      try {
        await rejectFile({ fileId: rejectFileId, rejectedNote: managerRejectNotes }).unwrap();
        toast.success("File rejected successfully", { id: toastId });
        refetchGroupedFiles();
      } catch (error: any) {
        console.error(error);
        toast.error(error?.data?.message || "Failed to reject file", { id: toastId });
      }
    } else if (managerRejectTarget === "group" && rejectGroupId) {
      const targetGroup = groupedFilesData.find((g) => g.groupInfo?.id === rejectGroupId);
      if (targetGroup) {
        const toastId = toast.loading("Rejecting folder group...");
        try {
          // Reject all files in the group with the notes
          await Promise.all(
            targetGroup.files.map((f) =>
              rejectFile({ fileId: f.id, rejectedNote: managerRejectNotes }).unwrap()
            )
          );
          toast.success("Folder group rejected successfully", { id: toastId });
          refetchGroupedFiles();
        } catch (error: any) {
          console.error(error);
          toast.error(error?.data?.message || "Failed to reject folder group", { id: toastId });
        }
      } else {
        toast.error("Group not found");
      }
    }
    setIsManagerRejectOpen(false);
  };

  const handleUploadSubmit = async (
    file: File,
    title: string,
    description: string,
    duration?: number,
    resubmitFileId?: string
  ) => {
    if (!selectedProjectId || !uploadTargetGroup) return;

    const formData = new FormData();
    formData.append("file", file);

    const fileExt = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : "";
    let finalFilename = file.name;
    if (title) {
      if (fileExt && !title.toLowerCase().endsWith(fileExt.toLowerCase())) {
        finalFilename = `${title}${fileExt}`;
      } else {
        finalFilename = title;
      }
    }
    formData.append("filename", finalFilename);
    if (duration !== undefined && duration !== null) {
      formData.append("duration", String(duration));
    }
    if (description) {
      formData.append("description", description);
    }

    const toastId = toast.loading(resubmitFileId ? "Resubmitting file..." : "Uploading file to group...");
    try {
      await submitProjectFile({
        projectId: selectedProjectId,
        groupId: uploadTargetGroup.id,
        body: formData,
      }).unwrap();
      refetchGroupedFiles();

      if (resubmitFileId) {
        toast.success("File resubmitted successfully.", { id: toastId });
      } else {
        toast.success("File uploaded to group successfully", { id: toastId });
      }
      setIsUploadOpen(false);
      setResubmitFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to upload file", { id: toastId });
    }
  };

  // Handle Submit Review Notes
  const handleSubmitReview = (_notes: string) => {
    setIsSubmittingReview(true);

    setTimeout(() => {
      setIsSubmittingReview(false);
      setIsSubmitModalOpen(false);
      setIsSuccessModalOpen(true);
      toast.success(
        isResubmitting
          ? "Resubmission details sent successfully!"
          : "Review details submitted successfully!"
      );
    }, 1500);
  };

  const handleDownload = (file: FileItem) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Started download for ${file.filename}`);
  };

  return (
    <div className=" text-slate-900 dark:text-slate-100">
      {/* Unified Program & Project Selector */}
      {(!selectedProjectId || (!isProjectReview && !selectedProgramId)) && (
        <ProgramProjectSelector
          selectedProgramId={selectedProgramId}
          selectedProjectId={selectedProjectId}
          programs={programs}
          filteredProjectsList={filteredProjectsList}
          onProgramChange={(val) => {
            setSearchParams(val ? { programId: val } : {});
          }}
          onProjectChange={(val) => {
            if (val) {
              setSearchParams({ programId: selectedProgramId || "", projectId: val });
            }
          }}
        />
      )}

      {/* Files Dashboard View */}
      {selectedProjectId && (isProjectReview || selectedProgramId) && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Grouped Table View */}
          {isGroupedFilesLoading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : filteredGroupedData.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-12 text-center min-h-[calc(100vh-20rem)] flex items-center justify-center flex-col">
              <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              {apiGroups.length === 0 ? (
                <>
                  <h3 className="text-lg mb-2 font-semibold">No Upload Folders Found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto font-normal">
                    No media folders have been created for this project yet. Please contact your manager or client to set up a media widget before uploading submissions.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg mb-2 font-semibold">No Files Found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-normal">
                    No files match your current search query.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              {filteredGroupedData.map((group) => {
                const groupId = group.groupInfo?.id || "general";
                const groupTitle = group.groupInfo?.groupTitle || "General Documents";
                const fileCount = group.files.length;
                const isRejectedGroup = group.groupInfo && (group.groupInfo as any).status === "rejected";

                return (
                  <div
                    key={groupId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-6 space-y-4"
                  >
                    {/* Group Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-855">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-955 dark:text-white font-semibold text-lg">
                          {groupTitle}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-normal">
                          {fileCount} File{fileCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isProjectReview && isManager && group.groupInfo && (
                          <>
                            {(group.groupInfo as any).status !== "approved" && (group.groupInfo as any).status !== "rejected" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveGroup(group.groupInfo!.id)}
                                  className="h-9 px-3 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 rounded-md cursor-pointer font-normal"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" /> Approve Group
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectGroupClick(group.groupInfo)}
                                  className="h-9 px-3 text-xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 rounded-md cursor-pointer font-normal"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" /> Reject Group
                                </Button>
                              </>
                            )}
                          </>
                        )}
                        {!isManager && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerGroupUpload(groupId, groupTitle)}
                            className="h-10 px-4 border border-gray-200 dark:border-slate-800 text-sm cursor-pointer rounded-md font-normal text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Upload File
                          </Button>
                        )}
                        {group.groupInfo && ((isRejectedGroup && !isManager) || (!isRejectedGroup && isManager)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerDeleteGroup(group.groupInfo!.id)}
                            className="h-9 px-3 text-xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 rounded-md cursor-pointer font-normal"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Group
                          </Button>
                        )}
                        {fileCount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setPreviewGroup(group);
                            }}
                            className="h-10 px-4 text-sm text-[#356DF0] hover:text-[#356DF0]/80 dark:text-[#356DF0] dark:hover:text-[#356DF0]/80 cursor-pointer font-normal"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Preview Group
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Folder Group Rejection Warning Box */}
                    {group.groupInfo && (group.groupInfo as any).status === "rejected" && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 rounded-md text-xs text-red-600 dark:text-red-400 font-normal mb-3">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                        <p className="font-semibold block">Folder Group Rejected:</p>
                        <p className="">{(group.groupInfo as any).notes || "All files in this folder group have been rejected."}</p>
                      </div>
                    )}

                    {/* Table for this specific group */}
                    <div className="overflow-x-auto border border-slate-100 dark:border-slate-855 rounded-md">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-55 dark:bg-slate-955 border-b border-slate-100 dark:border-slate-855">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              File Name & Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              File Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              Upload Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              Upload Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              File Size
                            </th>
                            <th className="px-6 py-3 text-right text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-normal">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-855">
                          {group.files.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-6 text-center text-xs text-slate-400 italic font-normal">
                                No files uploaded to this group. Click 'Upload File' to add documents.
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
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        {getFileIcon(file.filename, file.fileType)}
                                      </div>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-slate-900 dark:text-white truncate block max-w-[200px] font-normal cursor-pointer">
                                            {file.filename}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2.5 py-1 text-xs rounded shadow-md z-50">
                                          <p className="break-all">{file.filename}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate font-normal">
                                    {file.description || "-"}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] uppercase px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 font-normal">
                                      {ext}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className={cn(
                                        "text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1",
                                        file.status === "approved" && "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
                                        file.status === "pending" && "bg-amber-100 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400",
                                        file.status === "rejected" && "bg-rose-100 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400",
                                        file.status === "resubmitted" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                      )}>
                                        {file.status ? file.status.charAt(0).toUpperCase() + file.status.slice(1) : "Pending"}
                                      </span>
                                      {file.status === "rejected" && file.notes && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors">
                                              <AlertCircle className="w-4 h-4" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2.5 py-1 text-xs rounded shadow-md z-50">
                                            <p>{`Rejection Reason: ${file.notes}`}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-normal">
                                    {uploadTime ? format(new Date(uploadTime), "dd-MM-yyyy") : "-"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-normal">
                                    {uploadTime ? format(new Date(uploadTime), "hh:mm:ss a") : "-"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-normal">
                                    {file.size ? (file.size / 1024).toFixed(1) + " KB" : "-"}
                                  </td>
                                  <td className="px-6 py-4 text-right font-normal">
                                    <div className="flex items-center justify-end gap-2">
                                      {isProjectReview && isManager ? (
                                        <>
                                          {file.status !== "approved" && file.status !== "rejected" && (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => handleApproveFile(file.id)}
                                                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded transition-colors cursor-pointer"
                                                title="Approve file"
                                              >
                                                <Check className="w-4 h-4" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleRejectFileClick(file)}
                                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded transition-colors cursor-pointer"
                                                title="Reject file"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        file.status === "rejected" && (
                                          <button
                                            type="button"
                                            onClick={() => handleResubmitClick(file, group.groupInfo)}
                                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded transition-colors cursor-pointer"
                                            title="Resubmit file"
                                          >
                                            <RefreshCw className="w-4 h-4" />
                                          </button>
                                        )
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setPreviewFile(file)}
                                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors cursor-pointer"
                                        title="Preview file"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDownload(file)}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded transition-colors cursor-pointer"
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upload File to Group Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onOpenChange={(open) => {
          setIsUploadOpen(open);
          if (!open) setResubmitFile(null);
        }}
        uploadTargetGroup={uploadTargetGroup}
        resubmitFile={resubmitFile}
        isUploading={isUploadingApi}
        onUpload={handleUploadSubmit}
      />

      {/* Individual File Preview Modal */}
      <FilePreviewModal
        previewFile={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />

      {/* Group Preview Slideshow Modal */}
      <GroupPreviewModal
        previewGroup={previewGroup}
        onClose={() => setPreviewGroup(null)}
        onDownload={handleDownload}
        isManager={isManager}
        isProjectReview={isProjectReview}
        onApproveFile={handleApproveFile}
        onRejectFile={handleRejectFileClick}
        onApproveGroup={handleApproveGroup}
        onRejectGroup={handleRejectGroupClick}
      />

      {/* Submit/Resubmit review modal */}
      <SubmitReviewModal
        isOpen={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        isResubmitting={isResubmitting}
        selectedProjectName={selectedProject?.name || "N/A"}
        recentUploadsCount={groupedFilesData.reduce((acc, group) => acc + group.files.filter(f => f.status === "pending" || f.status === "resubmitted").length, 0)}
        isSubmittingReview={isSubmittingReview}
        onSubmitReview={handleSubmitReview}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        selectedProjectName={selectedProject?.name || ""}
      />

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col gap-0 animate-in fade-in duration-200">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              Delete Folder Group
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-normal mt-2">
              Are you sure you want to delete this folder group? This action will permanently remove all documents associated with this group and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-2 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/50 mt-4 pt-4">
            <Button
              variant="outline"
              className="rounded-md h-10 px-4 text-sm font-normal border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-md h-10 px-4 text-sm font-normal bg-red-600 hover:bg-red-750 text-white border border-red-600 cursor-pointer"
              onClick={handleConfirmDeleteGroup}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manager Rejection Dialog */}
      <Dialog open={isManagerRejectOpen} onOpenChange={setIsManagerRejectOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {managerRejectTarget === "group" ? "Reject Folder Group" : "Reject File"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              {managerRejectTarget === "group"
                ? "Please provide the reason for rejecting all files in this folder group."
                : "Please provide the reason for rejecting this document."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-2 space-y-4">
            <textarea
              className="w-full h-24 p-3 border border-slate-200 dark:border-slate-800 rounded-md text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Enter rejection notes..."
              value={managerRejectNotes}
              onChange={(e) => setManagerRejectNotes(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="rounded-md" onClick={() => setIsManagerRejectOpen(false)}>Cancel</Button>
              <Button className="rounded-md bg-red-600 hover:bg-red-750 text-white" onClick={handleConfirmManagerReject}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffEmployeeFiles;
