// import SvarGanttChart from "@/Common/Charts/SvarGanttChart";
// import GanttChart from "@/Common/Charts/GanttChart/GanttChart";
// import BasicInit from "@/Common/Charts/GanttChart/BasicGanttChart";
// import GanttChart from "@/Common/Charts/GanttChart/ModifiedGanttChart";
// import { tasks, links } from "@/Common/Charts/GanttChart/demoData";
import CustomGanttChart from "@/Common/Charts/GanttChart/CustomGanttChart/CustomGanttChart";
const GanttTab = () => {
  return (
    <div className="w-full h-full">
      {/* <SvarGanttChart /> */}
      {/* <BasicInit /> */}
      {/* <GanttChart /> */}
      <CustomGanttChart />
      {/* <GanttChartNew /> */}
      {/* <ModifiedGanttChart /> */}
      <div className="h-[70vh] w-full">
        {/* <GanttChart tasks={tasks} links={links} /> */}
      </div>
    </div>
  );
};

export default GanttTab;
