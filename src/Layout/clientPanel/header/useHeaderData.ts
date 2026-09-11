/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetUser } from "@/hooks/useGetUser";
import { getClientSidebarItems } from "../clientSidebarItems";
import {
  useGetProjectByIdQuery,
  useGetAllProjectsQuery,
  useGetProjectTagsQuery,
} from "@/store/Api/ProjectApi/ProjectApi";
import {
  useGetRootChartQuery,
  useGetProgramBuilderChartQuery,
} from "@/store/Api/ChartApi/ChartApi";
import {
  useGetProjectFilesQuery,
  useGetProgramFilesQuery,
  useGetProjectFilesByGroupQuery,
  useGetProgramFilesByGroupQuery,
} from "@/store/Api/Files/FilesApi";
import {
  useGetAllProgramQuery,
  useGetProgramByIdQuery,
} from "@/store/Api/ProgramApi/ProgramApi";
import { useGetNotificationsQuery } from "@/store/Api/NotificationApi/NotificationApi";
import { PdfProgress } from "./types";

/**
 * useHeaderData
 *
 * Centralises ALL data-fetching, route detection, derived state and local UI
 * state for ClientDashboardHeader. Returns a single object consumed by the
 * orchestrator and passed down to sub-components / useHeaderHandlers.
 */
export const useHeaderData = () => {
  /* ─── URL / routing ─────────────────────────────────────────────────────── */
  const { programId, projectId: projectIdFromParams } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;

  /* ─── Redux selectors ───────────────────────────────────────────────────── */
  const {
    projectId: projectIdFromState,
    programId: programIdFromState,
    selectedTemplate,
    isPreview,
    isPublished,
  } = useAppSelector((state: any) => state.chartSlice);
  const { user } = useAppSelector((state: any) => state.auth);
  const userId = user?.userId;
  const { name } = useGetUser();

  const projectId = projectIdFromParams || projectIdFromState;
  const targetProgramId = programId || programIdFromState;

  /* ─── Local UI state ────────────────────────────────────────────────────── */
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ programName: string; id: string }>({
    programName: "",
    id: "",
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectSuccessData, setProjectSuccessData] = useState<{
    projectName: string;
    projectId: string;
  } | null>(null);
  const [projectSuccessOpen, setProjectSuccessOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilesUploadModalOpen, setIsFilesUploadModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PdfProgress>({
    status: "idle",
    pdfUrl: null,
  });

  /* ─── Page-type detection (route shape → boolean flags) ─────────────────── */
  const isPage = useMemo(() => {
    const p = currentPath;
    return {
      employee: p.includes("/employee"),
      highway: p.includes("/highway-expansion/all-highway"),
      allProgram: p === "/client-panel/all-program",
      programOverview:
        p.includes("/all-program/program-overview/") && !p.includes("/project-details/"),
      projectDetails: p.includes("/project-details/"),
      projectReview: p.includes("/client-panel/project-review"),
      projectBuilder:
        p.includes("/client-panel/project-builder") && !p.includes("/project-details/"),
      programBuilder:
        p.includes("/client-panel/program-builder") && !p.includes("/program-details/"),
      publish:
        p.includes("/project-builder/publish") || p.includes("/program-builder/publish"),
      importCSV:
        p.includes("/project-builder/file-upload") || p.includes("/program-builder/file-upload"),
      projectReviewDetails:
        p.includes("/client-panel/project-review/") && p.split("/").length > 3,
      activityLog: p.includes("/client-panel/activity-log"),
      support: p.includes("/client-panel/help"),
      overviewProjectDetails: p.includes("/client-panel/overview/project-details/"),
      programDetails: p.includes("/program-builder/program-details/"),
      isOnProgramDashboardTab:
        p.includes("/all-program/program-overview/") && p.includes("/program-details"),
      showProgramOverviewBreadcrumb: p.startsWith(
        "/client-panel/all-program/program-overview/",
      ),
      contactUs: p.includes("/help/contact-us"),
      feedback: p.includes("/help/feedback"),
    };
  }, [currentPath]);

  /* ─── API queries ───────────────────────────────────────────────────────── */
  const { data: ProjectData } = useGetProjectByIdQuery(projectId as string, {
    skip: !projectId,
  });
  const projectName = ProjectData?.data?.project?.name;

  const { data: programData } = useGetProgramByIdQuery(programId as string, {
    skip: !programId,
  });
  const programName = programData?.data?.programName;

  const { data: projectCharts } = useGetRootChartQuery(projectId as string, {
    skip: !projectId,
  });
  const { data: programCharts } = useGetProgramBuilderChartQuery(
    targetProgramId as string,
    { skip: !targetProgramId || !isPage.programBuilder },
  );

  const { data: projectFiles } = useGetProjectFilesQuery(projectId as string, {
    skip: !projectId || !isPage.projectBuilder,
  });
  const { data: programFiles } = useGetProgramFilesQuery(targetProgramId as string, {
    skip: !targetProgramId || !isPage.programBuilder,
  });

  const hasFiles = isPage.programBuilder
    ? !!(programFiles?.data && programFiles.data.length > 0)
    : !!(projectFiles?.data && projectFiles.data.length > 0);

  const { data: projectGroupedFilesRes } = useGetProjectFilesByGroupQuery(
    projectId as string,
    { skip: !projectId },
  );
  const { data: programGroupedFilesRes } = useGetProgramFilesByGroupQuery(
    targetProgramId as string,
    { skip: !targetProgramId },
  );

  const groupedFilesData = useMemo(() => {
    const resData = isPage.programBuilder ? programGroupedFilesRes : projectGroupedFilesRes;
    const body = resData?.data;
    if (body && typeof body === "object" && "data" in body && Array.isArray(body.data))
      return body.data;
    if (Array.isArray(body)) return body;
    if (Array.isArray(resData)) return resData;
    return [];
  }, [isPage.programBuilder, programGroupedFilesRes, projectGroupedFilesRes]);

  const activeCharts = useMemo(() => {
    if (isPage.programBuilder) {
      const data = programCharts?.data || programCharts;
      const charts = data?.charts || data?.data?.charts || data?.data;
      return Array.isArray(charts) ? charts : Array.isArray(data) ? data : [];
    } else {
      const data = projectCharts?.data || projectCharts;
      const charts = data?.data || data;
      return Array.isArray(charts) ? charts : [];
    }
  }, [isPage.programBuilder, programCharts, projectCharts]);

  const isPublishDisabled = activeCharts.length === 0 && !hasFiles;

  /* ─── Notifications & tags ───────────────────────────────────────────────── */
  const { data: notificationData } = useGetNotificationsQuery(undefined, {
    // pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const { data: tagsData } = useGetProjectTagsQuery({});
  const allTags = useMemo(
    () => (tagsData?.data || []).map((tag: any) => tag.name || tag),
    [tagsData],
  );
  const unreadCount = useMemo(() => {
    const notifications = notificationData?.data || [];
    return notifications.filter((n: any) => n.isRead === false || n.status === "new").length;
  }, [notificationData]);

  /* ─── Project status ─────────────────────────────────────────────────────── */
  const statusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "live") return "bg-green-100 text-green-600";
    if (s === "draft") return "bg-yellow-100 text-yellow-600";
    if (s === "pending") return "bg-orange-100 text-orange-600";
    if (s === "completed") return "bg-blue-100 text-blue-600";
    if (s === "in review") return "bg-orange-50 text-[#FFA800] border-[#FFD994]";
    if (s === "rejected" || s === "revision") return "bg-red-100 text-red-600";
    if (s === "resubmitted") return "bg-purple-100 text-purple-600";
    return "bg-gray-100 text-gray-600";
  };

  const projectTagId =
    ProjectData?.data?.project?.projectTagId ||
    ProjectData?.data?.project?.projectTag?.id;
  const projectStatus = useMemo(() => {
    const rawStatus = ProjectData?.data?.project?.status;
    if (projectTagId && allTags.length > 0) {
      const tag = allTags.find((t: string) => t === projectTagId);
      if (tag && (!rawStatus || tag.toUpperCase() === rawStatus.toUpperCase())) return tag;
    }
    return rawStatus || projectTagId;
  }, [projectTagId, allTags, ProjectData]);

  /* ─── Search ─────────────────────────────────────────────────────────────── */
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: allProgramsData } = useGetAllProgramQuery({});
  const { data: allProjectsData } = useGetAllProjectsQuery({});

  const filteredPrograms = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const programs = allProgramsData?.data?.data || [];
    return Array.isArray(programs)
      ? programs.filter((p: any) =>
        p.programName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      )
      : [];
  }, [debouncedSearchTerm, allProgramsData]);

  const filteredProjects = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const projects =
      allProjectsData?.data?.projects?.data || allProjectsData?.data?.data || [];
    return Array.isArray(projects)
      ? projects.filter((p: any) =>
        p.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      )
      : [];
  }, [debouncedSearchTerm, allProjectsData]);

  /* ─── Sidebar routes → breadcrumb ───────────────────────────────────────── */
  const allRoutes = useMemo(
    () => getClientSidebarItems().flatMap((group) => group.items),
    [],
  );

  const currentRoute = useMemo(() => {
    if (isPage.showProgramOverviewBreadcrumb)
      return allRoutes.find((r) => r.path === "/client-panel/all-program");
    if (isPage.projectReviewDetails)
      return allRoutes.find((r) => r.path === "/client-panel/project-review");
    if (isPage.overviewProjectDetails)
      return allRoutes.find((r) => r.path === "/client-panel");
    if (isPage.publish || isPage.importCSV) {
      const isProgram = location.pathname.includes("/program-builder");
      return allRoutes.find(
        (r) =>
          r.path ===
          (isProgram ? "/client-panel/program-builder" : "/client-panel/project-builder"),
      );
    }
    let found;
    for (const r of allRoutes) {
      if (r.path === currentPath) { found = r; break; }
      if (r.children) {
        const child = r.children.find(
          (c: any) => `${r.path}/${c.path}` === currentPath,
        );
        if (child) { found = child; break; }
      }
    }
    if (!found) {
      if (currentPath.endsWith("/profile")) {
        return { name: "Profile", header: "Profile", description: "View and manage your profile details", path: "/client-panel/profile" };
      }
      if (currentPath.endsWith("/notifications")) {
        return { name: "Notifications", header: "Notifications", description: "Manage and view all your notifications", path: "/client-panel/notifications" };
      }
    }
    return found;
  }, [allRoutes, currentPath, isPage, location.pathname]);

  const breadcrumbData = useMemo(() => {
    const items: Array<{
      label: string;
      path?: string;
      icon?: React.ReactNode;
      isPage?: boolean;
    }> = [{ label: "Home", path: "/client-panel" }];
    if (currentRoute) {
      items.push({
        label: currentRoute?.name as string,
        path: currentRoute.path as string,
        icon: currentRoute.icon,
      });
      if (isPage.projectBuilder && isPreview) items.push({ label: "Preview", isPage: true });
      if (isPage.showProgramOverviewBreadcrumb) {
        items.push({
          label: "Program Overview",
          path: `/client-panel/all-program/program-overview/${targetProgramId}`,
        });
      }
      if (isPage.publish) {
        items.push({ label: "Publish", isPage: true });
      } else if (isPage.importCSV) {
        const isProgram = location.pathname.includes("/program-builder");
        items.push({
          label: "Publish",
          path: isProgram
            ? `/client-panel/program-builder/publish/${targetProgramId}`
            : `/client-panel/project-builder/publish/${projectId}`,
        });
        items.push({ label: "Import CSV", isPage: true });
      }
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
  }, [currentRoute, isPage, projectName, targetProgramId, projectId, isPreview, location.pathname]);

  /* ─── PDF download route detection ─────────────────────────────────────── */
  const isPdfDownloadRoute = useMemo(() => {
    const p = currentPath;
    const isProgramBuilderPublish = /^\/client-panel\/program-builder\/publish\/[^/]+$/.test(p);
    const isProjectBuilderPublish = /^\/client-panel\/project-builder\/publish\/[^/]+$/.test(p);
    const isProjectDetails = p.includes("/project-details/");
    const isProgramDetails =
      /^\/client-panel\/all-program\/program-overview\/[^/]+\/program-details$/.test(p);
    return isProgramBuilderPublish || isProjectBuilderPublish || isProjectDetails || isProgramDetails;
  }, [currentPath]);

  /* ─── Side effects ───────────────────────────────────────────────────────── */
  useEffect(() => {
    setIsEmployeeModalOpen(false);
  }, [currentPath]);

  /* ─── Return ─────────────────────────────────────────────────────────────── */
  return {
    // IDs & routing
    programId, projectId, targetProgramId, userId,
    currentPath, navigate, location, dispatch,
    // Search params
    searchParams, setSearchParams, activeTab,
    // Page detection
    isPage,
    // Redux state
    selectedTemplate, isPreview, isPublished, name,
    // API data
    projectName, programName, projectStatus, allTags,
    activeCharts, hasFiles, groupedFilesData, isPublishDisabled,
    // Breadcrumb
    breadcrumbData, currentRoute,
    // Search
    searchTerm, setSearchTerm, filteredPrograms, filteredProjects,
    // Notifications
    unreadCount,
    // Helpers
    statusColor, isPdfDownloadRoute,
    // Status popover
    isStatusPopoverOpen, setIsStatusPopoverOpen,
    // Modal states & setters
    activeModal, setActiveModal,
    successData, setSuccessData,
    successOpen, setSuccessOpen,
    isNotificationOpen, setIsNotificationOpen,
    isEmployeeModalOpen, setIsEmployeeModalOpen,
    isProjectModalOpen, setIsProjectModalOpen,
    projectSuccessData, setProjectSuccessData,
    projectSuccessOpen, setProjectSuccessOpen,
    isUploadModalOpen, setIsUploadModalOpen,
    isFilesUploadModalOpen, setIsFilesUploadModalOpen,
    isVersionHistoryOpen, setIsVersionHistoryOpen,
    isTemplateModalOpen, setIsTemplateModalOpen,
    templateName, setTemplateName,
    isApplyConfirmOpen, setIsApplyConfirmOpen,
    isPdfModalOpen, setIsPdfModalOpen,
    pdfProgress, setPdfProgress,
  };
};

export type HeaderData = ReturnType<typeof useHeaderData>;
