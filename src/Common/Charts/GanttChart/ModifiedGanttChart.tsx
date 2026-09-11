// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useRef, useState, useMemo } from "react";
// import Gantt, {
//   ReactGanttRef,
//   Task,
//   Link,
//   GanttConfig,
//   gantt
// } from "@dhtmlx/trial-react-gantt";
// import "@dhtmlx/trial-react-gantt/dist/react-gantt.css";

// import {
//   Paperclip,
//   MessageSquare,
//   FileText,
//   Printer,
//   ChevronLeft,
//   Search,
//   Upload,
//   Download,
//   Share2,
//   MoreVertical,
//   Plus,
//   FolderPlus,
//   ListPlus,
//   Columns3,
// } from "lucide-react";

// /*   COLOR POOL FOR ROOT PROJECTS   */
// const PROJECT_COLORS = [
//   "#3b82f6", // Starting (Blue)
//   "#f97316", // Plinth Beam (Orange)
//   "#ec4899", // 1st Floor Slab (Rose)
//   "#6366f1", // 2nd Floor Slab (Indigo)
//   "#eab308", // 3rd Floor Slab (Yellow)
//   "#2563eb", // Terrace Floor Slab (Navy)
//   "#0d9488", // Finishing Plan (Teal)
// ];

// export interface GanttProps {
//   tasks: Task[];
//   links: Link[];
// }

// export default function ModifiedGanttChart({ tasks, links }: GanttProps) {
//   const ganttRef = useRef<ReactGanttRef>(null);
//   const [searchText, setSearchText] = useState("");
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [showColumnMenu, setShowColumnMenu] = useState(false);
  
//   const [visibleColumns, setVisibleColumns] = useState({
//     wbs: true,
//     info: true,
//     text: true,
//     duration: true,
//     start_date: true,
//     end_date: true,
//     owner: true,
//   });

//   // Filter tasks based on search text
//   const filteredTasks = useMemo(() => {
//     if (!searchText) return tasks;
//     const query = searchText.toLowerCase();
//     return tasks.filter(t => t.text?.toLowerCase().includes(query));
//   }, [tasks, searchText]);

//   const config: GanttConfig = {
//     grid_width: 600,
//     row_height: 40,
//     scale_height: 60,
//     date_format: "%Y-%m-%d %H:%i:%s",
//     order_branch: "marker",
//     order_branch_free: true,
//     grid_resize: true,
//     drag_move: true,
//     drag_resize: true,
//     drag_progress: true,
//     // Define columns based on visibility
//     columns: [
//         {
//             name: "wbs",
//             label: "All",
//             width: 40,
//             align: "center",
//             resize: true,
//             template: (task: any) => {
//                 // We use native gantt helper if available via ref, or fallback
//                 return task.id; 
//             },
//             hide: !visibleColumns.wbs
//         },
//         {
//             name: "info",
//             label: "Info",
//             width: 80,
//             align: "center",
//             resize: true,
//             template: () => `
//               <div class="info-icons-group">
//                 <span class="info-icon-wrapper" title="Attachments">📎</span>
//                 <span class="info-icon-wrapper" title="Discussions">💬</span>
//                 <span class="info-icon-wrapper" title="Documents">📄</span>
//               </div>
//             `,
//             hide: !visibleColumns.info
//         },
//         {
//             name: "text",
//             label: "Task name",
//             tree: true,
//             width: 250,
//             resize: true,
//             template: (task: any) => `<div class="task-name-cell"><span>${task.text}</span></div>`,
//             hide: !visibleColumns.text
//         },
//         {
//             name: "duration",
//             label: "Duration",
//             align: "center",
//             width: 100,
//             resize: true,
//             template: (task: any) => `${task.duration} Days`,
//             hide: !visibleColumns.duration
//         },
//         {
//             name: "start_date",
//             label: "Start Date",
//             align: "center",
//             width: 100,
//             resize: true,
//             hide: !visibleColumns.start_date
//         },
//         {
//             name: "owner",
//             label: "Assigned",
//             align: "center",
//             width: 120,
//             resize: true,
//             template: (task: any) => task.owner || "",
//             hide: !visibleColumns.owner
//         },
//         { name: "add", width: 44 }
//     ].filter(c => !c.hide),
//     scales: [
//         { unit: "month", step: 1, date: "%F %Y" },
//         { unit: "day", step: 1, date: "%d" },
//     ],
//   };

//   const handleBeforeRowDragEnd = (id: any, parent: any, tindex: any) => {
//     // Access native gantt via the trial package export if needed, 
//     // but the component usually passes the instance or we use the global 'gantt'
//     const instance = (ganttRef.current as any)?.getGanttInstance() || (window as any).gantt;
    
//     if (instance) {
//         instance.modalbox({
//             text: "Do you want to move the task or copy it?",
//             buttons: ["Move", "Copy", "Cancel"],
//             callback: (result: string) => {
//                 switch (result) {
//                     case "0":
//                         instance.moveTask(id, tindex, parent);
//                         break;
//                     case "1": {
//                         const task = instance.getTask(id);
//                         const clone = instance.copy(task);
//                         clone.id = instance.uid();
//                         instance.addTask(clone, parent, tindex);
//                         break;
//                     }
//                     case "2":
//                         break;
//                 }
//             }
//         });
//     }
//     return false;
//   };

//   return (
//     <div className="flex flex-col h-screen bg-[#F8FAFC]">
//       {/* Top Navigation Bar */}
//       <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-border">
//         <div className="flex items-center gap-4 text-gray-400">
//           <Paperclip size={18} className="cursor-pointer hover:text-gray-600" />
//           <MessageSquare
//             size={18}
//             className="cursor-pointer hover:text-gray-600"
//           />
//           <FileText size={18} className="cursor-pointer hover:text-gray-600" />
//           <Printer size={18} className="cursor-pointer hover:text-gray-600" />
//           <Share2 size={18} className="cursor-pointer hover:text-gray-600" />
//           <MoreVertical
//             size={18}
//             className="cursor-pointer hover:text-gray-600"
//           />
//         </div>

//         <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl px-12">
//           <div className="relative w-full group">
//             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//               <Search
//                 size={16}
//                 className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
//               />
//             </div>
//             <input
//               type="text"
//               placeholder="Search anything here..."
//               className="w-full bg-gray-50 border-none rounded-lg py-2 pl-10 pr-12 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//             />
//             <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//               <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400 font-medium">
//                 ⌘ K
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <button
//               onClick={() => setShowAddMenu(!showAddMenu)}
//               className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 transition-colors border border-border"
//             >
//               <Plus size={16} />
//               Add New
//             </button>
//             {showAddMenu && (
//               <>
//                 <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
//                   {/* These would need implementation via gantt API */}
//                   <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700">
//                     <FolderPlus size={16} className="text-blue-600" />
//                     <div>
//                       <div className="font-medium">New Project</div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="relative">
//             <button
//               onClick={() => setShowColumnMenu(!showColumnMenu)}
//               className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-border"
//             >
//               <Columns3 size={18} className="text-gray-600" />
//             </button>
//             {showColumnMenu && (
//               <>
//                 <div className="fixed inset-0 z-10" onClick={() => setShowColumnMenu(false)} />
//                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 px-2">
//                     <div className="px-2 py-1 text-xs font-bold text-gray-400">VISIBLE COLUMNS</div>
//                     {Object.keys(visibleColumns).map((key) => (
//                         <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
//                             <input 
//                                 type="checkbox" 
//                                 checked={(visibleColumns as any)[key]} 
//                                 onChange={() => setVisibleColumns(prev => ({...prev, [key]: !(prev as any)[key]}))}
//                             />
//                             <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
//                         </label>
//                     ))}
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-border">
//             <Upload size={18} className="text-gray-600" />
//           </div>
//           <div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-border">
//             <Download size={18} className="text-gray-600" />
//           </div>
//           <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 transition-colors border border-border text-nowrap">
//             <ChevronLeft size={16} /> Return
//           </button>
//           <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95">
//             Publish
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-hidden relative border-t border-border">
//         <Gantt
//           ref={ganttRef}
//           tasks={filteredTasks}
//           links={links}
//           config={config}
//           onBeforeRowDragEnd={handleBeforeRowDragEnd}
//           templates={{
//             task_class: (_s: Date, _e: Date, task: any) => {
//               if (task.parent === 0 || !task.parent) return "bar-root-0";
//               return "";
//             }
//           }}
//         />
//       </div>

//       <style>{`
//         .gantt_container { border: none !important; font-family: 'Inter', sans-serif !important; }
//         .info-icons-group { display: flex; gap: 6px; justify-content: center; height: 100%; align-items: center; }
//         .info-icon-wrapper { 
//           display: flex; align-items: center; justify-content: center; 
//           width: 20px; height: 20px; border-radius: 4px; background: #F1F5F9; 
//           cursor: pointer; transition: all 0.2s; font-size: 11px; color: #64748B; border: 1px solid #E2E8F0;
//         }
//         .info-icon-wrapper:hover { background: #E2E8F0; color: #3B82F6; }
//         .task-name-cell { display: flex; align-items: center; padding-left: 8px; font-weight: 500; color: #334155; }
        
//         .bar-root-0 { background: #3b82f6 !important; border-color: #3b82f6 !important; }
//         .gantt_task_line { border-radius: 4px !important; }
        
//         /* Modern Scrollbars */
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-track { background: #f1f5f9; }
//         ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
//         ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

//         .gantt_resizer { background: #f8fafc !important; width: 6px !important; border-left: 1px solid #e2e8f0 !important; cursor: col-resize !important; }
//         .gantt_resizer:hover { background: #cbd5e1 !important; }
//       `}</style>
//     </div>
//   );
// }
