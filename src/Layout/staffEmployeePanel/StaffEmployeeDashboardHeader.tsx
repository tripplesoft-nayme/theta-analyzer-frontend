/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  cloneElement,
  useState,
  useMemo,
  isValidElement,
  ReactElement,
  useRef,
  useEffect,
} from "react";
import {
  Bell,
  Download,
  Eye,
  FileText,
  Upload,
  List,
  LayoutGrid,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  useLocation,
  Link,
  useNavigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import PrimaryButton from "@/Common/PrimaryButton";
import { useHeaderContext } from "./StaffEmployeeHeaderContext";
import { getStaffEmployeeSidebarItems } from "./staffEmployeeSidebarMenuItems";
import { useGetUser } from "@/hooks/useGetUser";
import { useGetNotificationsQuery } from "@/store/Api/NotificationApi/NotificationApi";
import StaffEmployeeGlobalSearch from "@/pages/staffEmployee/Components/StaffEmployeeGlobalSearch";
import NotificationModal from "@/Common/NotificationModal";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ThemeToggle } from "@/Common/ThemeToggle";
import { useGetProgramByIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import {
  useGetSubmissionPreviewQuery,
  useDeleteEmployeeSubmissionMutation,
  useGetEmployeeSubmissionByIdQuery,
  useUpdateEmployeeSubmissionDataMutation,
} from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import { useUpdateSubmissionStatusMutation } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { useGetAllTheLeafChartQuery } from "@/store/Api/ChartApi/ChartApi";
import { processExcelFile } from "@/utils/excelProcessing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const StaffEmployeeDashboardHeader = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const adminNotesRef = useRef<HTMLTextAreaElement>(null);
  const [noteError, setNoteError] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>("::1");
  const [isResubmitting, setIsResubmitting] = useState(false);
  const headerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) setIpAddress(data.ip);
      })
      .catch(() => { });
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/staff-employee-panel/project-review");
  };
  const { submissionId: routeSubmissionId, projectId: routeProjectId } =
    useParams<{
      submissionId: string;
      projectId: string;
    }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  // Robustly extract projectId for all scenarios
  const projectId = useMemo(() => {
    // 1. From route params
    if (routeProjectId) return routeProjectId;

    // 2. From URL match logic
    const detailsMatch = currentPath.match(/\/project-details\/([^/]+)/);
    if (detailsMatch?.[1]) return detailsMatch[1];

    const previewMatch = currentPath.match(/\/submission-preview\/[^/]+\/([^/]+)/);
    if (previewMatch?.[1]) return previewMatch[1];

    const reviewMatch = currentPath.match(/\/project-review\/[^/]+\/([^/]+)/);
    if (reviewMatch?.[1]) return reviewMatch[1];

    // 3. Fallback to routeProjectId (already checked, but for completeness)
    return routeProjectId || null;
  }, [currentPath, routeProjectId]);

  const isOnUploadSubmission = currentPath.includes("/upload-submission");
  const isOnSubmissionPreview = currentPath.includes("/submission-preview");

  // API Hooks
  // const [createEmployeeSubmission, { isLoading: isSubmitting }] =
  //   useCreateEmployeeSubmissionMutation();
  const [updateSubmissionStatus] = useUpdateSubmissionStatusMutation();
  const [deleteSubmission] = useDeleteEmployeeSubmissionMutation();

  const { data: projectData } = useGetProjectByIdQuery(projectId as string, {
    skip: !projectId,
  });

  const fileProgramId = searchParams.get("programId");
  const fileProjectId = searchParams.get("projectId");

  const { data: fileProgramData } = useGetProgramByIdQuery(fileProgramId as string, {
    skip: !fileProgramId || currentPath !== "/staff-employee-panel/files",
  });
  const { data: fileProjectData } = useGetProjectByIdQuery(fileProjectId as string, {
    skip: !fileProjectId || currentPath !== "/staff-employee-panel/files",
  });

  const { data: submissionPreviewData, isLoading: isSubmissionLoading } =
    useGetSubmissionPreviewQuery(
      {
        submittedId: routeSubmissionId as string,
        projectId: projectId as string,
      },
      {
        skip: !routeSubmissionId || !projectId,
      },
    );

  const { data: submissionDetailData } = useGetEmployeeSubmissionByIdQuery(
    routeSubmissionId as string,
    {
      skip: !routeSubmissionId,
    }
  );

  const { data: leafChartsData } = useGetAllTheLeafChartQuery(projectId as string, {
    skip: !projectId,
  });

  const allLeafCharts = useMemo(
    () => (leafChartsData?.data || []).flatMap((g: any) => g.charts || []),
    [leafChartsData],
  );

  const resolveChartId = (idSuffix: string): string => {
    if (!idSuffix) return idSuffix;
    const matched = allLeafCharts.find(
      (c: any) => c.id === idSuffix || c.id?.slice(-8) === idSuffix,
    );
    return matched?.id ?? idSuffix;
  };

  const [updateEmployeeSubmissionData, { isLoading: isUpdatingSubmissionData }] =
    useUpdateEmployeeSubmissionDataMutation();

  const handleTriggerHeaderUpload = () => {
    headerFileInputRef.current?.click();
  };

  const handleHeaderFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!routeSubmissionId) {
      toast.error("Submission ID not found.");
      return;
    }

    const toastId = toast.loading("Processing excel file...");
    try {
      const processedSheets = await processExcelFile({
        file: selectedFile,
        datasetDate: new Date(),
        resolveId: resolveChartId,
      });

      if (processedSheets.length === 0) {
        toast.error("No valid sheets found to update charts.", { id: toastId });
        return;
      }

      const elements = processedSheets.map((item) => ({
        chartId: item.id,
        xAxis: item.xAxis,
        yAxis: "",
        zAxis: "",
        datasettime: item.datasettime,
      }));

      toast.loading("Updating submission data...", { id: toastId });
      await updateEmployeeSubmissionData({
        submitionId: routeSubmissionId,
        data: {
          ipAddress,
          elements,
        },
      }).unwrap();

      toast.success("Submission data updated successfully! You can now review changes.", { id: toastId });
    } catch (error: any) {
      console.error("Header file processing error:", error);
      toast.error(error?.message || error?.data?.message || "Error processing file.", { id: toastId });
    } finally {
      if (headerFileInputRef.current) {
        headerFileInputRef.current.value = "";
      }
    }
  };

  const projectName =
    projectData?.data?.project?.name || projectData?.data?.name;
  const programId =
    projectData?.data?.project?.program?.id ??
    projectData?.data?.project?.programId ??
    null;

  const handleCancelSubmission = async () => {
    if (routeSubmissionId) {
      try {
        await deleteSubmission(routeSubmissionId).unwrap();
        toast.success("Submission cancelled and deleted.");
        navigate("/staff-employee-panel/upload-submission");
      } catch (error) {
        console.error("Failed to delete submission:", error);
        toast.error("Error cancelling submission.");
      }
    }
  };

  const handleSubmitReview = async () => {
    const adminNotes = adminNotesRef.current?.value || "";
    if (!adminNotes.trim()) {
      setNoteError(true);
      return;
    }

    try {
      const statusToSet = isResubmitting ? "RESUBMITTED" : "PENDING";
      await updateSubmissionStatus({
        id: routeSubmissionId as string,
        status: {
          status: statusToSet,
          information: adminNotes,
        },
      }).unwrap();

      setIsSubmitModalOpen(false);
      if (adminNotesRef.current) adminNotesRef.current.value = "";
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error?.data?.message || "Failed to submit review.");
    }
  };

  const tabs = [
    { id: "gantt", name: "Gantt", icon: List },
    { id: "sheet", name: "Sheet", icon: LayoutGrid },
    { id: "dashboard", name: "Dashboard", icon: Clock },
    { id: "files", name: "Files", icon: FileText },
  ];

  const { breadcrumb } = useHeaderContext();
  const { data: notificationData } = useGetNotificationsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const unreadCount = useMemo(() => {
    const notifications = notificationData?.data || [];
    return notifications.filter((n: any) => n.isRead === false || n.status === "new").length;
  }, [notificationData]);

  const isOnProjectDetails = currentPath.includes("/project-details/");
  const isOnProjectReview = currentPath.includes("/project-review/");
  const showTabs = isOnProjectDetails || isOnProjectReview || isOnSubmissionPreview;

  const { data: programData } = useGetProgramByIdQuery(programId as string, {
    skip: !programId,
  });
  const programName = programData?.data?.name || projectData?.data?.project?.program?.name;

  const { handleDownloadCharts } = useChartDownload({
    projectId: projectId as string,
    targetProgramId: programId as string,
    projectName,
    programName,
  });

  // ─── Navigate to Upload Submission (with or without IDs) ───────────────────
  const handleUploadSubmission = () => {
    if (projectId && programId) {
      navigate(
        `/staff-employee-panel/upload-submission?projectId=${projectId}&programId=${programId}`,
      );
    } else {
      navigate("/staff-employee-panel/upload-submission");
    }
  };

  // ─── Sidebar / breadcrumb ──────────────────────────────────────────────────
  const allRoutes = useMemo(
    () => getStaffEmployeeSidebarItems().flatMap((group) => group.items),
    [],
  );

  const { name } = useGetUser();

  const currentRouteObj = useMemo(() => {
    let found = allRoutes.find((r) => r.path === currentPath);
    if (!found) {
      for (const route of allRoutes) {
        if (route.children) {
          const childMatch = route.children.find(
            (child) => `${route.path}/${child.path}` === currentPath,
          );
          if (childMatch) {
            found = childMatch;
            break;
          }
        }
      }
    }
    if (!found) {
      if (currentPath.endsWith("/profile")) {
        return { name: "Profile", header: "Profile", description: "View and manage your profile details", path: "/staff-employee-panel/profile" };
      }
      if (currentPath.endsWith("/notifications")) {
        return { name: "Notifications", header: "Notifications", description: "Manage and view all your notifications", path: "/staff-employee-panel/notifications" };
      }
    }
    return found;
  }, [allRoutes, currentPath]);

  const breadcrumbData = useMemo(() => {
    const items: Array<{
      label: string;
      path?: string;
      icon?: React.ReactNode;
      isPage?: boolean;
    }> = [{ label: "Home", path: "/staff-employee-panel" }];

    let currentRoute = allRoutes.find((r) => r.path === currentPath);
    if (!currentRoute && currentRouteObj) {
      currentRoute = currentRouteObj;
    }

    if (!currentRoute) {
      for (const route of allRoutes) {
        if (route.children) {
          const childMatch = route.children.find(
            (child) => `${route.path}/${child.path}` === currentPath,
          );
          if (childMatch) {
            items.push({
              label: route.name as string,
              path: route.path as string,
              icon: route.icon,
            });
            items.push({ label: childMatch.name as string, isPage: true });
            return items;
          }
        }
      }
    }

    if (currentRoute) {
      const isPage = currentPath === "/staff-employee-panel/files" ? !fileProgramId : false;
      items.push({
        label: currentRoute.name as string,
        path: currentRoute.path as string,
        icon: currentRoute.icon,
        isPage,
      });
    }

    // Extra breadcrumb when on project details
    if (isOnProjectDetails) {
      items.push({
        label: "Projects",
        path: "/staff-employee-panel/projects",
      });

      if (projectName) {
        items.push({ label: projectName, isPage: true });
      }
    }
    if (isOnProjectReview) {
      items.push({
        label: "Project Review",
        path: "/staff-employee-panel/project-review",
      });

      if (projectName) {
        items.push({ label: projectName, isPage: true });
      }
    }

    // New logic for file upload flow
    if (currentPath.includes("/upload-submission")) {
      items.push({ label: "File Upload", isPage: true });
    }

    if (currentPath.includes("/submission-preview")) {
      items.push({
        label: "File Upload",
        path: "/staff-employee-panel/upload-submission",
      });
      items.push({ label: "Preview", isPage: true });
    }

    if (currentPath === "/staff-employee-panel/files") {
      if (fileProjectId) {
        const projName = fileProjectData?.data?.project?.name || fileProjectData?.data?.name || "Project";
        items.push({
          label: projName,
          isPage: true,
        });
      }
    }

    return items;
  }, [
    currentPath,
    allRoutes,
    isOnProjectDetails,
    projectName,
    isOnProjectReview,
    fileProgramId,
    fileProjectId,
    fileProgramData,
    fileProjectData,
  ]);

  // ── Conditional button visibility ────────────────────────────────────────
  // These paths show the legacy standalone preview/save-draft (project builder page)
  const previewButtonPaths = ["/staff-employee-panel/project-builder"];

  // ── Status badge colour helper ────────────────────────────────────────────
  const statusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "live") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    if (s === "draft") return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    if (s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    if (s === "rejected" || s === "revision") return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    if (s === "resubmitted") return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  };

  const projectStatus = projectData?.data?.project?.status;

  return (
    <div>
      <input
        type="file"
        ref={headerFileInputRef}
        onChange={handleHeaderFileChange}
        accept=".csv,.xls,.xlsx"
        className="hidden"
      />
      <div className="flex flex-col lg:flex-row items-center py-5 justify-between gap-4 lg:gap-0 h-auto lg:h-25">
        <div className="flex flex-row items-center justify-between w-full gap-4 lg:gap-2 relative">
          <div className="flex items-center gap-4 w-auto lg:flex-1 min-w-0">
            <SidebarTrigger className="md:hidden shrink-0" />
            <div className="min-w-0">
              {(isOnProjectDetails || isOnProjectReview) && projectName ? (
                <div>
                  <h1 className="text-[28px] text-wrap font-semibold text-primary-text dark:text-slate-100 leading-tight inline items-center">
                    <span className="mr-2">{projectName}</span>
                    {projectStatus && (
                      <span
                        className={cn(
                          "inline-block align-middle px-3 py-0.5 rounded-full text-[10px] font-semibold capitalize transition-colors",
                          statusColor(projectStatus)
                        )}
                      >
                        {projectStatus}
                      </span>
                    )}
                  </h1>
                </div>
              ) : (
                <>
                  <h1 className="text-[28px] font-semibold text-primary-text dark:text-slate-100 truncate">
                    {currentPath === "/staff-employee-panel"
                      ? `Welcome, ${name || ""} 👋`
                      : (currentPath === "/staff-employee-panel/files" && fileProjectId)
                        ? (fileProjectData?.data?.project?.name || fileProjectData?.data?.name || "Project Files")
                        : (currentRouteObj as any)?.header ||
                        (currentRouteObj as any)?.name ||
                        "Dashboard"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400 dark:text-slate-500">{breadcrumb}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:flex w-fit flex justify-center mt-2 lg:mt-0 relative group px-0 lg:px-4 hidden lg:flex-1">
            {showTabs ? (
              <div className="w-full grid grid-cols-4 bg-white dark:bg-slate-900 items-center border border-gray-200 dark:border-slate-800 rounded-lg gap-1 p-1 shadow-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("tab", tab.id);
                        setSearchParams(params, { state: location.state });
                      }}
                      className={`flex items-center justify-center gap-2 px-2 py-2.5 text-sm font-medium transition-all cursor-pointer rounded-lg ${isActive
                        ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="hidden sm:inline truncate">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1">
                <StaffEmployeeGlobalSearch />
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-3 relative w-auto lg:flex-1 min-w-0 mt-0">
            <ThemeToggle />
            {/* Notifications */}
            <div className="relative">
              <PrimaryButton
                leftIcon={<Bell className="size-5" />}
                type={"Outline"}
                onClick={() => setIsOpen(true)}
                tooltip="Notifications"
                className="h-12 w-12 p-0 flex items-center justify-center shrink-0"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 pointer-events-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <NotificationModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />

            {/* ── Project-builder-only buttons ── */}
            {previewButtonPaths.includes(currentPath) && (
              <PrimaryButton
                leftIcon={<Eye className="text-2xl" />}
                title="Preview"
                type={"Outline"}
                tooltip="Preview Page"
                onClick={() => console.log("preview clicked")}
              />
            )}

            {/* ── Upload Submission (always visible except on project-details where it appears below) ── */}
            {!isOnProjectDetails &&
              !isOnProjectReview &&
              !isOnUploadSubmission &&
              !isOnSubmissionPreview &&
              currentPath !== "/staff-employee-panel/files" && (
                <PrimaryButton
                  leftIcon={<Download className="text-2xl" />}
                  title="Upload Submission"
                  type="Primary"
                  tooltip="Upload Submission"
                  onClick={handleUploadSubmission}
                />
              )}

            {/* ── Files Page review/resubmit buttons ── */}
            {/* {currentPath === "/staff-employee-panel/files" && fileProjectId && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <PrimaryButton
                  title="Submit For Review"
                  type="Primary"
                  tooltip="Submit For Review"
                  onClick={() => {
                    dispatch(triggerSubmitReview());
                  }}
                />
                <PrimaryButton
                  title="Resubmit"
                  type="Primary"
                  tooltip="Resubmit"
                  onClick={() => {
                    dispatch(triggerResubmit());
                  }}
                />
              </div>
            )} */}

            {/* ── Submit & Cancel Buttons (Only on Preview Page) ── */}
            {isOnSubmissionPreview && (
              <div className="flex items-center gap-2">
                <PrimaryButton
                  leftIcon={<XCircle className="size-5" />}
                  title="Cancel"
                  type="Outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 h-12"
                  tooltip="Cancel"
                  onClick={handleCancelSubmission}
                />
                <PrimaryButton
                  title="Submit For Review"
                  type="Primary"
                  tooltip="Submit For Review"
                  onClick={() => {
                    setIsSubmitModalOpen(true);
                    setNoteError(false);
                  }}
                />
              </div>
            )}

            {(isOnProjectDetails || isOnProjectReview) && !isOnSubmissionPreview && (() => {
              const statusFromState = location.state?.status?.toUpperCase();
              const statusFromPreview = submissionPreviewData?.data?.status?.toUpperCase();
              const statusFromDetail = submissionDetailData?.data?.status?.toUpperCase();
              const isRejected =
                statusFromState === "REJECTED" ||
                statusFromPreview === "REJECTED" ||
                statusFromDetail === "REJECTED";

              return (
                <>
                  {/* Download Charts */}
                  <PrimaryButton
                    leftIcon={<Upload />}
                    // className="bg-green-700 hover:bg-green-800"
                    type="Primary"
                    tooltip="Download Charts"
                    onClick={handleDownloadCharts}
                  />

                  {/* Upload Submission or Resubmit */}
                  {isOnProjectReview && isRejected ? (
                    <>
                      <PrimaryButton
                        leftIcon={<Download className="text-2xl" />}
                        type="Primary"
                        tooltip="Upload Submission"
                        disabled={isUpdatingSubmissionData}
                        onClick={handleTriggerHeaderUpload}
                      />
                      <PrimaryButton
                        leftIcon={<Download className="text-2xl" />}
                        title="Resubmit"
                        type="Primary"
                        tooltip="Resubmit"
                        onClick={() => {
                          setIsResubmitting(true);
                          setIsSubmitModalOpen(true);
                          setNoteError(false);
                        }}
                      />
                    </>
                  ) : isRejected ? (
                    <PrimaryButton
                      leftIcon={<Download className="text-2xl" />}
                      title="Resubmit"
                      type="Primary"
                      tooltip="Resubmit"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("trigger-resubmit"));
                      }}
                    />
                  ) : (
                    <PrimaryButton
                      leftIcon={<Download className="text-2xl" />}
                      title="Upload Submission"
                      type="Primary"
                      tooltip="Upload Submission"
                      onClick={handleUploadSubmission}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Search / Tabs (Mobile/Tablet only) */}
        <div className="w-full flex justify-center mt-2 relative group px-0 flex lg:hidden">
          {showTabs ? (
            <div className="w-full grid grid-cols-4 bg-white dark:bg-slate-900 items-center border border-gray-200 dark:border-slate-800 rounded-lg gap-1 p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set("tab", tab.id);
                      setSearchParams(params, { state: location.state });
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all cursor-pointer rounded-lg ${isActive
                      ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="hidden sm:inline truncate">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <StaffEmployeeGlobalSearch />
          )}
        </div>
      </div>

      {/* --- Submit Review Modal --- */}
      <Dialog
        open={isSubmitModalOpen}
        onOpenChange={(open) => {
          setIsSubmitModalOpen(open);
          if (!open) {
            setNoteError(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Submit Review
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Finalize your submission for review. Your data will be analyzed by
              the management team.
            </p>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Info Section */}
            <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-md border border-border dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Project:</span>
                <span className="text-gray-900 dark:text-slate-100 font-semibold">
                  {projectName || "N/A"}
                </span>
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-200 flex justify-between">
                Admin/Manager Notes
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                  Required
                </span>
              </label>
              <textarea
                ref={adminNotesRef}
                onChange={() => {
                  setNoteError(false);
                }}
                placeholder="Share your insights or specific context about this data..."
                className={cn(
                  "w-full min-h-[100px] p-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600",
                  noteError
                    ? "border border-red-500 dark:border-red-500 focus:ring-red-500"
                    : "border border-gray-200 dark:border-slate-800 focus:ring-blue-500"
                )}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md text-xs border border-blue-100 dark:border-blue-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>Verify all chart data before final submission.</p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md cursor-pointer border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 cursor-pointer"
              onClick={handleSubmitReview}
              disabled={isSubmissionLoading}
            >
              {isSubmissionLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Complete Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Success Modal --- */}
      <Dialog open={isSuccessModalOpen} onOpenChange={(open) => { if (!open) handleCloseSuccessModal(); }}>
        <DialogContent className="sm:max-w-[400px] p-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Submission Finalized
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Excellent! Your update for{" "}
                <span className="font-semibold text-gray-900 dark:text-slate-100">
                  {projectName || "the project"}
                </span>{" "}
                has been successfully logged.
              </p>
            </div>

            <div className="w-full pt-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
                onClick={handleCloseSuccessModal}
              >
                Go to Project Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breadcrumb */}
      <div className="overflow-x-auto no-scrollbar py-1">
        <Breadcrumb className="my-2 min-w-max">
          <BreadcrumbList>
            {breadcrumbData.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.isPage ? (
                    <BreadcrumbPage className="text-[#356DF0]">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.path || "#"}
                        className={
                          index > 0
                            ? "text-[#356DF0] font-normal flex items-center gap-1"
                            : ""
                        }
                      >
                        {item.icon &&
                          isValidElement(item.icon) &&
                          cloneElement(
                            item.icon as ReactElement<{ className?: string }>,
                            { className: "w-4 h-4" },
                          )}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbData.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default StaffEmployeeDashboardHeader;
