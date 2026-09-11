// import { useState } from "react";

// import DoughnutChart from "@/Common/Charts/DoughnutChart";
// import HeatmapChart from "@/Common/Charts/HeatmapChart";
// import RadarCharts from "@/Common/Charts/RadarChart";
// // import ProjectConfiguration from "@/components/client/ProjectBuilder/ProjectConfiguration";
// import ProjectStats from "@/components/client/ProgramBuilder/ProjectStats";
// import ProjectWidget from "@/Common/Charts/CompletedCharts/Widgets/ProjectWidget";
// // import StackedBarChart from "@/Common/Charts/StackedBarChart";
// import ProgressRing from "@/Common/Charts/ProgressRingTest";
// // import MultiAxisLineChart from "@/Common/Charts/LineChart";
// // import HorizontalBarChart from "@/Common/Charts/HorizontalBarChart";
// // import AreaChart from "@/Common/Charts/AreaChart";
// import GanttChart from "@/Common/Charts/GanttChart/GanttChart";
// import LineChartModule from "@/Common/Charts/CompletedCharts/LineChart/LineChartModule";
// import ChartModuleOne from "@/Common/Charts/CompletedCharts/ChartModule/ChartModuleOne";

// import ChartModuleTwo from "@/components/client/ProjectBuilder/chartModules/ChartModuleTwo";
// import HorizontalBarChartModule from "../../Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChartModule";
// import StackedBarChartModule from "@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChartModule";
// import RibbonChartModule from "@/Common/Charts/CompletedCharts/Ribbon/RibbonChartModule";
// import MatrixTableChartModule from "@/Common/Charts/CompletedCharts/MatrixTable/MatrixTableChartModule";

// const StaffEmployeeProjectBuilder = () => {
//   const [selectedWidget, setSelectedWidget] = useState<string>("");
//   const [activeWidget, setActiveWidget] = useState("KPI Widget");

//   const handleWidgetSelect = (widgetId: string) => {
//     if (widgetId === "kpi") {
//       setSelectedWidget("");
//       setActiveWidget("KPI widget");
//     } else {
//       setSelectedWidget(widgetId);
//       setActiveWidget(widgetId);
//     }
//   };

//   return (
//     <div className="flex gap-6">
//       <ProjectWidget onWidgetSelect={handleWidgetSelect} selectedWidgets={[]} />
//       <div className="flex flex-col gap-6 border border-gray-200 rounded-lg p-4 w-full h-full mb-10">
//         <ProjectStats activeWidget={activeWidget} />

//         {!selectedWidget && (
//           <>
//             {/* <StackedBarChart /> */}
//             <div className="flex gap-4">
//               <RadarCharts />
//               <DoughnutChart
//                 title="Doughnut Pie"
//                 centerLabel="Total Visitor"
//                 data={[
//                   {
//                     name: "Paid traffic",
//                     value: 65,
//                     count: 12,
//                     color: "#19A1E9",
//                   },
//                   {
//                     name: "Social traffic",
//                     value: 21,
//                     count: 30,
//                     color: "#F7AF21",
//                   },
//                   {
//                     name: "Organic traffic",
//                     value: 14,
//                     count: 8,
//                     color: "#10A683",
//                   },
//                 ]}
//               />
//             </div>
//             <HeatmapChart />
//           </>
//         )}

//         {selectedWidget === "bar-chart" && <StackedBarChartModule />}
//         {selectedWidget === "progress-ring" && (
//           <ProgressRing
//             title="Project Progress"
//             centerLabel="Total Progress"
//             data={[
//               {
//                 name: "In Progress",
//                 value: 65,
//                 count: 12,
//                 color: "#5D8AF3",
//               },
//               {
//                 name: "Completed",
//                 value: 14,
//                 count: 30,
//                 color: "#169E7B",
//               },
//               {
//                 name: "Overdue",
//                 value: 13,
//                 count: 8,
//                 color: "#DA4352",
//               },
//               {
//                 name: "Not Started",
//                 value: 8,
//                 count: 8,
//                 color: "#E2E8F0",
//               },
//             ]}
//           />
//         )}

//         {selectedWidget === "pie-chart" && (
//           <ChartModuleTwo chartName="pie-chart" />
//         )}

//         {selectedWidget === "line-chart" && <LineChartModule />}

//         {selectedWidget === "data-table" && (
//           <div className="p-6 border border-gray-200 rounded-lg text-center text-gray-500">
//             Data Table coming soon...
//           </div>
//         )}

//         {selectedWidget === "gantt-chart" && (
//           <div className="p-6 border border-gray-200 rounded-lg text-center text-gray-500">
//             <GanttChart />
//           </div>
//         )}

//         {selectedWidget === "picture-video" && (
//           <div className="p-6 border border-gray-200 rounded-lg text-center text-gray-500">
//             Picture/Video coming soon...
//           </div>
//         )}

//         {selectedWidget === "horizontal-bar-chart" && (
//           <HorizontalBarChartModule />
//         )}

//         {selectedWidget === "heat-map-chart" && <HeatmapChart />}

//         {selectedWidget === "area-chart" && (
//           <ChartModuleOne chartName="area-chart" />
//         )}
//         {selectedWidget === "ribbon-chart" && <RibbonChartModule />}
//         {selectedWidget === "matrix-table-chart" && <MatrixTableChartModule />}
//       </div>
//       {/* <ProjectConfiguration /> */}
//     </div>
//   );
// };
// export default StaffEmployeeProjectBuilder;
