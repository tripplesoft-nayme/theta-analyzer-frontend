// import { Dispatch, SetStateAction } from "react";
// import {
//   ChevronDown,
//   Filter,
//   // ListChecks,
//   LucideTable2,
//   Search,
// } from "lucide-react";

// interface IEmployeeHeaderProps {
//   selectedEmployees: Set<string>;
//   handleDeleteSelected: () => void;
//   activeTab: "tables" | "task";
//   setActiveTab: Dispatch<SetStateAction<"tables" | "task">>;
//   showFilterDropdown: boolean;
//   setShowFilterDropdown: (show: boolean) => void;
//   filterBy: string;
//   setFilterBy: (filter: string) => void;
//   searchTerm: string;
//   setSearchTerm: Dispatch<SetStateAction<string>>;
//   setJoinedDateFrom: Dispatch<SetStateAction<string | undefined>>;
//   setJoinedDateTo: Dispatch<SetStateAction<string | undefined>>;
// }

// export default function EmployeeTableHeader({
//   selectedEmployees,
//   handleDeleteSelected,
//   activeTab,
//   setActiveTab,
//   showFilterDropdown,
//   setShowFilterDropdown,
//   filterBy,
//   setFilterBy,
//   searchTerm,
//   setSearchTerm,
//   setJoinedDateFrom,
//   setJoinedDateTo,
// }: IEmployeeHeaderProps) {
//   return (
//     <div className="px-6 py-4 border-b border-gray-200">
//       <div className="flex items-center justify-between">
//         {/* Left: Title + Selected Actions */}
//         <div className="flex items-center space-x-4">
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Employees List
//           </h1>

//           {selectedEmployees.size > 0 && (
//             <div className="flex items-center space-x-3">
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                 {selectedEmployees.size} selected
//               </span>
//               <button
//                 onClick={handleDeleteSelected}
//                 className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
//               >
//                 Delete Selected
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Right: Search + Tabs + Filter */}
//         <div className="flex items-center space-x-4">
//           {/* Search */}
//           {activeTab === "task" ? (
//             <button className="p-2 rounded-lg">
//               <Search className="w-6 h-6 text-gray-600" />
//             </button>
//           ) : (
//             <div className="relative">
//               <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
//               <input
//                 value={searchTerm}
//                 type="text"
//                 placeholder="Search By name..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           )}

//           {/* Tabs */}
//           <button
//             onClick={() => setActiveTab("tables")}
//             className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
//               activeTab === "tables"
//                 ? "bg-black text-white"
//                 : "border border-gray-300 text-gray-900"
//             }`}
//           >
//             <LucideTable2 className="w-4 h-4" />
//             <span>Tables</span>
//           </button>

//           {/* <button
//             onClick={() => setActiveTab("task")}
//             className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
//               activeTab === "task"
//                 ? "bg-black text-white"
//                 : "border border-gray-300 text-gray-900"
//             }`}
//           >
//             <ListChecks className="w-4 h-4" />
//             <span>Task</span>
//           </button> */}

//           {/* Filter Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => setShowFilterDropdown(!showFilterDropdown)}
//               className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
//             >
//               <Filter className="w-4 h-4" />
//               <span>Filter By</span>
//               <ChevronDown className="w-4 h-4" />
//             </button>

//             {showFilterDropdown && (
//               <div
//                 id="filter-dropdown"
//                 className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
//               >
//                 {/* By Status */}
//                 <div className="py-2">
//                   <h3 className="text-sm font-semibold text-gray-900 px-4 pb-2">
//                     By Status:
//                   </h3>

//                   {["active", "banned", "deleted", "suspended"].map(
//                     (status) => (
//                       <div
//                         key={status}
//                         className="flex items-center gap-2 pl-6 py-1"
//                       >
//                         <input
//                           type="radio"
//                           name="status" // group radio buttons
//                           value={status}
//                           id={status}
//                           checked={
//                             filterBy.toUpperCase() === status.toUpperCase()
//                           }
//                           onChange={() => setFilterBy(status.toUpperCase())}
//                         />
//                         <label
//                           htmlFor={status}
//                           className="text-sm text-gray-900 capitalize"
//                         >
//                           {status}
//                         </label>
//                       </div>
//                     )
//                   )}

//                   {/* Option to clear filter */}
//                   <div className="flex items-center gap-2 pl-6 py-1">
//                     <input
//                       type="radio"
//                       name="status"
//                       value="all"
//                       id="all"
//                       checked={filterBy === "all"}
//                       onChange={() => setFilterBy("")}
//                     />
//                     <label htmlFor="all" className="text-sm text-gray-900">
//                       All
//                     </label>
//                   </div>
//                 </div>

//                 {/* Joined Date Filters */}
//                 <div className="py-2 px-4">
//                   <h3 className="text-sm font-semibold text-gray-900 pb-2">
//                     Joined Date:
//                   </h3>
//                   <input
//                     type="date"
//                     className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
//                     onChange={(e) => setJoinedDateFrom(e.target.value)}
//                   />
//                   <input
//                     type="date"
//                     className="border border-gray-300 rounded px-2 py-1 w-full"
//                     onChange={(e) => setJoinedDateTo(e.target.value)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
