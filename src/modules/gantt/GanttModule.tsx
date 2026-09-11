import { useEffect, useRef } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

import { initGanttConfig } from "./ganttConfig";
import { demoTasks } from "./demoData";
import GanttToolbar from "./GanttToolbar";

const GanttModule = () => {
  const ganttContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGanttConfig();

    gantt.ext.zoom.init({
      levels: [
        {
          name: "day",
          scale_height: 27,
          min_column_width: 80,
          scales: [{ unit: "day", step: 1, format: "%d %M" }],
        },
        {
          name: "week",
          scale_height: 50,
          min_column_width: 50,
          scales: [
            { unit: "week", step: 1, format: "Week #%W" },
            { unit: "day", step: 1, format: "%D" },
          ],
        },
        {
          name: "month",
          scale_height: 50,
          min_column_width: 50,
          scales: [
            { unit: "month", step: 1, format: "%F %Y" },
            { unit: "week", step: 1, format: "W%W" },
          ],
        },
      ],
    });

    gantt.ext.zoom.setLevel("week");

    gantt.init(ganttContainer.current!);
    gantt.parse(demoTasks);

    return () => {
      gantt.clearAll();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#fff" }}>
      <GanttToolbar />
      <div ref={ganttContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default GanttModule;
