import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, ReactNode, useEffect, useState, useRef, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setChildPayload,
  setActiveConfigWidgetId,
} from "@/store/Slices/ChartSlice/ChartSlice";
import { useParams } from "react-router-dom";
import AddTierModal from "./Modal/AddTierModal";
import TierChartModal from "./Modal/TierChartModal";
import ChartDeleteModal from "./Modal/ChartDeleteModal";
import ChartCardWrapper from "./ChartCardWrapper";
import { toast } from "sonner";

const WidgetForChartModuleOne = lazyWithRetry(() => import("./WidgetsConfiguration/WidgetForChartModuleOne"));
const ComboChartConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/ComboChartConfiguration"));
const GaugeConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/GaugeConfiguration"));
const PieChartConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/PieChartConfiguration"));
const BoxPlotChartConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/BoxPlotChartConfiguration"));
const CalendarHeatmapConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/CalendarHeatmapConfiguration"));
const CandleChartConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/CandleChartConfiguration"));
const CohortAnalysisConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/CohortAnalysisConfiguration"));
const GeographicMapConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/GeographicMapConfiguration"));
const HistogramChartConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/HistogramChartConfiguration"));
const ProgressRingConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/ProgressRingConfiguration"));
const TreeConfiguration = lazyWithRetry(() => import("./WidgetsConfiguration/TreeConfiguration"));
const WidgetForChartModuleThree = lazyWithRetry(() => import("./WidgetsConfiguration/WidgetForChartModuleThree"));

const getConfigComponent = (category: string) => {
  switch (category) {
    case "COMBO": return ComboChartConfiguration;
    case "GAUGE": return GaugeConfiguration;
    case "PIE": return PieChartConfiguration;
    case "BOXPLOT":
    case "BOX_WHISKER": return BoxPlotChartConfiguration;
    case "CALENDAR_HEATMAP": return CalendarHeatmapConfiguration;
    case "CANDLESTICK": return CandleChartConfiguration;
    case "COHORT":
    case "RETENTION": return CohortAnalysisConfiguration;
    case "GEOGRAPHIC_MAP":
    case "GEOGRAPHY_GRAPH": return GeographicMapConfiguration;
    case "HISTOGRAM": return HistogramChartConfiguration;
    case "PROGRESS_RING":
    case "RING": return ProgressRingConfiguration;
    case "DECOMPOSITION_TREE": return TreeConfiguration;
    case "TREEMAP":
    case "POLAR_AREA":
    case "PARETO":
    case "FUNNEL":
    case "BULLET": return WidgetForChartModuleThree;
    default: return WidgetForChartModuleOne;
  }
};

// Common Imports
import { LegendValue, ChartType, BaseChartProps } from "./chartTypes";
import {
  getEffectiveLegendValues,
  getEffectiveXAxisValues,
  getSafeRanges,
  resolveChartData,
  flattenDecompositionTree,
  extractLegendsFromXAxis,
} from "./chartUtils";
import { useChartTierState } from "./useChartTierState";
import { downloadChartDataAsExcel, ChartExcelType } from "./excelUtils";
import { ChartLegendHeader, ChartChildTierFooter } from "./ChartSharedUI";
import {
  useDeleteChartMutation,
  useDeleteProgramChartMutation,
  useUpdateChartConfigMutation,
  useUpdateBulkProgramChartMutation,
} from "@/store/Api/ChartApi/ChartApi";

interface BaseChartContainerProps extends BaseChartProps {
  category: ChartType;
  excelType: ChartExcelType;
  children: (data: {
    chartData: any;
    isSampleData: boolean;
    safeStartingRange: number;
    safeEndingRange: number;
    effectiveLegendValues: LegendValue[];
    effectiveXAxisValues: string[];
    categoryTitle?: string;
  }) => ReactNode;
  generatorFunc: (
    xAxis: string[],
    legends: LegendValue[],
    numOfLegendDataSet: number,
    start: number,
    end: number,
  ) => any;
  getTierLegends: (tier: any) => LegendValue[];
  parseTierData: (
    xAxis: any,
    legends: LegendValue[],
    title: string,
  ) => { labels: string[]; data: any };
  renderChildChart: (tier: any, props: any) => ReactNode;
  showLegend?: boolean;
  categoryTitle?: string;
  xAxis?: any;
  customHeaderContent?: ReactNode;
  footer?: ReactNode;
  disableAddTier?: boolean;
  disableDownload?: boolean;
  onDeleteChart?: (chartId: string) => void;
}

export default function BaseChartContainer({
  widgetTitle = "Chart",
  groupTitle = "",
  xAxisValues = [],
  yAxisValues = [],
  zAxisValues = [],
  legendValues = [],
  numOfLegendDataSet = 1,
  startingRange,
  endingRange,
  onToggleWidget,
  onDelete,
  tierLevel = 0,
  chartId = "root",
  projectId,
  isCreationMode = false,
  allUploadedData,
  isPreview = false,
  breadcrumbPath = [],
  onNavigate,
  category,
  excelType,
  children,
  generatorFunc,
  getTierLegends,
  parseTierData,
  renderChildChart,
  preFetchedChildren,
  showLegend = true,
  categoryTitle,
  xAxis,
  yAxis,
  zAxis,
  customHeaderContent: providedHeaderContent,
  footer: providedFooter,
  disableAddTier = false,
  disableDownload = false,
  // onDeleteChart,
  isProgramBuilder = false,
  isValueDetection = false,
  width,
  height,
  order,
}: BaseChartContainerProps) {
  const { projectId: projectIdFromParams } = useParams();
  const effectiveProjectId = projectId || projectIdFromParams;
  const [deleteChart] = useDeleteChartMutation();
  const [deleteProgramChart] = useDeleteProgramChartMutation();
  const [updateChartConfig] = useUpdateChartConfigMutation();
  const [updateBulkProgramChart] = useUpdateBulkProgramChartMutation();
  const dispatch = useAppDispatch();
  const { programId } = useAppSelector((state) => state.chartSlice);
  const finalEffectiveId = isProgramBuilder ? programId : effectiveProjectId;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ---------- EDITING STATES ---------- */
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(widgetTitle);
  const [localXAxisValues, setLocalXAxisValues] = useState<string[]>([]);
  const [localNumOfXAxisDataSet, setLocalNumOfXAxisDataSet] = useState<number>(0);
  const [localLegendValues, setLocalLegendValues] = useState<LegendValue[]>([]);
  const [localNumOfLegendDataSet, setLocalNumOfLegendDataSet] = useState<number>(0);
  const [localStartingRange, setLocalStartingRange] = useState<number>(0);
  const [localEndingRange, setLocalEndingRange] = useState<number>(100);
  const [localShowLegend, setLocalShowLegend] = useState(true);
  const [localBinCount, setLocalBinCount] = useState<number>(10);
  // Live preview data for chart types that manage their own data state in the config panel (e.g. BOX_WHISKER)
  const [localBoxPlotLiveData, setLocalBoxPlotLiveData] = useState<any[] | null>(null);

  useEffect(() => {
    if (isEditing && chartId) {
      dispatch(setActiveConfigWidgetId(chartId));
    } else if (!isEditing) {
      dispatch(setActiveConfigWidgetId(null));
    }
    return () => {
      if (isEditing) {
        dispatch(setActiveConfigWidgetId(null));
      }
    };
  }, [isEditing, chartId, dispatch]);

  const handleEditClick = () => {
    setLocalTitle(widgetTitle);

    let currentXAxisValues = xAxisValues;
    let currentLegendValues = effectiveLegendValues;

    if (category === "BULLET" && xAxis) {
      try {
        const parsed = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
        const matrix = Array.isArray(parsed) ? parsed : parsed?.labels || [];
        if (matrix && matrix.length > 0) {
          const rows = matrix.slice(1);
          currentLegendValues = rows.map((row: any[], idx: number) => {
            const labelStr = String(row[0] || "").trim();
            const matchedWidget = (effectiveLegendValues || []).find(
              (w) => String(w.label || "").trim().toLowerCase() === labelStr.toLowerCase()
            );
            return {
              label: labelStr,
              field: labelStr.toLowerCase().replace(/\s+/g, ""),
              color: matchedWidget?.color || (idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : "#f59e0b"),
            };
          });
          currentXAxisValues = matrix[0].slice(1).map((h: any) => String(h || "").trim());
        }
      } catch (e) {
        console.error("Failed to parse BULLET data for editing", e);
      }
    } else if (["PARETO", "FUNNEL", "TREEMAP", "POLAR_AREA"].includes(category) && xAxis) {
      // These charts store: [["Label", "Cat A", "Cat B", ...], ["Value", 10, 20, ...]]
      // Column headers (row[0] after "Label") are the category/legend names.
      try {
        const parsed = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
        const matrix = Array.isArray(parsed) ? parsed : parsed?.labels || [];
        if (matrix && matrix.length > 0 && Array.isArray(matrix[0])) {
          const headers = matrix[0].slice(1).map((h: any) => String(h || "").trim());
          currentLegendValues = headers.map((label: string, idx: number) => {
            const matchedWidget = (effectiveLegendValues || []).find(
              (w) => String(w.label || "").trim().toLowerCase() === label.toLowerCase()
            );
            return {
              label,
              field: label.toLowerCase().replace(/\s+/g, ""),
              color: matchedWidget?.color || effectiveLegendValues[idx]?.color || "#4F81BC",
            };
          });
        }
      } catch (e) {
        console.error(`Failed to parse ${category} xAxis for editing`, e);
      }
    } else if (xAxis) {
      try {
        const { labels } = parseTierData(
          xAxis,
          effectiveLegendValues,
          widgetTitle,
        );
        if (labels && labels.length > 0) {
          currentXAxisValues = labels;
        }
      } catch (e) {
        console.error("Failed to parse X Axis data for editing", e);
      }
    }

    setLocalXAxisValues(currentXAxisValues);
    setLocalNumOfXAxisDataSet(currentXAxisValues.length);
    setLocalLegendValues(currentLegendValues);
    setLocalNumOfLegendDataSet(currentLegendValues.length);
    setLocalStartingRange(safeStartingRange ?? 0);
    setLocalEndingRange(safeEndingRange ?? 100);
    setLocalShowLegend(showLegend);

    // Derive bin width from the first data row label in the saved xAxis (e.g. "0-10" → 10)
    if (category === "HISTOGRAM" && xAxis) {
      try {
        const parsed = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
        const dataArr = Array.isArray(parsed) ? parsed : parsed?.labels || [];
        const firstDataRow = dataArr.length > 1 ? dataArr[1] : null;
        if (firstDataRow && typeof firstDataRow[0] === "string" && firstDataRow[0].includes("-")) {
          const parts = firstDataRow[0].split("-").map((v: string) => parseInt(v.trim(), 10));
          if (!isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > parts[0]) {
            setLocalBinCount(parts[1] - parts[0]);
          }
        }
      } catch {
        // fallback to default
        setLocalBinCount(10);
      }
    }

    setIsEditing(true);
  };

  const handleSetNumOfXAxisDataSet = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    const targetValue = isNaN(value) ? 1 : Math.max(value, 1);

    setLocalNumOfXAxisDataSet(targetValue);
    setLocalXAxisValues((prev) => {
      const updated = [...prev];
      while (updated.length < targetValue) {
        updated.push("");
      }
      return updated.slice(0, targetValue);
    });
  };

  const handleXAxisValueChange = (index: number, value: string) => {
    setLocalXAxisValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Freeze the seed at mount time so sample data never changes as the user
  // types in config fields (title, legend names, etc.).
  // The seed is based on the initial chartId (stable DB id) or the initial
  // widgetTitle captured before any edits occur.
  const stableSeedRef = useRef<string>(chartId && chartId !== "root" ? chartId : "new-widget-stable-seed");

  const deterministicGeneratorFunc = useMemo(() => {
    return (
      xAxis: string[],
      legends: LegendValue[],
      numSets: number,
      start: number,
      end: number,
    ) => {
      const seedStr = stableSeedRef.current;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
      }
      let seed = Math.abs(hash) || 1;

      const customRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x80000000;
      };

      const originalRandom = Math.random;
      Math.random = customRandom;
      try {
        return generatorFunc(xAxis, legends, numSets, start, end);
      } finally {
        Math.random = originalRandom;
      }
    };
    // stableSeedRef is a ref — its .current never changes, so it is safe to
    // omit from deps. Only generatorFunc itself needs to be tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatorFunc]);

  const { editingChartData, editingIsSampleData } = useMemo(() => {
    if (!isEditing) return { editingChartData: null, editingIsSampleData: false };

    const simulatedData = deterministicGeneratorFunc(
      localXAxisValues,
      localLegendValues,
      localNumOfLegendDataSet,
      0,
      100,
    );
    return {
      editingChartData: simulatedData,
      editingIsSampleData: true,
    };
  }, [
    isEditing,
    localXAxisValues,
    localLegendValues,
    localNumOfLegendDataSet,
    deterministicGeneratorFunc,
  ]);

  const handleSaveEditChanges = async (payload: any) => {
    let updatedXAxis = payload.xAxis;
    try {
      const getMatrix = (val: any): any[][] | null => {
        if (!val) return null;
        let parsed = val;
        if (typeof val === "string") {
          try {
            parsed = JSON.parse(val);
          } catch {
            return null;
          }
        }
        const raw =
          parsed && !Array.isArray(parsed) && parsed.labels
            ? parsed.labels
            : parsed;
        return Array.isArray(raw) ? raw : null;
      };

      const origMatrix = getMatrix(xAxis);
      const newMatrix = getMatrix(payload.xAxis);

      if (category === "BULLET" && origMatrix && origMatrix.length > 0 && newMatrix) {
        // Special merge for BULLET charts (always row-based format with Current and Target columns)
        const newRowNames = newMatrix.slice(1).map((row) => String(row[0] || "").trim());
        const widgetsLegendNames = payload.widgets?.map((w: any) => w.legendName) || [];

        // If the config panel loaded metric names as legend values, use them. Otherwise fallback to row names.
        const containsCurrentOrTarget = widgetsLegendNames.some((n: string) => {
          const l = n.toLowerCase();
          return l === "current" || l === "target";
        });
        const finalRowNames = containsCurrentOrTarget ? newRowNames : (widgetsLegendNames.length > 0 ? widgetsLegendNames : newRowNames);
        const newHeaders = ["Current", "Target"];

        // Output row-based format: Row 0 = ["Label", "Current", "Target"]
        const newRows: any[][] = [
          ["Label", ...newHeaders]
        ];

        finalRowNames.forEach((name: string, rIdx: number) => {
          const newRowCells: any[] = [name];
          newHeaders.forEach((headerName: string, hIdx: number) => {
            const header = origMatrix[0].map((h: any) => String(h || "").toLowerCase());
            const origIsRowBased = header.includes("current") || header.includes("target");
            let val = 0;

            if (origIsRowBased) {
              const colIdx = origMatrix[0].findIndex(h => String(h || "").trim().toLowerCase() === headerName.trim().toLowerCase());
              const origRow = origMatrix.slice(1).find(r => String(r[0] || "").trim().toLowerCase() === name.toLowerCase()) || origMatrix[rIdx + 1];
              if (origRow && colIdx !== -1) {
                val = Number(origRow[colIdx]) || 0;
              } else if (origRow) {
                // positional fallback
                val = Number(origRow[hIdx + 1]) || 0;
              }
            } else {
              // orig was column-based (Case 2)
              const colIdx = origMatrix[0].findIndex(h => String(h || "").trim().toLowerCase() === name.toLowerCase());
              const rowIdx = origMatrix.findIndex(r => String(r[0] || "").trim().toLowerCase() === headerName.toLowerCase());
              if (colIdx !== -1 && rowIdx !== -1) {
                val = Number(origMatrix[rowIdx][colIdx]) || 0;
              }
            }
            newRowCells.push(val);
          });
          newRows.push(newRowCells);
        });

        updatedXAxis = JSON.stringify(newRows);
      } else if (
        // BOX_WHISKER (and any chart where the config panel directly edits values)
        // must skip this merge — it would overwrite the user's edits with the
        // original saved values, making every update send the same stale data.
        category !== "BOX_WHISKER" &&
        origMatrix && origMatrix.length > 0 && newMatrix && newMatrix.length > 0
      ) {
        const valueMap: Record<string, Record<string, number>> = {};
        const origHeaders = origMatrix[0].slice(1).map((h) => String(h || "").trim());

        origMatrix.slice(1).forEach((row) => {
          if (Array.isArray(row) && row.length > 0) {
            const xLabel = String(row[0] || "").trim();
            valueMap[xLabel] = {};
            origHeaders.forEach((header, index) => {
              const val = row[index + 1];
              if (val !== undefined && val !== null) {
                valueMap[xLabel][header] = Number(val);
              }
            });
          }
        });

        const newHeaders = newMatrix[0].slice(1).map((h) => String(h || "").trim());
        const updatedRows = [newMatrix[0]];

        newMatrix.slice(1).forEach((row, rowIndex) => {
          if (Array.isArray(row) && row.length > 0) {
            const xLabel = String(row[0] || "").trim();
            const newRow: any[] = [row[0]];
            const origRowData = origMatrix[rowIndex + 1];

            newHeaders.forEach((header, headerIndex) => {
              let val = 0;
              if (valueMap[xLabel] && valueMap[xLabel][header] !== undefined) {
                // Exact string match
                val = valueMap[xLabel][header];
              } else if (valueMap[xLabel] && origHeaders[headerIndex] !== undefined && valueMap[xLabel][origHeaders[headerIndex]] !== undefined) {
                // X label matched, but header was renamed (fallback to header index)
                val = valueMap[xLabel][origHeaders[headerIndex]];
              } else if (origRowData && origRowData[headerIndex + 1] !== undefined) {
                // Completely renamed label, fallback to positional indices
                val = Number(origRowData[headerIndex + 1]) || 0;
              }
              newRow.push(val);
            });
            updatedRows.push(newRow);
          }
        });

        let parsedPayloadXAxis = typeof payload.xAxis === "string" ? JSON.parse(payload.xAxis) : payload.xAxis;
        if (parsedPayloadXAxis && !Array.isArray(parsedPayloadXAxis) && parsedPayloadXAxis.labels) {
          updatedXAxis = JSON.stringify({ ...parsedPayloadXAxis, labels: updatedRows });
        } else {
          updatedXAxis = JSON.stringify(updatedRows);
        }
      }
    } catch (err) {
      console.error("Failed to merge existing chart data on save:", err);
    }

    const updatePayload = {
      ...payload,
      xAxis: updatedXAxis,
      id: chartId,
      rootchart: tierLevel === 0,
      grouptitle: groupTitle || payload.grouptitle,
    };

    if (isProgramBuilder) {
      delete updatePayload.programid;
      delete updatePayload.projectnumber;
      if (updatePayload.width !== undefined) {
        updatePayload.width = Number(updatePayload.width);
      }
      if (updatePayload.height !== undefined) {
        updatePayload.height = Number(updatePayload.height);
      }

      const bulkPayload = {
        updates: [
          {
            id: chartId,
            data: updatePayload,
          },
        ],
      };
      const toastId = toast.loading("Saving chart changes...");
      try {
        await updateBulkProgramChart(bulkPayload).unwrap();
        toast.success("Chart updated successfully", { id: toastId });
        setIsEditing(false);
      } catch (error) {
        toast.error("Failed to update chart", { id: toastId });
      }
    } else {
      const toastId = toast.loading("Saving chart changes...");
      try {
        await updateChartConfig({ id: chartId, data: updatePayload }).unwrap();
        toast.success("Chart updated successfully", { id: toastId });
        setIsEditing(false);
      } catch (error) {
        toast.error("Failed to update chart", { id: toastId });
      }
    }
  };

  const {
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
  } = useChartTierState(
    chartId,
    widgetTitle,
    tierLevel,
    breadcrumbPath,
    onNavigate,
    preFetchedChildren,
    isProgramBuilder,
  );

  /* ---------- DATA NORMALIZATION ---------- */

  const effectiveLegendValues = useMemo(
    () => getEffectiveLegendValues(legendValues),
    [legendValues],
  );

  const effectiveXAxisValues = useMemo(
    () => getEffectiveXAxisValues(xAxisValues),
    [xAxisValues],
  );

  const { safeStartingRange, safeEndingRange } = useMemo(
    () => getSafeRanges(startingRange, endingRange ?? 100),
    [startingRange, endingRange],
  );
  useEffect(() => {
    // If we are showing the children modal and they are all gone after deletion, auto-close it
    // Wait for isFetching to be false to ensure we are looking at the post-deletion state
    if (showChildrenModal && !isLoading && !isFetching && isNoChildrenError) {
      setShowChildrenModal(false);
    }
  }, [
    showChildrenModal,
    isLoading,
    isFetching,
    isNoChildrenError,
    setShowChildrenModal,
  ]);

  const { chartData, isSampleData } = useMemo(() => {
    // Priority: If xAxis is passed explicitly (e.g. creation mode or dashboard override),
    // parse it using the chart's specific parseTierData logic first.
    let dataSource = allUploadedData;
    let xAxisNames = xAxisValues;

    if (xAxis) {
      const { labels, data: parsed } = parseTierData(
        xAxis,
        effectiveLegendValues,
        widgetTitle,
      );
      dataSource = parsed;
      xAxisNames = labels;
    }

    const resolved = resolveChartData(
      dataSource,
      xAxisNames,
      effectiveXAxisValues,
      effectiveLegendValues,
      safeStartingRange,
      safeEndingRange,
      numOfLegendDataSet,
      widgetTitle,
      deterministicGeneratorFunc,
    );

    if (isPreview && resolved.isSampleData) {
      return { chartData: [], isSampleData: false };
    }

    return resolved;
  }, [
    allUploadedData,
    xAxis,
    xAxisValues,
    effectiveXAxisValues,
    effectiveLegendValues,
    numOfLegendDataSet,
    widgetTitle,
    generatorFunc,
    parseTierData,
    isPreview,
  ]);

  const finalStartingRange = useMemo(() => {
    if (isSampleData) {
      return safeStartingRange ?? 0;
    }
    const hasExplicitStart = safeStartingRange !== undefined;
    if (hasExplicitStart) {
      return safeStartingRange;
    }
    let minVal = Infinity;
    if (Array.isArray(chartData)) {
      chartData.forEach((row: any) => {
        effectiveLegendValues.forEach((legend) => {
          const val = Number(row[legend.field]);
          if (!isNaN(val)) {
            if (minVal === Infinity || val < minVal) {
              minVal = val;
            }
          }
        });
      });
    }
    return minVal === Infinity ? 0 : minVal;
  }, [chartData, isSampleData, safeStartingRange, effectiveLegendValues]);

  const finalEndingRange = useMemo(() => {
    if (isSampleData) {
      return safeEndingRange;
    }
    const hasExplicitEnd = endingRange !== undefined && endingRange !== null && String(endingRange).trim() !== "";
    if (hasExplicitEnd) {
      return safeEndingRange;
    }
    let maxVal = -Infinity;
    if (Array.isArray(chartData)) {
      chartData.forEach((row: any) => {
        effectiveLegendValues.forEach((legend) => {
          const val = Number(row[legend.field]);
          if (!isNaN(val)) {
            if (maxVal === -Infinity || val > maxVal) {
              maxVal = val;
            }
          }
        });
      });
    }
    return maxVal === -Infinity ? 100 : maxVal;
  }, [chartData, isSampleData, safeEndingRange, endingRange, effectiveLegendValues]);

  /* ---------- ACTIONS ---------- */

  const handleDownload = async () => {
    if (finalEffectiveId) {
      const downloadXAxisValues = effectiveXAxisValues;
      const downloadLegends = effectiveLegendValues;

      // If this is a tree chart, we need to fetch the flattened leaf nodes first
      // to populate the Excel template with real current values.
      if (category === "DECOMPOSITION_TREE") {
        try {
          const res = await getAllTheLeafChart(finalEffectiveId).unwrap();
          const resData = res?.data || res;

          // Normalize: Program Builder returns a program object { charts: [] } or a flat array.
          // Project Builder returns an array of groups [{ charts: [] }].
          let allGroups: any[] = [];
          if (isProgramBuilder) {
            const charts = Array.isArray(resData)
              ? resData
              : resData?.charts || [];
            allGroups = [{ charts }];
          } else {
            allGroups = Array.isArray(resData) ? resData : [];
          }
          const treeRoot =
            typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;

          if (treeRoot && treeRoot.name) {
            // Find the group related to this tree
            const targetGroup = allGroups.find((g: any) =>
              g.charts?.some(
                (c: any) => c.id === chartId || c.parentId === chartId,
              ),
            );

            let leafDataRaw: any[][] = [];
            if (targetGroup) {
              (targetGroup.charts || []).forEach((c: any) => {
                if (c.xAxis) {
                  try {
                    const parsed =
                      typeof c.xAxis === "string"
                        ? JSON.parse(c.xAxis)
                        : c.xAxis;
                    if (
                      Array.isArray(parsed) &&
                      parsed.length > 0 &&
                      Array.isArray(parsed[0])
                    ) {
                      leafDataRaw.push(...parsed.slice(1));
                    }
                  } catch {
                    /* ignore */
                  }
                }
              });
            }

            // Fallback: If no child charts exist in the DB (common in Program Builder or early project phase),
            // flatten the local xAxis tree structure to get the leaf nodes for the table.
            if (leafDataRaw.length === 0) {
              leafDataRaw = flattenDecompositionTree(treeRoot);
            }

            if (leafDataRaw.length > 0) {
              const headers = [
                "Node Name",
                treeRoot.value1Label || "Target",
                treeRoot.value2Label || "Achieved",
              ];
              // De-duplicate by name if necessary
              const uniqueRowsMap = new Map();
              leafDataRaw.forEach((row) => uniqueRowsMap.set(row[0], row));
              const uniqueRowsArray = Array.from(uniqueRowsMap.values());

              const downloadXAxisValuesSet = uniqueRowsArray.map((r) => r[0]);
              // Pass pre-filled current data as template fallback
              const preFilledTemplateData = [headers, ...uniqueRowsArray];

              downloadChartDataAsExcel(
                widgetTitle,
                finalEffectiveId as string,
                getAllTheLeafChart,
                widgetTitle,
                downloadXAxisValuesSet,
                downloadLegends,
                setIsDownloading,
                excelType,
                chartId || "root",
                categoryTitle,
                preFilledTemplateData,
              );
              return; // Exit early since we've handled the tree download uniquely
            }
          }
        } catch (e) {
          console.error("Failed to build tree CSV with leaf data", e);
        }
      }

      let targetTemplateData: any[][] | undefined = undefined;
      // If it's program builder, we prioritize the existing chart data (xAxis) as the template
      if (isProgramBuilder && xAxis) {
        try {
          const parsedRaw = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
          const parsed = (parsedRaw && typeof parsedRaw === "object" && !Array.isArray(parsedRaw)) ? (parsedRaw.data || parsedRaw) : parsedRaw;

          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstRow = parsed[0];
            const legendNames = firstRow.slice(1);
            const dataRows = parsed.slice(1);

            if (isValueDetection) {
              // Image 2 style: Single-Row "Total" with columns for each metric
              const header = ["Label", ...legendNames];
              const totalRow: any[] = ["Total"];

              legendNames.forEach((_: string, idx: number) => {
                let val = 0;
                if (dataRows.length === 1) {
                  // Already single-row
                  val = dataRows[0][idx + 1];
                } else {
                  // It might be multi-row, we need to sum or find values
                  multiRowDiagonal: for (const r of dataRows) {
                    if (r[idx + 1] !== 0) {
                      val = r[idx + 1];
                      break multiRowDiagonal;
                    }
                  }
                }
                totalRow.push(val);
              });
              targetTemplateData = [header, totalRow];
            } else {
              // For standard xAxis data (e.g., Jan, Feb), use the data as is
              // This preserves the original category labels requested by the user.
              targetTemplateData = parsed;
            }
          }
        } catch {
          /* fail silently */
        }
      }

      downloadChartDataAsExcel(
        widgetTitle,
        finalEffectiveId as string,
        getAllTheLeafChart,
        widgetTitle,
        downloadXAxisValues,
        downloadLegends,
        setIsDownloading,
        excelType,
        chartId || "root",
        categoryTitle,
        targetTemplateData,
      );
    } else {
      toast.error(
        `${isProgramBuilder ? "Program" : "Project"} ID is missing. Cannot download chart data.`,
      );
    }
  };

  const handleAddTierClick = () => {
    // groupTitle is passed down from top-level DashboardTab or inherited
    const childPayload = {
      numberOfDataset: numOfLegendDataSet,
      firstFieldDataset: safeStartingRange,
      lastFieldDataset: safeEndingRange,
      widgets: effectiveLegendValues.map((l) => ({
        legendName: l.label,
        color: l.color,
      })),
      title: "",
      status: "ACTIVE",
      category: category,
      xAxis:
        category === "DECOMPOSITION_TREE"
          ? typeof xAxis === "string"
            ? xAxis
            : JSON.stringify(
              xAxis ||
              deterministicGeneratorFunc(
                effectiveXAxisValues,
                effectiveLegendValues,
                numOfLegendDataSet,
                safeStartingRange as number,
                safeEndingRange,
              ),
            )
          : JSON.stringify(
            category === "PIE" || category === "POLAR_AREA"
              ? [
                ["Label", ...effectiveLegendValues.map((l) => l.label)],
                ["Value", ...Array(effectiveLegendValues.length).fill(0)],
              ]
              : category === "BULLET"
                ? [
                  ["Label", ...effectiveLegendValues.map((l) => l.label)],
                  [
                    "Current",
                    ...Array(effectiveLegendValues.length).fill(0),
                  ],
                  [
                    "Target",
                    ...Array(effectiveLegendValues.length).fill(0),
                  ],
                ]
                : [
                  ["Label", ...effectiveLegendValues.map((l) => l.label)],
                  ...effectiveXAxisValues.map((label) => [
                    label,
                    ...Array(effectiveLegendValues.length).fill(0),
                  ]),
                ],
          ),
      yAxis: typeof yAxis === "string" ? yAxis : JSON.stringify(yAxis || {}),
      zAxis: typeof zAxis === "string" ? zAxis : JSON.stringify(zAxis || {}),
      projectId: effectiveProjectId,
      parentId: chartId,
      rootchart: false,
      roottitle: widgetTitle,
      grouptitle: groupTitle,
    };
    dispatch(setChildPayload(childPayload));
    setShowAddTierModal(true);
  };

  const confirmChartDelete = async () => {
    if (isCreationMode) {
      setShowDeleteModal(false);
      if (onDelete) onDelete();
      toast.success("Chart deleted successfully");
      return;
    }

    const toastId = toast.loading("Deleting Chart...");
    try {
      if (isProgramBuilder) {
        await deleteProgramChart(chartId).unwrap();
      } else {
        await deleteChart(chartId).unwrap();
      }
      toast.success("Chart deleted successfully", { id: toastId });
      setShowDeleteModal(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast.error("Failed to delete chart", { id: toastId });
    }
  };

  const handleChartClick = () => {
    if (childTiers && childTiers.length > 0) {
      setShowChildrenModal(true);
      // Removed the code that overwrites groupTitle with widgetTitle
    }
  };

  const hasChartData = useMemo(() => {
    if (!chartData) return false;
    if (category === "BULLET") {
      return effectiveLegendValues.length > 0;
    }
    return Array.isArray(chartData) && chartData.length > 0;
  }, [chartData, category, effectiveLegendValues]);

  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 animate-pulse">
        <span className="text-gray-400 dark:text-slate-500 text-sm">Loading Chart...</span>
      </div>
    );
  }

  const chartWrapper = (
    <ChartCardWrapper
      title={isEditing ? localTitle : widgetTitle}
      tierLevel={tierLevel}
      onHeaderClick={handleChartClick}
      menuActions={{
        onDownload:
          !isCreationMode && tierLevel === 0 && !disableDownload
            ? handleDownload
            : undefined,
        onDelete: () => setShowDeleteModal(true),
        onAddTier:
          !isCreationMode && !disableAddTier
            ? () => handleAddTierClick()
            : undefined,
        onToggleWidget: onToggleWidget,
        onEdit:
          !isCreationMode && tierLevel === 0
            ? () => handleEditClick()
            : undefined,
      }}
      isDownloading={isDownloading}
      isPreview={isPreview}
      customHeaderContent={
        providedHeaderContent ||
        ((isEditing ? localShowLegend : showLegend) && (!isPreview || hasChartData) ? (
          <ChartLegendHeader effectiveLegendValues={isEditing ? localLegendValues : effectiveLegendValues} />
        ) : null)
      }
      footer={
        providedFooter ||
        (childTiers && childTiers.length > 0 ? (
          <ChartChildTierFooter childTiers={childTiers} />
        ) : undefined)
      }
    >
      {!isEditing && isPreview && !hasChartData ? (
        <div className="flex flex-col items-center justify-center h-[280px] w-full text-center bg-secondary-bg rounded-md">
          <p className="text-base font-normal text-muted-text">
            No data available
          </p>
        </div>
      ) : (
        children({
          chartData: isEditing
            ? (localBoxPlotLiveData ?? editingChartData ?? chartData)
            : chartData,
          isSampleData: isEditing ? (editingIsSampleData || isSampleData) : isSampleData,
          safeStartingRange: isEditing ? localStartingRange : finalStartingRange,
          safeEndingRange: isEditing ? localEndingRange : finalEndingRange,
          effectiveLegendValues: isEditing ? localLegendValues : effectiveLegendValues,
          effectiveXAxisValues: isEditing ? localXAxisValues : effectiveXAxisValues,
          categoryTitle,
        })
      )}
    </ChartCardWrapper>
  );

  const ConfigComponent = getConfigComponent(category) as any;

  return (
    <>
      {isEditing ? (
        <div className="flex gap-3 h-full w-full min-h-0">
          <div className="flex-1 min-w-0 max-h-[450px] sticky top-5">
            {chartWrapper}
          </div>
          <div className="flex-shrink-0 min-w-0 overflow-hidden" style={{ maxHeight: '100%' }}>
            <Suspense fallback={<div className="w-78 animate-pulse bg-skeleton-bg rounded-lg" />}>
              <ConfigComponent
                widgedName={
                  category === "BAR" ? "Bar Chart" :
                    category === "RAG" ? "RAG Chart" :
                      category === "LINE" ? "Line Chart" :
                        category === "AREA" ? "Area Chart" :
                          category === "SPLINE" ? "Spline Area Chart" :
                            category === "HORIZONTAL_BAR" ? "Horizontal Bar Chart" :
                              category === "SIMPLE_HORIZONTAL_BAR" ? "Simple Horizontal Bar Chart" :
                                "Samplebar Chart"
                }
                widgetTitle={localTitle}
                widgetCategory={category}
                isRestricted={false}
                setWidgetTitle={setLocalTitle}
                numOfXAxisDataSet={localNumOfXAxisDataSet}
                handleSetNumOfXAxisDataSet={handleSetNumOfXAxisDataSet}
                xAxisValues={localXAxisValues}
                handleXAxisValueChange={handleXAxisValueChange}
                numOfLegendDataSet={localNumOfLegendDataSet}
                setNumOfLegendDataSet={setLocalNumOfLegendDataSet}
                legendValues={localLegendValues}
                setLegendValues={setLocalLegendValues}
                startingRange={localStartingRange}
                setStartingRange={setLocalStartingRange}
                endingRange={localEndingRange}
                setEndingRange={setLocalEndingRange}
                binCount={localBinCount}
                setBinCount={setLocalBinCount}
                yAxis={typeof yAxis === 'string' ? yAxis : (yAxis ? JSON.stringify(yAxis) : undefined)}
                xAxis={typeof xAxis === 'string' ? xAxis : (xAxis ? JSON.stringify(xAxis) : undefined)}
                onClose={() => {
                  setIsEditing(false);
                  setLocalBoxPlotLiveData(null);
                }}
                onDelete={confirmChartDelete}
                showLegend={localShowLegend}
                setShowLegend={setLocalShowLegend}
                onSaveOverride={handleSaveEditChanges}
                onLivePreviewUpdate={setLocalBoxPlotLiveData}
                layoutW={width}
                layoutH={height}
                orderIndex={order}
                isProgramBuilder={isProgramBuilder}
              />
            </Suspense>
          </div>

        </div>
      ) : (
        chartWrapper
      )}

      {showAddTierModal && (
        <AddTierModal
          isOpen={showAddTierModal}
          onClose={() => setShowAddTierModal(false)}
          parentChartName={groupTitle}
          widgetTitle={widgetTitle}
        />
      )}

      {showChildrenModal && (
        <TierChartModal
          isOpen={showChildrenModal}
          onClose={() => setShowChildrenModal(false)}
          tierLevel={tierLevel + 1}
          title={widgetTitle}
          breadcrumbs={currentBreadcrumbs}
          onBreadcrumbClick={handleBreadcrumbClick}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            {childTiers?.map((tier: any) => {
              let legends = getTierLegends(tier);
              if (!legends || legends.length === 0) {
                const derived = extractLegendsFromXAxis(tier.xAxis);
                if (derived.length > 0) {
                  legends = derived.map((lbl, idx) => ({
                    label: lbl,
                    field: String(lbl || `Legend ${idx + 1}`).toLowerCase().replace(/\s+/g, ""),
                    color: ["#13A490", "#35B6EE", "#6F78F9", "#F26419", "#F6AE2D", "#862BB0", "#D72638", "#3F88C5", "#44BBA4", "#FF9505"][idx % 10]
                  }));
                }
              }

              const { labels, data: tierData } = parseTierData(
                tier.xAxis,
                legends,
                tier.title || tier.name,
              );
              return (
                <div
                  key={tier.id}
                  className={
                    category === "DECOMPOSITION_TREE"
                      ? "h-[600px]"
                      : "h-auto min-h-[400px]"
                  }
                >
                  {renderChildChart(tier, {
                    widgetTitle: tier.title || tier.name || "Untitled Tier",
                    groupTitle: tier.grouptitle || groupTitle,
                    xAxisValues: labels,
                    yAxisValues: tier.yAxisValues || yAxisValues,
                    zAxisValues: tier.zAxisValues || zAxisValues,
                    legendValues: legends,
                    numOfLegendDataSet: legends.length,
                    startingRange: finalStartingRange,
                    endingRange: finalEndingRange,
                    tierLevel: tierLevel + 1,
                    chartId: tier.id,
                    projectId: tier.projectId || effectiveProjectId,
                    allUploadedData: tierData as any,
                    isPreview: isPreview,
                    breadcrumbPath: currentBreadcrumbs,
                    onNavigate: handleChildNavigate,
                    onDelete: onDelete,
                    preFetchedChildren: tier.children,
                    xAxis: tier.xAxis,
                    yAxis: tier.yAxis,
                    zAxis: tier.zAxis,
                  })}
                </div>
              );
            })}
          </div>
        </TierChartModal>
      )}

      {showDeleteModal && (
        <ChartDeleteModal
          isOpen={showDeleteModal}
          onClose={setShowDeleteModal}
          onConfirm={confirmChartDelete}
          widgetTitle={widgetTitle}
        />
      )}
    </>
  );
}
