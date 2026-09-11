import { useMemo, useState, useCallback, useEffect } from "react";
import {
  useGetRootChartQuery,
  useGetProgramBuilderChartQuery,
  useGetProjectInformationTableQuery,
} from "@/store/Api/ChartApi/ChartApi";
import {
  useGetProjectFilesByGroupQuery,
  useGetProgramFilesByGroupQuery,
} from "@/store/Api/Files/FilesApi";

const EMPTY_ARRAY: any[] = [];

export const useDashboardData = ({
  queryArg,
  resolvedProgramId,
  resolvedProjectId,
  isProgramBuilder,
  isReviewMode,
  selectedTemplate,
  groups,
}: {
  queryArg: any;
  resolvedProgramId?: string;
  resolvedProjectId?: string;
  isProgramBuilder: boolean;
  isReviewMode: boolean;
  selectedTemplate: any;
  groups?: any[];
}) => {
  const [page, setPage] = useState(1);
  const [accumulatedCharts, setAccumulatedCharts] = useState<any[]>([]);

  const chartQueryArg = useMemo(() => {
    if (typeof queryArg === "string") {
      return { id: queryArg, page, limit: 10 };
    }
    return { ...queryArg, page, limit: 10 };
  }, [queryArg, page]);

  const {
    data: projectsChart,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useGetRootChartQuery(chartQueryArg, {
    skip: isProgramBuilder || !resolvedProjectId || isReviewMode,
  });

  const { data: programCharts, isLoading: isProgramLoading } = useGetProgramBuilderChartQuery(
    resolvedProgramId as string,
    {
      skip: !isProgramBuilder || !resolvedProgramId || isReviewMode,
    },
  );

  const isChartsLoading = isReviewMode
    ? false
    : isProgramBuilder
      ? (resolvedProgramId ? isProgramLoading : false)
      : (resolvedProjectId ? isProjectsLoading : false);

  const {
    data: tableConfigRes,
    isFetching: isTableFetching,
    isError: isTableError,
  } = useGetProjectInformationTableQuery(resolvedProjectId as string, {
    skip: !resolvedProjectId,
  });

  const { data: projectGroupedFilesRes } = useGetProjectFilesByGroupQuery(
    resolvedProjectId as string,
    {
      skip: isProgramBuilder || !resolvedProjectId,
    },
  );
  const { data: programGroupedFilesRes } = useGetProgramFilesByGroupQuery(
    resolvedProgramId as string,
    {
      skip: !isProgramBuilder || !resolvedProgramId,
    },
  );

  const groupedFilesData = useMemo(() => {
    const resData = isProgramBuilder ? programGroupedFilesRes : projectGroupedFilesRes;
    const body = resData?.data;
    if (body && typeof body === "object" && "data" in body && Array.isArray(body.data)) {
      return body.data;
    }
    return Array.isArray(body) ? body : EMPTY_ARRAY;
  }, [projectGroupedFilesRes, programGroupedFilesRes, isProgramBuilder]);

  const [editingFieldsCount, setEditingFieldsCount] = useState<number | null>(null);

  const handleFieldsCountChange = useCallback((count: number | null) => {
    setEditingFieldsCount(count);
  }, []);

  const hasTableData = useMemo(() => {
    if (!resolvedProjectId || isTableFetching || isTableError) return false;
    const body = tableConfigRes as any;
    const data = body?.data || body;

    if (Array.isArray(data)) return data.length > 0;
    if (data?.columns && Array.isArray(data.columns)) return data.columns.length > 0;

    return false;
  }, [tableConfigRes, resolvedProjectId, isTableFetching, isTableError]);

  const calculatedH = useMemo(() => {
    if (editingFieldsCount !== null) {
      const hVal = Math.max(5, Math.ceil((editingFieldsCount * 52 + 120) / 25));
      return hVal;
    }
    if (!resolvedProjectId || isTableFetching || isTableError || !tableConfigRes) {
      return 5;
    }
    const body = tableConfigRes as any;
    const data = body?.data || body;

    let count = 0;
    if (Array.isArray(data)) {
      count = data.length;
    } else if (data?.columns && Array.isArray(data.columns)) {
      count = data.columns.length;
    }

    const effectiveFieldsCount = count > 0 ? count : 6;
    const hVal = Math.max(5, Math.ceil((effectiveFieldsCount * 52 + 100) / 28));
    return hVal;
  }, [tableConfigRes, resolvedProjectId, isTableFetching, isTableError, editingFieldsCount]);

  const hasFilesData = useMemo(() => {
    return groupedFilesData.some((g: any) => Array.isArray(g.files) && g.files.length > 0);
  }, [groupedFilesData]);

  const reviewChartsData = useMemo(() => {
    if (!groups) return null;
    return groups.flatMap((g: any) => g.charts || []);
  }, [groups]);

  // Reset accumulated charts when project or base query filters change
  const queryArgSerialized = useMemo(() => {
    return typeof queryArg === "string" ? queryArg : JSON.stringify(queryArg);
  }, [queryArg]);

  useEffect(() => {
    setAccumulatedCharts([]);
    setPage(1);
  }, [resolvedProjectId, queryArgSerialized]);

  // Append new page results to accumulated charts list
  useEffect(() => {
    const res = projectsChart as any;
    const data = res?.data || res;
    let newCharts: any[] = [];
    if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
      newCharts = data.data;
    } else if (Array.isArray(data)) {
      newCharts = data;
    }

    if (newCharts.length > 0) {
      setAccumulatedCharts((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const filteredNew = newCharts.filter((c) => !existingIds.has(c.id));
        return [...prev, ...filteredNew];
      });
    }
  }, [projectsChart]);

  const projectsChartsData = useMemo(() => {
    if (isProgramBuilder || !resolvedProjectId || isReviewMode) return null;
    return accumulatedCharts.filter((chart: any) => chart.projectId === resolvedProjectId);
  }, [accumulatedCharts, isProgramBuilder, resolvedProjectId, isReviewMode]);

  const programChartsData = useMemo(() => {
    if (!isProgramBuilder || !resolvedProgramId || isReviewMode) return null;
    const res = programCharts as any;
    const data = res?.data || res;
    const charts = data?.charts || (data && Array.isArray(data) ? data : null);
    return charts;
  }, [programCharts, isProgramBuilder, resolvedProgramId, isReviewMode]);

  const finalChartsData = useMemo(() => {
    const baseCharts = reviewChartsData || projectsChartsData || programChartsData || [];
    if (selectedTemplate && selectedTemplate.modifiedCharts) {
      return [...baseCharts, ...selectedTemplate.modifiedCharts];
    }
    return baseCharts.length > 0 ? baseCharts : null;
  }, [reviewChartsData, projectsChartsData, programChartsData, selectedTemplate]);

  const meta = projectsChart?.data?.meta || projectsChart?.meta;
  const hasMoreCharts = useMemo(() => {
    if (!meta) return false;
    return page < (meta.totalPages || 0);
  }, [meta, page]);

  const loadMoreCharts = useCallback(() => {
    if (hasMoreCharts && !isProjectsFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMoreCharts, isProjectsFetching]);

  return {
    groupedFilesData,
    finalChartsData,
    hasTableData,
    hasFilesData,
    calculatedH,
    handleFieldsCountChange,
    isChartsLoading,
    hasMoreCharts,
    loadMoreCharts,
    isChartsFetching: isProjectsFetching,
  };
};
