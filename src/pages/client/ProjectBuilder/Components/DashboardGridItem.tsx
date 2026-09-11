/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Move } from "lucide-react";

type ResizeType = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

interface DashboardGridItemProps {
  id: string;
  w: number;
  h: number;
  children: React.ReactNode;
  isReadOnly?: boolean;
  disableResize?: boolean;
  disableDrag?: boolean;
  minH?: number;
  onResize: (id: string, newW: number, newH: number) => void;
  onResizeStop?: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeaveItem?: (id: string) => void;
  onDragEnd: () => void;
  className?: string;
  isConfigActive?: boolean;
  draggedItemId?: string | null;
  hoveredDropTargetId?: string | null;
  insertAfterTarget?: boolean;
}

const DashboardGridItem: React.FC<DashboardGridItemProps> = ({
  id,
  w,
  h,
  children,
  isReadOnly,
  disableResize,
  disableDrag,
  minH,
  onResize,
  onResizeStop,
  onDragStart,
  onDragOver,
  onDragLeaveItem,
  onDragEnd,
  className,
  isConfigActive = false,
  draggedItemId,
  hoveredDropTargetId,
  insertAfterTarget,
}) => {
  const [activeResizeType, setActiveResizeType] = useState<ResizeType>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [initialPos, setInitialPos] = useState({
    mouseX: 0,
    mouseY: 0,
    startW: 0,
    startH: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize handling
  const startResize = (type: ResizeType) => (e: React.MouseEvent) => {
    if (isReadOnly || disableResize) return;
    e.preventDefault();
    e.stopPropagation();

    setActiveResizeType(type);
    setInitialPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: w,
      startH: h,
    });
  };

  useEffect(() => {
    if (!activeResizeType) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current?.parentElement) return;

      const parentWidth =
        containerRef.current.parentElement.clientWidth - 19 * 8; // 19 gaps of 8px
      const colWidth = parentWidth / 20; // 20 columns
      const rowHeightPx = 28; // row 20 + gap 8 for high density

      const deltaX = e.clientX - initialPos.mouseX;
      const deltaY = e.clientY - initialPos.mouseY;

      let newW = initialPos.startW;
      let newH = initialPos.startH;

      // Logic for E (Right) / W (Left)
      if (activeResizeType.includes("e")) {
        newW = Math.max(
          2,
          Math.min(20, initialPos.startW + Math.round(deltaX / colWidth)),
        );
      } else if (activeResizeType.includes("w")) {
        newW = Math.max(
          2,
          Math.min(20, initialPos.startW - Math.round(deltaX / colWidth)),
        );
      }

      // Logic for S (Bottom) / N (Top)
      const effectiveMinH = minH || 2;
      if (activeResizeType.includes("s")) {
        newH = Math.max(
          effectiveMinH,
          initialPos.startH + Math.round(deltaY / rowHeightPx),
        );
      } else if (activeResizeType.includes("n")) {
        newH = Math.max(
          effectiveMinH,
          initialPos.startH - Math.round(deltaY / rowHeightPx),
        );
      }

      if (newW !== w || newH !== h) {
        onResize(id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setActiveResizeType(null);
      if (onResizeStop) {
        onResizeStop(id);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeResizeType, id, w, h, onResize, onResizeStop, initialPos]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", "dashboard_grid_item_drag");
    setIsDragging(true);
    onDragStart(id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const isTargetOfDrag =
    hoveredDropTargetId === id && draggedItemId && draggedItemId !== id;

  return (
    <div
      ref={containerRef}
      id={id}
      draggable={!isReadOnly && !activeResizeType && !disableDrag}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(id, e);
      }}
      onDragLeave={() => {
        if (onDragLeaveItem) {
          onDragLeaveItem(id);
        }
      }}
      onDragEnd={handleDragEnd}
      style={{
        gridColumn: isConfigActive ? "span 20" : `span ${w}`,
        gridRow: `span ${h}`,
      }}
      className={`${isConfigActive ? "h-full w-full config-mode-active z-30 shadow-lg" : "h-full w-full"} bg-white dark:bg-slate-800 rounded-lg overflow-visible flex flex-col group relative ${activeResizeType || isDragging
        ? "z-50 shadow-lg ring-2 ring-brand-primary"
        : isTargetOfDrag
          ? "z-50 shadow-lg ring-2 ring-dashed ring-brand-primary border-brand-primary bg-secondary-bg"
          : "hover:border-brand-primary hover:shadow-lg transition-all duration-300"
        } ${className}`}
    >
      {/* 
         DRAG HANDLE - Floating overlay on hover ONLY.
      */}
      {!isReadOnly && (
        <div className={`absolute left-0 right-0 z-50 transition-all overflow-hidden flex items-center justify-center ${isTargetOfDrag
          ? (insertAfterTarget ? "bottom-0 h-6" : "top-0 h-6")
          : "top-0 h-0.5 group-hover:h-6 cursor-move"
          }`}>
          <div className={`opacity-0 ${isTargetOfDrag ? "opacity-100" : "group-hover:opacity-100"} transition-opacity bg-brand-primary text-white px-3 py-1 rounded-md flex items-center gap-2 shadow-sm pointer-events-none`}>
            <Move className="w-3 h-3" />
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none">
              {isTargetOfDrag
                ? (insertAfterTarget ? "Insert after" : "Insert before")
                : "Move Chart"}
            </span>
          </div>
        </div>
      )}

      {/* 
         RESIZE HANDLES - Transparent borders 
      */}
      {!isReadOnly && !disableResize && (
        <>
          {/* Edges */}
          <div
            className="absolute top-0 left-0 right-0 h-1 cursor-n-resize z-40"
            onMouseDown={startResize("n")}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-40"
            onMouseDown={startResize("s")}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize z-40"
            onMouseDown={startResize("w")}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize z-40"
            onMouseDown={startResize("e")}
          />

          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-50"
            onMouseDown={startResize("nw")}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-50"
            onMouseDown={startResize("ne")}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-50"
            onMouseDown={startResize("sw")}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50"
            onMouseDown={startResize("se")}
          />
        </>
      )}

      {/* 
         MAIN CONTENT - Takes 100% space
      */}
      <div className={`flex-1 w-full h-full min-h-0 ${isConfigActive ? "overflow-visible" : "overflow-hidden"} border border-transparent hover:border-brand-primary transition-all duration-300 rounded-md dark:bg-slate-900 pointer-events-none select-none`}>
        <div className="w-full h-full pointer-events-auto select-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardGridItem;
