/* eslint-disable @typescript-eslint/no-explicit-any */
import { Gantt, Willow, Editor } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";
import { useMemo, useState, useCallback } from "react";
import {
  FileText,
  Link2,
  MessageSquare,
  Printer,
  Share2,
  Search,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Plus,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialTasks: any[] = [
  {
    id: 1,
    text: "Starting",
    start: new Date(2025, 2, 1),
    duration: 23,
    progress: 60,
    type: "summary",
    open: true,
    assigned: "Mike Smith",
    color: "#00a65a",
  },
  {
    id: 2,
    text: "Mobilization at Site",
    start: new Date(2025, 2, 1),
    duration: 14,
    progress: 49,
    parent: 1,
    assigned: "Mike Smith",
  },
  {
    id: 3,
    text: "Surveying & Layout",
    start: new Date(2025, 2, 5),
    duration: 5,
    progress: 49,
    parent: 1,
    assigned: "Mike Smith",
  },
  {
    id: 4,
    text: "Excavation",
    start: new Date(2025, 2, 7),
    duration: 8,
    progress: 49,
    parent: 1,
    assigned: "Mike Smith",
  },
  {
    id: 5,
    text: "Footing",
    start: new Date(2025, 2, 9),
    duration: 10,
    progress: 49,
    parent: 1,
    assigned: "Mike Smith",
  },
  {
    id: 6,
    text: "Column upto Plinth Level",
    start: new Date(2025, 2, 12),
    duration: 10,
    progress: 49,
    parent: 1,
    assigned: "Mike Smith",
  },
  {
    id: 7,
    text: "Backfilling in Footing",
    start: new Date(2025, 2, 16),
    duration: 7,
    progress: 49,
    parent: 1,
    assigned: "Mike Smith",
  },
  // ── Milestone example ────────────────────────────────────────────────────
  {
    id: 50,
    text: "Foundation Complete",
    start: new Date(2025, 2, 29),
    duration: 0,
    progress: 100,
    type: "milestone",
    assigned: "Mike Smith",
  },
  {
    id: 8,
    text: "Plinth Beam",
    start: new Date(2025, 2, 23),
    duration: 7,
    progress: 60,
    type: "summary",
    open: true,
    assigned: "Jennifer Jones",
    color: "#f39c12",
  },
  {
    id: 9,
    text: "Earth Filling in Plinth Level",
    start: new Date(2025, 2, 23),
    duration: 4,
    progress: 49,
    parent: 8,
    assigned: "Jennifer Jones",
  },
  {
    id: 10,
    text: "Anti Termite Treatment",
    start: new Date(2025, 2, 25),
    duration: 4,
    progress: 49,
    parent: 8,
    assigned: "Jennifer Jones",
  },
  {
    id: 11,
    text: "CC Flooring with PCC",
    start: new Date(2025, 2, 25),
    duration: 5,
    progress: 49,
    parent: 8,
    assigned: "Jennifer Jones",
  },
  {
    id: 12,
    text: "Column GF to 1st Floor",
    start: new Date(2025, 2, 19),
    duration: 10,
    progress: 49,
    parent: 8,
    assigned: "Jennifer Jones",
  },
  {
    id: 13,
    text: "1st Floor Slab",
    start: new Date(2025, 3, 24),
    duration: 20,
    progress: 49,
    type: "summary",
    open: true,
    assigned: "Sam Watson",
    color: "#d81b60",
  },
  {
    id: 14,
    text: "Brickwork at Ground Floor",
    start: new Date(2025, 3, 24),
    duration: 14,
    progress: 49,
    parent: 13,
    assigned: "Sam Watson",
  },
  {
    id: 15,
    text: "Internal Plaster at GF",
    start: new Date(2025, 4, 3),
    duration: 14,
    progress: 49,
    parent: 13,
    assigned: "Sam Watson",
  },
  {
    id: 16,
    text: "Flooring Work - GF",
    start: new Date(2025, 4, 17),
    duration: 7,
    progress: 49,
    parent: 13,
    assigned: "Sam Watson",
  },
  {
    id: 17,
    text: "Door & Window Work - GF",
    start: new Date(2025, 4, 24),
    duration: 10,
    progress: 49,
    parent: 13,
    assigned: "Sam Watson",
  },
  {
    id: 18,
    text: "Internal Painting - GF",
    start: new Date(2025, 5, 8),
    duration: 14,
    progress: 49,
    parent: 13,
    assigned: "Sam Watson",
  },
  {
    id: 19,
    text: "2nd Floor Slab",
    start: new Date(2025, 5, 24),
    duration: 20,
    progress: 20,
    type: "summary",
    open: true,
    assigned: "Jane Cooper",
    color: "#3c8dbc",
  },
  {
    id: 20,
    text: "Brickwork at 1st Floor",
    start: new Date(2025, 5, 24),
    duration: 15,
    progress: 10,
    parent: 19,
    assigned: "Jane Cooper",
  },
  {
    id: 21,
    text: "Internal Plaster at 1st Floor",
    start: new Date(2025, 6, 8),
    duration: 14,
    progress: 0,
    parent: 19,
    assigned: "Jane Cooper",
  },
  {
    id: 22,
    text: "Flooring Work - 1st",
    start: new Date(2025, 6, 22),
    duration: 7,
    progress: 0,
    parent: 19,
    assigned: "Jane Cooper",
  },
  {
    id: 23,
    text: "Final Finishing",
    start: new Date(2025, 7, 1),
    duration: 30,
    progress: 0,
    type: "summary",
    open: false,
    assigned: "Devon Lane",
    color: "#00c0ef",
  },
];

// Extra tasks to guarantee vertical scrolling
for (let i = 100; i < 140; i++) {
  initialTasks.push({
    id: i,
    text: `Extra Task ${i - 99}`,
    start: new Date(2025, 8, 5 + (i - 100)),
    duration: 5,
    progress: 0,
    assigned: `Worker ${i}`,
  });
}

const links = [
  { id: 1, source: 2, target: 3, type: "fs" },
  { id: 2, source: 3, target: 4, type: "fs" },
  { id: 3, source: 4, target: 5, type: "fs" },
];

const formatDate = (date: any) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
};

// ─── Context Menu Items ───────────────────────────────────────────────────────

const TASK_MENU_ITEMS = [
  { id: "add-task", text: "Add Task", icon: Plus },
  { id: "add-milestone", text: "Add Milestone", icon: Flag },
  { id: "edit", text: "Edit Task", icon: Pencil },
  { id: "delete", text: "Delete Task", icon: Trash2 },
];

const MILESTONE_MENU_ITEMS = [
  { id: "edit", text: "Edit Milestone", icon: Pencil },
  { id: "delete", text: "Delete Milestone", icon: Trash2 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SvarGanttChart() {
  const [ganttApi, setGanttApi] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskId: any;
    isMilestone: boolean;
  }>({ visible: false, x: 0, y: 0, taskId: null, isMilestone: false });

  const tasks = useMemo(() => initialTasks, []);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "All",
        width: 50,
        align: "center",
        cell: (props: any) => (
          <div className="text-slate-400 text-xs text-center w-full">
            {props.row.id}
          </div>
        ),
      },
      {
        id: "info",
        header: "Info",
        width: 140,
        cell: () => (
          <div className="flex items-center gap-2 text-slate-400 pl-2">
            <FileText
              size={14}
              className="hover:text-blue-500 cursor-pointer"
            />
            <Link2 size={14} className="hover:text-blue-500 cursor-pointer" />
            <MessageSquare
              size={14}
              className="hover:text-blue-500 cursor-pointer"
            />
            <Printer size={14} className="hover:text-blue-500 cursor-pointer" />
          </div>
        ),
      },
      {
        id: "text",
        header: "Task Name",
        width: 260,
        tree: true,
        cell: (props: any) => {
          const row = props.row;
          const isParent = row.type === "summary";
          const isMilestone = row.type === "milestone";
          const color = isParent
            ? row.color
            : tasks.find((t) => t.id === row.parent)?.color || "#CBD5E1";

          return (
            <div className="flex items-center gap-1 py-1 h-full w-full">
              <div
                className="flex items-center"
                style={{ paddingLeft: (props.level || 0) * 16 }}
              >
                {isParent ? (
                  row.open ? (
                    <ChevronDown size={14} className="text-slate-400 mr-1" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-400 mr-1" />
                  )
                ) : (
                  <div className="w-[18px]" />
                )}
                {isMilestone ? (
                  <span className="mr-2 text-amber-500">◆</span>
                ) : (
                  <div
                    style={{
                      width: 4,
                      height: 18,
                      backgroundColor: color,
                      borderRadius: 2,
                    }}
                    className="shrink-0 mr-2"
                  />
                )}
                <span
                  className={`${
                    isParent
                      ? "font-bold text-slate-800"
                      : isMilestone
                        ? "font-semibold text-amber-700"
                        : "text-slate-600 font-medium"
                  } text-sm truncate uppercase`}
                >
                  {row.text}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "duration",
        header: {
          text: "Duration",
          // The '+' button lives in the header — matches the library's
          // built-in pattern shown in the screenshot
          template: () => (
            <div className="flex items-center justify-between w-full pr-1">
              <span>Duration</span>
              <button
                title="Add task"
                className="flex items-center justify-center w-5 h-5 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                onClick={() => {
                  if (!ganttApi) return;
                  ganttApi.createTask({
                    text: "New Task",
                    start: new Date(),
                    duration: 1,
                    progress: 0,
                  });
                  setShowEditor(true);
                }}
              >
                <Plus size={11} />
              </button>
            </div>
          ),
        },
        width: 90,
        cell: (props: any) => (
          <div className="flex items-center justify-between w-full pr-1">
            <span className="text-slate-500 text-sm">{props.row.duration} Days</span>
            <button
              title="Add child task"
              className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-4 h-4 rounded bg-slate-200 hover:bg-blue-500 hover:text-white text-slate-500 transition-all"
              onClick={() => {
                if (!ganttApi) return;
                ganttApi.createTask({
                  text: "New Task",
                  start: new Date(),
                  duration: 1,
                  progress: 0,
                  parent: props.row.id,
                });
                setShowEditor(true);
              }}
            >
              <Plus size={10} />
            </button>
          </div>
        ),
      },
      {
        id: "start",
        header: "Start Date",
        width: 100,
        cell: (props: any) => (
          <div className="text-slate-500 text-sm whitespace-nowrap">
            {formatDate(props.row.start)}
          </div>
        ),
      },
      {
        id: "end",
        header: "Finished",
        width: 100,
        cell: (props: any) => {
          const d = new Date(props.row.start);
          d.setDate(d.getDate() + (props.row.duration || 0) - 1);
          return (
            <div className="text-slate-500 text-sm whitespace-nowrap">
              {formatDate(d)}
            </div>
          );
        },
      },
      {
        id: "assigned",
        header: "Assigned",
        width: 160,
        cell: (props: any) => (
          <div className="font-semibold text-slate-700 text-sm whitespace-nowrap truncate">
            {props.row.assigned}
          </div>
        ),
      },
    ],
    [tasks, ganttApi],
  );

  const scales = useMemo(
    () => [
      { unit: "month", step: 1, format: "%M %Y" },
      { unit: "day", step: 1, format: "%d" },
    ],
    [],
  );

  // Capture the library's API via the init prop — use setState so Editor re-renders with the live api
  const handleInit = useCallback((api: any) => {
    setGanttApi(api);
    // After init, wire up the editor-open event if the library supports it
    api.on?.("add-task", () => setShowEditor(true));
    api.on?.("edit-task", () => setShowEditor(true));
  }, []);

  // Handle context menu from library events
  const handleContextMenu = useCallback((ev: any) => {
    // ev.id = task id, ev.e = mouse event from library
    const nativeEvent = ev?.e as MouseEvent | undefined;
    if (!nativeEvent) return;
    nativeEvent.preventDefault();

    const task = initialTasks.find((t) => t.id === ev.id);
    setContextMenu({
      visible: true,
      x: nativeEvent.clientX,
      y: nativeEvent.clientY,
      taskId: ev.id,
      isMilestone: task?.type === "milestone",
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((m) => ({ ...m, visible: false }));
  }, []);

  const handleMenuAction = useCallback(
    (actionId: string) => {
      const api = ganttApi;
      const { taskId } = contextMenu;
      closeContextMenu();

      if (!api) return;

      switch (actionId) {
        case "add-task":
          api.createTask({
            text: "New Task",
            start: new Date(),
            duration: 5,
            progress: 0,
            parent: taskId,
          });
          setShowEditor(true);
          break;
        case "add-milestone":
          api.createTask({
            text: "New Milestone",
            start: new Date(),
            duration: 0,
            type: "milestone",
          });
          setShowEditor(true);
          break;
        case "edit":
          api.showTaskEditor(taskId);
          setShowEditor(true);
          break;
        case "delete":
          api.deleteTask(taskId);
          break;
      }
    },
    [ganttApi, contextMenu, closeContextMenu],
  );

  // Progress change handler (drag-to-resize built into the library)
  const handleProgressChange = useCallback((ev: any) => {
    // Persist to state / backend here if needed
    console.info("Progress updated", ev?.id, ev?.progress);
  }, []);

  const menuItems = contextMenu.isMilestone
    ? MILESTONE_MENU_ITEMS
    : TASK_MENU_ITEMS;

  return (
    <div
      className="flex flex-col w-full font-sans antialiased"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white shrink-0 rounded-t-xl shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-slate-400">
            <FileText
              size={20}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            />
            <Download
              size={20}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            />
            <Upload
              size={20}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            />
            <Share2
              size={20}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            />
            <Printer
              size={20}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            />
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-widest border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Project Status
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search schedule..."
              className="pl-9 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-bold">
              ⌘K
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Upload size={15} /> Import
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-blue-200">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* ── Gantt Container ──────────────────────────────────────────────── */}
      {/* 
        KEY LAYOUT RULE: 
        - This wrapper is flex-1 so it fills remaining height.
        - position:relative + overflow:hidden traps the absolutely-positioned
          .sv-gantt element inside, which then activates internal scrollbars.
      */}
      <div
        className="flex-1 relative overflow-auto bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-md"
        style={{ minHeight: 0 }}
      >
        <Willow>
          <Gantt
            {...({
              tasks,
              links,
              scales,
              columns: columns as any,
              gridWidth: 500,
              cellHeight: 46,
              readonly: false,
              init: handleInit,
              onContextMenu: handleContextMenu,
              onProgressChange: handleProgressChange,
            } as any)}
          />
          {/* Built-in Editor panel — opens on Add Task / Edit Task */}
          {showEditor && ganttApi && (
            <Editor
              {...({ api: ganttApi } as any)}
            />
          )}
        </Willow>
      </div>

      {/* ── Custom Context Menu ─────────────────────────────────────────── */}
      {contextMenu.visible && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={closeContextMenu}
          />
          <div
            className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 min-w-[180px] overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors ${
                    item.id === "delete"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                  onClick={() => handleMenuAction(item.id)}
                >
                  <Icon size={15} />
                  {item.text}
                </button>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        /* ── Layout: fill the relative parent so internal scrollers activate ── */
        .sv-gantt {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        .sv-gantt-layout {
          height: 100% !important;
          width: 100% !important;
          overflow: hidden !important;
        }

        /* ── Row hover group (for child + button) ─────────────────────────── */
        .sv-gantt-row { @apply group; }

        /* ── Custom scrollbars ────────────────────────────────────────────── */
        ::-webkit-scrollbar { width: 10px !important; height: 10px !important; }
        ::-webkit-scrollbar-track { background: #f1f5f9 !important; }
        ::-webkit-scrollbar-thumb {
          background: #93c5fd !important;
          border-radius: 8px !important;
          border: 2px solid #f1f5f9 !important;
        }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6 !important; }

        /* ── Internal library scrollers ───────────────────────────────────── */
        .sv-gantt-scroll-y, .sv-gantt-scroll-x {
          visibility: visible !important; opacity: 1 !important;
          display: block !important; z-index: 500 !important;
          background: #f1f5f9 !important;
        }
        .sv-gantt-scroll-y-thumb, .sv-gantt-scroll-x-thumb {
          background: #93c5fd !important; border-radius: 8px !important;
        }

        /* ── Grid ────────────────────────────────────────────────────────── */
        .sv-gantt-grid { border-right: 2px solid #e2e8f0 !important; overflow-x: auto !important; }
        .sv-gantt-grid-header {
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          height: 52px !important;
        }
        .sv-gantt-grid-header-cell {
          color: #334155 !important; font-weight: 700 !important;
          font-size: 12px !important; text-transform: uppercase !important;
          letter-spacing: 0.03em !important;
        }
        .sv-gantt-grid-cell {
          padding: 0 !important; border-bottom: 1px solid #f1f5f9 !important;
        }
        .sv-gantt-row:hover .sv-gantt-grid-cell { background: #f0f9ff !important; }

        /* ── Task bars ────────────────────────────────────────────────────── */
        .sv-gantt-task-content { font-weight: 700 !important; font-size: 11px !important; }
        .sv-gantt-task-right { font-size: 11px !important; font-weight: 600 !important; color: #64748b !important; }
        .sv-gantt-task-summary { height: 10px !important; border-radius: 5px !important; }
        .sv-gantt-task-milestone { background: #f59e0b !important; border-color: #d97706 !important; }
        .sv-gantt-task-progress-handle { cursor: ew-resize !important; opacity: 1 !important; }

        /* ── Editor panel ─────────────────────────────────────────────────── */
        .sv-editor {
          position: absolute !important;
          right: 0 !important; top: 0 !important; bottom: 0 !important;
          width: 320px !important;
          background: white !important;
          border-left: 1px solid #e2e8f0 !important;
          box-shadow: -4px 0 24px rgba(0,0,0,0.08) !important;
          z-index: 800 !important;
          overflow-y: auto !important;
        }
      `}</style>
    </div>
  );
}
