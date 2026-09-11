import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useState, useEffect, Suspense } from "react";
import ProjectWidget, { Widget } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/ProjectWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useLocation, useOutletContext } from "react-router-dom";
import {
  setSelectedWidgets,
  setIsPreview,
  setIsPublished,
  setProjectId,
  setProgramId,
} from "@/store/Slices/ChartSlice/ChartSlice";
import { toast } from "sonner";
const ProjectDashboardView = lazyWithRetry(() => import("./Components/ProjectDashboardView/ProjectDashboardView"));

const SESSION_KEY_PROJECT = "chartBuilder_projectId";
const SESSION_KEY_PROGRAM = "chartBuilder_programId";

const ClientProjectBuilder = () => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const isProgramBuilder = pathname.split("/")[2] === "program-builder";

  const { projectId, isPreview, isPublished, widgetConfigs, selectedWidgets } =
    useAppSelector((state) => state.chartSlice);

  useEffect(() => {
    dispatch(setIsPreview(false));
    dispatch(setIsPublished(false));
    dispatch(setSelectedWidgets([]));
    return () => {
      dispatch(setSelectedWidgets([]));
    };
  }, [dispatch]);

  const location = useLocation();
  const locationState = location.state as {
    projectId?: string;
    programId?: string;
  } | null;

  // On mount / context change: prioritise locationState, then sessionStorage fallback.
  // This keeps IDs alive across page refreshes (sessionStorage survives refresh but not tab close).
  useEffect(() => {
    dispatch(setSelectedWidgets([])); // Clear selected widgets on context change
    if (isProgramBuilder) {
      // Clear any cached project ID when in Program Builder mode
      dispatch(setProjectId(""));
      sessionStorage.removeItem(SESSION_KEY_PROJECT);

      const resolvedProgramId =
        locationState?.programId ||
        sessionStorage.getItem(SESSION_KEY_PROGRAM) ||
        "";
      if (resolvedProgramId) {
        dispatch(setProgramId(resolvedProgramId));
        sessionStorage.setItem(SESSION_KEY_PROGRAM, resolvedProgramId);
      }
    } else {
      const resolvedProjectId =
        locationState?.projectId ||
        sessionStorage.getItem(SESSION_KEY_PROJECT) ||
        "";
      const resolvedProgramId =
        locationState?.programId ||
        sessionStorage.getItem(SESSION_KEY_PROGRAM) ||
        "";

      if (resolvedProjectId) dispatch(setProjectId(resolvedProjectId));
      if (resolvedProgramId) dispatch(setProgramId(resolvedProgramId));

      // Persist whatever we just resolved back into sessionStorage
      if (resolvedProjectId)
        sessionStorage.setItem(SESSION_KEY_PROJECT, resolvedProjectId);
      if (resolvedProgramId)
        sessionStorage.setItem(SESSION_KEY_PROGRAM, resolvedProgramId);
    }
  }, [dispatch, isProgramBuilder, locationState?.projectId, locationState?.programId]);

  // Removed redundant useEffect since we'll handle it inside the isProgramBuilder one if needed or just initialize properly

  const handleWidgetSelect = (widgetId: string) => {
    if (widgetId) {
      const uniqueId = `${widgetId}_${Date.now()}`;
      const newSelected = [...selectedWidgets, uniqueId];
      dispatch(setSelectedWidgets(newSelected));
    }
  };

  const handleWidgetDelete = (uniqueId: string) => {
    dispatch(
      setSelectedWidgets(selectedWidgets.filter((id) => id !== uniqueId)),
    );
  };

  useEffect(() => {
    const handleDownload = () => {
      const headers = ["Widget ID", "Configuration"];
      const rows = selectedWidgets.map((id) => {
        const config = widgetConfigs[id] || "Default Configuration";
        const configStr =
          typeof config === "string"
            ? config
            : JSON.stringify(config).replace(/\t/g, " ");
        return [id, configStr];
      });

      const csvContent =
        "data:text/csv;charset=utf-8," +
        headers.join("\t") +
        "\n" +
        rows.map((e) => e.join("\t")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "project_configuration.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Configuration downloaded successfully");
    };

    window.addEventListener("download-project-config", handleDownload);
    return () =>
      window.removeEventListener("download-project-config", handleDownload);
  }, [selectedWidgets, widgetConfigs]);

  const [hiddenDefaultWidgets, setHiddenDefaultWidgets] = useState<string[]>(
    [],
  );

  const handleDefaultDelete = (widgetId: string) => {
    setHiddenDefaultWidgets((prev) => [...prev, widgetId]);
    toast.success("Widget removed");
  };

  const handleDefaultCopy = (widgetName: string) => {
    navigator.clipboard.writeText(`Data for ${widgetName}`);
    toast.success(`${widgetName} data copied to clipboard`);
  };

  const { activeWidgetInfo, setActiveWidgetInfo } = useOutletContext<{
    activeWidgetInfo: Widget | null;
    setActiveWidgetInfo: (info: Widget | null) => void;
  }>() || { activeWidgetInfo: null, setActiveWidgetInfo: () => { } };

  const isPreviewOrPublished = isPreview || isPublished;

  return (
    <div className="relative flex min-h-full h-full gap-6 w-full">
      {!isPreviewOrPublished && (
        <div className="sticky top-5 h-full">
          <ProjectWidget
            onWidgetSelect={handleWidgetSelect}
            onShowInfo={setActiveWidgetInfo}
            activeWidgetInfo={activeWidgetInfo}
          />
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] min-w-0 transition-all duration-300">
        <Suspense fallback={<div className="flex-1 w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
          <ProjectDashboardView
            projectId={projectId as string}
            isProgramBuilder={isProgramBuilder}
            isPreviewOrPublished={isPreviewOrPublished}
            selectedWidgets={selectedWidgets}
            hiddenDefaultWidgets={hiddenDefaultWidgets}
            handleDefaultDelete={handleDefaultDelete}
            handleDefaultCopy={handleDefaultCopy}
            handleWidgetDelete={handleWidgetDelete}
            onDropWidget={handleWidgetSelect}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default ClientProjectBuilder;

