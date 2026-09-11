/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  Paperclip,
  MessageSquare,
  FileText,
  Printer,
  Share2,
  MoreVertical,
  Search,
  Upload,
  Download,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface GanttTask {
  id: string;
  name: string;
  duration: string;
  start: string;
  end: string;
  assigned: string;
  progress: number;
  type: "group" | "task";
  color: string;
  enableTaskDrag: boolean;
  enableTaskResize: boolean;
  isExpanded?: boolean;
  subtasks?: GanttTask[];
  dependencies?: string[]; // IDs of tasks this task follows
}

const PROJECT_DATA: GanttTask[] = [
  {
    id: "1",
    name: "Starting",
    duration: "23 Days",
    start: "2025-03-01",
    end: "2025-03-24",
    assigned: "Mike Smith",
    enableTaskDrag: false,
    enableTaskResize: false,
    progress: 60,
    type: "group",
    color: "#3b82f6",
    isExpanded: true,
    subtasks: [
      {
        id: "1-1",
        name: "Mobilization at Site",
        duration: "14 Days",
        start: "2025-03-01",
        end: "2025-03-14",
        assigned: "Mike Smith",
        progress: 49,
        enableTaskDrag: false,
        enableTaskResize: false,
        type: "task",
        color: "#3b82f6",
      },
      {
        id: "1-2",
        name: "Surveying & Layout",
        duration: "5 Days",
        start: "2025-03-05",
        end: "2025-03-09",
        assigned: "Mike Smith",
        progress: 49,
        enableTaskDrag: false,
        enableTaskResize: false,
        type: "task",
        color: "#3b82f6",
      },
      {
        id: "1-3",
        name: "Excavation",
        duration: "8 Days",
        start: "2025-03-07",
        end: "2025-03-14",
        assigned: "Mike Smith",
        progress: 49,
        enableTaskDrag: false,
        enableTaskResize: false,
        type: "task",
        color: "#3b82f6",
      },
    ],
  },
  {
    id: "2",
    name: "Plinth Beam",
    duration: "7 Days",
    start: "2025-03-23",
    end: "2025-03-29",
    assigned: "Jennifer Jones",
    progress: 50,
    enableTaskDrag: false,
    enableTaskResize: false,
    type: "group",
    color: "#f97316",
    isExpanded: true,
    subtasks: [
      {
        id: "2-1",
        name: "Earth Filling",
        duration: "4 Days",
        start: "2025-03-23",
        end: "2025-03-26",
        assigned: "Jennifer Jones",
        progress: 49,
        enableTaskDrag: false,
        enableTaskResize: false,
        type: "task",
        color: "#f97316",
      },
      {
        id: "2-2",
        name: "Anti Termite",
        duration: "4 Days",
        start: "2025-03-25",
        end: "2025-03-29",
        assigned: "Jennifer Jones",
        progress: 49,
        enableTaskDrag: false,
        enableTaskResize: false,
        type: "task",
        color: "#f97316",
        dependencies: ["2-1"],
      },
    ],
  },
  {
    id: "3",
    name: "1st Floor Slab",
    duration: "20 Days",
    start: "2025-03-24",
    end: "2025-04-13",
    assigned: "Sam Watson",
    progress: 30,
    enableTaskDrag: false,
    enableTaskResize: false,
    type: "group",
    color: "#ec4899",
    isExpanded: true,
    subtasks: [
      {
        id: "3-1",
        name: "Brickwork",
        duration: "14 Days",
        start: "2025-04-30",
        end: "2025-05-13",
        assigned: "Sam Watson",
        progress: 45,
        enableTaskDrag: false,
        enableTaskResize: false,
        type: "task",
        color: "#ec4899",
      },
    ],
  },
];

const ApexGnttChart: React.FC = () => {
  const [tasks, setTasks] = useState(PROJECT_DATA);
  const [tableWidth, setTableWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<GanttTask>>({
    name: "",
    assigned: "",
    start: "2025-03-01",
    end: "2025-03-08",
    progress: 0,
    type: "task",
    color: "#3b82f6",
  });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  // Refs for synchronized vertical scroll
  const tablePaneRef = useRef<HTMLDivElement>(null);
  const chartPaneRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && tablePaneRef.current) {
        const containerRect =
          tablePaneRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const newWidth = mouseMoveEvent.clientX - containerRect.left;
          // Limit minimum and maximum width
          if (newWidth > 200 && newWidth < 1200) {
            setTableWidth(newWidth);
          }
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Synchronize vertical scroll
  useEffect(() => {
    const tablePane = tablePaneRef.current;
    const chartPane = chartPaneRef.current;
    if (!tablePane || !chartPane) return;

    const handleTableScroll = () => {
      chartPane.scrollTop = tablePane.scrollTop;
    };
    const handleChartScroll = () => {
      tablePane.scrollTop = chartPane.scrollTop;
    };

    tablePane.addEventListener("scroll", handleTableScroll);
    chartPane.addEventListener("scroll", handleChartScroll);

    return () => {
      tablePane.removeEventListener("scroll", handleTableScroll);
      chartPane.removeEventListener("scroll", handleChartScroll);
    };
  }, []);

  const handleChartWheel = useCallback((e: WheelEvent) => {
    const pane = chartPaneRef.current;
    if (!pane) return;
    // If the event is primarily horizontal, let it pass through
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // Otherwise redirect vertical delta to horizontal scroll
    e.preventDefault();
    pane.scrollLeft += e.deltaY;
  }, []);

  useEffect(() => {
    const pane = chartPaneRef.current;
    if (!pane) return;
    pane.addEventListener("wheel", handleChartWheel, { passive: false });
    return () => pane.removeEventListener("wheel", handleChartWheel);
  }, [handleChartWheel]);

  const flatTasks: GanttTask[] = [];
  tasks.forEach((parent) => {
    flatTasks.push(parent);
    if (parent.isExpanded && parent.subtasks) {
      parent.subtasks.forEach((sub) => flatTasks.push(sub));
    }
  });

  const chartSeries = [
    {
      name: "Actual",
      data: flatTasks.map((t) => ({
        x: `${t.name}_${t.id}`, // Ensure unique X value to prevent row overlapping
        y: [new Date(t.start).getTime(), new Date(t.end).getTime()],
        fillColor: t.color,
      })),
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: "rangeBar",
      height: flatTasks.length * 40 + 60,
      toolbar: { show: false },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "55%",
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    xaxis: {
      type: "datetime",
      position: "top",
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 500 },
        format: "MMM d",
        offsetY: 0,
      },
      axisBorder: { show: true },
      axisTicks: { show: true },
      tooltip: { enabled: true },
    },
    yaxis: {
      show: false,
    },
    grid: {
      borderColor: "#94a3b8",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: {
        top: 0,
        bottom: 0,
      },
    },
    fill: {
      type: "solid",
      opacity: 0.85,
    },
    dataLabels: {
      enabled: true,
      formatter: function (_val: any, opts: any) {
        const task = flatTasks[opts.dataPointIndex];
        return `${task.name} ${task.progress}% ${task.assigned}`;
      },
      style: {
        fontSize: "10px",
        colors: ["#64748b"],
        fontWeight: 400,
      },
      textAnchor: "start",
      offsetX: 5,
    },
    tooltip: {
      enabled: true,
      custom: ({ dataPointIndex }: any) => {
        const t = flatTasks[dataPointIndex];
        return `
          <div class="px-3 py-2 bg-white shadow-xl border border-border rounded-xl">
            <div class="font-bold text-gray-900 border-b pb-1.5 mb-1.5">${t.name}</div>
            <div class="space-y-1 text-[11px] text-gray-500">
              <div class="flex justify-between gap-4"><span>Start:</span><span class="font-medium text-gray-900">${new Date(t.start).toLocaleDateString()}</span></div>
              <div class="flex justify-between gap-4"><span>End:</span><span class="font-medium text-gray-900">${new Date(t.end).toLocaleDateString()}</span></div>
              <div class="flex justify-between gap-4"><span>Progress:</span><span class="font-bold text-blue-600">${t.progress}%</span></div>
            </div>
          </div>
        `;
      },
    },
  };

  const toggleExpand = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, isExpanded: !t.isExpanded } : t)),
    );
  };

  const calculateDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return `${days} Days`;
  };

  const handleAddTask = () => {
    if (!newTask.name) return;
    const task: GanttTask = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTask.name || "New Task",
      duration: calculateDuration(newTask.start!, newTask.end!),
      start: newTask.start!,
      end: newTask.end!,
      assigned: newTask.assigned || "Unassigned",
      progress: newTask.progress || 0,
      type: newTask.type || "task",
      color: newTask.color || "#3b82f6",
      enableTaskDrag: false,
      enableTaskResize: false,
      isExpanded: true,
      subtasks: newTask.type === "group" ? [] : undefined,
    };

    setTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({
      name: "",
      assigned: "",
      start: "2025-03-01",
      end: "2025-03-08",
      progress: 0,
      type: "task",
      color: "#3b82f6",
    });
  };

  const deleteTask = (id: string) => {
    const removeById = (list: GanttTask[]): GanttTask[] => {
      return list
        .filter((t) => t.id !== id)
        .map((t) => ({
          ...t,
          subtasks: t.subtasks ? removeById(t.subtasks) : undefined,
        }));
    };
    setTasks(removeById(tasks));
  };

  const addSubtask = (parentId: string) => {
    const addSubToParent = (list: GanttTask[]): GanttTask[] => {
      return list.map((t) => {
        if (t.id === parentId) {
          const newSub: GanttTask = {
            id: Math.random().toString(36).substr(2, 9),
            name: "New Subtask",
            duration: "7 Days",
            start: t.start,
            end: t.end,
            assigned: "Unassigned",
            progress: 0,
            type: "task",
            color: t.color,
            enableTaskDrag: false,
            enableTaskResize: false,
          };
          return {
            ...t,
            isExpanded: true,
            subtasks: [...(t.subtasks || []), newSub],
          };
        }
        if (t.subtasks) {
          return { ...t, subtasks: addSubToParent(t.subtasks) };
        }
        return t;
      });
    };
    setTasks(addSubToParent(tasks));
  };

  const renameTask = (id: string, newName: string) => {
    const updateName = (list: GanttTask[]): GanttTask[] => {
      return list.map((t) => {
        if (t.id === id) {
          return { ...t, name: newName };
        }
        if (t.subtasks) {
          return { ...t, subtasks: updateName(t.subtasks) };
        }
        return t;
      });
    };
    setTasks(updateName(tasks));
    setEditingTaskId(null);
  };

  const changeColor = (id: string, newColor: string) => {
    const updateColor = (list: GanttTask[]): GanttTask[] => {
      return list.map((t) => {
        if (t.id === id) {
          // If it's a group, update its color and all its subtasks
          if (t.type === "group" && t.subtasks) {
            return {
              ...t,
              color: newColor,
              subtasks: t.subtasks.map((sub) => ({ ...sub, color: newColor })),
            };
          }
          return { ...t, color: newColor };
        }
        if (t.subtasks) {
          return { ...t, subtasks: updateColor(t.subtasks) };
        }
        return t;
      });
    };
    setTasks(updateColor(tasks));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white font-sans overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-5 text-gray-400">
          <Paperclip
            size={18}
            className="cursor-pointer hover:text-blue-500 transition-colors"
          />
          <MessageSquare
            size={18}
            className="cursor-pointer hover:text-blue-500 transition-colors"
          />
          <FileText
            size={18}
            className="cursor-pointer hover:text-blue-500 transition-colors"
          />
          <Printer
            size={18}
            className="cursor-pointer hover:text-blue-500 transition-colors"
          />
          <Share2
            size={18}
            className="cursor-pointer hover:text-blue-500 transition-colors"
          />
          <MoreVertical
            size={18}
            className="cursor-pointer hover:text-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl px-12 ">
          <div className="relative w-full group border border-gray-200 rounded-xl shadow-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search anything here..."
              className="w-full bg-white border-none rounded-xl py-3 pl-10 pr-12 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all "
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-white border border-border px-1.5 py-0.5 rounded-lg font-medium">
              ⌘ K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={16} /> New Task
          </button>
          <button className="flex items-center gap-2 px-5 py-2 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 transition-all active:scale-95">
            <Upload size={16} /> Import
          </button>
          <button className="flex items-center gap-2 px-5 py-2 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 transition-all active:scale-95">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Main Content Pane — individual scroll containers with synced vertical scroll */}
      <div className="flex flex-1 min-h-0 bg-white overflow-hidden relative">
        {/* Left Side: Data Table */}
        <div
          ref={tablePaneRef}
          style={{ width: `${tableWidth}px` }}
          className="border-r border-border shrink-0 flex flex-col bg-white overflow-x-auto overflow-y-auto"
        >
          <div className="min-w-[800px] flex-1 flex flex-col">
            {/* Table Header */}
            <div className="flex items-center bg-white border-b border-border text-[10px] font-bold text-gray-400 uppercase tracking-widest h-[50px] shrink-0 sticky top-0 z-10">
              <div className="w-[45px] px-3 text-center border-r border-gray-50">
                All
              </div>
              <div className="w-[70px] px-3 text-center border-r border-gray-50">
                Info
              </div>
              <div className="w-[200px] px-5 border-r border-gray-50">
                Task name
              </div>
              <div className="w-[85px] px-3 text-center border-r border-gray-50">
                Duration
              </div>
              <div className="w-[95px] px-3 text-center border-r border-gray-50">
                Start
              </div>
              <div className="w-[105px] px-3 text-center border-r border-gray-50">
                Finished
              </div>
              <div className="w-[115px] px-3 pl-5">Assigned</div>
            </div>

            {/* Table Rows */}
            <div className="flex-1">
              {flatTasks.map((t, idx) => (
                <div
                  key={t.id}
                  onDoubleClick={() => {
                    setActiveMenuId(t.id);
                  }}
                  className={`flex items-center h-10 text-[12px] border-b border-gray-50 hover:bg-blue-50/30 transition-colors group relative ${t.type === "group"
                      ? "bg-white font-bold text-gray-900"
                      : "text-gray-600"
                    }`}
                >
                  <div className="w-[45px] px-3 text-center text-gray-300 font-bold">
                    {idx + 1}
                  </div>
                  <div className="w-[70px] px-3 flex justify-center gap-2 opacity-20 group-hover:opacity-60 transition-opacity">
                    <Paperclip
                      size={22}
                      className="cursor-pointer hover:text-blue-500"
                    />
                    <MessageSquare
                      size={22}
                      className="cursor-pointer hover:text-blue-500"
                    />
                    <FileText
                      size={22}
                      className="cursor-pointer hover:text-blue-500"
                    />
                  </div>
                  <div className="w-[200px] flex items-center relative gap-2 pl-5 self-stretch">
                    {/* Phase Color Bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: t.color }}
                    ></div>
                    {t.type === "group" ? (
                      <button
                        onClick={() => toggleExpand(t.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-all font-sans"
                      >
                        {t.isExpanded ? (
                          <ChevronDown size={14} className="text-gray-900" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-900" />
                        )}
                      </button>
                    ) : (
                      <div className="w-6"></div>
                    )}
                    {editingTaskId === t.id ? (
                      <input
                        autoFocus
                        type="text"
                        className="flex-1 bg-white border border-blue-400 rounded px-1 outline-none font-normal"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onBlur={() => renameTask(t.id, editNameValue)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            renameTask(t.id, editNameValue);
                          if (e.key === "Escape") setEditingTaskId(null);
                        }}
                      />
                    ) : (
                      <span className="truncate tracking-tight">{t.name}</span>
                    )}

                    {/* Context Menu Popup */}
                    {activeMenuId === t.id && (
                      <div
                        ref={menuRef}
                        className="absolute left-1/2 top-full mt-[-5px] z-60 bg-white border border-border shadow-xl rounded-xl p-1.5 min-w-[140px] animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        {t.type === "group" && (
                          <button
                            onClick={() => {
                              addSubtask(t.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                          >
                            <Plus size={14} /> Add Subtask
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingTaskId(t.id);
                            setEditNameValue(t.name);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <FileText size={14} /> Rename Task
                        </button>
                        <div className="h-px bg-gray-50 my-1" />

                        {t.type === "group" && (
                          <div className="px-3 py-1.5">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Group Theme
                            </div>
                            <div className="flex gap-1.5">
                              {[
                                "#3b82f6",
                                "#f97316",
                                "#ec4899",
                                "#8b5cf6",
                                "#10b981",
                                "#64748b",
                              ].map((col) => (
                                <button
                                  key={col}
                                  onClick={() => {
                                    changeColor(t.id, col);
                                    setActiveMenuId(null);
                                  }}
                                  className={`w-4 h-4 rounded-full border border-black/5 hover:scale-125 transition-transform ${t.color === col ? "ring-1 ring-offset-1 ring-gray-400" : ""}`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="h-px bg-gray-50 my-1" />
                        <button
                          onClick={() => {
                            deleteTask(t.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} /> Delete Task
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="w-[85px] px-3 text-center text-gray-500 font-medium">
                    {t.duration}
                  </div>
                  <div className="w-[95px] px-3 text-center text-gray-400 tabular-nums">
                    {new Date(t.start).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </div>
                  <div className="w-[105px] px-3 text-center text-gray-400 tabular-nums">
                    {new Date(t.end).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </div>
                  <div className="w-[115px] px-3 pl-5 truncate text-gray-700 font-medium">
                    {t.assigned}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resize Handle — Now always visible and doesn't scroll with content */}
        <div
          className={`w-1 cursor-col-resize z-40 shrink-0 hover:bg-blue-400 transition-colors bg-gray-200 border-x border-white/50`}
          onMouseDown={startResizing}
        >
          <div className="h-full w-full" />
        </div>

        {/* Right Side: Apex Chart — individual horizontal scroll */}
        <div
          ref={chartPaneRef}
          className="flex-1 min-w-0 relative overflow-x-auto overflow-y-auto"
        >
          <div className="min-w-[1200px]">
            <Chart
              key={`gantt-chart-${flatTasks.length}`} // Force re-render when row count changes
              options={chartOptions as any}
              series={chartSeries}
              type="rangeBar"
              height={flatTasks.length * 40 + 70}
            />
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-gray-900">
                Create New Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Task Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter task name..."
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Name"
                    value={newTask.assigned}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assigned: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Type
                  </label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={newTask.type}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        type: e.target.value as "group" | "task",
                      })
                    }
                  >
                    <option value="task">Subtask</option>
                    <option value="group">Main Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={newTask.start}
                    onChange={(e) =>
                      setNewTask({ ...newTask, start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={newTask.end}
                    onChange={(e) =>
                      setNewTask({ ...newTask, end: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Progress ({newTask.progress}%)
                </label>
                <input
                  type="range"
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  min="0"
                  max="100"
                  value={newTask.progress}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      progress: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Color Theme
                </label>
                <div className="flex gap-3">
                  {[
                    "#3b82f6",
                    "#f97316",
                    "#ec4899",
                    "#8b5cf6",
                    "#10b981",
                    "#64748b",
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewTask({ ...newTask, color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${newTask.color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Status bar */}
      <div className="h-7 border-t border-border bg-white flex items-center justify-between px-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{" "}
            System Online
          </span>
          <span>•</span>
          <span>Last Synced: Today, 3:24 PM</span>
        </div>
        <div>v2.4.0-STABLE</div>
      </div>

      <style>{`
        /* Minimalist scrollbars */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* ApexChart Label Styling Overrides */
        .apexcharts-datalabel { pointer-events: none !important; font-family: inherit !important; }
        .apexcharts-gridline { stroke-dasharray: 4; stroke: #f1f5f9 !important; }
        .apexcharts-xaxis-label { letter-spacing: -0.01em; }
        
        /* Hierarchy levels */
        .group-row { background-color: #fbfcfe; }

        /* Dependency Connection Drawing */
        .dependency-line {
          pointer-events: none;
          fill: none;
          stroke: #94a3b8;
          stroke-width: 1.5;
          stroke-linecap: round;
          opacity: 0.4;
        }
      `}</style>

      {/* Connection Layer Overlay */}
      <svg className="fixed inset-0 pointer-events-none z-50 w-full h-full opacity-30">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orientation="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
        {/* Connection drawing logic would go here based on element positions */}
      </svg>
    </div>
  );
};

export default ApexGnttChart;
