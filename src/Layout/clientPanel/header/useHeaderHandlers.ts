/* eslint-disable @typescript-eslint/no-explicit-any */
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  setIsPublished,
  setSelectedTemplate,
} from "@/store/Slices/ChartSlice/ChartSlice";
import { useUpdateProjectStatusMutation } from "@/store/Api/ProjectApi/ProjectApi";
import {
  useLayoutUpdateMutation,
  useUpdateBulkProgramChartMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { useUpdateFileGroupMutation } from "@/store/Api/Files/FilesApi";
import {
  useCreateATemplateMutation,
  useApplyTemplateMutation,
  useCreateProgramBuilderTemplateMutation,
  useApplyProgramBuilderTemplateMutation,
} from "@/store/Api/ChartApi/chartTemplateApi";
import { useChartDownload } from "@/hooks/useChartDownload";
import { generateClientDashboardPdf } from "../utils/pdfGenerator";
import type { HeaderData } from "./useHeaderData";

/**
 * useHeaderHandlers
 *
 * Declares all RTK mutation hooks and returns the event-handler functions
 * used by the header (publish, template, PDF, status, etc.).
 * Receives the full data object from useHeaderData so handlers can read
 * current state without prop-drilling.
 */
export const useHeaderHandlers = (data: HeaderData) => {
  const {
    projectId,
    targetProgramId,
    userId,
    isPage,
    selectedTemplate,
    location,
    dispatch,
    navigate,
    projectName,
    programName,
    activeCharts,
    groupedFilesData,
    isPublishDisabled,
    setActiveModal,
    setSuccessData,
    setSuccessOpen,
    setIsProjectModalOpen,
    setProjectSuccessData,
    setProjectSuccessOpen,
    setIsStatusPopoverOpen,
    setIsTemplateModalOpen,
    templateName,
    setTemplateName,
    setIsApplyConfirmOpen,
    setIsPdfModalOpen,
    setPdfProgress,
    pdfProgress,
  } = data;

  /* ─── Mutations ─────────────────────────────────────────────────────────── */
  const [updateProjectStatus] = useUpdateProjectStatusMutation();
  const [layoutUpdate] = useLayoutUpdateMutation();
  const [updateBulkProgramChart] = useUpdateBulkProgramChartMutation();
  const [updateFileGroup] = useUpdateFileGroupMutation();
  const [createATemplate, { isLoading: isCreatingTemplate }] = useCreateATemplateMutation();
  const [applyTemplate, { isLoading: isApplyingTemplate }] = useApplyTemplateMutation();
  const [createProgramBuilderTemplate, { isLoading: isCreatingProgramTemplate }] =
    useCreateProgramBuilderTemplateMutation();
  const [applyProgramBuilderTemplate, { isLoading: isApplyingProgramTemplate }] =
    useApplyProgramBuilderTemplateMutation();

  /* ─── CSV / chart download ──────────────────────────────────────────────── */
  const { handleDownloadCharts: handleDownloadCSV } = useChartDownload({
    projectId: projectId as string,
    targetProgramId: targetProgramId as string,
    projectName,
    programName,
  });

  /* ─── Project status ─────────────────────────────────────────────────────── */
  const handleSelectStatus = async (tag: string) => {
    if (!projectId) return;
    const toastId = toast.loading("Updating status...");
    try {
      await updateProjectStatus({ projectId, status: tag.toUpperCase() }).unwrap();
      toast.success(`Project status updated to ${tag}`, { id: toastId });
      setIsStatusPopoverOpen(false);
    } catch (error: any) {
      toast.error(error.data.message || "Failed to update status", { id: toastId });
      setIsStatusPopoverOpen(false);
    }
  };

  /* ─── Program / project creation success ────────────────────────────────── */
  const handleProgramSuccess = ({
    programName: pName,
    id,
  }: {
    programName: string;
    id: string;
  }) => {
    setActiveModal(null);
    setSuccessData({ programName: pName, id });
    setSuccessOpen(true);
  };

  const handleProjectSuccess = (projectNameArg: string, projectIdArg: string) => {
    setIsProjectModalOpen(false);
    setProjectSuccessData({ projectName: projectNameArg, projectId: projectIdArg });
    setProjectSuccessOpen(true);
  };

  /* ─── PDF export ─────────────────────────────────────────────────────────── */
  const handleModalClose = (open: boolean) => {
    setIsPdfModalOpen(open);
    if (!open) {
      if (pdfProgress.pdfUrl) URL.revokeObjectURL(pdfProgress.pdfUrl);
      setPdfProgress({ status: "idle", pdfUrl: null });
    }
  };

  const handleDownloadClick = () => {
    if (!pdfProgress.pdfUrl) return;
    const pageName = projectName || programName || "details";
    const cleanFileName = pageName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    saveAs(pdfProgress.pdfUrl, `${cleanFileName}_report_${Date.now()}.pdf`);
  };

  const handleViewClick = () => {
    if (!pdfProgress.pdfUrl) return;
    window.open(pdfProgress.pdfUrl, "_blank");
  };

  const handleDownloadPdfImage = async () => {
    setIsPdfModalOpen(true);
    setPdfProgress({ status: "capturing", current: 0, total: 1, pdfUrl: null });
    try {
      const isDark = document.documentElement.classList.contains("dark");
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const blob = await generateClientDashboardPdf({
        elementId: "details-capture-area",
        isDark,
        projectName,
        programName,
        formattedDate,
        onProgress: (progress) => {
          setPdfProgress({
            status: progress.status,
            current: progress.current,
            total: progress.total,
            pdfUrl: null,
          });
        },
      });
      const blobUrl = URL.createObjectURL(blob);
      setPdfProgress({ status: "success", pdfUrl: blobUrl });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      setPdfProgress({
        status: "error",
        pdfUrl: null,
        errorMsg: error?.message || "Failed to generate PDF report",
      });
    }
  };

  /* ─── Publish ────────────────────────────────────────────────────────────── */
  const handlePublish = async () => {
    const isProgram = location.pathname.includes("/program-builder");
    const activeId = isProgram ? targetProgramId : projectId;

    if (isPublishDisabled || !activeId) {
      toast.error("No charts to publish");
      return;
    }
    const toastId = toast("Publishing charts...");
    try {
      const storageKey = `custom_layout_${isProgram ? "program_" : "project_"}${activeId}`;
      const savedLayouts = localStorage.getItem(storageKey);
      const savedOrder = localStorage.getItem(`${storageKey}_order`);
      const layouts = savedLayouts ? JSON.parse(savedLayouts) : {};
      const order = savedOrder ? JSON.parse(savedOrder) : [];

      if (isProgram) {
        // PROGRAM BUILDER PUBLISH
        const updates = (activeCharts as any[]).map((chart: any) => {
          const layout = layouts[chart.id];
          const chartOrder = order.indexOf(chart.id);
          return {
            id: chart.id,
            data: {
              title: chart.title || chart.chartData?.title,
              order: chartOrder !== -1 ? chartOrder : chart.order || 0,
              status: chart.status || "ACTIVE",
              width: layout?.w ? String(layout.w) : String(chart.width || "12"),
              height: layout?.h
                ? String(layout.h)
                : String(
                  chart.height >= 50
                    ? Math.round((chart.height + 8) / 28)
                    : chart.height || "15",
                ),
            },
          };
        });

        const fileGroupPromises = (groupedFilesData || []).map((group: any) => {
          const layoutId = `file-group-${group.groupInfo.id}`;
          const layout = layouts[layoutId];
          const chartOrder = order.indexOf(layoutId);
          return updateFileGroup({
            id: group.groupInfo.id,
            body: {
              groupId: group.groupInfo.id,
              groupTitle: group.groupInfo.groupTitle,
              width: layout?.w !== undefined ? layout.w : group.groupInfo.width,
              height: layout?.h !== undefined ? layout.h : group.groupInfo.height,
              order: chartOrder !== -1 ? chartOrder : group.groupInfo.order || 0,
            },
          }).unwrap();
        });

        await Promise.all([
          updateBulkProgramChart({ updates }).unwrap(),
          ...fileGroupPromises,
        ]);
        toast.success("Program published successfully", { id: toastId });
      } else {
        // PROJECT BUILDER PUBLISH
        const payload = (activeCharts as any[]).map((chart: any) => {
          const layout = layouts[chart.id];
          const chartOrder = order.indexOf(chart.id);
          return {
            id: chart.id,
            height: layout?.h
              ? layout.h
              : chart.height >= 50
                ? Math.round((chart.height + 8) / 28)
                : chart.height,
            width: layout?.w ? layout.w : chart.width,
            order: chartOrder !== -1 ? chartOrder : chart.order || 0,
          };
        });

        const fileGroupPromises = (groupedFilesData || []).map((group: any) => {
          const layoutId = `file-group-${group.groupInfo.id}`;
          const layout = layouts[layoutId];
          const chartOrder = order.indexOf(layoutId);
          return updateFileGroup({
            id: group.groupInfo.id,
            body: {
              groupId: group.groupInfo.id,
              groupTitle: group.groupInfo.groupTitle,
              width: layout?.w !== undefined ? layout.w : group.groupInfo.width,
              height: layout?.h !== undefined ? layout.h : group.groupInfo.height,
              order: chartOrder !== -1 ? chartOrder : group.groupInfo.order || 0,
            },
          }).unwrap();
        });

        await Promise.all([layoutUpdate(payload).unwrap(), ...fileGroupPromises]);
        toast.success("Project published successfully", { id: toastId });
        navigate(`/client-panel/project-details/${projectId}`);
      }

      dispatch(setIsPublished(true));
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish charts", { id: toastId });
    }
  };

  /* ─── Template save ──────────────────────────────────────────────────────── */
  const handleTemplate = async () => {
    const targetId = isPage.programBuilder ? targetProgramId : projectId;
    if (!targetId) {
      toast.error(`${isPage.programBuilder ? "Program" : "Project"} ID is missing`);
      return;
    }
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    const toastId = toast.loading("Saving as template...");
    try {
      const payload: any = { name: templateName.trim() };
      if (isPage.programBuilder) {
        payload.programId = targetId;
        payload.clientId = userId;
        payload.ownerid = userId;
        await createProgramBuilderTemplate(payload).unwrap();
      } else {
        payload.projectId = targetId;
        await createATemplate(payload).unwrap();
      }
      toast.success("Template saved successfully", { id: toastId });
      setIsTemplateModalOpen(false);
      setTemplateName("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save template", { id: toastId });
    }
  };

  /* ─── Template apply ─────────────────────────────────────────────────────── */
  const handleApplyTemplateConfirm = async () => {
    if (!selectedTemplate || (!projectId && !targetProgramId)) return;
    const toastId = toast.loading("Applying template...");
    try {
      const payload: any = { name: selectedTemplate.name };
      if (isPage.programBuilder) {
        payload.programId = targetProgramId;
        payload.templateName = payload.name;
        delete payload.name;
        await applyProgramBuilderTemplate(payload).unwrap();
      } else {
        payload.projectId = projectId;
        await applyTemplate(payload).unwrap();
      }
      toast.success("Template applied successfully", { id: toastId });
      dispatch(setSelectedTemplate(null));
      setIsApplyConfirmOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to apply template", { id: toastId });
    }
  };

  /* ─── Return ─────────────────────────────────────────────────────────────── */
  return {
    handleSelectStatus,
    handleProgramSuccess,
    handleProjectSuccess,
    handleDownloadCSV,
    handleModalClose,
    handleDownloadClick,
    handleViewClick,
    handleDownloadPdfImage,
    handlePublish,
    handleTemplate,
    handleApplyTemplateConfirm,
    // Mutation loading states (needed by HeaderButtons)
    isCreatingTemplate,
    isApplyingTemplate,
    isApplyingProgramTemplate,
    isCreatingProgramTemplate,
  };
};

export type HeaderHandlers = ReturnType<typeof useHeaderHandlers>;
