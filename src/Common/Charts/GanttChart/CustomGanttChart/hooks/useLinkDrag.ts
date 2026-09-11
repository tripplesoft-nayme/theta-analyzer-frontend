/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Dep, DepSide, LinkDragState, TaskItem } from "../types/index";
import { dFromStart } from "../utils/ganttUtils";

export function useLinkDrag(
  dayPx: number,
  startDate: Date,
  linkDragRef: React.MutableRefObject<LinkDragState | null>,
  tlPaneContainerRef: React.RefObject<HTMLDivElement | null>,
  setLinkPreview: (preview: any) => void,
  setTasks: (update: (prev: TaskItem[]) => TaskItem[]) => void,
  setDeps: (update: (prev: Dep[]) => Dep[]) => void,
  ROW_H: number
) {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!linkDragRef.current || !tlPaneContainerRef.current) return;
      const rect = tlPaneContainerRef.current.getBoundingClientRect(),
        scrollLeft = tlPaneContainerRef.current.scrollLeft,
        scrollTop = tlPaneContainerRef.current.scrollTop,
        toX = e.clientX - rect.left + scrollLeft,
        toY = e.clientY - rect.top + scrollTop;
      linkDragRef.current.curX = toX;
      linkDragRef.current.curY = toY;
      setLinkPreview({
        fromX: linkDragRef.current.fromX,
        fromY: linkDragRef.current.fromY,
        toX,
        toY,
      });
    };
    const onUp = (e: MouseEvent) => {
      if (!linkDragRef.current || !tlPaneContainerRef.current) return;
      const capturedFromId = linkDragRef.current.fromId,
        capturedFromSide = linkDragRef.current.fromSide,
        rect = tlPaneContainerRef.current.getBoundingClientRect(),
        relX = e.clientX - rect.left + tlPaneContainerRef.current.scrollLeft,
        relY = e.clientY - rect.top + tlPaneContainerRef.current.scrollTop,
        rowIdx = Math.floor(relY / ROW_H);
      linkDragRef.current = null;
      setLinkPreview(null);
      document.body.style.cursor = "";
      setTasks((prev) => {
        const target = prev[rowIdx];
        if (!target || target.group || target.id === capturedFromId)
          return prev;
        let resolvedToSide: DepSide = "left";
        if (target.start && target.end) {
          const rowStartDate = startDate;
          const dpx = dayPx;
          const barLeft = dFromStart(rowStartDate, target.start) * dpx,
            barRight = dFromStart(rowStartDate, target.end) * dpx,
            barMid = (barLeft + barRight) / 2;
          resolvedToSide = relX >= barMid ? "right" : "left";
        }
        setDeps((prevDeps) => {
          if (
            prevDeps.some(
              (d) => d.from === capturedFromId && d.to === target.id,
            )
          )
            return prevDeps;
          return [
            ...prevDeps,
            {
              id: "d" + Date.now(),
              from: capturedFromId,
              to: target.id,
              fromSide: capturedFromSide,
              toSide: resolvedToSide,
              autoColor: true,
              style: "solid",
              color: "",
              width: 1.5,
              curve: "curve",
              arrow: "arrow",
              lag: 0,
            },
          ];
        });
        return prev;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dayPx, startDate, tlPaneContainerRef, linkDragRef, setLinkPreview, setTasks, setDeps, ROW_H]);
}
