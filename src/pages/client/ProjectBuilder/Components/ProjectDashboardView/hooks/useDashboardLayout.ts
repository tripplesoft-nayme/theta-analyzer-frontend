import { useState, useRef, useEffect } from "react";
import { CHART_REGISTRY } from "../../ChartRegistry";

export const useDashboardLayout = ({
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
}: {
  storageKey: string;
  activeConfigId: string | null;
  isPreviewOrPublished: boolean;
  isReadOnly: boolean;
  selectedWidgets: string[];
  finalChartsData: any[] | null;
  groupedFilesData: any[];
  hasTableData: boolean;
  calculatedH: number;
  hiddenWidgetIds: string[];
  externalDropTargetRef?: React.MutableRefObject<string | null>;
  externalDropTargetPositionRef?: React.MutableRefObject<"before" | "after">;
  droppedOnCanvasRef?: React.MutableRefObject<boolean>;
  isChartsLoading: boolean;
}) => {
  const ROW_HEIGHT = 20;
  const GAP_SIZE = 8;

  const [layouts, setLayouts] = useState<any>(() => {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? JSON.parse(saved) : {};

    const versionKey = `${storageKey}_hi_res_v1`;
    const currentVersion = localStorage.getItem(versionKey);
    if (!currentVersion) {
      localStorage.setItem(versionKey, "v1");
      return {};
    }
    return parsed;
  });

  const [orderedItems, setOrderedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${storageKey}_order`);
    return saved ? JSON.parse(saved) : [];
  });

  // Keep state synced with localStorage when storageKey changes (e.g. after async Redux load)
  useEffect(() => {
    const savedLayouts = localStorage.getItem(storageKey);
    const parsedLayouts = savedLayouts ? JSON.parse(savedLayouts) : {};
    setLayouts(parsedLayouts);

    const savedOrder = localStorage.getItem(`${storageKey}_order`);
    const parsedOrder = savedOrder ? JSON.parse(savedOrder) : [];
    setOrderedItems(parsedOrder);
  }, [storageKey]);

  const previousLayoutsRef = useRef<Record<string, { w: number; h: number }>>({});
  const backedUpIdsRef = useRef<Set<string>>(new Set());
  const prevSelectedWidgetsRef = useRef<string[]>([]);
  const prevChartsDataRef = useRef<any[]>([]);

  // Keep a ref to activeConfigId so Effect #4 can access the latest value
  // without having to list it as a dependency (which would cause a race condition
  // where Effect #4 fires at the same time as Effect #1 when config opens, and
  // overwrites Effect #1's layout update with stale localStorage data).
  const activeConfigIdRef = useRef<string | null>(activeConfigId);
  useEffect(() => {
    activeConfigIdRef.current = activeConfigId;
  }, [activeConfigId]);

  const layoutsRef = useRef(layouts);
  useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);

  const orderedItemsRef = useRef(orderedItems);
  useEffect(() => {
    orderedItemsRef.current = orderedItems;
  }, [orderedItems]);

  const persistToStorage = (currentLayouts: any, currentOrder: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify(currentLayouts));
    localStorage.setItem(`${storageKey}_order`, JSON.stringify(currentOrder));
  };

  const onResize = (id: string, w: number, h: number) => {
    setLayouts((prev: any) => ({ ...prev, [id]: { w, h } }));
  };

  const onResizeStop = () => {
    persistToStorage(layoutsRef.current, orderedItemsRef.current);
  };

  // 1. Sync Layout for Active Config
  useEffect(() => {
    if (isPreviewOrPublished || isReadOnly) return;

    if (activeConfigId) {
      if (!backedUpIdsRef.current.has(activeConfigId)) {
        let currentLayout = layoutsRef.current[activeConfigId];
        if (!currentLayout) {
          let defaultW = 10;
          let defaultH = 15;
          const widgetType = activeConfigId.split("_")[0];
          const registryConfig = CHART_REGISTRY[widgetType];
          if (registryConfig?.defaultHeight) {
            defaultH = Math.max(15, Math.round((registryConfig.defaultHeight + 8) / 28));
          }
          currentLayout = { w: defaultW, h: defaultH };
        }
        previousLayoutsRef.current[activeConfigId] = { ...currentLayout };
        backedUpIdsRef.current.add(activeConfigId);
      }

      const prevIdToRevert = Object.keys(previousLayoutsRef.current).find((id) => id !== activeConfigId);
      const backupLayout = prevIdToRevert ? previousLayoutsRef.current[prevIdToRevert] : null;

      setLayouts((prev: any) => {
        const next = { ...prev };
        let changed = false;

        if (prevIdToRevert && next[prevIdToRevert]) {
          next[prevIdToRevert] = backupLayout || { w: 10, h: 15 };
          changed = true;
        }

        if (next[activeConfigId]) {
          if (next[activeConfigId].w !== 20) {
            // Use a generous initial height (min 40 rows = ~1120px) to prevent the
            // config panel from visually overflowing into adjacent grid items while
            // Effect #2 measures the actual needed height via DOM query.
            const safeH = Math.max(next[activeConfigId].h, 40);
            next[activeConfigId] = { w: 20, h: safeH };
            changed = true;
          }
        } else {
          let defaultH = 15;
          const widgetType = activeConfigId.split("_")[0];
          const registryConfig = CHART_REGISTRY[widgetType];
          if (registryConfig?.defaultHeight) {
            defaultH = Math.max(15, Math.round((registryConfig.defaultHeight + 8) / 28));
          }
          next[activeConfigId] = { w: 20, h: Math.max(defaultH, 40) };
          changed = true;
        }

        if (changed) {
          persistToStorage(next, orderedItemsRef.current);
          return next;
        }
        return prev;
      });

      if (prevIdToRevert) {
        delete previousLayoutsRef.current[prevIdToRevert];
        backedUpIdsRef.current.delete(prevIdToRevert);
      }
    } else {
      const prevIdToRevert = Object.keys(previousLayoutsRef.current)[0];
      if (prevIdToRevert) {
        const backupLayout = previousLayoutsRef.current[prevIdToRevert];
        setLayouts((prev: any) => {
          const next = { ...prev };
          if (next[prevIdToRevert]) {
            let fallbackLayout = { w: 10, h: 15 };
            const widgetType = prevIdToRevert.split("_")[0];
            const registryConfig = CHART_REGISTRY[widgetType];
            if (registryConfig?.defaultHeight) {
              fallbackLayout.h = Math.max(15, Math.round((registryConfig.defaultHeight + 8) / 28));
            }
            if (widgetType === "HORIZONTAL" || widgetType === "STACKED" || widgetType === "SIMPLE") {
              fallbackLayout.h = 18;
            }

            next[prevIdToRevert] = backupLayout || fallbackLayout;
            persistToStorage(next, orderedItemsRef.current);
            return next;
          }
          return prev;
        });
        delete previousLayoutsRef.current[prevIdToRevert];
        backedUpIdsRef.current.delete(prevIdToRevert);
      }
    }
  }, [activeConfigId, isPreviewOrPublished, isReadOnly]);

  // 2. Handle dynamic height updates of the active config panel
  useEffect(() => {
    if (!activeConfigId || isPreviewOrPublished || isReadOnly) return;

    let cancelled = false;

    const checkHeight = () => {
      if (cancelled) return;
      const element = document.getElementById(activeConfigId);
      if (element) {
        const sidebarEl = (element.querySelector('.min-w-78') || element.querySelector('.w-\\[320px\\]') || element.querySelector('.max-w-78') || element.querySelector('.min-w-\\[350px\\]')) as HTMLElement | null;
        if (sidebarEl) {
          const scrollableChild = sidebarEl.querySelector('.overflow-y-auto, .custom-scrollbar') as HTMLElement | null;
          let measuredH = 15;
          if (scrollableChild) {
            const totalNeeded = sidebarEl.offsetHeight - scrollableChild.offsetHeight + scrollableChild.scrollHeight;
            measuredH = Math.max(15, Math.ceil((totalNeeded + 16) / 28));
          } else {
            measuredH = Math.max(15, Math.ceil((sidebarEl.scrollHeight + 16) / 28));
          }
          setLayouts((prev: any) => {
            if (cancelled) return prev;
            if (!prev[activeConfigId] || prev[activeConfigId].w !== 20) return prev;
            if (prev[activeConfigId]?.h === measuredH) return prev;
            const next = { ...prev, [activeConfigId]: { w: 20, h: measuredH } };
            persistToStorage(next, orderedItemsRef.current);
            return next;
          });
        }
      }
    };

    // Fire immediately (best-effort), then again at 50ms and 300ms to handle
    // async renders (Suspense, animations, etc.) that affect the sidebar height.
    const timeout0 = setTimeout(checkHeight, 0);
    const timeout1 = setTimeout(checkHeight, 50);
    const timeout2 = setTimeout(checkHeight, 300);

    const observer = new MutationObserver(checkHeight);
    const element = document.getElementById(activeConfigId);
    if (element) {
      observer.observe(element, { childList: true, subtree: true, attributes: true });
    } else {
      const gridContainer = document.querySelector('.auto-rows-\\[20px\\]');
      if (gridContainer) {
        observer.observe(gridContainer, { childList: true, subtree: true });
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(timeout0);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      observer.disconnect();
    };
  }, [activeConfigId, isPreviewOrPublished, isReadOnly]);

  // 3. Sync Layout/Dimensions from Pending/Creation widget to Newly Saved/Created Chart
  useEffect(() => {
    const prevSelected = prevSelectedWidgetsRef.current;
    const prevCharts = prevChartsDataRef.current;

    const removedPending = prevSelected.find((id) => !selectedWidgets.includes(id));
    const addedChart = (finalChartsData || []).find((c: any) => !prevCharts.some((pc: any) => pc.id === c.id));

    const matchPendingTypeToCategory = (pendingId: string, category: string): boolean => {
      const type = pendingId.split("_")[0].toLowerCase();
      const cat = category.toUpperCase();

      const typeToCategoryMap: Record<string, string[]> = {
        "kpi": ["KPI"],
        "bar-chart": ["BAR", "SAMPLECHART"],
        "sample-bar-chart": ["BAR", "SAMPLECHART"],
        "stacked-bar-chart": ["BAR", "SAMPLECHART", "STACKED_BAR"],
        "progress-ring": ["RING"],
        "pie-chart": ["PIE"],
        "line-chart": ["LINE"],
        "multi-axis-line-chart": ["LINE"],
        "horizontal-bar-chart": ["SIMPLE_HORIZONTAL_BAR", "HORIZONTAL_BAR", "STACKED_BAR_HORIZONTAL", "STACK_BAR_HORIZONTAL"],
        "horizontal-stacked-bar-chart": ["SIMPLE_HORIZONTAL_BAR", "HORIZONTAL_BAR", "STACKED_BAR_HORIZONTAL", "STACK_BAR_HORIZONTAL"],
        "area-chart": ["AREA"],
        "heat-map-chart": ["HEATMAP", "CALENDAR_HEATMAP"],
        "calendar-heatmap-chart": ["HEATMAP", "CALENDAR_HEATMAP"],
        "spline-area-chart": ["SPLINE"],
        "column-chart": ["COLUMN"],
        "sparklines-chart": ["SPARKLINE"],
        "logarithmic-chart": ["LOGARITHM", "LOGARITHMIC"],
        "decomposition-tree": ["DECOMPOSITION_TREE"],
        "gauge-chart": ["GAUGE", "SOLID_GAUGE"],
        "histogram-chart": ["HISTOGRAM"],
        "bubble-chart": ["BUBBLE"],
        "funnel-chart": ["FUNNEL"],
        "scatter-chart": ["SCATTER"],
        "pareto-chart": ["PARETO"],
        "waterfall-chart": ["WATERFALL"],
        "radar-chart": ["RADAR"],
        "candle-chart": ["CANDLESTICK"],
        "treemap-chart": ["TREEMAP"],
        "gantt-new-chart": ["GANTT"],
        "matrix-table-chart": ["MATRIXTABLE"],
        "combo-chart": ["COMBO", "MIXED"],
        "bullet-chart": ["BULLET"],
        "marimekko-chart": ["MARIMEKKO"],
        "box-plot": ["BOXPLOT", "BOX_PLOT"],
        "cohort-analysis": ["COHORT", "COHORT_ANALYSIS"],
        "geographic-map": ["GEOGRAPHY", "GEOGRAPHY_GRAPH", "GEOGRAPHIC"],
        "rag-chart": ["RAG"],
        "ribbon-chart": ["RIBBON"],
        "data-table": ["TABLE"],
        "polar-area-chart": ["POLAR_AREA"],
        "media-widget": ["MEDIA_WIDGET", "FILES_PREVIEW"],
        "files-preview": ["MEDIA_WIDGET", "FILES_PREVIEW"]
      };

      const mappedCategories = typeToCategoryMap[type];
      if (mappedCategories) {
        return mappedCategories.includes(cat);
      }

      // Fallback simple comparison if not in dictionary
      const normType = type.replace(/-chart$|-widget$|-new$|-analysis$/g, "");
      const normCat = cat.toLowerCase().replace(/_/g, "-").replace(/-chart$|-widget$|-new$|-analysis$/g, "");
      return normType === normCat;
    };

    if (removedPending && addedChart) {
      if (matchPendingTypeToCategory(removedPending, addedChart.category)) {
        const apiW = addedChart.width ? Number(addedChart.width) : 10;
        let rawHeight = addedChart.height ? Number(addedChart.height) : 15;
        if (rawHeight >= 50) {
          rawHeight = Math.max(1, Math.round((rawHeight + GAP_SIZE) / (ROW_HEIGHT + GAP_SIZE)));
        }
        const apiH = rawHeight;
        const apiOrder = typeof addedChart.order === "number" ? addedChart.order : orderedItemsRef.current.length;

        setLayouts((prev: any) => {
          const next = { ...prev, [addedChart.id]: { w: apiW, h: apiH } };
          delete next[removedPending];
          return next;
        });

        setOrderedItems((prevOrder: string[]) => {
          const nextOrder = prevOrder.filter((id) => id !== removedPending);
          if (apiOrder < nextOrder.length) {
            nextOrder.splice(apiOrder, 0, addedChart.id);
          } else {
            nextOrder.push(addedChart.id);
          }
          return nextOrder;
        });

        const nextLayouts = { ...layoutsRef.current, [addedChart.id]: { w: apiW, h: apiH } };
        delete nextLayouts[removedPending];

        let nextOrder = orderedItemsRef.current.filter((id) => id !== removedPending);
        if (apiOrder < nextOrder.length) {
          nextOrder.splice(apiOrder, 0, addedChart.id);
        } else {
          nextOrder.push(addedChart.id);
        }

        persistToStorage(nextLayouts, nextOrder);
      }
    }

    prevSelectedWidgetsRef.current = [...selectedWidgets];
    prevChartsDataRef.current = [...(finalChartsData || [])];
  }, [selectedWidgets, finalChartsData]);

  // 4. Sync state with incoming charts/widgets
  useEffect(() => {
    if (isChartsLoading) return;

    const savedOrder = localStorage.getItem(`${storageKey}_order`);
    const savedOrderList: string[] = isReadOnly || isPreviewOrPublished
      ? orderedItemsRef.current
      : (savedOrder ? JSON.parse(savedOrder) : []);

    const savedLayoutsRaw = localStorage.getItem(storageKey);
    const currentLayouts = isReadOnly || isPreviewOrPublished
      ? layoutsRef.current
      : (savedLayoutsRaw ? JSON.parse(savedLayoutsRaw) : {});

    // Local unsaved widgets to prevent intermediate race condition deletions during load
    const unsavedLocalWidgets = isPreviewOrPublished
      ? []
      : savedOrderList.filter((id) => {
        if (id === "project-info-table" || id.startsWith("file-group-")) return false;
        const isSavedInDb = (finalChartsData || []).some((c: any) => c.id === id);
        return !isSavedInDb;
      });

    const activeSelectedWidgets = isPreviewOrPublished
      ? []
      : Array.from(
        new Set([...selectedWidgets, ...unsavedLocalWidgets]),
      );

    const sortedCharts = [...(finalChartsData || [])].sort((a: any, b: any) => {
      const orderA = typeof a.order === "number" ? a.order : Infinity;
      const orderB = typeof b.order === "number" ? b.order : Infinity;
      return orderA - orderB;
    });

    const apiIds = sortedCharts.map(
      (item: any, idx: number) => item.id || `default_${idx}`,
    );

    const sortedGroups = [...groupedFilesData]
      .filter((g: any) => Array.isArray(g.files) && g.files.length > 0)
      .sort((a: any, b: any) => {
        const orderA = typeof a.groupInfo.order === "number" ? a.groupInfo.order : Infinity;
        const orderB = typeof b.groupInfo.order === "number" ? b.groupInfo.order : Infinity;
        return orderA - orderB;
      });
    const fileGroupIds = sortedGroups.map((g: any) => `file-group-${g.groupInfo.id}`);

    const tableId = hasTableData ? "project-info-table" : null;
    const allIds = [
      ...(tableId ? [tableId] : []),
      ...activeSelectedWidgets,
      ...fileGroupIds,
      ...apiIds,
    ].filter((id) => !hiddenWidgetIds.includes(id));
    const uniqueIds = Array.from(new Set(allIds));

    let finalOrder = uniqueIds;

    const getWidgetOrder = (id: string): number => {
      if (id === "project-info-table") return -1;
      // Pending creation widgets should appear at the top (after project-info-table)
      if (activeSelectedWidgets.includes(id)) return 0;
      if (id.startsWith("file-group-")) {
        const groupId = id.replace("file-group-", "");
        const group = sortedGroups.find((g: any) => g.groupInfo.id === groupId);
        return typeof group?.groupInfo?.order === "number" ? group.groupInfo.order : Infinity;
      }
      const chartItem = sortedCharts.find((c: any) => c.id === id);
      return typeof chartItem?.order === "number" ? chartItem.order : Infinity;
    };

    const hasApiOrder =
      sortedCharts.some((c: any) => typeof c.order === "number") ||
      sortedGroups.some((g: any) => typeof g.groupInfo?.order === "number");

    const parsedOrder = isReadOnly || isPreviewOrPublished
      ? orderedItemsRef.current
      : (savedOrder ? JSON.parse(savedOrder) : null);

    if (parsedOrder) {
      const filteredOrder = parsedOrder.filter((id: string) => uniqueIds.includes(id));
      const missingIds = uniqueIds.filter((id) => !filteredOrder.includes(id));

      const hasTable = filteredOrder.includes("project-info-table");
      const tableIndex = hasTable ? filteredOrder.indexOf("project-info-table") : -1;

      // Create a copy of the filtered order to insert missing items
      const mergedOrder = [...filteredOrder];

      // Sort missing IDs by their API order (if any) to insert them sequentially
      missingIds.sort((a, b) => getWidgetOrder(a) - getWidgetOrder(b));

      missingIds.forEach((missingId) => {
        const isLocalDragged = activeSelectedWidgets.includes(missingId);
        if (isLocalDragged) {
          if (externalDropTargetRef && externalDropTargetRef.current) {
            const targetIdx = mergedOrder.indexOf(externalDropTargetRef.current);
            const after = externalDropTargetPositionRef?.current === "after";
            const insertIdx = targetIdx !== -1 ? (after ? targetIdx + 1 : targetIdx) : (hasTable ? tableIndex + 1 : 0);
            mergedOrder.splice(insertIdx, 0, missingId);
            externalDropTargetRef.current = null;
            if (droppedOnCanvasRef) {
              droppedOnCanvasRef.current = false;
            }
            return;
          }

          if (droppedOnCanvasRef && droppedOnCanvasRef.current) {
            // Dragged and dropped on empty canvas space -> append to bottom
            mergedOrder.push(missingId);
            droppedOnCanvasRef.current = false;
            return;
          } else {
            // Clicked from widget list -> insert at top (after table)
            let insertIdx = hasTable ? tableIndex + 1 : 0;
            mergedOrder.splice(insertIdx, 0, missingId);
            return;
          }
        }

        const orderVal = getWidgetOrder(missingId);
        if (orderVal !== Infinity && orderVal >= 0 && orderVal <= mergedOrder.length) {
          // If the widget has a valid API order, insert it at that index
          // Ensure it doesn't go before project-info-table
          let insertIdx = orderVal;
          if (hasTable && insertIdx <= tableIndex) {
            insertIdx = tableIndex + 1;
          }
          mergedOrder.splice(insertIdx, 0, missingId);
        } else {
          let insertIdx = hasTable ? tableIndex + 1 : 0;
          mergedOrder.splice(insertIdx, 0, missingId);
        }
      });
      finalOrder = mergedOrder;
    } else if (hasApiOrder) {
      finalOrder = [...uniqueIds].sort((a, b) => {
        const orderA = getWidgetOrder(a);
        const orderB = getWidgetOrder(b);
        if (orderA !== orderB) return orderA - orderB;
        return uniqueIds.indexOf(a) - uniqueIds.indexOf(b);
      });
    }

    if (JSON.stringify(finalOrder) !== JSON.stringify(orderedItemsRef.current)) {
      setOrderedItems(finalOrder);
      if (!isPreviewOrPublished && !isReadOnly) {
        persistToStorage(currentLayouts, finalOrder);
      }
    }

    const newLayouts: any = {};
    let changed = false;

    // Prune deleted layouts, also strip any config-expanded entries (w===20) that
    // belong to charts which are NOT the currently active config. These are ghost
    // heights written to localStorage while the configuration panel was open and
    // not yet cleaned up (e.g. right after saving a chart).
    Object.keys(currentLayouts).forEach((key) => {
      if (uniqueIds.includes(key)) {
        const entry = currentLayouts[key];
        const chartItem = sortedCharts.find((c: any) => c.id === key);
        const apiW = chartItem && chartItem.width ? Math.max(1, Math.min(20, Math.round(typeof chartItem.width === "string" ? parseFloat(chartItem.width) : chartItem.width))) : null;

        // If this entry was written while in config-expanded mode (w===20) but the
        // chart is no longer being configured, we discard it so it gets re-derived
        // from API data or defaults below instead of ghosting a large height.
        if (entry && entry.w === 20 && key !== "project-info-table" && apiW !== 20 && key !== activeConfigIdRef.current) {
          changed = true; // force re-derivation below
        } else {
          newLayouts[key] = entry;
        }
      } else {
        changed = true;
      }
    });

    uniqueIds.forEach((id) => {
      if (id === "project-info-table") {
        if (!newLayouts[id]) {
          newLayouts[id] = { w: 20, h: calculatedH };
          changed = true;
        }
        return;
      }

      if (id.startsWith("file-group-")) {
        if (!newLayouts[id]) {
          const groupId = id.replace("file-group-", "");
          const group = sortedGroups.find((g: any) => g.groupInfo.id === groupId);

          let rawWidth = 10;
          let rawHeight = 18;
          if (group?.groupInfo) {
            if (typeof group.groupInfo.width === "number") rawWidth = group.groupInfo.width;
            else if (typeof group.groupInfo.width === "string") rawWidth = parseInt(group.groupInfo.width);

            if (typeof group.groupInfo.height === "number") rawHeight = group.groupInfo.height;
            else if (typeof group.groupInfo.height === "string") rawHeight = parseInt(group.groupInfo.height);
          }
          newLayouts[id] = { w: rawWidth, h: rawHeight };
          changed = true;
        }
        return;
      }

      const chartItem = sortedCharts.find((c: any) => c.id === id);
      const hasApiLayout =
        chartItem &&
        chartItem.width &&
        (typeof chartItem.height === "number" || typeof chartItem.height === "string");

      if (hasApiLayout) {
        let rawHeight = typeof chartItem.height === "string" ? parseFloat(chartItem.height) : chartItem.height;
        let rawWidth = typeof chartItem.width === "string" ? parseFloat(chartItem.width) : chartItem.width;

        const isOldGrid = rawHeight > 100 && (rawHeight + 24) % 74 === 0;

        if (isOldGrid) {
          const oldUnitsH = Math.round((rawHeight + 24) / 74);
          rawHeight = oldUnitsH * (ROW_HEIGHT + GAP_SIZE) - GAP_SIZE;
        }

        const minHUnits = (chartItem?.category === "TREEMAP" || chartItem?.category === "CANDLESTICK") ? 6 : 1;
        const apiW = Math.max(1, Math.min(20, Math.round(rawWidth)));
        let apiH = Math.max(minHUnits, Math.round(rawHeight));
        if (rawHeight >= 50) {
          apiH = Math.max(minHUnits, Math.round((rawHeight + GAP_SIZE) / (ROW_HEIGHT + GAP_SIZE)));
        }

        if (isReadOnly) {
          if (newLayouts[id]?.w !== apiW || newLayouts[id]?.h !== apiH) {
            newLayouts[id] = { w: apiW, h: apiH };
            changed = true;
          }
        } else {
          if (!newLayouts[id]) {
            newLayouts[id] = { w: apiW, h: apiH };
            changed = true;
          }
        }
      } else if (!newLayouts[id]) {
        let defaultW = 10;
        let defaultH = 15;

        const widgetType = id.split("_")[0];
        const registryConfig = CHART_REGISTRY[widgetType];
        if (registryConfig?.defaultHeight) {
          defaultH = Math.max(15, Math.round((registryConfig.defaultHeight + GAP_SIZE) / (ROW_HEIGHT + GAP_SIZE)));
        }

        switch (chartItem?.category) {
          case "DECOMPOSITION_TREE":
            defaultW = 10;
            defaultH = 26;
            break;
          case "GEOGRAPHY":
          case "GEOGRAPHY_GRAPH":
            defaultW = 10;
            defaultH = 24;
            break;
          case "RAG":
            defaultH = 20;
            break;
          case "FUNNEL":
          case "HORIZONTAL_BAR":
            defaultH = 18;
            break;
          case "MARIMEKKO":
            defaultH = 6;
            break;
          default:
            break;
        }

        newLayouts[id] = { w: defaultW, h: defaultH };
        changed = true;
      }

      let minH = 1;
      if (id === "project-info-table") {
        minH = calculatedH;
      } else {
        if (chartItem?.category === "MARIMEKKO") minH = 6;
        else if (chartItem?.category === "TREEMAP" || chartItem?.category === "CANDLESTICK") minH = 6;
      }

      if (newLayouts[id] && newLayouts[id].h < minH) {
        newLayouts[id] = { ...newLayouts[id], h: minH };
        changed = true;
      }
    });

    if (changed) {
      // Use an updater so we merge with any in-flight state updates from other
      // effects (e.g. Effect #3 that sets the newly saved chart's layout) rather
      // than blindly overwriting the whole layouts object.
      setLayouts((prev: any) => {
        const merged = { ...newLayouts };
        // Re-apply any in-flight updates that are already in React state but not
        // yet flushed to localStorage (e.g. the pending→savedChart swap from Eff#3).
        Object.keys(prev).forEach((key) => {
          if (uniqueIds.includes(key) && !merged[key]) {
            // key exists in live state but was pruned (config-expanded) – use prev
            merged[key] = prev[key];
          }
        });
        return merged;
      });
      if (!isPreviewOrPublished && !isReadOnly) {
        persistToStorage(newLayouts, finalOrder);
      }
    }
  }, [
    finalChartsData,
    selectedWidgets,
    storageKey,
    hasTableData,
    groupedFilesData,
    isReadOnly,
    isChartsLoading,
    // NOTE: activeConfigId is intentionally NOT listed here. Effect #4 reads it
    // via activeConfigIdRef.current so it always has the latest value without
    // triggering a re-run when config opens — which would race with Effect #1.
  ]);

  // 5. Dynamically sync Project Information layout height with field count
  useEffect(() => {
    if (hasTableData) {
      setLayouts((prev: any) => {
        if (!prev) return prev;
        const currentH = prev["project-info-table"]?.h;
        if (currentH !== calculatedH) {
          return {
            ...prev,
            "project-info-table": {
              ...prev["project-info-table"],
              w: prev["project-info-table"]?.w || 20,
              h: calculatedH,
            },
          };
        }
        return prev;
      });
    }
  }, [calculatedH, hasTableData]);

  const deleteWidgetLayout = (id: string) => {
    setLayouts((prev: any) => {
      const next = { ...prev };
      delete next[id];
      const nextOrder = orderedItemsRef.current.filter((item) => item !== id);
      setOrderedItems(nextOrder);
      persistToStorage(next, nextOrder);
      return next;
    });
  };

  return {
    layouts,
    orderedItems,
    setOrderedItems,
    onResize,
    onResizeStop,
    persistToStorage,
    previousLayouts: previousLayoutsRef.current,
    deleteWidgetLayout,
  };
};
