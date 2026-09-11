/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

declare const gantt: any;

import {
  Paperclip,
  MessageSquare,
  FileText,
  Printer,
  ChevronLeft,
  Search,
  Upload,
  Download,
  Share2,
  MoreVertical,
  Plus,
  FolderPlus,
  ListPlus,
  PlusCircle,
  Columns3,
} from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { useParams } from "react-router-dom";
import AddTaskModal from "./AddTaskModal";
import { useGetGanttChartByIdQuery } from "@/store/Api/ChartApi/GanttChartApi";
import { useMemo } from "react";

/*   COLOR POOL FOR ROOT PROJECTS (From Design Image)   */
const PROJECT_COLORS = [
  "#3b82f6", // Starting (Blue)
  "#f97316", // Plinth Beam (Orange)
  "#ec4899", // 1st Floor Slab (Rose)
  "#6366f1", // 2nd Floor Slab (Indigo)
  "#eab308", // 3rd Floor Slab (Yellow)
  "#2563eb", // Terrace Floor Slab (Navy)
  "#0d9488", // Finishing Plan (Teal)
];

interface GanttChartProps {
  initialTasks?: any[];
  initialLinks?: any[];
  onTaskUpdate?: (id: string, task: any) => void;
  onLinkUpdate?: (id: string, link: any) => void;
}

const GanttChart = ({ initialTasks, initialLinks }: GanttChartProps) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const searchRef = useRef("");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    wbs: true,
    info: true,
    color_bar: true,
    text: true,
    duration: true,
    start_date: true,
    end_date: true,
    owner: true,
    actual_cost: false,
    actual_duration: false,
    actual_finish_date: false,
    actual_hours: false,
    actual_resource_cost: false,
    actual_start_date: false,
    baseline_finish_date: false,
    baseline_start_date: false,
    complete: false,
    linked_from: false,
    linked_to: false,
    milestone: false,
    percent_complete: true,
    planned_cost: false,
    planned_finish_date: false,
    planned_hours: false,
    planned_resource_cost: false,
    planned_start_date: false,
    priority: true,
    remaining_hours: false,
    status: false,
    tags: false,
    task_type: false,
  });
  const [customColumns, setCustomColumns] = useState<
    Array<{ name: string; key: string; width: number }>
  >([]);
  const [newColumnName, setNewColumnName] = useState("");
  const { projectId: storeProjectId } = useAppSelector(
    (state) => state.chartSlice,
  );
  const { projectId: urlProjectId } = useParams();
  const projectId = storeProjectId || urlProjectId;

  const { data: ganttRes } = useGetGanttChartByIdQuery(projectId as string, {
    skip: !projectId,
  });

  const parsedApiTasks = useMemo(() => {
    if (!ganttRes?.data?.xAxis) return null;
    try {
      const rows =
        typeof ganttRes.data.xAxis === "string"
          ? JSON.parse(ganttRes.data.xAxis)
          : ganttRes.data.xAxis;

      if (!Array.isArray(rows)) return null;

      const tasks: any[] = [];
      rows.forEach((group: any, groupIndex: number) => {
        const groupColor =
          group.color || PROJECT_COLORS[groupIndex % PROJECT_COLORS.length];
        const groupData = group.data || [];

        groupData.forEach((row: any[], rowIndex: number) => {
          const taskId = `${groupIndex}-${rowIndex}`;
          const text = row[0] || "Unnamed Task";
          const durationStr = row[1] || "1 Days";
          const duration = parseInt(durationStr) || 1;
          const startDateStr = row[2];
          const endDateStr = row[3];
          const owner = row[4];
          const progressStr = row[5] || "0%";
          const progress = parseFloat(progressStr) / 100 || 0;
          const priority = row[6];
          const planned_hours = row[7];
          const actual_hours = row[8];
          const planned_cost = row[9];
          const actual_cost = row[10];

          tasks.push({
            id: taskId,
            text,
            start_date: startDateStr ? new Date(startDateStr) : new Date(),
            end_date: endDateStr ? new Date(endDateStr) : undefined,
            duration,
            progress,
            owner,
            priority,
            planned_hours,
            actual_hours,
            planned_cost,
            actual_cost,
            rootColor: groupIndex % PROJECT_COLORS.length,
            color: groupColor,
          });
        });
      });
      return tasks;
    } catch (e) {
      console.error("Failed to parse Gantt xAxis", e);
      return null;
    }
  }, [ganttRes]);

  const existingGroups = useMemo(() => {
    if (!ganttRes?.data?.xAxis) return [];
    try {
      const rows =
        typeof ganttRes.data.xAxis === "string"
          ? JSON.parse(ganttRes.data.xAxis)
          : ganttRes.data.xAxis;
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      console.error("Failed to parse existing groups", e);
      return [];
    }
  }, [ganttRes]);

  useEffect(() => {
    searchRef.current = searchText;
  }, [searchText]);

  useEffect(() => {
    if (!ganttContainer.current) return;

    gantt.clearAll();

    // Enable required plugins
    gantt.plugins({
      undo: true,
      marker: true,
      tooltip: true,
      critical_path: true,
      drag_timeline: true,
    });

    /*    CORE CONFIG    */
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.row_height = 40;
    gantt.config.grid_width = 400;
    gantt.config.grid_resize = true;
    gantt.config.scroll_size = 12;
    gantt.config.autosize = false;
    gantt.config.readonly = false; // Make grid editable

    // Resizing & Dragging
    gantt.config.grid_resize = true;
    gantt.config.resize_grid_columns = true;
    gantt.config.min_grid_column_width = 40;
    gantt.config.min_column_width = 40;
    gantt.config.grid_elastic_columns = false;
    gantt.config.fit_tasks = false;
    gantt.config.drag_progress = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_move = true;

    // Tree behavior
    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
    gantt.config.open_tree_initially = true;

    // Timeline Visuals
    gantt.config.show_chart_grid = true;
    gantt.config.link_line_width = 1.5;
    gantt.config.link_arrow_size = 6;
    gantt.config.sort = true;

    // Replace your entire layout config block with this:
    gantt.config.layout = {
      css: "gantt_container",

      rows: [
        {
          cols: [
            {
              // Grid column with its OWN horizontal scrollbar below it
              rows: [
                {
                  view: "grid",
                  scrollX: "gridScroll",
                  scrollY: "scrollVer",
                  id: "grid",
                },
                {
                  view: "scrollbar",
                  id: "gridScroll",
                  scroll: "x",
                  height: 20,
                },
              ],
              id: "gridSection",
            },
            { view: "resizer", width: 6 },
            {
              // Timeline column with its OWN horizontal scrollbar below it
              rows: [
                {
                  view: "timeline",
                  scrollX: "timelineScroll",
                  scrollY: "scrollVer",
                  id: "timeline",
                },
                {
                  view: "scrollbar",
                  id: "timelineScroll",
                  scroll: "x",
                  height: 20,
                },
              ],
            },
            // Single shared vertical scrollbar on the far right
            { view: "scrollbar", id: "scrollVer" },
          ],
        },
      ],
    };
    /*    COLUMNS CONFIGURATION    */
    const allColumnsArr = [
      {
        name: "wbs",
        label: "WBS",
        width: 40,
        align: "center",
        resize: true,
        hide: !visibleColumns.wbs,
        template: (task: any) => gantt.getWBSCode(task),
      },
      {
        name: "info",
        label: "Info",
        width: 80,
        align: "center",
        resize: true,
        hide: !visibleColumns.info,
        template: () => `
          <div class="info-icons">
            <span class="icon-btn">📎</span>
            <span class="icon-btn">💬</span>
            <span class="icon-btn">📄</span>
          </div>
        `,
      },
      {
        name: "color_bar",
        label: "",
        width: 8,
        resize: false,
        hide: !visibleColumns.color_bar,
        template: (task: any) => {
          const color =
            task.color ||
            PROJECT_COLORS[task.rootColor % PROJECT_COLORS.length];
          return `<div class="sidebar-color-indicator" style="background: ${color}"></div>`;
        },
      },
      {
        name: "text",
        label: "Task Name",
        tree: true,
        width: 250,
        resize: true,
        editor: { type: "text", map_to: "text" },
        hide: !visibleColumns.text,
        template: (task: any) =>
          `<div class="task-name-cell"><span>${task.text}</span></div>`,
      },
      {
        name: "duration",
        label: "Duration",
        align: "center",
        width: 100,
        resize: true,
        editor: { type: "number", map_to: "duration" },
        hide: !visibleColumns.duration,
        template: (task: any) => `${task.duration} Days`,
      },
      {
        name: "start_date",
        label: "Planned Start Date",
        align: "center",
        width: 100,
        resize: true,
        editor: { type: "date", map_to: "start_date" },
        hide: !visibleColumns.planned_start_date,
        template: (task: any) => gantt.templates.date_grid(task.start_date),
      },
      {
        name: "end_date",
        label: "Planned Finish Date",
        align: "center",
        width: 100,
        resize: true,
        editor: { type: "date", map_to: "end_date" },
        hide: !visibleColumns.planned_finish_date,
        template: (task: any) =>
          task.end_date ? gantt.templates.date_grid(task.end_date) : "",
      },
      {
        name: "owner",
        label: "Assigned",
        align: "center",
        width: 120,
        resize: true,
        editor: { type: "text", map_to: "owner" },
        hide: !visibleColumns.owner,
        template: (task: any) => task.owner || "",
      },
      {
        name: "priority",
        label: "Priority",
        align: "center",
        width: 80,
        resize: true,
        editor: {
          type: "select",
          map_to: "priority",
          options: [
            { key: "High", label: "High" },
            { key: "Medium", label: "Medium" },
            { key: "Low", label: "Low" },
          ],
        },
        hide: !visibleColumns.priority,
        template: (task: any) => task.priority || "",
      },
      {
        name: "progress",
        label: "Percent Complete",
        align: "center",
        width: 80,
        resize: true,
        editor: { type: "number", map_to: "progress" },
        hide: !visibleColumns.percent_complete,
        template: (task: any) => `${Math.round(task.progress * 100)}%`,
      },
      {
        name: "actual_cost",
        label: "Actual Cost",
        width: 100,
        resize: true,
        hide: !visibleColumns.actual_cost,
        editor: { type: "text", map_to: "actual_cost" },
      },
      {
        name: "actual_duration",
        label: "Actual Duration",
        width: 100,
        resize: true,
        hide: !visibleColumns.actual_duration,
        editor: { type: "text", map_to: "actual_duration" },
      },
      {
        name: "actual_finish_date",
        label: "Actual Finish Date",
        width: 100,
        resize: true,
        hide: !visibleColumns.actual_finish_date,
        editor: { type: "date", map_to: "actual_start_date" },
      },
      {
        name: "actual_hours",
        label: "Actual Hours",
        width: 100,
        resize: true,
        hide: !visibleColumns.actual_hours,
        editor: { type: "text", map_to: "actual_hours" },
      },
      {
        name: "actual_resource_cost",
        label: "Actual Resource Cost",
        width: 100,
        resize: true,
        hide: !visibleColumns.actual_resource_cost,
        editor: { type: "text", map_to: "actual_resource_cost" },
      },
      {
        name: "actual_start_date",
        label: "Actual Start Date",
        width: 100,
        resize: true,
        hide: !visibleColumns.actual_start_date,
        editor: { type: "date", map_to: "actual_start_date" },
      },
      {
        name: "baseline_finish_date",
        label: "Baseline Finish Date",
        width: 100,
        resize: true,
        hide: !visibleColumns.baseline_finish_date,
        editor: { type: "date", map_to: "baseline_finish_date" },
      },
      {
        name: "baseline_start_date",
        label: "Baseline Start Date",
        width: 100,
        resize: true,
        hide: !visibleColumns.baseline_start_date,
        editor: { type: "date", map_to: "baseline_start_date" },
      },
      {
        name: "planned_cost",
        label: "Planned Cost",
        width: 100,
        resize: true,
        hide: !visibleColumns.planned_cost,
        editor: { type: "text", map_to: "planned_cost" },
      },
      {
        name: "planned_hours",
        label: "Planned Hours",
        width: 100,
        resize: true,
        hide: !visibleColumns.planned_hours,
        editor: { type: "text", map_to: "planned_hours" },
      },
      {
        name: "planned_resource_cost",
        label: "Planned Resource Cost",
        width: 100,
        resize: true,
        hide: !visibleColumns.planned_resource_cost,
        editor: { type: "text", map_to: "planned_resource_cost" },
      },
      {
        name: "remaining_hours",
        label: "Remaining Hours",
        width: 100,
        resize: true,
        hide: !visibleColumns.remaining_hours,
        editor: { type: "text", map_to: "remaining_hours" },
      },
      {
        name: "status",
        label: "Status",
        width: 100,
        resize: true,
        hide: !visibleColumns.status,
        editor: { type: "text", map_to: "status" },
      },
      {
        name: "tags",
        label: "Tags",
        width: 100,
        resize: true,
        hide: !visibleColumns.tags,
        editor: { type: "text", map_to: "tags" },
      },
      {
        name: "task_type",
        label: "Task Type",
        width: 100,
        resize: true,
        hide: !visibleColumns.task_type,
        editor: { type: "text", map_to: "type" },
      },
      {
        name: "milestone",
        label: "Milestone",
        width: 80,
        resize: true,
        hide: !visibleColumns.milestone,
        template: (task: any) => (task.type === "milestone" ? "Yes" : "No"),
      },
      // Add custom columns
      ...customColumns.map((col) => ({
        name: col.key,
        label: col.name,
        align: "center",
        width: col.width,
        resize: true,
        editor: { type: "text", map_to: col.key },
        template: (task: any) => task[col.key] || "",
      })),
    ];

    gantt.config.columns = allColumnsArr.filter((col: any) => !col.hide);

    gantt.templates.date_grid = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
    };

    /*    BAR STYLING    */
    gantt.templates.task_class = (_start: Date, _end: Date, task: any) => {
      if (task.rootColor !== undefined) return `bar-root-${task.rootColor}`;
      return "";
    };

    gantt.templates.rightside_text = (_start: Date, _end: Date, task: any) => {
      const progress = Math.round(task.progress * 100) || 0;
      if (task.type === gantt.config.types.project) {
        return `<b class="bar-label-project">${task.text} ${progress}%</b>`;
      }
      return `<span class="bar-label-task">${task.text} ${progress}% <span class="owner-name">${task.owner || ""}</span></span>`;
    };

    /*    ZOOM CONFIG (Month View)    */
    gantt.ext.zoom.init({
      levels: [
        {
          name: "month",
          scale_height: 50,
          min_column_width: 35,
          scales: [
            { unit: "month", step: 1, format: "%F %Y" },
            { unit: "day", step: 1, format: "%d" },
          ],
        },
      ],
    });
    gantt.ext.zoom.setLevel("month");

    /*    EVENT HANDLERS    */
    gantt.templates.grid_row_class = (_start: Date, _end: Date, task: any) => {
      if (task.rootColor !== undefined) return `row-root-${task.rootColor}`;
      return "";
    };

    gantt.attachEvent("onTaskCreated", (task: any) => {
      if (!task.parent || task.parent === 0) {
        task.rootColor = gantt.getTaskCount() % PROJECT_COLORS.length;
      } else {
        const parent = gantt.getTask(task.parent);
        task.rootColor = parent.rootColor;
      }
      return true;
    });

    gantt.attachEvent("onBeforeTaskDisplay", (_id: any, task: any) => {
      const query = searchRef.current.toLowerCase();
      if (!query) return true;
      return task.text.toLowerCase().includes(query);
    });

    // API Ready: Emit changes
    gantt.attachEvent("onAfterTaskUpdate", (id: string, task: any) => {
      console.log("Task Updated:", id, task);
    });

    // Helper to get all tasks for the modal/API
    (window as any).getGanttDataForApi = () => {
      const groupedData: { [key: number]: any } = {};

      gantt.eachTask((task: any) => {
        const rootIndex = task.rootColor || 0;
        if (!groupedData[rootIndex]) {
          groupedData[rootIndex] = {
            color: PROJECT_COLORS[rootIndex % PROJECT_COLORS.length],
            data: [],
          };
        }

        groupedData[rootIndex].data.push([
          task.text,
          `${task.duration} Days`,
          gantt.templates.date_grid(task.start_date),
          task.end_date ? gantt.templates.date_grid(task.end_date) : "",
          task.owner || "",
          `${Math.round(task.progress * 100)}%`,
          task.priority || "Medium",
          task.planned_hours || "0 hours",
          task.actual_hours || "0 hours",
          task.planned_cost || "$0.00",
          task.actual_cost || "$0.00",
        ]);
      });

      return Object.values(groupedData);
    };

    /*    INIT & PARSE    */
    gantt.resetLayout();
    gantt.init(ganttContainer.current);

    const defaultTasks = parsedApiTasks ||
      initialTasks || [
        {
          id: 10,
          text: "Starting",
          start_date: "2025-03-01",
          duration: 23,
          progress: 0.6,
          open: true,
          rootColor: 0,
        },
        {
          id: 1,
          text: "Mobilization at Site",
          start_date: "2025-03-01",
          duration: 14,
          parent: 10,
          progress: 0.49,
          owner: "Mike Smith",
          rootColor: 0,
        },
        {
          id: 2,
          text: "Surveying & Layout",
          start_date: "2025-03-05",
          duration: 5,
          parent: 10,
          progress: 0.49,
          owner: "Mike Smith",
          rootColor: 0,
        },
        {
          id: 3,
          text: "Excavation",
          start_date: "2025-03-07",
          duration: 8,
          parent: 10,
          progress: 0.49,
          owner: "Mike Smith",
          rootColor: 0,
        },
        {
          id: 4,
          text: "Footing",
          start_date: "2025-03-11",
          duration: 10,
          parent: 10,
          progress: 0.49,
          owner: "Mike Smith",
          rootColor: 0,
        },
        {
          id: 5,
          text: "Column upto Plinth Level",
          start_date: "2025-03-12",
          duration: 9,
          parent: 10,
          progress: 0.49,
          owner: "Mike Smith",
          rootColor: 0,
        },

        {
          id: 20,
          text: "Plinth Beam",
          start_date: "2025-03-23",
          duration: 7,
          progress: 0.6,
          open: true,
          rootColor: 1,
        },
        {
          id: 6,
          text: "Earth Filling in Plinth Level",
          start_date: "2025-03-23",
          duration: 4,
          parent: 20,
          progress: 0.49,
          owner: "Jennifer Jones",
          rootColor: 1,
        },
        {
          id: 7,
          text: "Anti Termite Treatment",
          start_date: "2025-03-25",
          duration: 4,
          parent: 20,
          progress: 0.49,
          owner: "Jennifer Jones",
          rootColor: 1,
        },
        {
          id: 8,
          text: "CC Flooring with PCC",
          start_date: "2025-03-25",
          duration: 5,
          parent: 20,
          progress: 0.49,
          owner: "Jennifer Jones",
          rootColor: 1,
        },

        {
          id: 30,
          text: "1st Floor Slab",
          start_date: "2025-03-24",
          duration: 20,
          progress: 0.3,
          open: true,
          rootColor: 2,
        },
        {
          id: 9,
          text: "Brickwork at Ground Floor",
          start_date: "2025-04-24",
          duration: 14,
          parent: 30,
          progress: 0.49,
          owner: "Sam Watson",
          rootColor: 2,
        },
      ];

    const defaultLinks = initialLinks || [
      { id: 1, source: 1, target: 2, type: "0" },
      { id: 2, source: 2, target: 3, type: "0" },
      { id: 3, source: 3, target: 4, type: "0" },
    ];

    gantt.parse({ data: defaultTasks, links: defaultLinks });

    return () => gantt.clearAll();
  }, [
    initialTasks,
    initialLinks,
    visibleColumns,
    customColumns,
    parsedApiTasks,
  ]);

  useEffect(() => {
    gantt.render();
  }, [searchText]);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-border">
        <div className="flex items-center gap-4 text-gray-400">
          <Paperclip size={18} className="cursor-pointer hover:text-gray-600" />
          <MessageSquare
            size={18}
            className="cursor-pointer hover:text-gray-600"
          />
          <FileText size={18} className="cursor-pointer hover:text-gray-600" />
          <Printer size={18} className="cursor-pointer hover:text-gray-600" />
          <Share2 size={18} className="cursor-pointer hover:text-gray-600" />
          <MoreVertical
            size={18}
            className="cursor-pointer hover:text-gray-600"
          />
        </div>

        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl px-12">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search
                size={16}
                className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Search anything here..."
              className="w-full bg-gray-50 border-none rounded-lg py-2 pl-10 pr-12 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400 font-medium">
                ⌘ K
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 transition-colors border border-border"
            >
              <Plus size={16} />
              Add New
            </button>

            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={() => {
                      gantt.createTask({
                        text: "New Project",
                        start_date: new Date(),
                        duration: 5,
                        progress: 0,
                        type: gantt.config.types.project,
                      });
                      setShowAddMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <FolderPlus size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium">New Root Project</div>
                      <div className="text-xs text-gray-500">
                        Add a root project group
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      gantt.createTask({
                        text: "New Sub Task",
                        start_date: new Date(),
                        duration: 3,
                        progress: 0,
                      });
                      setShowAddMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <ListPlus size={16} className="text-green-600" />
                    <div>
                      <div className="font-medium">Sub Task</div>
                      <div className="text-xs text-gray-500">
                        Add a subtask to selected item
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTaskModal(true);
                      setShowAddMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <PlusCircle size={16} className="text-purple-600" />
                    <div>
                      <div className="font-medium">Root Task</div>
                      <div className="text-xs text-gray-500">
                        Add root task via input form
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Column Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-border"
              title="Manage Columns"
            >
              <Columns3 size={18} className="text-gray-600" />
            </button>

            {showColumnMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowColumnMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Visible Columns
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[
                      { name: "WBS", key: "wbs" },
                      { name: "Info", key: "info" },
                      { name: "Task Name", key: "text" },
                      { name: "Duration", key: "duration" },
                      { name: "Planned Start Date", key: "planned_start_date" },
                      {
                        name: "Planned Finish Date",
                        key: "planned_finish_date",
                      },
                      { name: "Assigned", key: "owner" },
                      { name: "Priority", key: "priority" },
                      { name: "Percent Complete", key: "percent_complete" },
                      { name: "Actual Cost", key: "actual_cost" },
                      { name: "Actual Duration", key: "actual_duration" },
                      { name: "Actual Finish Date", key: "actual_finish_date" },
                      { name: "Actual Hours", key: "actual_hours" },
                      {
                        name: "Actual Resource Cost",
                        key: "actual_resource_cost",
                      },
                      { name: "Actual Start Date", key: "actual_start_date" },
                      {
                        name: "Baseline Finish Date",
                        key: "baseline_finish_date",
                      },
                      {
                        name: "Baseline Start Date",
                        key: "baseline_start_date",
                      },
                      { name: "Planned Cost", key: "planned_cost" },
                      { name: "Planned Hours", key: "planned_hours" },
                      {
                        name: "Planned Resource Cost",
                        key: "planned_resource_cost",
                      },
                      { name: "Remaining Hours", key: "remaining_hours" },
                      { name: "Status", key: "status" },
                      { name: "Tags", key: "tags" },
                      { name: "Task Type", key: "task_type" },
                      { name: "Milestone", key: "milestone" },
                    ].map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            visibleColumns[
                            col.key as keyof typeof visibleColumns
                            ]
                          }
                          onChange={(e) => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [col.key]: e.target.checked,
                            });
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {col.name}
                        </span>
                      </label>
                    ))}

                    {/* Custom Columns */}
                    {customColumns.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {col.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCustomColumns(
                              customColumns.filter((c) => c.key !== col.key),
                            );
                          }}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 px-4">
                    <button
                      onClick={() => {
                        setShowAddColumnModal(true);
                        setShowColumnMenu(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Custom Column
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Add Custom Column Modal */}
          {showAddColumnModal && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center"
                onClick={() => setShowAddColumnModal(false)}
              >
                <div
                  className="bg-white rounded-lg shadow-xl p-6 w-96"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Add Custom Column
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Column Name
                    </label>
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Enter column name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowAddColumnModal(false);
                        setNewColumnName("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (newColumnName.trim()) {
                          const key = newColumnName
                            .toLowerCase()
                            .replace(/\s+/g, "_");
                          setCustomColumns([
                            ...customColumns,
                            { name: newColumnName, key, width: 120 },
                          ]);
                          setNewColumnName("");
                          setShowAddColumnModal(false);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Add Column
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-border">
            <Upload size={18} className="text-gray-600" />
          </div>
          <div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-border">
            <Download size={18} className="text-gray-600" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 transition-colors border border-border">
            <ChevronLeft size={16} /> Return
          </button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95">
            Publish
          </button>
        </div>

        {/* Add Task Modal */}
        <AddTaskModal
          open={showAddTaskModal}
          onOpenChange={setShowAddTaskModal}
          projectId={projectId}
          existingGroups={existingGroups}
          onSuccess={() => {
            // onSuccess logic
          }}
        />
      </div>

      {/* Main Gantt Container */}
      <div className="flex-1 overflow-hidden relative border-t border-border">
        <div ref={ganttContainer} className="w-full h-full" />
      </div>

      <style>{`
        .gantt_container { border: none !important; font-family: 'Inter', system-ui, -apple-system, sans-serif !important; background: #fff !important; }
        .gantt_grid_header { background-color: #F8FAFC !important; border-bottom: 1px solid #E2E8F0 !important; color: #64748B !important; font-weight: 600 !important; font-size: 13px !important; }
        .gantt_grid_data { background-color: #FFFFFF !important; }
        .gantt_row { border-bottom: 1px solid #F1F5F9 !important; transition: background 0.2s; }
        .gantt_row:hover { background-color: #F8FAFC !important; }
        .gantt_scale_cell { color: #64748B !important; font-weight: 500 !important; font-size: 12px !important; border-right: 1px solid #F1F5F9 !important; }
        .gantt_task_scale { border-bottom: 1px solid #E2E8F0 !important; }

        .gantt_task_bg { background-image: none !important; background-color: #fff !important; }
        .gantt_task_row { border-bottom: 1px solid #F1F5F9 !important; }
        .gantt_task_cell { border-right: none !important; }

        .info-icons { display: flex; gap: 8px; justify-content: center; opacity: 0.5; }
        .icon-btn { cursor: pointer; transition: transform 0.2s; font-size: 14px; }
        .icon-btn:hover { transform: scale(1.2); opacity: 1; }
        
        .task-name-cell { 
          display: flex; 
          align-items: center; 
          padding-left: 12px; 
          height: 100%; 
          font-weight: 500; 
          color: #334155; 
          box-sizing: border-box;
        }
        
        .gantt_side_content.gantt_right { font-size: 11px; color: #475569; padding-left: 12px; pointer-events: none; }
        .owner-name { color: #94A3B8; margin-left: 4px; font-weight: 400; font-size: 10px; }
        .bar-label-project { font-size: 12px; color: #1e293b; }

        .gantt_task_progress { background-color: rgba(255, 255, 255, 0.2) !important; }
        .gantt_task_line { border-radius: 5px !important; border: none !important; box-shadow: 0 2px 4px rgba(0,0,0,0.06) !important; }

        ${PROJECT_COLORS.map(
        (c, i) => `
            .bar-root-${i} { background-color: ${c} !important; border-color: ${c} !important; }
            .bar-root-${i}.gantt_selected { opacity: 1; box-shadow: 0 0 10px ${c}44 !important; }
          `,
      ).join("")}

        .sidebar-color-indicator {
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 4px;
          border-radius: 2px;
          margin-left: 2px;
        }

        .gantt_resizer { 
          background-color: #F1F5F9 !important; 
          cursor: col-resize; 
          transition: background 0.2s;
          z-index: 1000 !important;
          border-left: 1px solid #E2E8F0 !important;
          border-right: 1px solid #E2E8F0 !important;
        }
        .gantt_resizer:hover { 
          background-color: #3B82F6 !important; 
        }
      
        .gantt_resizer::after {
            content: "⋮";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #94A3B8;
            font-size: 16px;
            font-weight: bold;
            pointer-events: none;
        }
        .gantt_resizer:hover::after {
            color: #fff;
        }

        .gantt_grid_column_resize_wrap { 
          cursor: col-resize !important;
          z-index: 100 !important;
          position: absolute !important;
          right: -4px !important;
          top: 0 !important;
          bottom: 0 !important;
          width: 8px !important;
          background: transparent !important;
          transition: all 0.2s ease !important;
          pointer-events: all !important;
        }        
   
        .gantt_grid_column_resize_wrap::after {
          content: '';
          position: absolute;
          right: 3px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #E2E8F0;
          transition: all 0.2s ease;
        }
        
        .gantt_grid_column_resize_wrap:hover {
          background: rgba(59, 130, 246, 0.1) !important;
        }
        
        .gantt_grid_column_resize_wrap:hover::after {
          background: #3B82F6 !important;
          width: 2px !important;
          right: 2.5px;
        }
        
        .gantt_grid_column_resize_wrap::before {
          content: '⋮';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #CBD5E1;
          font-size: 14px;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          line-height: 1;
        }
        
        .gantt_grid_column_resize_wrap:hover::before {
          opacity: 1;
          color: #3B82F6;
        }
        
        .gantt_grid_column_resize_wrap.gantt_grid_column_resize_active {
          background: rgba(59, 130, 246, 0.2) !important;
        }
        
        .gantt_grid_column_resize_wrap.gantt_grid_column_resize_active::after {
          background: #3B82F6 !important;
          width: 2px !important;
        }
        
        .gantt_grid_header_cell { 
          position: relative !important;
          transition: background-color 0.2s ease !important;
          overflow: visible !important;
        }

        .gantt_grid_header_cell:hover {
          background-color: #F8FAFC !important;
        }

        .gantt_grid_scale .gantt_grid_column_resize_wrap {
          display: block !important;
          visibility: visible !important;
        }

        .gantt_hor_scroll { background: #F8FAFC !important; border-top: 1px solid #E2E8F0 !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        

        .gantt_tree_indent { width: 15px !important; }
        .gantt_tree_icon { width: 24px !important; }
        .gantt_cell { position: relative; 
      `}</style>
    </div>
  );
};

export default GanttChart;
