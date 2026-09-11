// import { useState } from "react";
// import { IEmployeeProfile } from "@/types";

// interface IEmployeeProps {
//   employees?: IEmployeeProfile[];
// }

// const EmployeeTask = ({ employees: propEmployees }: IEmployeeProps) => {
//   const data = propEmployees || [];

//   const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
//   const allSelected =
//     data.length > 0 && selectedEmployees.length === data.length;

//   const handleSelectAll = () => {
//     if (allSelected) {
//       setSelectedEmployees([]);
//     } else {
//       setSelectedEmployees(data.map((emp) => emp.id as string));
//     }
//   };

//   const handleSelectEmployee = (id: string) => {
//     setSelectedEmployees((prev) =>
//       prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div>
//       <div className="bg-white">
//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-left border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-3 text-lg font-semibold text-gray-700 border-b border-border">
//                   <input
//                     type="checkbox"
//                     checked={allSelected}
//                     onChange={handleSelectAll}
//                     className="accent-black cursor-pointer mr-2"
//                   />{" "}
//                   Employee Name
//                 </th>
//                 <th className="px-6 py-3 text-lg font-semibold text-gray-700">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-lg font-semibold text-gray-700">
//                   Last Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((emp) => (
//                 <tr
//                   key={emp.id}
//                   className={`hover:bg-gray-50 transition-colors border-b border-border ${
//                     selectedEmployees.includes(emp.id as string)
//                       ? "bg-gray-100"
//                       : ""
//                   }`}
//                 >
//                   <td className="px-6 py-3 align-middle">
//                     <div className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedEmployees.includes(emp.id as string)}
//                         onChange={() => handleSelectEmployee(emp.id as string)}
//                         className="accent-black cursor-pointer"
//                       />
//                       <span className="text-xl">
//                         <img
//                           className="size-10 rounded-full"
//                           src={emp.user.profileImage || ""}
//                           alt="Employee Avater"
//                         />
//                       </span>
//                       <span className="text-gray-800 font-medium">
//                         {emp.user.name}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-3 align-middle text-gray-600">{emp.user.role}</td>
//                   <td className="px-6 py-3 align-middle text-gray-500">
//                     {emp.user.lastActive ? "Active" : "Inactive"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeTask;
