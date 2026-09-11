import { useEffect } from "react";
import { BarDragState, TaskItem } from "../types/index";

const DAY_MS = 86_400_000;

export function useBarDrag(
  dayPx: number,
  barDragRef: React.MutableRefObject<BarDragState | null>,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  tlPaneRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!barDragRef.current || !tlPaneRef.current) return;
      const { 
        id, 
        mode, 
        startX, 
        startScrollLeft, 
        lastDD, 
        origStart, 
        origEnd,
        origMilestoneDate 
      } = barDragRef.current;

      const currentScrollLeft = tlPaneRef.current.scrollLeft;
      const deltaX = e.clientX - startX + (currentScrollLeft - startScrollLeft);
      const dd = Math.round(deltaX / dayPx);

      // Only re-render if we actually crossed a day boundary
      if (dd === lastDD) return;
      barDragRef.current.lastDD = dd;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;

          if (mode === "move") {
            const ns = new Date(origStart.getTime() + dd * DAY_MS);
            const ne = new Date(origEnd.getTime() + dd * DAY_MS);
            const update: Partial<TaskItem> = { start: ns, end: ne };
            
            // Move milestone with the bar if it exists
            if (origMilestoneDate) {
              update.milestone_date = new Date(origMilestoneDate.getTime() + dd * DAY_MS);
            } else if (t.milestone) {
              // If it's a milestone but date wasn't set, default it to current start
              update.milestone_date = ns;
            }
            return { ...t, ...update };
          }

          if (mode === "move-milestone") {
            const base = origMilestoneDate || origStart;
            const nmd = new Date(base.getTime() + dd * DAY_MS);
            // Move only the milestone marker, keep the task start/end as they are
            return { ...t, milestone_date: nmd };
          }


          if (mode === "resize-r") {
            const ne = new Date(origEnd.getTime() + dd * DAY_MS);
            const minEnd = new Date(
              (t.start || origStart).getTime() + 0 * DAY_MS
            );
            return ne >= minEnd ? { ...t, end: ne } : t;
          }

          if (mode === "resize-l") {
            const ns = new Date(origStart.getTime() + dd * DAY_MS);
            const maxStart = new Date(
              (t.end || origEnd).getTime() - 0 * DAY_MS
            );
            return ns <= maxStart ? { ...t, start: ns } : t;
          }

          return t;
        })
      );
    };

    const onUp = () => {
      if (barDragRef.current) {
        barDragRef.current = null;
        document.body.style.cursor = "";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

  }, [dayPx, barDragRef, setTasks, tlPaneRef]);
}

