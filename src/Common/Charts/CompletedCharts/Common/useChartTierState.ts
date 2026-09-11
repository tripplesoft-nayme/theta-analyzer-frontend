import { useMemo, useState } from "react";
import { BreadcrumbItem } from "./chartTypes";
import {
  useFindChildrenValueQuery,
  useLazyGetAllTheLeafChartQuery,
  useLazyGetProgramBuilderChartQuery,
} from "@/store/Api/ChartApi/ChartApi";

export const useChartTierState = (
  chartId: string,
  widgetTitle: string,
  tierLevel: number,
  breadcrumbPath: BreadcrumbItem[] = [],
  onNavigate?: (level: number) => void,
  preFetchedChildren?: any[],
  isProgramBuilder: boolean = false,
) => {
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: childrenResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useFindChildrenValueQuery(chartId, {
    skip:
      isProgramBuilder || !chartId || chartId === "root" || !!preFetchedChildren,
  });
  const [getLeafCharts] = useLazyGetAllTheLeafChartQuery();
  const [getProgramCharts] = useLazyGetProgramBuilderChartQuery();

  const getAllTheLeafChart = isProgramBuilder ? getProgramCharts : getLeafCharts;

  // Match the specific 404 "No chart is found" error from the backend
  const isNoChildrenError = useMemo(() => {
    if (!isError || !error) return false;
    const errData = (error as any)?.data;
    return (
      errData?.statusCode === 404 || errData?.message === "No chart is found"
    );
  }, [isError, error]);

  const childTiers = useMemo(() => {
    if (preFetchedChildren) return preFetchedChildren;
    if (isNoChildrenError) return [];
    return childrenResponse?.data || [];
  }, [preFetchedChildren, isNoChildrenError, childrenResponse]);

  const currentBreadcrumbs = useMemo(() => {
    const base =
      breadcrumbPath.length === 0
        ? [{ id: "dashboard", name: "Dashboard", level: -1 }]
        : breadcrumbPath;
    return [
      ...base,
      { id: chartId || "root", name: widgetTitle, level: tierLevel },
    ];
  }, [breadcrumbPath, chartId, widgetTitle, tierLevel]);

  const handleChildNavigate = (targetLevel: number) => {
    if (targetLevel < tierLevel) {
      setShowChildrenModal(false);
      if (onNavigate) onNavigate(targetLevel);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = currentBreadcrumbs[index];
    if (index < currentBreadcrumbs.length - 1) {
      if (onNavigate) {
        onNavigate(target.level);
      }
      setShowChildrenModal(false);
    }
  };

  return {
    showAddTierModal,
    setShowAddTierModal,
    showChildrenModal,
    setShowChildrenModal,
    isDownloading,
    setIsDownloading,
    childTiers,
    isLoading,
    isFetching,
    isNoChildrenError,
    currentBreadcrumbs,
    handleChildNavigate,
    handleBreadcrumbClick,
    getAllTheLeafChart,
  };
};
