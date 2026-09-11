import { Suspense, useMemo, useRef, useEffect } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { setSelectedWidgets } from "@/store/Slices/ChartSlice/ChartSlice";
import ProjectBuilderPlaceholderChartSkeleton from "@/Common/Skeleton/ProjectBuilderPlaceholderChartSkeleton";
import { Loader2 } from "lucide-react";

import { useFullscreen } from "./hooks/useFullscreen";
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardLayout } from "./hooks/useDashboardLayout";
import { useDashboardDragDrop } from "./hooks/useDashboardDragDrop";

import { FullscreenToggle } from "./FullscreenToggle";
import { DragDropPlaceholder } from "./DragDropPlaceholder";
import { DefaultDashboardWidgets } from "./DefaultDashboardWidgets";
import { DashboardGridItemRenderer } from "./DashboardGridItemRenderer";

interface ProjectDashboardViewProps {
  projectId?: string;
  isProgramBuilder?: boolean; // Context flag
  isPreviewOrPublished: boolean;
  isReadOnly?: boolean;
  groups?: any[]; // Passed when viewing a submission review
  selectedWidgets?: string[];
  hiddenDefaultWidgets?: string[];
  handleDefaultDelete?: (id: string) => void;
  handleDefaultCopy?: (name: string) => void;
  handleWidgetDelete?: (id: string) => void;
  onDropWidget?: (widgetId: string) => void;
}

const ProjectDashboardView = ({
  projectId: projectIdProp,
  isProgramBuilder = false,
  isPreviewOrPublished,
  isReadOnly = false,
  groups,
  selectedWidgets = [],
  hiddenDefaultWidgets = [],
  handleDefaultDelete = () => { },
  handleDefaultCopy = () => { },
  handleWidgetDelete = () => { },
  onDropWidget,
}: ProjectDashboardViewProps) => {
  const { projectId: projectIdParam, programId: programIdParam } = useParams();
  const dispatch = useAppDispatch();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const { programId: programIdFromState, projectId: projectIdFromState, selectedTemplate, hiddenWidgetIds = [] } =
    useAppSelector((state) => state.chartSlice);
  const activeConfigId = useAppSelector((state) => state.chartSlice.activeConfigWidgetId);

  const resolvedProjectId =
    projectIdProp || projectIdParam || (!isProgramBuilder ? projectIdFromState : undefined);
  const resolvedProgramId = programIdParam || (isProgramBuilder ? programIdFromState : undefined);
  const isReviewMode = !!groups;

  const storageId = isProgramBuilder ? resolvedProgramId : resolvedProjectId;
  const storageKey = useMemo(() => {
    const prefix = isReviewMode
      ? "review_"
      : isProgramBuilder
        ? "program_"
        : "project_";
    return `custom_layout_${prefix}${storageId || "default"}`;
  }, [storageId, isReviewMode, isProgramBuilder]);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isViewerPanel = location.pathname.includes("/viewer-panel");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const queryArg = useMemo(() => {
    if (isViewerPanel && startDate && endDate) {
      return {
        id: resolvedProjectId as string,
        startDate: `${startDate}T00:00:00.000Z`,
        asOf: `${endDate}T00:00:00.000Z`,
      };
    }
    return resolvedProjectId as string;
  }, [resolvedProjectId, isViewerPanel, startDate, endDate]);

  // 1. Data Hook
  const {
    groupedFilesData,
    finalChartsData,
    hasTableData,
    hasFilesData,
    calculatedH,
    handleFieldsCountChange,
    isChartsLoading,
    hasMoreCharts,
    loadMoreCharts,
    isChartsFetching,
  } = useDashboardData({
    queryArg,
    resolvedProgramId,
    resolvedProjectId,
    isProgramBuilder,
    isReviewMode,
    selectedTemplate,
    groups,
  });

  // Restore unsaved widgets from localStorage order on initial load
  useEffect(() => {
    if (isPreviewOrPublished || isReadOnly || isChartsLoading) return;

    try {
      const savedOrderRaw = localStorage.getItem(storageKey + "_order");
      if (!savedOrderRaw) return;
      const savedOrderList: string[] = JSON.parse(savedOrderRaw);

      const unsavedLocal = savedOrderList.filter((id) => {
        if (id === "project-info-table" || id.startsWith("file-group-")) return false;
        const isSavedInDb = (finalChartsData || []).some((c: any) => c.id === id);
        return !isSavedInDb;
      });

      const missingFromState = unsavedLocal.filter((id) => !selectedWidgets.includes(id));
      if (missingFromState.length > 0) {
        dispatch(setSelectedWidgets([...selectedWidgets, ...missingFromState]));
      }
    } catch (e) {
      console.error("Error restoring widgets from localStorage:", e);
    }
  }, [finalChartsData, isChartsLoading, storageKey, isPreviewOrPublished, isReadOnly, dispatch]);

  // Show default charts logic
  const isContextEmpty = (!finalChartsData || finalChartsData.length === 0) && selectedWidgets.length === 0;
  const showDefaultCharts = !resolvedProjectId || isContextEmpty;

  // Ref to track which chart was hovered when dropping an external widget
  const externalDropTargetRef = useRef<string | null>(null);
  const externalDropTargetPositionRef = useRef<"before" | "after">("after");
  const droppedOnCanvasRef = useRef<boolean>(false);

  // 2. Layout Hook
  const {
    layouts,
    orderedItems,
    setOrderedItems,
    onResize,
    onResizeStop,
    persistToStorage,
    previousLayouts,
    deleteWidgetLayout,
  } = useDashboardLayout({
    storageKey,
    activeConfigId,
    isPreviewOrPublished,
    isReadOnly,
    selectedWidgets,
    finalChartsData,
    groupedFilesData,
    hasTableData,
    calculatedH,
    hiddenWidgetIds,
    externalDropTargetRef,
    externalDropTargetPositionRef,
    droppedOnCanvasRef,
    isChartsLoading,
  });

  const handleWidgetDeleteWrapper = (id: string) => {
    deleteWidgetLayout(id);
    handleWidgetDelete(id);
  };

  // 3. Drag and Drop Hook
  const {
    isDragOverCanvas,
    draggedItemId,
    hoveredDropTargetId,
    insertAfterTarget,
    onDragStart,
    onDragOver,
    onDragLeaveItem,
    onDragEnd,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
  } = useDashboardDragDrop({
    orderedItems,
    setOrderedItems,
    layouts,
    persistToStorage,
    onDropWidget,
    externalDropTargetRef,
    externalDropTargetPositionRef,
    droppedOnCanvasRef,
  });

  return (
    <Suspense fallback={<ProjectBuilderPlaceholderChartSkeleton />}>
      <style>{`
        /* Sticky chart during configuration mode */
        .config-mode-active .sticky.top-5 {
          height: 450px !important;
          position: sticky !important;
          top: 20px !important;
          z-index: 10 !important;
        }
      `}</style>
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`flex-1 min-w-0 w-full min-h-full flex flex-col ${!isPreviewOrPublished && !isReadOnly
          ? isDragOverCanvas
            ? "border-2 border-dashed border-blue-400 dark:border-blue-500/50 rounded-lg"
            : "border border-gray-200 dark:border-slate-800 rounded-lg p-4"
          : ""
          } mb-6 relative`}
      >
        {/* Unified Grid for Project Table, Charts & Widgets */}
        <div
          className="w-full grid gap-2 auto-rows-[20px]"
          style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
        >
          {orderedItems.map((id) => (
            <DashboardGridItemRenderer
              key={id}
              id={id}
              layout={layouts[id] || { w: 6, h: 4 }}
              previousLayouts={previousLayouts}
              calculatedH={calculatedH}
              hasTableData={hasTableData}
              isReadOnly={isReadOnly}
              isPreviewOrPublished={isPreviewOrPublished}
              isProgramBuilder={isProgramBuilder}
              activeConfigId={activeConfigId}
              resolvedProjectId={resolvedProjectId}
              resolvedProgramId={resolvedProgramId}
              groupedFilesData={groupedFilesData}
              finalChartsData={finalChartsData}
              selectedWidgets={selectedWidgets}
              orderedItems={orderedItems}
              onResize={onResize}
              onResizeStop={onResizeStop}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeaveItem={onDragLeaveItem}
              onDragEnd={onDragEnd}
              draggedItemId={draggedItemId}
              hoveredDropTargetId={hoveredDropTargetId}
              insertAfterTarget={insertAfterTarget}
              handleWidgetDelete={handleWidgetDeleteWrapper}
              handleFieldsCountChange={handleFieldsCountChange}
            />
          ))}

          {/* Inline drop skeleton */}
          <DragDropPlaceholder isDragOverCanvas={isDragOverCanvas} />
        </div>

        {/* Render Default Placeholder Charts strictly outside the resize grid */}
        <DefaultDashboardWidgets
          showDefaultCharts={showDefaultCharts}
          hasTableData={hasTableData}
          hasFilesData={hasFilesData}
          isReadOnly={isReadOnly}
          isPreviewOrPublished={isPreviewOrPublished}
          isContextEmpty={isContextEmpty}
          hiddenDefaultWidgets={hiddenDefaultWidgets}
          isProgramBuilder={isProgramBuilder}
          resolvedProgramId={resolvedProgramId}
          resolvedProjectId={resolvedProjectId}
          handleDefaultDelete={handleDefaultDelete}
          handleDefaultCopy={handleDefaultCopy}
        />

        {/* View More Button for Root Charts */}
        {hasMoreCharts && (
          <div className="flex justify-center mt-6 mb-4 z-10">
            <button
              onClick={loadMoreCharts}
              disabled={isChartsFetching}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isChartsFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "View More Charts"
              )}
            </button>
          </div>
        )}

        {/* Floating Fullscreen Toggle Button */}
        <FullscreenToggle
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      </div>
    </Suspense>
  );
};

export default ProjectDashboardView;
