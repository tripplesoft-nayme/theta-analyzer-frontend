import { useState, useRef, useEffect } from "react";

export const useDashboardDragDrop = ({
  orderedItems,
  setOrderedItems,
  layouts,
  persistToStorage,
  onDropWidget,
  externalDropTargetRef,
  externalDropTargetPositionRef,
  droppedOnCanvasRef,
}: {
  orderedItems: string[];
  setOrderedItems: (items: string[]) => void;
  layouts: any;
  persistToStorage: (layouts: any, order: string[]) => void;
  onDropWidget?: (widgetId: string) => void;
  externalDropTargetRef?: React.MutableRefObject<string | null>;
  externalDropTargetPositionRef?: React.MutableRefObject<"before" | "after">;
  droppedOnCanvasRef?: React.MutableRefObject<boolean>;
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const autoScrollInterval = useRef<any>(null);
  const currentDragY = useRef<number | null>(null);
  const dragCounter = useRef(0);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [insertAfterTarget, setInsertAfterTarget] = useState<boolean>(false);

  useEffect(() => {
    if (!draggedItemId) {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      return;
    }

    const SCROLL_THRESHOLD = 150;
    const MAX_SPEED = 20;

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      currentDragY.current = e.clientY;
    };

    if (!autoScrollInterval.current) {
      autoScrollInterval.current = setInterval(() => {
        if (currentDragY.current === null) return;

        const y = currentDragY.current;
        const winHeight = window.innerHeight;

        if (y < SCROLL_THRESHOLD) {
          const intensity = (SCROLL_THRESHOLD - y) / SCROLL_THRESHOLD;
          window.scrollBy(0, -Math.round(intensity * MAX_SPEED));
        } else if (y > winHeight - SCROLL_THRESHOLD) {
          const intensity =
            (y - (winHeight - SCROLL_THRESHOLD)) / SCROLL_THRESHOLD;
          window.scrollBy(0, Math.round(intensity * MAX_SPEED));
        }
      }, 16);
    }

    window.addEventListener("dragover", handleWindowDragOver);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      currentDragY.current = null;
    };
  }, [draggedItemId]);

  const [hoveredDropTargetId, setHoveredDropTargetId] = useState<string | null>(null);

  const onDragStart = (id: string) => {
    setDraggedItemId(id);
    setHoveredDropTargetId(null);
    setInsertAfterTarget(false);
  };

  const findClosestChart = (mx: number, my: number) => {
    let closestId = null;
    let minDistance = Infinity;
    let relativePosition: "before" | "after" = "after";

    for (const id of orderedItems) {
      if (id === draggedItemId) continue;
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(mx - cx, my - cy);
      if (dist < minDistance) {
        minDistance = dist;
        closestId = id;

        if (my < rect.top) {
          relativePosition = "before";
        } else if (my > rect.bottom) {
          relativePosition = "after";
        } else {
          const draggedIdx = draggedItemId ? orderedItems.indexOf(draggedItemId) : -1;
          const hoveredIdx = orderedItems.indexOf(id);
          if (draggedIdx !== -1 && hoveredIdx !== -1) {
            if (draggedIdx > hoveredIdx) {
              relativePosition = mx < rect.left + rect.width * 0.75 ? "before" : "after";
            } else {
              relativePosition = mx < rect.left + rect.width * 0.25 ? "before" : "after";
            }
          } else {
            relativePosition = mx < cx ? "before" : "after";
          }
        }
      }
    }
    return { id: closestId, position: relativePosition };
  };

  const onDragOver = (hoveredId: string, e: React.DragEvent) => {
    const rect = document.getElementById(hoveredId)?.getBoundingClientRect();
    if (!rect) return;

    const mx = e.clientX;
    const cx = rect.left + rect.width / 2;
    let after = mx >= cx;

    if (!draggedItemId) {
      if (externalDropTargetRef) {
        externalDropTargetRef.current = hoveredId;
      }
      if (externalDropTargetPositionRef) {
        externalDropTargetPositionRef.current = after ? "after" : "before";
      }
      return;
    }

    if (draggedItemId === hoveredId) return;

    const draggedIdx = orderedItems.indexOf(draggedItemId);
    const hoveredIdx = orderedItems.indexOf(hoveredId);
    if (draggedIdx !== -1 && hoveredIdx !== -1) {
      if (draggedIdx > hoveredIdx) {
        after = mx >= rect.left + rect.width * 0.75;
      } else {
        after = mx >= rect.left + rect.width * 0.25;
      }
    }

    if (hoveredDropTargetId !== hoveredId || insertAfterTarget !== after) {
      setHoveredDropTargetId(hoveredId);
      setInsertAfterTarget(after);
    }
  };

  const onDragLeaveItem = (_id: string) => {
    // Keep the last active target to prevent flicker and layout dropping to end on race conditions
  };

  const onDragEnd = () => {
    setDraggedItemId(null);
    setHoveredDropTargetId(null);
    setInsertAfterTarget(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    dragCounter.current = 0;
    setIsDragOverCanvas(false);

    const isGridDrag = e.dataTransfer.getData("text/plain") === "dashboard_grid_item_drag";
    if (isGridDrag) {
      e.preventDefault();
      if (draggedItemId) {
        const newOrder = [...orderedItems];
        const draggedIdx = newOrder.indexOf(draggedItemId);

        if (draggedIdx !== -1) {
          newOrder.splice(draggedIdx, 1);

          if (hoveredDropTargetId) {
            const targetIdx = newOrder.indexOf(hoveredDropTargetId);
            if (targetIdx !== -1) {
              const insertIdx = insertAfterTarget ? targetIdx + 1 : targetIdx;
              newOrder.splice(insertIdx, 0, draggedItemId);
            } else {
              newOrder.splice(draggedIdx, 0, draggedItemId);
            }
          } else {
            newOrder.splice(draggedIdx, 0, draggedItemId);
          }

          setOrderedItems(newOrder);
          persistToStorage(layouts, newOrder);
        }
      }
      return;
    }

    e.preventDefault();
    const widgetId = e.dataTransfer.getData("widgetId");
    if (widgetId && onDropWidget) {
      if (droppedOnCanvasRef) {
        droppedOnCanvasRef.current = true;
      }
      onDropWidget(widgetId);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const isGridDrag = !!draggedItemId;
    if (!isGridDrag) {
      dragCounter.current += 1;
      setIsDragOverCanvas(true);
    }
  };

  const handleDragLeave = (_e: React.DragEvent<HTMLDivElement>) => {
    const isGridDrag = !!draggedItemId;
    if (!isGridDrag) {
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragOverCanvas(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const isGridDrag = !!draggedItemId;
    const mx = e.clientX;
    const my = e.clientY;

    if (!isGridDrag) {
      e.dataTransfer.dropEffect = "copy";
      const closest = findClosestChart(mx, my);
      if (closest.id) {
        if (externalDropTargetRef) {
          externalDropTargetRef.current = closest.id;
        }
        if (externalDropTargetPositionRef) {
          externalDropTargetPositionRef.current = closest.position;
        }
      }
      return;
    }

    const closest = findClosestChart(mx, my);
    if (closest.id) {
      const after = closest.position === "after";
      if (hoveredDropTargetId !== closest.id || insertAfterTarget !== after) {
        setHoveredDropTargetId(closest.id);
        setInsertAfterTarget(after);
      }
    }
  };

  return {
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
  };
};
