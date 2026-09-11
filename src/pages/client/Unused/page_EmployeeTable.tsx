// import { Eye, Edit, Trash2 } from "lucide-react";
// import { UserType } from "@/types/Auth/Auth";
// import { useLazyGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
// import { useEffect, useState, useMemo } from "react";

// // Project interface
// export interface Project {
//   id: string;
//   programId: string;
//   name: string;
//   description: string;
//   status: string;
//   priority: string;
//   startDate: string;
//   deadline: string;
//   progress: number;
//   managerId: string;
//   chartList: unknown[];
//   estimatedCompletedDate: string;
//   projectCompleteDate: string | null;
//   currentRate: string;
//   budget: string;
//   latitude: number | null;
//   longitude: number | null;
//   createdAt: string;
//   updatedAt: string;
// }

// interface ITableProps {
//   employees: UserType[];
//   visibleColumns?: string[];
//   handleViewClick: (employeeId: string) => void;
//   handleEditClick?: (employee: UserType) => void;
//   handleDeleteEmployee?: (id: string) => void;
//   handleSort?: (field: string) => void;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
//   getRoleBadgeColor: (role: string) => string;
//   getStatusBadgeColor?: (level: string) => string;
// }

// const EmployeeTable = ({
//   employees,
//   visibleColumns = [
//     "employeeName",
//     "email",
//     "role",
//     "projects",
//     "lastActive",
//     "level",
//     "action",
//   ],
//   handleViewClick,
//   handleEditClick,
//   handleDeleteEmployee,
//   handleSort,
//   sortBy,
//   sortOrder,
//   getRoleBadgeColor,
//   getStatusBadgeColor,
// }: ITableProps) => {

  
//   const [employeeProjects, setEmployeeProjects] = useState<
//     Record<string, Project[]>
//   >({});
//   const [isLoadingProjects, setIsLoadingProjects] = useState(false);
//   const [getProjects] = useLazyGetAllProjectsQuery();

//   // Fetch projects for all employees in parallel
//   useEffect(() => {
//     const fetchProjectsForEmployees = async () => {
//       setIsLoadingProjects(true);

//       const entries = await Promise.all(
//         employees.map(async (employee) => {
//           const queryParams =
//             employee.role === "MANAGER"
//               ? { managerId: employee.id }
//               : employee.role === "VIEWER"
//               ? { viewerId: employee.id }
//               : { employeeId: employee.id };

//           try {
//             const result = await getProjects(queryParams).unwrap();
//             return [employee.id, result?.data || []] as const;
//           } catch {
//             return [employee.id, []] as const;
//           }
//         })
//       );

//       setEmployeeProjects(Object.fromEntries(entries));
//       setIsLoadingProjects(false);
//     };

//     if (employees.length) {
//       fetchProjectsForEmployees();
//     }
//   }, [employees, getProjects]);

//   // Memoize derived project stats
//   const employeeProjectStats = useMemo(() => {
//     const stats: Record<string, { count: number }> = {};
//     for (const employeeId in employeeProjects) {
//       const projects = employeeProjects[employeeId] ?? [];
//       stats[employeeId] = { count: projects.length };
//     }
//     return stats;
//   }, [employeeProjects]);
//   console.log(employeeProjectStats);

//   const renderSortIcon = (field: string) => {
//     if (sortBy !== field) return null;
//     return sortOrder === "asc" ? " ▲" : " ▼";
//   };

//   const sortableHeader = (label: string, field: string, className = "") => (
//     <th
//       onClick={() => handleSort?.(field)}
//       className={`px-6 py-3 text-left cursor-pointer select-none ${className}`}
//     >
//       <span className="inline-flex items-center text-sm font-medium text-gray-700">
//         {label} {renderSortIcon(field)}
//       </span>
//     </th>
//   );

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full">
//         <thead className="bg-gray-50">
//           <tr>
//             {visibleColumns.includes("employeeName") &&
//               sortableHeader("Employee Name", "userName")}
//             {visibleColumns.includes("email") &&
//               sortableHeader("Email", "email")}
//             {visibleColumns.includes("role") && sortableHeader("Role", "role")}
//             {visibleColumns.includes("projects") &&
//               sortableHeader("Projects", "projects")}
//             {visibleColumns.includes("lastActive") &&
//               sortableHeader("Last Active", "updatedAt")}
//             {visibleColumns.includes("level") &&
//               sortableHeader("Status", "status")}
//             {visibleColumns.includes("action") && (
//               <th className="px-6 py-3 text-left">Action</th>
//             )}
//           </tr>
//         </thead>

//         <tbody className="bg-white divide-y divide-gray-200">
//           {employees?.map((employee) => {
//             const projectStats = employeeProjectStats[employee.id];

//             return (
//               <tr
//                 key={employee.id}
//                 className="hover:bg-gray-50 transition-colors"
//               >
//                 {visibleColumns.includes("employeeName") && (
//                   <td className="px-6 py-4 align-middle">
//                     <div className="flex items-center">
//                       <img
//                         src={employee?.profileImage || ""}
//                         alt="Employee Avatar"
//                         className="w-10 h-10 rounded-full mr-3 bg-gray-100"
//                       />
//                       <span className="text-sm font-medium text-gray-900">
//                         {employee?.name}
//                       </span>
//                     </div>
//                   </td>
//                 )}

//                 {visibleColumns.includes("email") && (
//                   <td className="px-6 py-4 text-sm text-gray-600 align-middle">
//                     {employee.email}
//                   </td>
//                 )}

//                 {visibleColumns.includes("role") && (
//                   <td className="px-6 py-4 align-middle">
//                     <span
//                       className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
//                         employee.role
//                       )}`}
//                     >
//                       {employee.role}
//                     </span>
//                   </td>
//                 )}

//                 {visibleColumns.includes("projects") && (
//                   <td className="px-6 py-4 align-middle">
//                     {isLoadingProjects ? (
//                       <span className="text-xs text-gray-400">Loading...</span>
//                     ) : (
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-900">
//                           {projectStats?.count ?? 0}
//                         </span>
//                         <span className="text-xs text-gray-500">
//                           {projectStats?.count === 1 ? "project" : "projects"}
//                         </span>
//                       </div>
//                     )}
//                   </td>
//                 )}

//                 {visibleColumns.includes("lastActive") && (
//                   <td className="px-6 py-4 text-sm text-gray-600 align-middle">
//                     {employee.updatedAt
//                       ? new Date(employee.updatedAt).toLocaleDateString()
//                       : "N/A"}
//                   </td>
//                 )}

//                 {visibleColumns.includes("level") && getStatusBadgeColor && (
//                   <td className="px-6 py-4 align-middle">
//                     <span
//                       className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
//                         employee.userStatus === "ACTIVE"
//                           ? "Active"
//                           : "In Active"
//                       )}`}
//                     >
//                       {employee.userStatus === "ACTIVE"
//                         ? "Active"
//                         : "In Active"}
//                     </span>
//                   </td>
//                 )}

//                 {visibleColumns.includes("action") && (
//                   <td className="px-6 py-4 align-middle">
//                     <div className="flex gap-2">
//                       {handleViewClick && (
//                         <button
//                           onClick={() => handleViewClick(employee.id)}
//                           className="p-1 text-blue-500"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                       )}
//                       {handleEditClick && (
//                         <button
//                           className="p-1 text-green-600"
//                           onClick={() => handleEditClick(employee)}
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                       )}
//                       {handleDeleteEmployee && (
//                         <button
//                           className="p-1 text-red-600"
//                           onClick={() => handleDeleteEmployee(employee.id)}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default EmployeeTable;
