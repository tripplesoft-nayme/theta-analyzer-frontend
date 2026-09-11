// import { useState } from "react";

// import DoughnutChart from "@/Common/Charts/DoughnutChart";
// import HeatmapChart from "@/Common/Charts/HeatmapChart";
// import RadarCharts from "@/Common/Charts/RadarChart";
// import ProjectStats from "@/components/client/ProgramBuilder/ProjectStats";
// import ProjectWidget from "@/Common/Charts/CompletedCharts/Widgets/ProjectWidget";
// // import ProgressRing from "@/Common/Charts/ProgressRingTest";
// // import HorizontalBarChart from "@/Common/Charts/HorizontalBarChart";
// import GanttChart from "@/Common/Charts/GanttChart/GanttChart";

// import LineChartModule from "@/Common/Charts/CompletedCharts/LineChart/LineChartModule";
// import ChartModuleOne from "@/Common/Charts/CompletedCharts/ChartModule/ChartModuleOne";
// // import ChartModuleTwo from "@/components/client/ProjectBuilder/chartModules/ChartModuleTwo";
// import PieChartModule from "../../Common/Charts/CompletedCharts/PieChart/PieChartModule";
// import HorizontalBarChartModule from "../../Common/Charts/CompletedCharts/HorizontalBarChart/HorizontalBarChartModule";
// import ProgressRingModule from "./../../components/client/ProjectBuilder/chartModules/ProgressRingModule";
// import GaugeChartModule from "./../../components/client/ProjectBuilder/chartModules/GaugeChartModule";
// import HistogramChartModule from "../../Common/Charts/CompletedCharts/Histogram/HistogramChartModule";
// import BubbleChartModule from "./../../components/client/ProjectBuilder/chartModules/BubbleChartModule";
// import ColumnBarChartModule from "@/Common/Charts/CompletedCharts/ColumnChart/ColumnBarChartModule";
// import FunnelChartModule from "@/components/client/ProjectBuilder/chartModules/FunnelChartModule";
// import ScatterChartModule from "@/components/client/ProjectBuilder/chartModules/ScatterChartModule";
// import ParetoChartModule from "@/components/client/ProjectBuilder/chartModules/ParetoChartModule";
// import RadarChartModule from "@/components/client/ProjectBuilder/chartModules/RadarChartModule";
// import WaterfallChartModule from "@/components/client/ProjectBuilder/chartModules/WaterfallChartModule";
// import CandleChartModule from "./../../components/client/ProjectBuilder/chartModules/CandleChartModule";
// import StackedBarChartModule from "@/Common/Charts/CompletedCharts/StackedBarChart/StackedBarChartModule";
// import RibbonChartModule from "@/Common/Charts/CompletedCharts/Ribbon/RibbonChartModule";
// import MatrixTableChartModule from "@/Common/Charts/CompletedCharts/MatrixTable/MatrixTableChartModule";

// const StaffManagerProjectBuilder = () => {
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
//   const handleWidgetDelete = (widgetId: string) => {
//     if (selectedWidget === widgetId) {
//       setSelectedWidget("");
//       setActiveWidget("KPI widget");
//     }
//   };

//   return (
//     <div className="flex gap-6">
//       <ProjectWidget
//         onWidgetSelect={handleWidgetSelect}
//         selectedWidgets={selectedWidget ? [selectedWidget] : []}
//       />
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

//         {selectedWidget === "bar-chart" && (
//           <StackedBarChartModule
//             onDelete={() => handleWidgetDelete("bar-chart")}
//           />
//         )}
//         {selectedWidget === "progress-ring" && <ProgressRingModule />}

//         {selectedWidget === "pie-chart" && <PieChartModule />}

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

//         {selectedWidget === "heat-map-chart" && (
//           <ChartModuleOne chartName="heat-map-chart" />
//         )}

//         {selectedWidget === "area-chart" && (
//           <ChartModuleOne chartName="area-chart" />
//         )}

//         {selectedWidget === "gauge-chart" && <GaugeChartModule />}

//         {selectedWidget === "histogram-chart" && <HistogramChartModule />}

//         {selectedWidget === "bubble-chart" && <BubbleChartModule />}
//         {selectedWidget === "column-chart" && <ColumnBarChartModule />}
//         {selectedWidget === "funnel-chart" && <FunnelChartModule />}
//         {selectedWidget === "scatter-chart" && <ScatterChartModule />}
//         {selectedWidget === "pareto-chart" && <ParetoChartModule />}
//         {selectedWidget === "waterfall-chart" && <WaterfallChartModule />}
//         {selectedWidget === "radar-chart" && <RadarChartModule />}
//         {selectedWidget === "candle-chart" && <CandleChartModule />}
//         {selectedWidget === "ribbon-chart" && (
//           <RibbonChartModule
//             onDelete={() => handleWidgetDelete("ribbon-chart")}
//           />
//         )}
//         {selectedWidget === "matrix-table-chart" && (
//           <MatrixTableChartModule
//             onDelete={() => handleWidgetDelete("matrix-table-chart")}
//           />
//         )}
//       </div>
//       {/* <ProjectConfiguration /> */}
//     </div>
//   );
// };
// export default StaffManagerProjectBuilder;
