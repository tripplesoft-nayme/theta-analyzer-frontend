/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  cloneElement,
  useState,
  useMemo,
  isValidElement,
  ReactElement,
  useRef,
} from "react";
import {
  Bell,
  Download,
  FileText,
  Radio,
  Undo2,
  Upload,
  List,
  LayoutGrid,
  Clock,
  AlertTriangle,
  Loader2,
  Plus,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getStaffManagerSidebarItems } from "./staffManagerSidebarItem";
import PrimaryButton from "@/Common/PrimaryButton";
import NotificationModal from "@/Common/NotificationModal";
import { useGetNotificationsQuery } from "@/store/Api/NotificationApi/NotificationApi";
import GlobalSearch from "@/pages/staffManager/Components/GlobalSearch";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useGetUser } from "@/hooks/useGetUser";
import { setIsPublished } from "@/store/Slices/ChartSlice/ChartSlice";
import {
  useGetProjectByIdQuery,
  useUpdateProjectStatusMutation,
  useGetProjectTagsQuery,
} from "@/store/Api/ProjectApi/ProjectApi";
import {
  useGetRootChartQuery,
  useLayoutUpdateMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useCreateATemplateMutation } from "@/store/Api/ChartApi/chartTemplateApi";
import { useChartDownload } from "@/hooks/useChartDownload";
import { useUpdateSubmissionStatusMutation } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { ThemeToggle } from "@/Common/ThemeToggle";
import { useGetEmployeeSubmissionByIdQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useGetProgramByIdQuery } from "@/store/Api/ProgramApi/ProgramApi";

/**
 * StaffManagerDashboardHeader Component
 * Serves as the global top navigation and contextual control bar for the Staff Manager Panel.
 * Dynamically adapts layout, tabs, search capabilities, and actions based on current active route.
 */
const StaffManagerDashboardHeader = () => {
  // Navigation & Parameter Extraction
  const { programId: programIdFromParams, projectId: projectIdFromParams } =
    useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isPublishSuccessOpen, setIsPublishSuccessOpen] = useState(false);
  const revisionNoteRef = useRef<HTMLTextAreaElement>(null);
  const [noteError, setNoteError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  // Contextual Sub-navigation Tabs for Project Review / Details
  const tabs = [
    { id: "gantt", name: "Gantt", icon: List },
    { id: "sheet", name: "Sheet", icon: LayoutGrid },
    { id: "dashboard", name: "Dashboard", icon: Clock },
    { id: "files", name: "Files", icon: FileText },
  ];

  const currentPath = location.pathname;
  // Location state passed during review routing
  const locationState = location.state as {
    submissionId?: string;
    employeeName?: string;
    fromReview?: boolean;
  } | null;

  // Real-time Notification Polling
  const { data: notificationData } = useGetNotificationsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const unreadCount = useMemo(() => {
    const notifications = notificationData?.data || [];
    return notifications.filter((n: any) => n.isRead === false || n.status === "new").length;
  }, [notificationData]);

  const projectIdFromRedux = useAppSelector(
    (state) => state.chartSlice.projectId,
  );

  // ── Extract projectId directly from the URL (works from any nesting level) ──
  const projectIdFromUrl = useMemo(() => {
    const detailsMatch = currentPath.match(/\/project-details\/([^/]+)/);
    if (detailsMatch) return detailsMatch[1];

    const reviewMatch = currentPath.match(/\/project-review\/([^/]+)\/([^/]+)/);
    if (reviewMatch) return reviewMatch[2];

    const publishMatch = currentPath.match(
      /\/project-builder\/publish\/([^/]+)/,
    );
    if (publishMatch) return publishMatch[1];

    const fileUploadMatch = currentPath.match(
      /\/project-builder\/file-upload\/([^/]+)/,
    );
    if (fileUploadMatch) return fileUploadMatch[1];

    return null;
  }, [currentPath]);

  const submissionIdFromUrl = useMemo(() => {
    const reviewMatch = currentPath.match(/\/project-review\/([^/]+)\/([^/]+)/);
    if (reviewMatch) return reviewMatch[1];
    return null;
  }, [currentPath]);

  // Active projectId resolution hierarchy: URL Params -> URL Path Extraction -> Redux State
  const projectId =
    projectIdFromParams || projectIdFromUrl || projectIdFromRedux;

  // ── Page-type detection ────────────────────────────────────────────────────
  const isPage = useMemo(() => {
    const p = currentPath;
    // A pure project-details page (from any flow)
    const isOnProjectDetails =
      p.includes("/projects/project-details/") ||
      (p.includes("/all-program/") && p.includes("/project-details/")) ||
      p.includes("/project-builder/project-details/");

    const isOnProjectReviewDetails =
      p.includes("/staff-manager-panel/project-review/") &&
      p.split("/").length > 3;

    return {
      projectDetails: isOnProjectDetails,
      projectBuilder:
        p.includes("/staff-manager-panel/project-builder") &&
        !p.includes("/project-details/"),
      publish: p.includes("/project-builder/publish"),
      importCSV: p.includes("/project-builder/file-upload"),
      // Only show Return/GoLive when manager came from review view
      projectReviewDetails:
        isOnProjectReviewDetails ||
        (isOnProjectDetails && !!locationState?.fromReview),
    };
  }, [currentPath, locationState]);

  // ── Fetch project (name + status + programId) ──────────────────────────────
  const { data: projectData } = useGetProjectByIdQuery(projectId as string, {
    skip: !projectId,
  });
  const projectName = projectData?.data?.project?.name;
  const { data: tagsData } = useGetProjectTagsQuery({});
  const allTags = useMemo(() => (tagsData?.data || []).map((tag: any) => tag.name || tag), [tagsData]);
  const projectTagId = projectData?.data?.project?.projectTagId || projectData?.data?.project?.projectTag?.id;
  const projectStatus = useMemo(() => {
    const rawStatus = projectData?.data?.project?.status;
    if (projectTagId && allTags.length > 0) {
      const tag = allTags.find((t: string) => t === projectTagId);
      if (tag && (!rawStatus || tag.toUpperCase() === rawStatus.toUpperCase())) {
        return tag;
      }
    }
    return rawStatus || projectTagId;
  }, [projectTagId, allTags, projectData]);

  const activeSubmissionId = useMemo(() => {
    return locationState?.submissionId || submissionIdFromUrl;
  }, [locationState, submissionIdFromUrl]);

  const { data: submissionData } = useGetEmployeeSubmissionByIdQuery(
    activeSubmissionId as string,
    {
      skip: !activeSubmissionId,
    }
  );

  const isSubmissionRejected = submissionData?.data?.status === "REJECTED";

  const [updateProjectStatus] = useUpdateProjectStatusMutation();
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  const handleSelectStatus = async (tag: string) => {
    if (!projectId) return;
    const toastId = toast.loading("Updating status...");
    try {
      await updateProjectStatus({ projectId: projectId, status: tag.toUpperCase() }).unwrap();
      toast.success(`Project status updated to ${tag}`, { id: toastId });
      setIsStatusPopoverOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status", { id: toastId });
      setIsStatusPopoverOpen(false);
    }
  };
  const programId =
    programIdFromParams ??
    projectData?.data?.project?.program?.id ??
    projectData?.data?.project?.programId ??
    null;

  // ── Navigate to Upload Submission (with or without pre-filled IDs) ──────────
  const handleUploadSubmission = () => {
    if (projectIdFromUrl && programId) {
      navigate(
        `/staff-manager-panel/projects/upload-submission?projectId=${projectIdFromUrl}&programId=${programId}`,
      );
    } else {
      navigate("/staff-manager-panel/projects/upload-submission");
    }
  };

  // ── Status badge colour helper ─────────────────────────────────────────────
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

  // ── Layout Persistence & Publishing Workflow ─────────────────────────────
  const [layoutUpdate] = useLayoutUpdateMutation();
  const [createATemplate, { isLoading: isCreatingTemplate }] =
    useCreateATemplateMutation();

  const { data: rootChartData } = useGetRootChartQuery(projectId as string, {
    skip: !projectId,
  });
  const isPublishDisabled = rootChartData?.data?.length === 0;

  /**
   * Synchronizes customized dashboard grid layout coordinates (from local storage)
   * with backend chart entities before committing the project layout to production.
   */
  const handlePublish = async () => {
    if (isPublishDisabled || !projectId) {
      toast.error("No charts to publish");
      return;
    }
    const toastId = toast("Publishing charts...");
    try {
      const storageKey = `custom_layout_project_${projectId}`;
      const savedLayouts = localStorage.getItem(storageKey);
      const savedOrder = localStorage.getItem(`${storageKey}_order`);

      const layouts = savedLayouts ? JSON.parse(savedLayouts) : {};
      const order = savedOrder ? JSON.parse(savedOrder) : [];

      const charts = (rootChartData?.data || []).map((chart: any) => {
        const layout = layouts[chart.id];
        const chartOrder = order.indexOf(chart.id);

        return {
          ...chart,
          height: layout?.h ? layout.h : (chart.height >= 50 ? Math.round((chart.height + 8) / 28) : chart.height),
          width: layout?.w ? layout.w : chart.width,
          order: chartOrder !== -1 ? chartOrder : chart.order || 0,
        };
      });

      await layoutUpdate(charts).unwrap();

      toast.success("Project published successfully", { id: toastId });
      navigate(`/staff-manager-panel/projects/project-details/${projectId}`);
      dispatch(setIsPublished(true));
    } catch {
      toast.error("Failed to publish project", { id: toastId });
    }
  };

  /**
   * Captures the current active project configuration and exports it as a reusable
   * chart template within the organization's repository.
   */
  const handleTemplate = async () => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }
    const toastId = toast.loading("Saving as template...");
    try {
      const payload = {
        projectId: projectId as string,
        name: projectName || "Executive Dashboard",
      };
      await createATemplate(payload).unwrap();
      toast.success("Template saved successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save template", {
        id: toastId,
      });
    }
  };

  // ── Submission Review Workflow (Return for Revision / Go Live) ─────────────
  const [updateSubmissionStatus, { isLoading: isUpdatingStatus }] =
    useUpdateSubmissionStatusMutation();

  /**
   * Evaluates employee data submissions. Dispatches approval to go live or
   * rejects with revision notes back to the employee's queue.
   */
  const handleUpdateStatus = async (status: "REJECTED" | "APPROVED") => {
    const submissionId = locationState?.submissionId || submissionIdFromUrl;
    if (!submissionId) {
      toast.error(
        "Submission ID not found. Please navigate from Project Review.",
      );
      return;
    }
    try {
      await updateSubmissionStatus({
        id: submissionId,
        status: {
          status,
          ...(status === "REJECTED" && { information: revisionNoteRef.current?.value || "" }),
        },
      }).unwrap();
      if (revisionNoteRef.current) revisionNoteRef.current.value = ""; // Clear note after success
      if (status === "APPROVED") {
        setIsPublishSuccessOpen(true);
      } else {
        toast.success("Submission sent for revision.");
        navigate("/staff-manager-panel/project-review");
      }
    } catch {
      toast.error("Failed to update submission status.");
    }
  };

  // ── Sidebar / breadcrumb ──────────────────────────────────────────────────
  const allRoutes = useMemo(
    () => getStaffManagerSidebarItems().flatMap((group) => group.items),
    [],
  );

  const { name } = useGetUser();

  const currentRoute = useMemo(() => {
    let found = allRoutes.find((r) => r.path === currentPath);
    if (
      !found &&
      (isPage.publish || isPage.importCSV || isPage.projectBuilder)
    ) {
      found = allRoutes.find(
        (r) => r.path === "/staff-manager-panel/project-builder",
      );
    }
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
        return { name: "Profile", header: "Profile", description: "View and manage your profile details", path: "/staff-manager-panel/profile" };
      }
      if (currentPath.endsWith("/notifications")) {
        return { name: "Notifications", header: "Notifications", description: "Manage and view all your notifications", path: "/staff-manager-panel/notifications" };
      }
    }
    return found;
  }, [allRoutes, currentPath, isPage]);

  const breadcrumbData = useMemo(() => {
    const items: Array<{
      label: string;
      path?: string;
      icon?: React.ReactNode;
      isPage?: boolean;
    }> = [{ label: "Home", path: "/staff-manager-panel" }];

    let currentRouteLocal = allRoutes.find((r) => r.path === currentPath);
    if (!currentRouteLocal && currentRoute) {
      currentRouteLocal = currentRoute as any;
    }

    if (
      !currentRouteLocal &&
      (isPage.publish || isPage.importCSV || isPage.projectBuilder)
    ) {
      currentRouteLocal = allRoutes.find(
        (r) => r.path === "/staff-manager-panel/project-builder",
      );
    }

    if (!currentRouteLocal) {
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

    if (currentRouteLocal) {
      items.push({
        label: currentRouteLocal.name as string,
        path: currentRouteLocal.path as string,
        icon: currentRouteLocal.icon,
      });

      //   // TODO define preview logic based on boolean value that will get from the api response
      // if (isPage.projectBuilder && isPreview) {
      //   items.push({ label: "Preview", isPage: true });
      // }

      if (isPage.publish) {
        items.push({ label: "Publish", isPage: true });
      } else if (isPage.importCSV) {
        items.push({
          label: "Publish",
          path: `/staff-manager-panel/project-builder/publish/${projectId}`,
        });
        items.push({ label: "Import CSV", isPage: true });
      }
    }

    // Extra breadcrumb when on project-details from project-review
    if (isPage.projectReviewDetails) {
      items.push({
        label: "Project Review",
        path: "/staff-manager-panel/project-review",
      });
    } else if (isPage.projectDetails) {
      items.push({
        label: "Projects",
        path: "/staff-manager-panel/projects",
      });
    }

    const isSpecialProjectPage = isPage.publish || isPage.importCSV;
    if (
      (isPage.projectDetails || isPage.projectReviewDetails) &&
      !isSpecialProjectPage &&
      projectName
    ) {
      items.push({ label: projectName, isPage: true });
    }

    return items;
  }, [currentPath, allRoutes, isPage, projectName, currentRoute]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row items-center py-5 justify-between gap-4 lg:gap-0 min-h-[100px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4 lg:gap-2 relative">
          <div className="flex items-center gap-4 w-full sm:w-auto lg:flex-1 min-w-0">
            <SidebarTrigger className="md:hidden shrink-0" />
            <div className="min-w-0">
              {(isPage.projectDetails || isPage.projectReviewDetails) &&
                projectName ? (
                <div>
                  <h1 className="text-[28px] text-wrap font-semibold text-primary-text dark:text-slate-100 leading-tight inline items-center">
                    <span className="mr-2">{projectName}</span>
                    {projectStatus && (
                      isPage.projectReviewDetails ? (
                        <span
                          className={`inline-block align-middle px-3 py-0.5 rounded-full text-[10px] font-semibold capitalize border cursor-default ${statusColor(projectStatus)}`}
                        >
                          {projectStatus}
                        </span>
                      ) : (
                        <Popover open={isStatusPopoverOpen} onOpenChange={setIsStatusPopoverOpen}>
                          <PopoverTrigger asChild>
                            <span
                              className={`inline-block align-middle px-3 py-0.5 rounded-full text-[10px] font-semibold capitalize border cursor-pointer hover:opacity-85 transition-all ${statusColor(projectStatus)}`}
                            >
                              {projectStatus}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="p-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-xl z-50">
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 px-2 py-1">Update Status</p>
                              {allTags.map((tag: string) => (
                                <button
                                  key={tag}
                                  onClick={() => handleSelectStatus(tag)}
                                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${String(projectStatus).toLowerCase() === tag.toLowerCase()
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                                    : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                  <span>{tag}</span>
                                  {String(projectStatus).toLowerCase() === tag.toLowerCase() && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )
                    )}
                  </h1>
                </div>
              ) : (
                <>
                  <h1 className="text-[28px] font-semibold leading-tight text-primary-text dark:text-slate-100 truncate">
                    {currentPath === "/staff-manager-panel"
                      ? `Welcome, ${name || ""} 👋`
                      : (currentRoute as any)?.header ||
                      (currentRoute as any)?.name ||
                      "Dashboard"}
                  </h1>
                  <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 truncate">
                    {(currentRoute as any)?.description ||
                      "This is dashboard overview of Acme Corporation"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="lg:flex-none lg:w-[320px] xl:w-[450px] 2xl:w-[650px] w-full flex justify-center mt-2 lg:mt-0 relative group px-0 lg:px-2 hidden lg:flex z-10">
            {isPage.projectDetails || isPage.projectReviewDetails ? (
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
                        setSearchParams(params);
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
            ) : isPage.publish ? null : (
              <GlobalSearch />
            )}
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-start sm:justify-end lg:justify-end gap-3 relative w-full sm:w-auto lg:flex-1 lg:min-w-max mt-2 sm:mt-0">
            <ThemeToggle />
            {/* Notifications */}
            <div className="relative">
              <PrimaryButton
                leftIcon={<Bell className="size-5" />}
                type={"Outline"}
                onClick={() => setIsOpen(true)}
                tooltip="Notifications"
                className="h-12"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <NotificationModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
              />
            </div>

            {/* ── Project Builder buttons (same as client panel) ─────────────── */}
            {isPage.projectBuilder &&
              !isPage.importCSV &&
              (isPage.publish ? (
                <div className="flex gap-4">
                  <PrimaryButton
                    type="Primary"
                    leftIcon={<Upload />}
                    tooltip="Upload File"
                    onClick={() =>
                      navigate(
                        `/staff-manager-panel/project-builder/file-upload/${projectId}`,
                      )
                    }
                  />
                  <PrimaryButton
                    type="Primary"
                    leftIcon={<Download />}
                    tooltip="Download CSV"
                    onClick={() => handleDownloadCharts()}
                  />
                  <PrimaryButton
                    title="Save Template"
                    leftIcon={<Plus />}
                    type="Primary"
                    disabled={isCreatingTemplate}
                    tooltip="Save Template"
                    onClick={handleTemplate}
                  />
                  <PrimaryButton
                    title="Publish"
                    type="Primary"
                    disabled={isPublishDisabled}
                    tooltip="Publish to Live"
                    onClick={handlePublish}
                  />
                </div>
              ) : (
                <div className="flex gap-3">
                  <PrimaryButton
                    title="Preview"
                    type="Outline"
                    disabled={isPublishDisabled}
                    tooltip="Preview Page"
                    onClick={() => {
                      if (isPublishDisabled) return;
                      navigate(
                        `/staff-manager-panel/project-builder/publish/${projectId}`,
                      );
                    }}
                  />
                </div>
              ))}

            {/* ── Project-details buttons (download + upload submission) ─────────────── */}
            {isPage.projectDetails && !isPage.projectBuilder && (
              <>
                <PrimaryButton
                  leftIcon={<Upload />}
                  type="Primary"
                  tooltip="Download Charts"
                  onClick={handleDownloadCharts}
                />
                {projectStatus?.toLowerCase() === "draft" && (
                  <PrimaryButton
                    leftIcon={<Download />}
                    type="Primary"
                    tooltip="Upload Submission"
                    onClick={handleUploadSubmission}
                  />
                )}
              </>
            )}

            {/* ── Upload Submission on non-project-details pages ────────────────── */}
            {!isPage.projectDetails &&
              !isPage.projectBuilder &&
              !isPage.projectReviewDetails && (
                <PrimaryButton
                  leftIcon={<Download />}
                  title="Upload Submission"
                  type="Primary"
                  tooltip="Upload Submission"
                  onClick={handleUploadSubmission}
                />
              )}

            {/* ── Review-specific: Return for Edit & Go Live ───────────────── */}
            {isPage.projectReviewDetails && activeTab !== "files" && (
              <>
                <PrimaryButton
                  leftIcon={<Upload />}
                  type="Primary"
                  onClick={handleDownloadCharts}
                />
                {projectStatus?.toLowerCase() === "draft" && (
                  <PrimaryButton
                    leftIcon={<Download />}
                    type="Primary"
                    onClick={handleUploadSubmission}
                  />
                )}
                {isSubmissionRejected ? (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <button
                            disabled
                            className="flex items-center justify-center gap-2 px-4 py-3 font-medium tracking-wide capitalize rounded-lg text-sm bg-red-700/50 text-white/80 border border-red-700/50 cursor-not-allowed dark:bg-rose-700/50 dark:text-white/80 dark:border-rose-700/50"
                          >
                            <Undo2 className="text-2xl" />
                            <span>Revise</span>
                          </button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="p-2 text-xs font-semibold shadow-md z-50">
                        Already Send for Revision
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <PrimaryButton
                    leftIcon={<Undo2 className="text-2xl" />}
                    className="bg-red-700 hover:bg-red-800 dark:bg-rose-700 hover:text-white/80 border border-red-700 dark:border-rose-700 dark:hover:text-white/80"
                    title="Revise"
                    type="Primary"
                    tooltip="Send for Revision"
                    onClick={() => {
                      setIsReviseModalOpen(true);
                      setNoteError(false);
                    }}
                    disabled={isUpdatingStatus}
                  />
                )}
                <PrimaryButton
                  leftIcon={<Radio className="text-2xl" />}
                  className="bg-green-700 hover:bg-green-800 dark:bg-emerald-700 dark:hover:bg-emerald-800 border border-green-700 dark:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-600"
                  title={isUpdatingStatus ? "Publishing..." : "Publish"}
                  type="Primary"
                  tooltip="Publish"
                  onClick={() => setIsPublishConfirmOpen(true)}
                  disabled={isUpdatingStatus}
                />
              </>
            )}
          </div>
        </div>

        {/* Search / Tabs (Mobile/Tablet only) */}
        <div className="w-full flex justify-center mt-2 relative group px-0 flex lg:hidden">
          {isPage.projectDetails || isPage.projectReviewDetails ? (
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
                      setSearchParams(params);
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
          ) : isPage.publish ? null : (
            <GlobalSearch />
          )}
        </div>
      </div>

      {/* --- Revise Modal --- */}
      <Dialog
        open={isReviseModalOpen}
        onOpenChange={(open) => {
          setIsReviseModalOpen(open);
          if (!open) {
            setNoteError(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Revise Submission
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Provide feedback or instructions on why this submission needs
              revision.
            </p>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-200 flex justify-between">
                Revision Notes
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                  Required
                </span>
              </label>
              <textarea
                ref={revisionNoteRef}
                onChange={() => {
                  setNoteError(false);
                }}
                placeholder="Ex: Please update the Q3 revenue data in the spline chart..."
                className={cn(
                  "w-full min-h-[120px] p-3 text-sm rounded-md focus:outline-none transition-all resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600",
                  noteError
                    ? "border border-red-500 dark:border-red-500 focus:ring-red-500"
                    : "border border-gray-200 dark:border-slate-800 focus:ring-blue-500"
                )}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-md text-xs border border-rose-100 dark:border-rose-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>
                The submission will be returned to the employee for editing.
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsReviseModalOpen(false);
                if (revisionNoteRef.current) revisionNoteRef.current.value = "";
                setNoteError(false);
              }}
              className="px-4 py-2 text-sm font-medium rounded-md cursor-pointer border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const revisionNote = revisionNoteRef.current?.value || "";
                if (!revisionNote.trim()) {
                  setNoteError(true);
                  return;
                }
                handleUpdateStatus("REJECTED");
                setIsReviseModalOpen(false);
              }}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Publish Confirmation Modal --- */}
      <Dialog
        open={isPublishConfirmOpen}
        onOpenChange={setIsPublishConfirmOpen}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2 text-left!">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Publish Project Review
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              Are you sure you want to approve this submission and make the
              project live? This action will notify the stakeholders.
            </p>
          </DialogHeader>

          <div className="px-6 pb-2 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20 italic!">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full shrink-0">
                <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Ready for Production</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold opacity-80">
                  This submission meets all quality standards and is ready to go
                  live on the dashboard.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPublishConfirmOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md cursor-pointer border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 cursor-pointer"
              onClick={() => {
                handleUpdateStatus("APPROVED");
                setIsPublishConfirmOpen(false);
              }}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Publish Success Modal --- */}
      <Dialog
        open={isPublishSuccessOpen}
        onOpenChange={setIsPublishSuccessOpen}
      >
        <DialogContent className="sm:max-w-[400px] p-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <Radio className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Project Published!
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                The submission has been approved and the project is now live.
              </p>
            </div>

            <div className="w-full pt-4 space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors cursor-pointer"
                onClick={() => {
                  setIsPublishSuccessOpen(false);
                  navigate(
                    `/staff-manager-panel/projects/project-details/${projectId}`,
                  );
                }}
              >
                Go to Project Details
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 py-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsPublishSuccessOpen(false);
                  navigate("/staff-manager-panel/project-review");
                }}
              >
                Back to Reviews
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
                    <BreadcrumbPage className="text-[#356DF0] dark:text-blue-400 font-semibold">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.path || "#"}
                        className={
                          index > 0
                            ? "text-[#356DF0] dark:text-blue-400 font-semibold flex items-center gap-1  "
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
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

export default StaffManagerDashboardHeader;
