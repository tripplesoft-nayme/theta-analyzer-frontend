// import React, { useEffect, useState } from "react";

// import EmployeeTable from "@/components/client/Employee/EmployeeTable";
// import EmployeeListTask from "@/components/client/Employee/EmployeeListTask";
// import DianneRussellTask from "@/components/client/Employee/DianneRussellTask";

// import EmployeeHeader from "@/components/client/Employee/EmployeeHeader";
// import EditEmployeeModal from "@/components/client/Employee/EditEmployeeModal";

// import { IEmployee } from "@/types";

// const employees = [
//   {
//     id: "1",
//     name: "Dianne Russell",
//     email: "tanya.hill@example.com",
//     role: "Manager",
//     projects: [
//       "Carlyle Hat",
//       "Carlyle Hat",
//       "Carlyle Hat",
//       "Carlyle Hat",
//     ],
//     lastActive: "4/4/18",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "2",
//     name: "Brooklyn Simmons",
//     email: "curtis.weaver@example.com",
//     role: "Staff",
//     projects: ["Carlyle Hat"],
//     lastActive: "12/4/17",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "3",
//     name: "Darlene Robertson",
//     email: "michelle.rivera@example.com",
//     role: "Viewer",
//     projects: ["Carlyle Hat"],
//     lastActive: "1/31/14",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "4",
//     name: "Arlene McCoy",
//     email: "jackson.graham@example.com",
//     role: "Staff",
//     projects: ["Carlyle Hat"],
//     lastActive: "3/4/16",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "5",
//     name: "Marvin McKinney",
//     email: "bill.sanders@example.com",
//     role: "Staff",
//     projects: ["Carlyle Hat"],
//     lastActive: "5/7/16",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "6",
//     name: "Jane Cooper",
//     email: "nathan.roberts@example.com",
//     role: "Viewer",
//     projects: ["Carlyle Hat"],
//     lastActive: "2/11/12",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "7",
//     name: "Theresa Webb",
//     email: "tim.jennings@example.com",
//     role: "Viewer",
//     projects: ["Carlyle Hat"],
//     lastActive: "6/19/14",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "8",
//     name: "Darrell Steward",
//     email: "deanna.curtis@example.com",
//     role: "Manager",
//     projects: ["Carlyle Hat"],
//     lastActive: "9/18/16",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "9",
//     name: "Jacob Jones",
//     email: "willie.jennings@example.com",
//     role: "Manager",
//     projects: ["Phoenix App", "Delta Website"],
//     lastActive: "7/11/19",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "10",
//     name: "Savannah Nguyen",
//     email: "dolores.chambers@example.com",
//     role: "Viewer",
//     projects: ["Quantum Project"],
//     lastActive: "8/30/14",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "11",
//     name: "Devon Lane",
//     email: "debra.holt@example.com",
//     role: "Viewer",
//     projects: ["Alpha Beta", "Gamma Delta"],
//     lastActive: "5/27/15",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "12",
//     name: "Robert Fox",
//     email: "kenzi.lawson@example.com",
//     role: "Viewer",
//     projects: ["Echo Platform"],
//     lastActive: "5/19/12",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "13",
//     name: "Albert Flores",
//     email: "alma.lawson@example.com",
//     role: "Viewer",
//     projects: ["Sierra Mobile"],
//     lastActive: "10/6/13",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "14",
//     name: "Kathryn Murphy",
//     email: "felicia.reid@example.com",
//     role: "Viewer",
//     projects: ["Tango API"],
//     lastActive: "1/15/12",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "15",
//     name: "Wade Warren",
//     email: "michael.mitc@example.com",
//     role: "Viewer",
//     projects: ["Bravo System"],
//     lastActive: "1/15/12",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "16",
//     name: "Kristin Watson",
//     email: "nevaeh.simmons@example.com",
//     role: "Viewer",
//     projects: ["Victor Cloud"],
//     lastActive: "1/15/12",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "17",
//     name: "Eleanor Pena",
//     email: "eleanor.pena@example.com",
//     role: "Staff",
//     projects: ["Whiskey Analytics", "X-Ray Tools"],
//     lastActive: "3/22/20",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "18",
//     name: "Cameron Williamson",
//     email: "cameron.williamson@example.com",
//     role: "Staff",
//     projects: ["Yankee Dashboard"],
//     lastActive: "8/15/19",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "19",
//     name: "Jenny Wilson",
//     email: "jenny.wilson@example.com",
//     role: "Manager",
//     projects: ["Zulu Network", "Alpha Prime"],
//     lastActive: "11/3/21",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "20",
//     name: "Ralph Edwards",
//     email: "ralph.edwards@example.com",
//     role: "Staff",
//     projects: ["Beta Launch"],
//     lastActive: "6/12/18",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "21",
//     name: "Courtney Henry",
//     email: "courtney.henry@example.com",
//     role: "Viewer",
//     projects: ["Charlie Protocol"],
//     lastActive: "2/8/17",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "22",
//     name: "Annette Black",
//     email: "annette.black@example.com",
//     role: "Staff",
//     projects: ["Delta Force", "Echo Point"],
//     lastActive: "9/30/20",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "23",
//     name: "Ronald Richards",
//     email: "ronald.richards@example.com",
//     role: "Manager",
//     projects: ["Foxtrot Initiative"],
//     lastActive: "4/17/22",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "24",
//     name: "Cody Fisher",
//     email: "cody.fisher@example.com",
//     role: "Staff",
//     projects: ["Golf Suite", "Hotel Management"],
//     lastActive: "12/5/19",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "25",
//     name: "Esther Howard",
//     email: "esther.howard@example.com",
//     role: "Viewer",
//     projects: ["India Connect"],
//     lastActive: "7/28/16",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "26",
//     name: "Leslie Alexander",
//     email: "leslie.alexander@example.com",
//     role: "Manager",
//     projects: ["Juliet Framework", "Kilo Base"],
//     lastActive: "1/12/23",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "27",
//     name: "Guy Hawkins",
//     email: "guy.hawkins@example.com",
//     role: "Staff",
//     projects: ["Lima Portal"],
//     lastActive: "10/14/21",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "28",
//     name: "Floyd Miles",
//     email: "floyd.miles@example.com",
//     role: "Viewer",
//     projects: ["Mike System"],
//     lastActive: "3/7/15",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "29",
//     name: "Jerome Bell",
//     email: "jerome.bell@example.com",
//     role: "Staff",
//     projects: ["November Tech", "Oscar Platform"],
//     lastActive: "5/23/20",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "30",
//     name: "Kristin Watson",
//     email: "kristin.watson2@example.com",
//     role: "Manager",
//     projects: ["Papa Solutions"],
//     lastActive: "8/9/22",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "31",
//     name: "Bessie Cooper",
//     email: "bessie.cooper@example.com",
//     role: "Staff",
//     projects: ["Quebec Labs", "Romeo Engine"],
//     lastActive: "11/17/18",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "32",
//     name: "Dianne Russell",
//     email: "dianne.russell2@example.com",
//     role: "Viewer",
//     projects: ["Sierra Vista"],
//     lastActive: "6/4/14",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "33",
//     name: "Marvin McKinney",
//     email: "marvin.mckinney2@example.com",
//     role: "Staff",
//     projects: ["Tango Works", "Uniform Build"],
//     lastActive: "2/19/21",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "34",
//     name: "Jane Cooper",
//     email: "jane.cooper2@example.com",
//     role: "Manager",
//     projects: ["Victor Labs"],
//     lastActive: "9/11/23",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "35",
//     name: "Robert Fox",
//     email: "robert.fox2@example.com",
//     role: "Staff",
//     projects: ["Whiskey Digital"],
//     lastActive: "4/8/19",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "36",
//     name: "Brooklyn Simmons",
//     email: "brooklyn.simmons2@example.com",
//     role: "Viewer",
//     projects: ["X-Ray Vision"],
//     lastActive: "12/29/17",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "37",
//     name: "Arlene McCoy",
//     email: "arlene.mccoy2@example.com",
//     role: "Manager",
//     projects: ["Yankee Enterprise", "Zulu Gateway"],
//     lastActive: "7/6/24",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "38",
//     name: "Theresa Webb",
//     email: "theresa.webb2@example.com",
//     role: "Staff",
//     projects: ["Alpha Integration"],
//     lastActive: "1/25/18",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "39",
//     name: "Darrell Steward",
//     email: "darrell.steward2@example.com",
//     role: "Viewer",
//     projects: ["Bravo Testing"],
//     lastActive: "10/2/16",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "40",
//     name: "Jacob Jones",
//     email: "jacob.jones2@example.com",
//     role: "Staff",
//     projects: ["Charlie Deploy", "Delta Ops"],
//     lastActive: "3/15/22",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "41",
//     name: "Savannah Nguyen",
//     email: "savannah.nguyen2@example.com",
//     role: "Manager",
//     projects: ["Echo Hub"],
//     lastActive: "8/21/23",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "42",
//     name: "Devon Lane",
//     email: "devon.lane2@example.com",
//     role: "Staff",
//     projects: ["Foxtrot Core"],
//     lastActive: "6/13/20",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "43",
//     name: "Albert Flores",
//     email: "albert.flores2@example.com",
//     role: "Viewer",
//     projects: ["Golf Stream"],
//     lastActive: "11/8/15",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "44",
//     name: "Kathryn Murphy",
//     email: "kathryn.murphy2@example.com",
//     role: "Staff",
//     projects: ["Hotel Central", "India Bridge"],
//     lastActive: "4/26/21",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "45",
//     name: "Wade Warren",
//     email: "wade.warren2@example.com",
//     role: "Manager",
//     projects: ["Juliet Command"],
//     lastActive: "12/18/22",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "46",
//     name: "Kristin Watson",
//     email: "kristin.watson3@example.com",
//     role: "Staff",
//     projects: ["Kilo Network"],
//     lastActive: "9/4/19",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "47",
//     name: "Eleanor Pena",
//     email: "eleanor.pena2@example.com",
//     role: "Viewer",
//     projects: ["Lima Flow"],
//     lastActive: "5/16/17",
//     level: "In Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "48",
//     name: "Cameron Williamson",
//     email: "cameron.williamson2@example.com",
//     role: "Staff",
//     projects: ["Mike Protocol", "November Suite"],
//     lastActive: "2/3/23",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "49",
//     name: "Jenny Wilson",
//     email: "jenny.wilson2@example.com",
//     role: "Manager",
//     projects: ["Oscar Drive"],
//     lastActive: "7/14/24",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: "50",
//     name: "Ralph Edwards",
//     email: "ralph.edwards2@example.com",
//     role: "Staff",
//     projects: ["Papa Connect", "Quebec Engine"],
//     lastActive: "10/27/21",
//     level: "Active",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
// ];

// const StaffEmployeeEmployees: React.FC = () => {
//   const [searchTerm] = useState<string>("");
//   const [filterBy, setFilterBy] = useState<string>("all");
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [showFilterDropdown, setShowFilterDropdown] =
//     useState<boolean>(false);
//   const [selectedEmployees, setSelectedEmployees] = useState<
//     Set<string>
//   >(new Set());
//   const [selectAll, setSelectAll] = useState<boolean>(false);
//   const [employeeList, setEmployeeList] =
//     useState<IEmployee[]>(employees as IEmployee[]);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [editEmployee, setEditEmployee] = useState<IEmployee | null>(
//     null
//   );
//   const [activeTab, setActiveTab] = useState<"tables" | "task">(
//     "tables"
//   );

//   const itemsPerPage = 17;

//   const filteredEmployees = employeeList.filter((employee) => {
//     const matchesSearch =
//       employee.name
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       employee.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter =
//       filterBy === "all" ||
//       employee.level.toLowerCase() === filterBy.toLowerCase();
//     return matchesSearch && matchesFilter;
//   });

//   const totalPages = Math.ceil(
//     filteredEmployees.length / itemsPerPage
//   );
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentEmployees = filteredEmployees.slice(
//     startIndex,
//     endIndex
//   );

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedEmployees(new Set());
//       setSelectAll(false);
//     } else {
//       setSelectedEmployees(
//         new Set(currentEmployees.map((emp) => emp.id as string))
//       );
//       setSelectAll(true);
//     }
//   };

//   const handleSelectEmployee = (employeeId: string) => {
//     const newSelected = new Set(selectedEmployees);
//     if (newSelected.has(employeeId)) {
//       newSelected.delete(employeeId);
//     } else {
//       newSelected.add(employeeId);
//     }
//     setSelectedEmployees(newSelected);
//     setSelectAll(
//       newSelected.size === currentEmployees.length &&
//         currentEmployees.every((emp) => newSelected.has(emp.id as string))
//     );
//   };

//   const handleDeleteEmployee = (employeeId: string) => {
//     setEmployeeList((prev) =>
//       prev.filter((emp) => emp.id !== employeeId)
//     );
//   };

//   const handleEditClick = (employee: IEmployee) => {
//     setEditEmployee(employee);
//     setEditModalOpen(true);
//   };

//   const handleEditChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     if (!editEmployee) return;
//     const { name, value } = e.target;
//     setEditEmployee({ ...editEmployee, [name]: value });
//   };

//   const handleEditSave = () => {
//     if (!editEmployee) return;
//     setEmployeeList((prev) =>
//       prev.map((emp) =>
//         emp.id === editEmployee.id ? editEmployee : emp
//       )
//     );
//     setEditModalOpen(false);
//     setEditEmployee(null);
//   };

//   const handleEditCancel = () => {
//     setEditModalOpen(false);
//     setEditEmployee(null);
//   };
//   const handleDeleteSelected = () => {
//     setEmployeeList((prev) =>
//       prev.filter((emp) => !selectedEmployees.has(emp.id as string))
//     );
//     setSelectedEmployees(new Set());
//     setSelectAll(false);
//   };

//   // Reset to first page when search or filter changes
//   useEffect(() => {
//     setCurrentPage(1);
//     setSelectedEmployees(new Set());
//     setSelectAll(false);
//   }, [searchTerm, filterBy]);

//   const getRoleBadgeColor = (role: string): string => {
//     switch (role) {
//       case "Manager":
//         return "bg-purple-100 text-purple-800 border-purple-200";
//       case "Staff":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "Viewer":
//         return "bg-gray-100 text-gray-800 border-gray-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStatusBadgeColor = (status: string): string => {
//     return status === "Active"
//       ? "bg-green-100 text-green-800 border-green-200"
//       : "bg-red-100 text-red-800 border-red-200";
//   };

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       const dropdown = document.getElementById("filter-dropdown");
//       if (dropdown && !dropdown.contains(e.target as Node)) {
//         setShowFilterDropdown(false);
//       }
//     };
//     if (showFilterDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showFilterDropdown]);

//   return (
//     <div className="my-10 flex gap-5">
//       <div
//         className={`${
//           activeTab === "task" ? "w-full" : "w-full"
//         } transition-all duration-300`}
//       >
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           {/* Header */}
//           <EmployeeHeader
//             selectedEmployees={selectedEmployees}
//             handleDeleteSelected={handleDeleteSelected}
//             activeTab={activeTab}
//             setActiveTab={setActiveTab}
//             showFilterDropdown={showFilterDropdown}
//             setShowFilterDropdown={setShowFilterDropdown}
//             filterBy={filterBy}
//             setFilterBy={setFilterBy}
//           />

//           {/* Table */}
//           {activeTab === "tables" ? (
//             <EmployeeTable
//               employees={currentEmployees}
//               selectedEmployees={selectedEmployees}
//               selectAll={selectAll}
//               handleSelectAll={handleSelectAll}
//               handleSelectEmployee={handleSelectEmployee}
//               handleEditClick={handleEditClick}
//               handleDeleteEmployee={handleDeleteEmployee}
//               getRoleBadgeColor={getRoleBadgeColor}
//               getStatusBadgeColor={getStatusBadgeColor}
//             />
//           ) : (
//             <EmployeeListTask employees={currentEmployees} />
//           )}

//           {/* Pagination */}
//           <div className="px-6 py-4 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-gray-500">
//                 Showing {startIndex + 1} to{" "}
//                 {Math.min(endIndex, filteredEmployees.length)} of{" "}
//                 {filteredEmployees.length} Files
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() =>
//                     setCurrentPage(Math.max(1, currentPage - 1))
//                   }
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Prev
//                 </button>

//                 {/* Page Numbers */}
//                 {Array.from(
//                   { length: Math.min(5, totalPages) },
//                   (_, i) => {
//                     let pageNum;
//                     if (totalPages <= 5) {
//                       pageNum = i + 1;
//                     } else if (currentPage <= 3) {
//                       pageNum = i + 1;
//                     } else if (currentPage >= totalPages - 2) {
//                       pageNum = totalPages - 4 + i;
//                     } else {
//                       pageNum = currentPage - 2 + i;
//                     }

//                     return (
//                       <button
//                         key={pageNum}
//                         onClick={() => setCurrentPage(pageNum)}
//                         className={`px-3 py-1 text-sm rounded ${
//                           currentPage === pageNum
//                             ? "bg-blue-600 text-white"
//                             : "border border-gray-300 hover:bg-gray-50"
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   }
//                 )}

//                 {totalPages > 5 && currentPage < totalPages - 2 && (
//                   <>
//                     <span className="px-3 py-1 text-sm text-gray-500">
//                       ...
//                     </span>
//                     <button
//                       onClick={() => setCurrentPage(totalPages)}
//                       className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
//                     >
//                       {totalPages}
//                     </button>
//                   </>
//                 )}

//                 <button
//                   onClick={() =>
//                     setCurrentPage(
//                       Math.min(totalPages, currentPage + 1)
//                     )
//                   }
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editModalOpen && editEmployee && (
//         <EditEmployeeModal
//           editEmployee={editEmployee}
//           handleEditChange={handleEditChange}
//           handleEditSave={handleEditSave}
//           handleEditCancel={handleEditCancel}
//         />
//       )}
//       {activeTab === "task" && (
//         <div className="w-full">
//           <DianneRussellTask />
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffEmployeeEmployees;


const StaffEmployeeEmployees = () => {
  return (
    <div>StaffEmployeeEmployees</div>
  )
}

export default StaffEmployeeEmployees
