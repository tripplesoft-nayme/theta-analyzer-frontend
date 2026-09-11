import { ActivityLog } from '@/types/customer';
import { useState, useMemo, ReactNode } from 'react';

interface ActivityLogsProps {
  activityLogs: ActivityLog[];
}
type ActionType =
  | "Update"
  | "Suspend"
  | "Edit"
  | "Export"
  | "Create"
  | "Login"
  | "Delete"
  | "Default";

const ClientSingleActivityLog: React.FC<ActivityLogsProps> = ({ activityLogs }) => {
  // Color mapping for action badges
  const actionColors: Record<ActionType, string> = {
    Update: "bg-yellow-100 text-yellow-700",
    Suspend: "bg-red-100 text-red-700",
    Edit: "bg-orange-100 text-orange-700",
    Export: "bg-purple-100 text-purple-700",
    Create: "bg-green-100 text-green-700",
    Login: "bg-blue-100 text-blue-700",
    Delete: "bg-gray-100 text-gray-700",
    Default: "bg-gray-100 text-gray-600",
  };

  // Typed Badge component
  const Badge: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return activityLogs.slice(startIndex, endIndex);
  }, [activityLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(activityLogs.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-7xl rounded-2xl shadow-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Activity Log</h2>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Time Stamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Performed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log, index) => {
                // Ensure valid key lookup
                const color =
                  actionColors[(log.action as ActionType) in actionColors ? (log.action as ActionType) : "Default"];

                return (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Badge className={color}>{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.performedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientSingleActivityLog;
