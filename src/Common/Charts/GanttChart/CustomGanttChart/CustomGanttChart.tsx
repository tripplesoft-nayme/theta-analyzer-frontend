/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Settings,
  Columns,
  ZoomIn,
  ZoomOut,
  FileDown,
  FileUp,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";

// Types
import {
  TaskItem,
  Dep,
  ColDef,
  LinkDragState,
  BarDragState,
} from "./types/index";

// Utils
import {
  getToday,
  dDiff,
  dFromStart,
  fmtDate,
  getTaskSummary,
} from "./utils/ganttUtils";

// Components
import { TimelineHeader } from "./components/TimelineHeader";
import { DepSvg } from "./components/DepSvg";
// import { LinkPanel } from "./components/LinkPanel";
import { GridCell } from "./components/GridCell";
import { ColumnModal } from "./components/ColumnModal";
import { TaskModal } from "./components/TaskModal";

// Hooks
import { useBarDrag } from "./hooks/useBarDrag";
import { useLinkDrag } from "./hooks/useLinkDrag";

// API
import {
  useGetGanttChartByIdQuery,
  useCreateGanttChartMutation,
  useUpdateGanttChartByIdMutation,
} from "@/store/Api/ChartApi/GanttChartApi";
import { useGetAllManagersQuery } from "@/store/Api/UserApi/UserApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import CustomGanttChartSkeleton from "@/Common/Skeleton/Common/Charts/GanttChart/CustomGanttChart/CustomGanttChartSkeleton";
// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const ROW_H = 40;
const GRID_INIT_W = 400;

const FULL_COLUMNS: ColDef[] = [
  { id: "id", label: "ID", width: 50, align: "center", defaultVisible: true },
  {
    id: "info",
    label: "Info",
    width: 80,
    align: "center",
    defaultVisible: true,
  },
  {
    id: "name",
    label: "Task Name",
    width: 220,
    align: "left",
    defaultVisible: true,
    flex: true,
  },
  {
    id: "duration",
    label: "Duration",
    width: 80,
    align: "left",
    defaultVisible: true,
  },
  {
    id: "planned_start",
    label: "Start Date",
    width: 120,
    align: "left",
    defaultVisible: true,
  },
  {
    id: "planned_finish",
    label: "End Date",
    width: 120,
    align: "left",
    defaultVisible: true,
  },
  {
    id: "assigned",
    label: "Assigned",
    width: 120,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "link",
    label: "Link",
    width: 80,
    align: "center",
    defaultVisible: false,
  },
  {
    id: "status",
    label: "Status",
    width: 100,
    align: "center",
    defaultVisible: false,
  },
  {
    id: "priority",
    label: "Priority",
    width: 80,
    align: "center",
    defaultVisible: false,
  },
  {
    id: "percent_complete",
    label: "Percent Complete",
    width: 120,
    align: "center",
    defaultVisible: false,
  },
  {
    id: "actual_start",
    label: "Actual Start Date",
    width: 120,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "actual_finish",
    label: "Actual Finish Date",
    width: 120,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "baseline_start",
    label: "Baseline Start Date",
    width: 120,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "baseline_finish",
    label: "Baseline Finish Date",
    width: 120,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "planned_hours",
    label: "Planned Hours",
    width: 100,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "actual_hours",
    label: "Actual Hours",
    width: 100,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "remaining_hours",
    label: "Remaining Hours",
    width: 120,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "planned_cost",
    label: "Planned Cost",
    width: 100,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "actual_cost",
    label: "Actual Cost",
    width: 100,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "resource_cost_planned",
    label: "Planned Resource Cost",
    width: 140,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "resource_cost_actual",
    label: "Actual Resource Cost",
    width: 140,
    align: "right",
    defaultVisible: false,
  },
  {
    id: "milestone",
    label: "Milestone",
    width: 80,
    align: "center",
    defaultVisible: true,
  },
  {
    id: "milestone_date",
    label: "Milestone Date",
    width: 120,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "tags",
    label: "Tags",
    width: 100,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "task_type",
    label: "Task Type",
    width: 100,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "linked_from",
    label: "Linked From",
    width: 100,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "linked_to",
    label: "Linked To",
    width: 100,
    align: "left",
    defaultVisible: false,
  },
  {
    id: "complete",
    label: "Complete",
    width: 80,
    align: "center",
    defaultVisible: false,
  },
  {
    id: "actual_duration",
    label: "Actual Duration",
    width: 110,
    align: "left",
    defaultVisible: false,
  },
];

export default function CustomGanttChart() {
  const { projectId } = useParams();
  const { pathname } = useLocation();
  const isEmployee = pathname.includes("staff-employee-panel");
  const { data: managersData } = useGetAllManagersQuery({});
  const managers = Array.isArray(managersData?.data?.data) ? managersData.data.data : [];
  const { data: ganttData, isLoading: isGanttLoading } =
    useGetGanttChartByIdQuery(projectId as string, { skip: !projectId });
  const [createGantt] = useCreateGanttChartMutation();
  const [updateGantt] = useUpdateGanttChartByIdMutation();
  const TODAY = useMemo(() => getToday(), []);
  const projectTitle = ganttData?.data?.title || "Project Timeline";
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);

  const [dayPx, setDayPx] = useState(28);
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);
  // const [depCounter, setDepCounter] = useState(INITIAL_DEPS.length + 1);
  const [visibleColIds, setVisibleColIds] = useState<string[]>(
    FULL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id),
  );
  const [customCols, setCustomCols] = useState<ColDef[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("Text");
  const [gridWidth, setGridWidth] = useState(GRID_INIT_W);
  const [hoveredBarId, setHoveredBarId] = useState<number | null>(null);
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  const [taskColors, setTaskColors] = useState<Record<number, string>>({});
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const colResizingRef = useRef<{ id: string; startX: number; startW: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingCell, setEditingCell] = useState<{ taskId: number; colId: string } | null>(null);

  useEffect(() => {
    if (isGanttLoading) return;

    const parsedTasks: TaskItem[] = [];
    const m: Record<number, string> = {};
    let currentId = 1;

    if (ganttData?.data) {
      if (ganttData?.data?.xAxis) {
        let rows: any[] = [];
        try {
          rows =
            typeof ganttData.data.xAxis === "string"
              ? JSON.parse(ganttData.data.xAxis)
              : ganttData.data.xAxis;
        } catch (e) {
          console.error("Failed to parse xAxis", e);
        }

        if (Array.isArray(rows)) {
          // Check for new structure: [ { deps, columns }, ...rows ]
          let startIdx = 0;
          if (rows.length > 0 && (rows[0] as any).deps) {
            const meta = rows[0] as any;
            setDeps(meta.deps || []);
            if (meta.columns && Array.isArray(meta.columns)) {
              setVisibleColIds(meta.columns);
            }
            startIdx = 1;
          } else {
            setDeps(ganttData.data.deps || []);
          }

          rows.slice(startIdx).forEach((item: any) => {
            if (item?.group && item?.group?.length > 0) {
              const groupId = item.group[7] ? Number(item.group[7]) : currentId;
              parsedTasks.push({
                id: groupId,
                name: item.group[0] || "Unnamed Group",
                group: true,
                start: item.group[2] ? new Date(item.group[2]) : undefined,
                end: item.group[3] ? new Date(item.group[3]) : undefined,
                assigned: item.group[4],
                progress: item.group[5] || 0,
                status:
                  item.group[5] === 100
                    ? "complete"
                    : item.group[5] > 0
                      ? "in-progress"
                      : "not-started",
                milestone: !!item.group[8],
                milestone_date: item.group[9] ? new Date(item.group[9]) : undefined,
              });
              m[groupId] = item.color || "#3B82F6";
              currentId = Math.max(currentId, groupId + 1);

              if (item.task && Array.isArray(item.task)) {
                item.task.forEach((childTask: any) => {
                  if (Array.isArray(childTask)) {
                    const childId = childTask[7] ? Number(childTask[7]) : currentId;
                    const meta = childTask[10] || {};
                    parsedTasks.push({
                      id: childId,
                      parentId: groupId,
                      name: childTask[0] || "Unnamed Task",
                      group: false,
                      start: childTask[2] ? new Date(childTask[2]) : undefined,
                      end: childTask[3] ? new Date(childTask[3]) : undefined,
                      assigned: childTask[4],
                      progress: childTask[5] || 0,
                      status:
                        childTask[5] === 100
                          ? "complete"
                          : childTask[5] > 0
                            ? "in-progress"
                            : "not-started",
                      milestone: !!childTask[8],
                      milestone_date: childTask[9] ? new Date(childTask[9]) : undefined,
                      ...meta,
                    });

                    m[childId] = item.color || "#3B82F6";
                    currentId = Math.max(currentId, childId + 1);
                  }
                });
              }
            } else if (item?.task) {
              const taskData = Array.isArray(item.task[0])
                ? item.task[0]
                : item.task;
              if (
                Array.isArray(taskData) &&
                taskData.length > 0 &&
                typeof taskData[0] === "string"
              ) {
                const taskId = taskData[7] ? Number(taskData[7]) : currentId;
                const meta = taskData[10] || {};
                parsedTasks.push({
                  id: taskId,
                  name: taskData[0] || "Unnamed Task",
                  group: false,
                  start: taskData[2] ? new Date(taskData[2]) : undefined,
                  end: taskData[3] ? new Date(taskData[3]) : undefined,
                  assigned: taskData[4],
                  progress: taskData[5] || 0,
                  status:
                    taskData[5] === 100
                      ? "complete"
                      : taskData[5] > 0
                        ? "in-progress"
                        : "not-started",
                  milestone: !!taskData[8],
                  milestone_date: taskData[9] ? new Date(taskData[9]) : undefined,
                  ...meta,
                });
                m[taskId] = item.color || "#3B82F5";
                currentId = Math.max(currentId, taskId + 1);
              }
            }

          });
        }
      }
    }

    // Default empty row logic
    if (parsedTasks.length === 0) {
      const start = new Date(TODAY);
      const end = new Date(TODAY.getTime() + 7 * 86400000);
      parsedTasks.push({
        id: 1,
        name: "New Task",
        group: false,
        start,
        end,
        assigned: "Unassigned",
        progress: 0,
        status: "not-started",
        wbs: "1.",
      });
      m[1] = "#3B82F6";
    }

    setTasks(parsedTasks);
    setTaskColors(m);
  }, [ganttData, isGanttLoading, TODAY]);

  const barDragRef = useRef<BarDragState | null>(null);
  const linkDragRef = useRef<LinkDragState | null>(null);
  const resizerRef = useRef<{ startX: number; startW: number } | null>(null);

  const tlPaneRef = useRef<HTMLDivElement | null>(null),
    tlHdrRef = useRef<HTMLDivElement | null>(null),
    gridBodyRef = useRef<HTMLDivElement | null>(null),
    gridHdrRef = useRef<HTMLDivElement | null>(null),
    tlPaneContainerRef = useRef<HTMLDivElement | null>(null);

  const { startDate, totalDays } = useMemo(() => {
    // We base the range on the fetched data (ganttData) if available,
    // rather than the live 'tasks' state, to prevent the entire coordinate
    // system from shifting (jumping) while the user is actively dragging.
    const rawXAxis = ganttData?.data?.xAxis;
    let baseTasks: any[] = [];
    if (rawXAxis) {
      try {
        baseTasks =
          typeof rawXAxis === "string" ? JSON.parse(rawXAxis) : rawXAxis;
      } catch (e) {
        console.error("Failed to parse xAxis for range", e);
      }
    }

    let minD = new Date(TODAY);
    let maxD = new Date(TODAY);

    // If we have data, we find the range once.
    if (baseTasks.length > 0) {
      baseTasks.forEach((item: any) => {
        const group = item.group || [];
        const tasksArr = item.task || [];

        const checkArr = (row: any[]) => {
          if (row[2] || row[3]) {
            const s = row[2] ? new Date(row[2]) : null;
            const e = row[3] ? new Date(row[3]) : null;
            if (s && s < minD) minD = new Date(s);
            if (e && e > maxD) maxD = new Date(e);
          }
        };

        if (group.length > 0) checkArr(group);
        if (Array.isArray(tasksArr[0])) {
          tasksArr.forEach((tData: any[]) => checkArr(tData));
        } else if (tasksArr.length > 0) {
          checkArr(tasksArr);
        }
      });
    }

    const s = new Date(minD);
    s.setDate(s.getDate() - 30); // buffer
    const e = new Date(maxD);
    e.setDate(maxD.getDate() + 90); // buffer

    // Calculate how many days we need to at least cover a standard screen width
    // to avoid the "empty part" on the right when zoomed out.
    const minDaysToFillScreen = Math.ceil(2500 / dayPx);
    const contentDays = Math.ceil((e.getTime() - s.getTime()) / DAY_MS);

    const diff = Math.max(minDaysToFillScreen, contentDays);
    return { startDate: s, totalDays: diff };
  }, [ganttData, TODAY, dayPx]);

  const totalW = totalDays * dayPx;

  const scrollToToday = useCallback(
    (smooth = false) => {
      if (!tlPaneRef.current) return;
      const left = Math.max(0, dFromStart(startDate, TODAY) * dayPx - 150);
      tlPaneRef.current.scrollTo({
        left,
        behavior: smooth ? "smooth" : "auto",
      });
      if (tlHdrRef.current) {
        tlHdrRef.current.scrollTo({
          left,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    },
    [startDate, TODAY, dayPx],
  );

  useEffect(() => {
    const timer = setTimeout(() => scrollToToday(false), 100);
    return () => clearTimeout(timer);
  }, [scrollToToday]);

  const handleTlScroll = useCallback(() => {
    if (!tlPaneRef.current) return;
    if (tlHdrRef.current)
      tlHdrRef.current.scrollLeft = tlPaneRef.current.scrollLeft;
    if (gridBodyRef.current)
      gridBodyRef.current.scrollTop = tlPaneRef.current.scrollTop;
  }, []);

  const handleGridBodyScroll = useCallback(() => {
    if (!gridBodyRef.current || !tlPaneRef.current) return;
    tlPaneRef.current.scrollTop = gridBodyRef.current.scrollTop;
    if (gridHdrRef.current)
      gridHdrRef.current.scrollLeft = gridBodyRef.current.scrollLeft;
  }, []);

  useBarDrag(dayPx, barDragRef, setTasks, tlPaneRef);
  useLinkDrag(
    dayPx,
    startDate,
    linkDragRef,
    tlPaneContainerRef,
    setLinkPreview,
    setTasks,
    setDeps,
    ROW_H,
  );

  const startBarDrag = useCallback(
    (
      e: React.MouseEvent,
      id: number,
      mode: "move" | "resize-l" | "resize-r" | "move-milestone",
    ) => {
      if (isEmployee) return;
      e.stopPropagation();
      e.preventDefault();
      const t = tasks.find((x) => x.id === id);
      const mDate = t?.milestone_date || t?.start || new Date();
      if (!t) return;
      barDragRef.current = {
        id,
        mode,
        startX: e.clientX,
        startScrollLeft: tlPaneRef.current?.scrollLeft || 0,
        lastDD: 0,
        origStart: t.start ? new Date(t.start) : new Date(mDate),
        origEnd: t.end ? new Date(t.end) : new Date(mDate),
        origMilestoneDate: t.milestone_date ? new Date(t.milestone_date) : undefined,
      };
      document.body.style.cursor = mode.includes("move")
        ? "grabbing"
        : "col-resize";
    },
    [tasks],
  );

  const startLinkDrag = useCallback(
    (
      e: React.MouseEvent,
      fromId: number,
      fromSide: any,
      fromX: number,
      fromY: number,
    ) => {
      if (isEmployee) return;
      e.stopPropagation();
      e.preventDefault();
      linkDragRef.current = {
        fromId,
        fromSide,
        fromX,
        fromY,
        curX: fromX,
        curY: fromY,
      };
      setLinkPreview({ fromX, fromY, toX: fromX, toY: fromY });
      document.body.style.cursor = "crosshair";
    },
    [],
  );

  const startColResize = useCallback(
    (e: React.MouseEvent, id: string, currentW: number) => {
      e.preventDefault();
      e.stopPropagation();
      colResizingRef.current = { id, startX: e.clientX, startW: currentW };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  const handleInlineUpdate = (taskId: number, colId: string, value: any) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const update: any = { [colId]: value };
          if (colId === "duration") {
            const days = Number(value);
            const baseStart = t.start || t.planned_start || TODAY;
            if (!isNaN(days) && days > 0) {
              const newEnd = new Date(baseStart);
              newEnd.setDate(newEnd.getDate() + (days - 1));
              return {
                ...t,
                start: baseStart,
                planned_start: baseStart,
                end: newEnd,
                planned_finish: newEnd,
              };
            }
          }
          if (colId === "planned_start") {
            update.start = value;
            update.planned_start = value;
          }
          if (colId === "planned_finish") {
            update.end = value;
            update.planned_finish = value;
          }
          if (colId === "milestone_date") {
            update.milestone_date = value;
          }

          if (colId === "percent_complete") {
            update.progress = Number(value);
          }
          if (colId === "task_type") {
            update.type = value;
          }
          if (colId === "milestone") {
            update.milestone = value;
            if (value && !t.milestone_date) {
              update.milestone_date = t.start || t.planned_start || TODAY;
            }
          }
          // Ensure other numeric fields are stored as numbers
          if (colId.includes("hours") || colId.includes("cost")) {
            update[colId] = Number(value);
          }
          return { ...t, ...update };
        }
        return t;
      }),
    );
  };

  const handleInlineSave = (taskId: number, colId: string, value: any) => {
    handleInlineUpdate(taskId, colId, value);
    setEditingCell(null);
  };

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizerRef.current = { startX: e.clientX, startW: gridWidth };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [gridWidth],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizerRef.current) {
        const delta = e.clientX - resizerRef.current.startX,
          newW = Math.max(
            200,
            Math.min(1200, resizerRef.current.startW + delta),
          );
        setGridWidth(newW);
      } else if (colResizingRef.current) {
        const delta = e.clientX - colResizingRef.current.startX;
        const newW = Math.max(30, colResizingRef.current.startW + delta);
        setColWidths((prev) => ({
          ...prev,
          [colResizingRef.current!.id]: newW,
        }));
      }
    };
    const onUp = () => {
      if (resizerRef.current || colResizingRef.current) {
        resizerRef.current = null;
        colResizingRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // const addDep = (from: number, to: number) => {
  //   if (from === to) return;
  //   const newId = "d" + depCounter;
  //   setDeps((prev) => [
  //     ...prev,
  //     {
  //       id: newId,
  //       from,
  //       to,
  //       fromSide: "right",
  //       toSide: "left",
  //       autoColor: true,
  //       style: "solid",
  //       color: "",
  //       width: 1.5,
  //       curve: "curve",
  //       arrow: "arrow",
  //       lag: 0,
  //     },
  //   ]);
  //   setDepCounter((c) => c + 1);
  //   setSelectedDepId(newId);
  // };

  const removeDep = (id: string) => {
    setDeps((prev) => prev.filter((d) => d.id !== id));
    setSelectedDepId((cur) => (cur === id ? null : cur));
  };

  // const applyStylePatch = (patch: Partial<Dep>) => {
  //   setDeps((prev) =>
  //     prev.map((d) => (d.id === selectedDepId ? { ...d, ...patch } : d)),
  //   );
  // };

  const toggleCollapse = useCallback((id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, collapsed: !t.collapsed } : t)),
    );
  }, []);

  const handleSaveGanttChart = async () => {
    // 1. Transform tasks into the requested structure
    const topLevelTasks = tasks.filter((t) => !t.parentId);

    const formattedXAxis = topLevelTasks.map((parent) => {
      const summary = getTaskSummary(parent, tasks);
      const isGroup = !!parent.group;

      const formatDuration = (
        start?: Date,
        end?: Date,
        dur?: number | null,
      ) => {
        if (dur != null) return `${dur} Days`;
        if (start && end) return `${dDiff(start, end) + 1} Days`;
        return "0 Days";
      };

      const formatTaskData = (
        t: TaskItem,
        tSummary?: { start?: Date; end?: Date; dur?: number | null },
      ) => {
        const sDate = fmtDate(tSummary?.start || t.start);
        const eDate = fmtDate(tSummary?.end || t.end);
        const duration = formatDuration(
          tSummary?.start || t.start,
          tSummary?.end || t.end,
          tSummary?.dur,
        );
        const progress = t.progress || 0;
        const assigned = t.assigned || "Unassigned";

        // Calculate Link string (Predecessor IDs)
        const predecessors = deps
          .filter((d) => d.to === t.id)
          .map((d) => d.from)
          .sort((a, b) => a - b);
        const linkVal = predecessors.join(", ");

        // Collect all other metadata fields that aren't part of the primary array
        const primaryFieldKeys = [
          "name", "start", "end", "assigned", "progress", "milestone",
          "milestone_date", "id", "wbs", "parentId", "collapsed", "group"
        ];
        const meta: any = {};
        Object.keys(t).forEach(key => {
          if (!primaryFieldKeys.includes(key)) (meta as any)[key] = (t as any)[key];
        });

        return [
          t.name,
          duration,
          sDate,
          eDate,
          assigned,
          progress,
          linkVal,
          t.id,
          !!t.milestone,
          t.milestone_date ? fmtDate(t.milestone_date) : null,
          meta, // Index 10: All other fields (tags, task_type, costs, etc.)
        ];
      };

      const color = taskColors[parent.id] || (isGroup ? "#3B82F6" : "#3B82F5");

      if (isGroup) {
        // Find children
        const children = tasks.filter((c) => c.parentId === parent.id);
        const childrenData = children.map((c) => formatTaskData(c));

        return {
          color,
          group: formatTaskData(parent, summary),
          task: childrenData,
        };
      } else {
        // Independent task
        return {
          color,
          group: [],
          task: formatTaskData(parent, summary), // Single array, not nested
        };
      }
    });

    const projectTitle = ganttData?.data?.title || "Project Name";
    const currentDeps = deps.map((d) => ({ ...d }));

    try {
      const payload = {
        title: projectTitle,
        xAxis: JSON.stringify([
          { deps: currentDeps, columns: visibleColIds },
          ...formattedXAxis,
        ]),
      };

      if (ganttData?.data?.id) {
        await updateGantt({
          id: projectId as string,
          data: payload,
        }).unwrap();
        toast.success("Gantt chart updated successfully!");
      } else {
        await createGantt({
          ...payload,
          projectId: projectId as string,
        }).unwrap();
        toast.success("Gantt chart created successfully!");
      }
      setIsPublishConfirmOpen(false);
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Failed to publish Gantt chart");
    }
  };

  const handleSaveTask = (partialTask: Partial<TaskItem>) => {
    if (partialTask.id) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === partialTask.id ? { ...t, ...partialTask } : t,
        ),
      );
      if (partialTask.color) {
        setTaskColors((prev) => {
          const next = { ...prev, [partialTask.id!]: partialTask.color! };
          if (partialTask.group) {
            tasks.forEach((t: TaskItem) => {
              if (t.parentId === partialTask.id) {
                next[t.id] = partialTask.color!;
              }
            });
          }
          return next;
        });
      }
      return;
    }

    // Add New logic...
    const newId = Math.max(0, ...tasks.map((t) => t.id)) + 1;
    let finalColor = partialTask.color;
    if (!finalColor && partialTask.parentId && taskColors[partialTask.parentId]) {
      finalColor = taskColors[partialTask.parentId];
    }

    const newTask: TaskItem = {
      id: newId,
      name: partialTask.name || "Unnamed Task",
      group: !!partialTask.group,
      parentId: partialTask.parentId,
      start: partialTask.start,
      end: partialTask.end,
      assigned: partialTask.assigned,
      status: partialTask.status || "not-started",
      progress: 0,
      wbs: "", // WBS is still calculated for internal use if needed, but not a primary column
      color: finalColor,
    };

    setTasks((prev) => {
      let insertIdx = prev.length;
      if (newTask.parentId) {
        const parentIdx = prev.findIndex((t) => t.id === newTask.parentId);
        if (parentIdx !== -1) {
          let lastChildIdx = parentIdx;
          for (let i = parentIdx + 1; i < prev.length; i++) {
            if (prev[i].parentId === newTask.parentId) lastChildIdx = i;
            else break;
          }
          insertIdx = lastChildIdx + 1;
        }
      }

      const next = [...prev];
      next.splice(insertIdx, 0, newTask);

      let gCount = 0;
      const tCounts: Record<number, number> = {};
      return next.map((t) => {
        if (!t.parentId) {
          gCount++;
          tCounts[t.id] = 0;
          return { ...t, wbs: `${gCount}.` };
        } else {
          tCounts[t.parentId] = (tCounts[t.parentId] || 0) + 1;
          const parent = next.find((p) => p.id === t.parentId);
          const pWbs = parent?.wbs || "";
          return { ...t, wbs: `${pWbs}${tCounts[t.parentId]}` };
        }
      });
    });

    if (finalColor) {
      setTaskColors((prev) => ({ ...prev, [newId]: finalColor! }));
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
      const activeCols = FULL_COLUMNS.filter((c) => visibleColIds.includes(c.id));
      const headers = activeCols.map((c) => c.label);

      const dataRows = tasks.map((t) => {
        const summary = getTaskSummary(t, tasks);
        return activeCols.map((col) => {
          switch (col.id) {
            case "id":
              return String(t.id).replace(/_/g, "");
            case "name":
              return t.name;
            case "duration":
              return summary.dur !== null ? `${summary.dur}d` : "—";
            case "planned_start":
            case "planned_finish":
            case "actual_start":
            case "actual_finish":
            case "baseline_start":
            case "baseline_finish":
            case "milestone_date": {
              const isStart = col.id.includes("start") || col.id === "milestone_date";
              const dateVal = col.id === "milestone_date"
                ? t.milestone_date || t.start || summary.start
                : isStart
                  ? t.start || (t as any)[col.id] || summary.start
                  : t.end || (t as any)[col.id] || summary.end;
              return dateVal ? fmtDate(dateVal) : "—";
            }
            case "assigned": {
              const manager = managers.find((m: any) => m.id === t.assigned);
              return (
                manager?.user?.name ||
                manager?.user?.email ||
                t.assigned ||
                "Unassigned"
              );
            }
            case "status":
              return t.status || "not-started";
            case "percent_complete":
              return `${t.progress || 0}%`;
            case "milestone":
              return t.milestone ? "Yes" : "No";
            case "tags":
              return Array.isArray(t.tags) ? t.tags.join(", ") : "";
            case "link":
            case "linked_from":
              return deps
                .filter((d) => d.to === t.id)
                .map((d) => String(d.from).replace(/_/g, ""))
                .join(", ");
            case "linked_to":
              return deps
                .filter((d) => d.from === t.id)
                .map((d) => String(d.to).replace(/_/g, ""))
                .join(", ");
            default:
              return (t as any)[col.id] ?? "";
          }
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gantt Tasks");

      // Auto-size columns slightly
      const wscols = activeCols.map((c) => ({ wch: Math.max(c.label.length, 15) }));
      worksheet["!cols"] = wscols;

      XLSX.writeFile(workbook, `${projectTitle.replace(/\s+/g, "_")}_Gantt.xlsx`);
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Excel Download Error:", error);
    }
  };

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
        const data = evt.target?.result;
        // Set cellDates: true to handle Excel date objects correctly
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];

        const parsedTasks: any[] = json.map((row: any) => {
          const tUpdate: any = {};

          const parseDate = (val: any) => {
            if (!val || val === "—") return undefined;
            const d = new Date(val);
            return isNaN(d.getTime()) ? undefined : d;
          };

          // Map every column from FULL_COLUMNS by its Label
          FULL_COLUMNS.forEach(col => {
            const excelVal = row[col.label];
            if (excelVal === undefined) return;

            // Specialized mappings
            if (col.id === "id") {
              tUpdate.id = excelVal;
            } else if (col.id === "name") {
              tUpdate.name = excelVal;
            } else if (col.id === "planned_start") {
              tUpdate.start = parseDate(excelVal);
            } else if (col.id === "planned_finish") {
              tUpdate.end = parseDate(excelVal);
            } else if (col.id === "assigned") {
              const manager = managers.find(
                (m: any) =>
                  m.user?.name === excelVal || m.user?.email === excelVal || String(m.id) === String(excelVal)
              );
              tUpdate.assigned = manager ? manager.id : excelVal;
            } else if (col.id === "percent_complete" || col.id === "progress") {
              let val = 0;
              if (typeof excelVal === "number") {
                // Handle both 50 and 0.5
                val = excelVal <= 1 && excelVal > 0 ? excelVal * 100 : excelVal;
              } else {
                val = parseInt(String(excelVal).replace("%", "")) || 0;
              }
              tUpdate.progress = Math.min(100, Math.max(0, val));

              // Auto-update status based on progress if status not provided
              if (!row["Status"] && !row["status"]) {
                tUpdate.status = tUpdate.progress === 100 ? "complete" : tUpdate.progress > 0 ? "in-progress" : "not-started";
              }
            } else if (col.id === "milestone") {
              tUpdate.milestone = excelVal === "Yes" || excelVal === true;
            } else if (col.id === "tags") {
              tUpdate.tags = typeof excelVal === "string"
                ? excelVal.split(",").map(val => val.trim()).filter(Boolean)
                : excelVal ? [String(excelVal)] : [];
            } else if (col.id.includes("start") || col.id.includes("finish") || col.id.includes("date")) {
              tUpdate[col.id] = parseDate(excelVal);
            } else {
              tUpdate[col.id] = excelVal;
            }
          });

          return tUpdate;
        });

        setTasks((prev) => {
          const next = [...prev];
          let added = 0;
          let updated = 0;

          parsedTasks.forEach((nt) => {
            if (!nt.name && !nt.id) return;
            // Match by ID if possible
            const existingIdx = nt.id ? next.findIndex((t) => String(t.id) === String(nt.id)) : -1;

            if (existingIdx !== -1) {
              next[existingIdx] = { ...next[existingIdx], ...nt };
              updated++;
            } else {
              const newId = nt.id ? (typeof nt.id === 'string' ? nt.id : Number(nt.id)) : (Math.max(0, ...next.map(t => typeof t.id === 'number' ? t.id : 0)) + 1 + added);
              next.push({
                group: false,
                progress: 0,
                status: "not-started",
                ...nt,
                id: newId,
              } as TaskItem);
              added++;
            }
          });

          toast.success(`Import complete: ${updated} updated, ${added} added`);
          return next;
        });
      } catch (err) {
        console.error("Excel Upload Error:", err);
        toast.error("Failed to parse Excel file");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const visibleTasks = useMemo(() => {
    const hiddenIds = new Set<number>();
    tasks.forEach((t) => {
      if (t.group && t.collapsed) {
        tasks.forEach((child) => {
          if (child.parentId === t.id) hiddenIds.add(child.id);
        });
      }
    });
    return tasks.filter((t) => !hiddenIds.has(t.id));
  }, [tasks]);

  const activeCols = useMemo(() => {
    const base = FULL_COLUMNS.filter((c) => visibleColIds.includes(c.id));
    const customs = customCols.filter((c) => visibleColIds.includes(c.id));
    return [...base, ...customs].map((c) => ({
      ...c,
      width: colWidths[c.id] || c.width,
    }));
  }, [visibleColIds, customCols, colWidths]);

  const gridContentW = useMemo(() => {
    return activeCols.reduce((acc, c) => acc + c.width, 0) + 40;
  }, [activeCols]);

  const toggleColumn = (id: string) => {
    setVisibleColIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const createCustomColumn = () => {
    if (!newColName.trim()) return;
    const id = "custom_" + Date.now();
    const col: ColDef = {
      id,
      label: newColName,
      width: 100,
      align: "left",
      custom: true,
    };
    setCustomCols((prev) => [...prev, col]);
    setVisibleColIds((prev) => [...prev, id]);
    setNewColName("");
  };

  if (isGanttLoading) {
    return <CustomGanttChartSkeleton />;
  }

  return (
    <>
      <style>{`
        :root { 
          --gc-bg-p: #ffffff; 
          --gc-bg-s: #ffffff; 
          --gc-bg-t: #f8fafc; 
          --gc-bg-info: #e0f2fe; 
          --gc-text-p: #0f172a; 
          --gc-text-s: #475569; 
          --gc-text-t: #94a3b8; 
          --gc-text-info: #0284c7; 
          --gc-border-t: #e2e8f0; 
          --gc-border-s: #cbd5e1; 
          --gc-border-p: #94a3b8; 
          --gc-border-info: #38bdf8; 
        } 
        .dark {
          --gc-bg-p: #0f172a; /* slate-900 */
          --gc-bg-s: #1e293b; /* slate-800 */
          --gc-bg-t: #0f172a; /* slate-900 */
          --gc-bg-info: #1e1b4b; /* indigo-950 */
          --gc-text-p: #f1f5f9; /* slate-100 */
          --gc-text-s: #cbd5e1; /* slate-300 */
          --gc-text-t: #94a3b8; /* slate-400 */
          --gc-text-info: #38bdf8; /* sky-400 */
          --gc-border-t: #1e293b; /* slate-800 */
          --gc-border-s: #334155; /* slate-700 */
          --gc-border-p: #475569; /* slate-600 */
          --gc-border-info: #0ea5e9; /* sky-500 */
        }
        .gc-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; } 
        .gc-scrollbar::-webkit-scrollbar-track { background: var(--gc-bg-s); } 
        .gc-scrollbar::-webkit-scrollbar-thumb { background: var(--gc-border-s); border-radius: 4px; } 
        .gc-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--gc-border-p); } 
        .gc-hide-scroll { scrollbar-width: none; } 
        .gc-hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <h1 className="text-[18px] font-medium mb-4 text-(--gc-text-p)">
        Project Gantt Chart
      </h1>

      <div
        className="flex flex-col border border-(--gc-border-s) rounded-xl overflow-hidden bg-(--gc-bg-p) shadow-sm"
        style={{ borderWidth: "0.5px" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 border-b border-(--gc-border-s) bg-(--gc-bg-p)"
          style={{ borderBottomWidth: "0.5px" }}
        >
          {[
            { label: "Day", px: 28 },
            { label: "Week", px: 7 },
            { label: "Month", px: 1 },
          ].map(({ label, px }) => (
            <button
              key={label}
              onClick={() => setDayPx(px)}
              className={`text-[12px] px-2.5 py-1 border rounded-lg cursor-pointer transition-colors ${dayPx === px ? "bg-(--gc-bg-info) text-(--gc-text-info) border-(--gc-border-info)" : "bg-(--gc-bg-p) text-(--gc-text-p) border-(--gc-border-s) hover:bg-(--gc-bg-s)"}`}
              style={{ borderWidth: "0.5px" }}
            >
              {label}
            </button>
          ))}

          <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={() => setDayPx((prev) => Math.min(100, prev + 5))}
              className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={dayPx >= 100}
            >
              <ZoomIn className="w-[15px] h-[15px]" />
            </button>
            <button
              onClick={() => setDayPx((prev) => Math.max(0.5, prev - 2))}
              className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={dayPx <= 0.5}
            >
              <ZoomOut className="w-[15px] h-[15px]" />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              scrollToToday(true);
            }}
            className="text-[12px] px-2.5 py-1 border border-(--gc-border-s) rounded-lg bg-(--gc-bg-p) text-(--gc-text-p) cursor-pointer hover:bg-(--gc-bg-s)"
            style={{ borderWidth: "0.5px" }}
          >
            Today
          </button>

          <div className="ml-auto flex items-center gap-2">
            {!isEmployee && (
              <>
                <button
                  onClick={() => setIsPublishConfirmOpen(true)}
                  className="px-4 py-1.5 border border-blue-600 rounded-lg bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]"
                >
                  Publish
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-all shadow-sm active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </>
            )}

            <button
              onClick={() => setIsColModalOpen(true)}
              disabled={isEmployee}
              className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              title="Columns"
            >
              <Columns className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={isEmployee}
              className="p-1.5 border border-(--gc-border-s) rounded-lg bg-(--gc-bg-p) text-(--gc-text-s) hover:bg-(--gc-bg-s) shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as Excel"
            >
              <FileDown className="w-[18px] h-[18px]" />
            </button>

            {!isEmployee && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
                title="Import from Excel"
              >
                <FileUp className="w-[18px] h-[18px]" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleUploadExcel}
            />
          </div>
        </div>

        {/* Header Row */}
        <div
          className="flex border-b border-(--gc-border-s) bg-(--gc-bg-s)"
          style={{ borderBottomWidth: "1px" }}
        >
          <div
            ref={gridHdrRef}
            className="gc-hide-scroll shrink-0 overflow-x-auto border-r border-(--gc-border-s)"
            style={{ width: gridWidth, minWidth: gridWidth }}
          >
            <div
              className="flex items-center"
              style={{ width: gridContentW, minWidth: gridContentW }}
            >
              {activeCols.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center text-[11px] font-semibold text-(--gc-text-s) border-r border-(--gc-border-t) px-3 shrink-0 group relative bg-(--gc-bg-p)"
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    height: 44,
                    justifyContent: col.id === "info" ? "center" : "flex-start",
                    borderRightWidth: "0.5px",
                  }}
                >
                  {col.id === "id" ? (
                    <div className="flex items-center gap-1">
                      <Settings
                        className={cn(
                          "w-3.5 h-3.5",
                          isEmployee
                            ? "text-slate-400 opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:text-blue-500"
                        )}
                        onClick={() => {
                          if (isEmployee) return;
                          setIsColModalOpen(true);
                        }}
                      />
                      <span>{col.label}</span>
                    </div>
                  ) : (
                    <span>{col.label}</span>
                  )}
                  {/* Resize Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400/30 z-20"
                    onMouseDown={(e) => startColResize(e, col.id, col.width)}
                  />
                </div>
              ))}
              <div
                className={cn(
                  "w-10 flex items-center justify-center border-l border-(--gc-border-t) sticky right-0 bg-(--gc-bg-p) z-10",
                  isEmployee
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
                onClick={() => {
                  if (isEmployee) return;
                  setIsColModalOpen(true);
                }}
                title={isEmployee ? "Columns Settings (Disabled)" : "Add Column"}
                style={{
                  height: 44,
                  borderLeftWidth: "1px",
                }}
              >
                <Plus className="w-4 h-4 text-blue-600 stroke-[3px]" />
              </div>
            </div>
          </div>
          <div
            className="shrink-0 w-[10px] cursor-col-resize bg-(--gc-border-t) relative"
            onMouseDown={startResize}
          >
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-slate-300" />
              ))}
            </div>
          </div>
          <div
            ref={tlHdrRef}
            className="gc-hide-scroll flex-1 overflow-x-hidden bg-(--gc-bg-s) relative"
          >
            <TimelineHeader
              startDate={startDate}
              dayPx={dayPx}
              totalDays={totalDays}
              today={TODAY}
            />
            {TODAY.getTime() >= startDate.getTime() && (
              <div
                // className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-500 pointer-events-none z-[5]"
                style={{
                  left: dFromStart(startDate, TODAY) * dayPx,
                }}
              >
                {/* <div className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-b shadow-sm whitespace-nowrap">
                  Today
                </div> */}
              </div>
            )}
          </div>
        </div>

        {/* Body Row */}
        <div className="flex overflow-hidden" style={{ height: 600 }}>
          {/* Grid Body */}
          <div
            ref={gridBodyRef}
            onScroll={handleGridBodyScroll}
            className="gc-scrollbar shrink-0 overflow-auto border-r border-(--gc-border-s)"
            style={{ width: gridWidth, minWidth: gridWidth }}
          >
            <div style={{ width: gridContentW, minWidth: gridContentW }}>
              {visibleTasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="flex items-center group/row hover:bg-slate-50 border-b border-(--gc-border-t) transition-colors cursor-pointer"
                  style={{ height: ROW_H, borderBottomWidth: "0.5px" }}
                >
                  {activeCols.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center border-r border-(--gc-border-t) px-2 shrink-0 overflow-hidden relative"
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        height: "100%",
                        justifyContent:
                          col.align === "right"
                            ? "flex-end"
                            : col.align === "center"
                              ? "center"
                              : "flex-start",
                        borderRightWidth: "0.5px",
                      }}
                    >
                      {col.id === "name" && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[4px]"
                          style={{
                            backgroundColor: taskColors[t.id] || "#3b82f6",
                          }}
                        />
                      )}
                      <GridCell
                        col={col}
                        task={t}
                        rowNum={idx + 1}
                        onToggleCollapse={toggleCollapse}
                        allTasks={tasks}
                        deps={deps}
                        isEditing={
                          editingCell?.taskId === t.id &&
                          editingCell?.colId === col.id
                        }
                        onStartEdit={() => {
                          if (isEmployee) return;
                          setEditingCell({ taskId: t.id, colId: col.id });
                        }}
                        onSave={(val) => handleInlineSave(t.id, col.id, val)}
                        onUpdate={(val) => handleInlineUpdate(t.id, col.id, val)}
                        onCancel={() => setEditingCell(null)}
                      />
                    </div>
                  ))}
                  {!isEmployee && (
                    <div
                      className="w-10 h-full border-l border-slate-200 dark:border-slate-800 flex items-center justify-center sticky right-0 bg-(--gc-bg-p) z-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      title="Add Task"
                    >
                      <Plus className="w-4 h-4 text-blue-600 stroke-[3px] cursor-pointer" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="shrink-0 w-[10px] cursor-col-resize bg-(--gc-border-t) relative"
            onMouseDown={startResize}
          >
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-slate-300" />
              ))}
            </div>
          </div>

          {/* Timeline Body */}
          <div
            ref={(el) => {
              (tlPaneRef as any).current = el;
              (tlPaneContainerRef as any).current = el;
            }}
            onScroll={handleTlScroll}
            className="gc-scrollbar flex-1 overflow-auto relative bg-(--gc-bg-p)"
          >
            <div
              style={{
                position: "relative",
                width: totalW,
                minHeight: visibleTasks.length * ROW_H,
              }}
            >
              {visibleTasks.map((t, idx) => {
                const summary = getTaskSummary(t, tasks);
                if (!summary.start || !summary.end)
                  return (
                    <div
                      key={t.id}
                      style={{ height: ROW_H }}
                      className="border-b border-slate-50"
                    />
                  );

                const left = dFromStart(startDate, summary.start) * dayPx;
                const barW = Math.max(
                  dDiff(summary.start, summary.end) * dayPx,
                  dayPx,
                );
                const isGrp = !!t.group;
                const currentColor = taskColors[t.id] || "#3b82f6";
                const isHov = hoveredBarId === t.id;
                const barCY = idx * ROW_H + ROW_H / 2;

                return (
                  <div
                    key={t.id}
                    className={`relative border-b border-slate-50 dark:border-slate-800 group/row ${isGrp ? "bg-slate-50/30 dark:bg-slate-900/30" : "bg-(--gc-bg-p)"}`}
                    style={{ height: ROW_H, width: totalW }}
                  >
                    <div
                      className={cn(
                        "absolute z-2 flex items-center select-none",
                        isGrp ? "h-3 top-[14px]" : "h-7 top-[6px] shadow-sm rounded-lg",
                      )}
                      style={{
                        left,
                        width: barW,
                        cursor: !isGrp && isHov ? "grab" : "default",
                      }}
                      onMouseDown={(e) =>
                        !isGrp && startBarDrag(e, t.id, "move")
                      }
                      onMouseEnter={() => !isGrp && setHoveredBarId(t.id)}
                      onMouseLeave={() => !isGrp && setHoveredBarId(null)}
                    >
                      <div
                        className="absolute inset-0 opacity-90 transition-opacity"
                        style={{
                          background: currentColor,
                          borderRadius: isGrp ? 0 : 8,
                        }}
                      >
                        {!isGrp && (
                          <div
                            className="absolute inset-0 bg-black/10"
                            style={{
                              width: `${t.progress || 0}%`,
                              borderRadius: 8,
                            }}
                          />
                        )}
                      </div>
                      <span className="relative z-1 px-3 text-[11px] font-medium text-white truncate">
                        {t.name}
                      </span>
                      {isGrp && (
                        <>
                          <div
                            className="absolute left-0 bottom-[-5px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                            style={{ borderTopColor: currentColor }}
                          />
                          <div
                            className="absolute right-0 bottom-[-5px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                            style={{ borderTopColor: currentColor }}
                          />
                        </>
                      )}

                      {!isGrp && (
                        <>
                          <div
                            className="absolute left-0 top-0 bottom-0 w-8 md:w-10 cursor-col-resize z-10 hover:bg-black/5"
                            onMouseDown={(e) =>
                              startBarDrag(e, t.id, "resize-l")
                            }
                          />
                          <div
                            className="absolute right-0 top-0 bottom-0 w-8 md:w-10 cursor-col-resize z-10 hover:bg-black/5"
                            onMouseDown={(e) =>
                              startBarDrag(e, t.id, "resize-r")
                            }
                          />
                        </>
                      )}
                    </div>

                    {t.milestone && (
                      <div
                        className="absolute z-10 top-[4px] w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing group/milestone"
                        style={{
                          left:
                            dFromStart(
                              startDate,
                              t.milestone_date || t.start || summary.start,
                            ) *
                            dayPx +
                            dayPx / 2 -
                            16,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startBarDrag(e, t.id, "move-milestone");
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          startBarDrag(e as any, t.id, "move-milestone");
                        }}
                      >
                        <div
                          className="w-4 h-4 rotate-45 border-2 border-white shadow-lg transition-transform group-hover/milestone:scale-125 z-20"
                          style={{ backgroundColor: currentColor }}
                          title={`Milestone: ${fmtDate(t.milestone_date || t.start || summary.start)}`}
                        />
                      </div>
                    )}

                    {!isGrp && (
                      <>
                        <div
                          className="absolute z-20 left-[-18px] top-[11px] opacity-0 group-hover/row:opacity-100 transition-opacity"
                          style={{ left: left - 18 }}
                          onMouseDown={(e) =>
                            startLinkDrag(e, t.id, "left", left, barCY)
                          }
                        >
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-crosshair" />
                        </div>
                        <div
                          className="absolute z-20 top-[11px] opacity-0 group-hover/row:opacity-100 transition-opacity"
                          style={{ left: left + barW }}
                          onMouseDown={(e) =>
                            startLinkDrag(e, t.id, "right", left + barW, barCY)
                          }
                        >
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-crosshair" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              <DepSvg
                tasks={visibleTasks}
                deps={deps}
                startDate={startDate}
                dayPx={dayPx}
                totalDays={totalDays}
                selectedDepId={selectedDepId}
                onSelect={setSelectedDepId}
                onRemoveDep={removeDep}
                linkPreview={linkPreview}
                ROW_H={ROW_H}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-500 font-medium">
              Theme:
            </span>
            <div className="flex items-center gap-3">
              {[
                { c: "bg-blue-500", l: "Group A" },
                { c: "bg-orange-500", l: "Group B" },
                { c: "bg-pink-500", l: "Group C" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${t.c}`} />
                  <span className="text-[11px] text-slate-600 font-medium">
                    {t.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            Timeline range: {fmtDate(startDate)} -{" "}
            {fmtDate(new Date(startDate.getTime() + totalDays * DAY_MS))}
          </span>
        </div>
      </div>

      {/* <LinkPanel tasks={tasks} deps={deps} selectedDepId={selectedDepId} onSelect={setSelectedDepId} onRemove={removeDep} onAdd={addDep} onStyleChange={applyStylePatch} /> */}

      <ColumnModal
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
        newColName={newColName}
        setNewColName={setNewColName}
        newColType={newColType}
        setNewColType={setNewColType}
        createCustomColumn={createCustomColumn}
        FULL_COLUMNS={FULL_COLUMNS}
        customCols={customCols}
        visibleColIds={visibleColIds}
        toggleColumn={toggleColumn}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        color={editingTask ? taskColors[editingTask.id] : undefined}
        taskColors={taskColors}
        groups={tasks
          .filter((t) => t.group && (!editingTask || t.id !== editingTask.id))
          .map((t) => ({ id: t.id, name: t.name }))}
      />

      <AlertDialog
        open={isPublishConfirmOpen}
        onOpenChange={setIsPublishConfirmOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 text-gray-900 dark:text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-slate-800">
              Publish Gantt Chart?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm">
              Are you sure you want to publish the current changes? This will
              update the project timeline for all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row gap-2 justify-end">
            <AlertDialogCancel className="rounded-lg px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveGanttChart}
              className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Confirm & Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
