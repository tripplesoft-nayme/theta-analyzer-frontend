import { Gantt } from "@svar-ui/react-gantt";
import { useMemo } from "react";
import { getData } from "./data";


export default function BasicInit() {
  const data = useMemo(() => getData("day"), []);

  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
    />
  );
}