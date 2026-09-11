import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { Suspense } from "react";
import DashboardGridItem from "../DashboardGridItem";
import { ChartErrorBoundary } from "./ChartErrorBoundary";
import { CHART_REGISTRY, FilesPreview } from "../ChartRegistry";
import ChartSkeleton from "@/Common/Skeleton/ChartSkeleton";
import ChartModuleSkeleton from "@/Common/Skeleton/ChartModuleSkeleton";

const renderChartContent = lazyWithRetry(() => import("../DefaultChartData").then(m => ({ default: m.renderChartContent })));
const ProjectInformationModule = lazyWithRetry(() => import("@/Common/Charts/CompletedCharts/ProjectInformation/ProjectInformationModule"));

const ROW_HEIGHT = 20;
const GAP_SIZE = 8;

export interface DashboardGridItemRendererProps {
  id: string;
  layout: { w: number; h: number };
  calculatedH: number;
  hasTableData: boolean;
  isReadOnly: boolean;
  isPreviewOrPublished: boolean;
  isProgramBuilder: boolean;
  activeConfigId: string | null;
  resolvedProjectId?: string;
  resolvedProgramId?: string;
  groupedFilesData: any[];
  finalChartsData: any[] | null;
  selectedWidgets: string[];
  orderedItems: string[];
  onResize: (id: string, w: number, h: number) => void;
  onResizeStop: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeaveItem?: (id: string) => void;
  onDragEnd: () => void;
  draggedItemId?: string | null;
  hoveredDropTargetId?: string | null;
  insertAfterTarget?: boolean;
  handleWidgetDelete: (id: string) => void;
  handleFieldsCountChange: (count: number | null) => void;
  previousLayouts?: Record<string, { w: number; h: number }>;
}

export const DashboardGridItemRenderer = ({
  id,
  layout,
  calculatedH,
  hasTableData,
  isReadOnly,
  isPreviewOrPublished,
  isProgramBuilder,
  activeConfigId,
  resolvedProjectId,
  resolvedProgramId,
  groupedFilesData,
  finalChartsData,
  selectedWidgets,
  orderedItems,
  onResize,
  onResizeStop,
  onDragStart,
  onDragOver,
  onDragLeaveItem,
  onDragEnd,
  draggedItemId,
  hoveredDropTargetId,
  insertAfterTarget,
  handleWidgetDelete,
  handleFieldsCountChange,
  previousLayouts,
}: DashboardGridItemRendererProps) => {
  // Handle Project Information Table
  if (id === "project-info-table" && hasTableData) {
    return (
      <DashboardGridItem
        key={id}
        id={id}
        w={layout?.w || 20}
        h={layout?.h || calculatedH}
        minH={calculatedH}
        isReadOnly={isReadOnly}
        onResize={onResize}
        onResizeStop={onResizeStop}
        onDragStart={onDragStart}
        disableResize={activeConfigId === id}
        disableDrag={activeConfigId === id}
        onDragOver={onDragOver}
        onDragLeaveItem={onDragLeaveItem}
        onDragEnd={onDragEnd}
        draggedItemId={draggedItemId}
        hoveredDropTargetId={hoveredDropTargetId}
        insertAfterTarget={insertAfterTarget}
        className="border border-gray-200 dark:border-slate-800"
      >
        <ChartErrorBoundary>
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
            <ProjectInformationModule
              projectId={resolvedProjectId as string}
              isPreview={isPreviewOrPublished || isReadOnly}
              onDelete={() => handleWidgetDelete(id)}
              onFieldsChange={handleFieldsCountChange}
            />
          </Suspense>
        </ChartErrorBoundary>
      </DashboardGridItem>
    );
  }

  // Handle dynamic grouped file widgets
  if (id.startsWith("file-group-")) {
    const groupId = id.replace("file-group-", "");
    const group = (groupedFilesData || []).find((g: any) => g.groupInfo.id === groupId);

    if (group) {
      return (
        <DashboardGridItem
          key={id}
          id={id}
          w={layout?.w || 10}
          h={layout?.h || 18}
          isReadOnly={isReadOnly}
          onResize={onResize}
          onResizeStop={onResizeStop}
          onDragStart={onDragStart}
          disableResize={activeConfigId === id}
          disableDrag={activeConfigId === id}
          onDragOver={onDragOver}
          onDragLeaveItem={onDragLeaveItem}
          onDragEnd={onDragEnd}
          draggedItemId={draggedItemId}
          hoveredDropTargetId={hoveredDropTargetId}
          insertAfterTarget={insertAfterTarget}
        >
          <ChartErrorBoundary>
            <FilesPreview
              files={group.files || []}
              title={group.groupInfo.groupTitle || "Media Widget"}
              onDelete={() => handleWidgetDelete(id)}
              groupId={group.groupInfo.id}
              isPreview={isPreviewOrPublished || isReadOnly}
            />
          </ChartErrorBoundary>
        </DashboardGridItem>
      );
    }
  }

  // Handle existing charts
  const chartItem = (finalChartsData || []).find((item: any) => (item.id || `default_0`) === id);

  if (chartItem) {
    const minHeightGrid = chartItem.category === "MARIMEKKO" ? 6 : chartItem.category === "TREEMAP" || chartItem.category === "CANDLESTICK" ? 6 : undefined;

    return (
      <DashboardGridItem
        key={id}
        id={id}
        w={layout?.w || 10}
        h={layout?.h || 15}
        minH={minHeightGrid}
        isReadOnly={isReadOnly}
        disableResize={activeConfigId === id}
        disableDrag={activeConfigId === id}
        isConfigActive={activeConfigId === id}
        onResize={onResize}
        onResizeStop={onResizeStop}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeaveItem={onDragLeaveItem}
        onDragEnd={onDragEnd}
        draggedItemId={draggedItemId}
        hoveredDropTargetId={hoveredDropTargetId}
        insertAfterTarget={insertAfterTarget}
      >
        <ChartErrorBoundary>
          <Suspense fallback={<ChartSkeleton />}>
            {(() => {
              const LazyRender = renderChartContent as any;
              const originalLayout = (previousLayouts && previousLayouts[id]) || layout || { w: 10, h: 15 };
              return (
                <LazyRender
                  {...chartItem}
                  projectId={resolvedProjectId}
                  programId={resolvedProgramId}
                  isPreview={isPreviewOrPublished || isReadOnly}
                  isProgramBuilder={isProgramBuilder}
                  width={originalLayout.w}
                  height={originalLayout.h}
                  order={chartItem.order !== undefined ? Number(chartItem.order) : orderedItems.indexOf(id)}
                />
              );
            })()}
          </Suspense>
        </ChartErrorBoundary>
      </DashboardGridItem>
    );
  }

  // Handle pending creation widgets
  const isPendingWidget = selectedWidgets.includes(id);
  if (isPendingWidget) {
    const widgetType = id.split("_")[0];
    const config = CHART_REGISTRY[widgetType];
    if (config) {
      const ChartComponent = config.component;
      const originalLayout = (previousLayouts && previousLayouts[id]) || layout || { w: 10, h: 15 };
      return (
        <DashboardGridItem
          key={id}
          id={id}
          w={layout?.w || 10}
          h={layout?.h || 15}
          isReadOnly={isReadOnly}
          disableResize={activeConfigId === id}
          disableDrag={activeConfigId === id}
          isConfigActive={activeConfigId === id}
          onResize={onResize}
          onResizeStop={onResizeStop}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeaveItem={onDragLeaveItem}
          onDragEnd={onDragEnd}
          draggedItemId={draggedItemId}
          hoveredDropTargetId={hoveredDropTargetId}
          insertAfterTarget={insertAfterTarget}
          className=""
        >
          <ChartErrorBoundary>
            <Suspense fallback={<ChartModuleSkeleton />}>
              <ChartComponent
                chartName={id}
                projectId={resolvedProjectId}
                programId={resolvedProgramId}
                isPreview={isPreviewOrPublished || isReadOnly}
                isProgramBuilder={isProgramBuilder}
                onDelete={() => handleWidgetDelete(id)}
                onSaveSuccess={() => handleWidgetDelete(id)}
                className={config.className}
                height={originalLayout.h * (ROW_HEIGHT + GAP_SIZE) - GAP_SIZE - 4}
                layoutW={originalLayout.w}
                layoutH={originalLayout.h}
                orderIndex={orderedItems.indexOf(id)}
              />
            </Suspense>
          </ChartErrorBoundary>
        </DashboardGridItem>
      );
    }
  }

  return null;
};
