import { gantt } from "dhtmlx-gantt";

const GanttToolbar = () => {
  return (
    <div style={{ padding: 10, borderBottom: "1px solid #ddd", display: "flex", gap: 8 }}>
      <button onClick={() => gantt.ext.zoom.setLevel("day")}>Day</button>
      <button onClick={() => gantt.ext.zoom.setLevel("week")}>Week</button>
      <button onClick={() => gantt.ext.zoom.setLevel("month")}>Month</button>
      <button onClick={() => gantt.createTask()}>+ Add Task</button>
      <button onClick={() => gantt.deleteTask(gantt.getSelectedId())}>Delete Selected</button>
    </div>
  );
};

export default GanttToolbar;
