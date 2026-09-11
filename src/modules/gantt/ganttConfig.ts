import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

export function initGanttConfig() {
  gantt.config.date_format = "%Y-%m-%d";

  gantt.config.columns = [
    { name: "text", label: "Task name", tree: true, width: 250 },
    { name: "start_date", label: "Start Date", align: "center", width: 100 },
    { name: "duration", label: "Duration", align: "center", width: 80 },
    {
      name: "progress",
      label: "Progress",
      align: "center",
      width: 80,
      template: (task) => Math.round((task.progress ?? 0) * 100) + "%",
    },
    { name: "add", label: "", width: 44 },
  ];

  gantt.config.grid_resize = true;
  gantt.config.drag_move = true;
  gantt.config.drag_resize = true;
  gantt.config.drag_progress = true;
  gantt.config.details_on_dblclick = true;
  gantt.config.open_tree_initially = true;

  gantt.config.show_links = true;
}
