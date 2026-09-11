import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react";
import { Eye, RotateCcw } from 'lucide-react';

const priorityColors: Record<string, string> = {
    Critical: "bg-red-100 text-red-600",
    High: "bg-yellow-100 text-yellow-700",
    Medium: "bg-purple-100 text-purple-700",
    Low: "bg-blue-100 text-blue-600",
    Default: "bg-gray-100 text-gray-600",
}

const statusColors: Record<string, string> = {
    Resolved: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    New: "bg-gray-100 text-gray-600",
}

const ClientSingleActiveAlerts = ({ alerts }: { alerts: any[] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate the alerts to display on the current page
    const paginatedAlerts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return alerts.slice(startIndex, endIndex);
    }, [alerts, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(alerts.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    return (
        <div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Active Alerts
                    </h2>
                    <span className="text-sm text-gray-500">
                        Showing {alerts.length} Alerts
                    </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    Alert Type
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    Priority
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    Time Stamp
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedAlerts.map((alert, index) => (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-middle">
                                        {alert.alertType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-middle">
                                        <Badge
                                            className={`${priorityColors[alert.priority] || priorityColors.Default}`}
                                        >
                                            {alert.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-middle">
                                        {alert.timeStamp}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-middle">
                                        <Badge
                                            className={`${statusColors[alert.status] || statusColors.New}`}
                                        >
                                            {alert.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-middle">
                                        <div className="flex gap-3">
                                            <Eye className="h-4 w-4 text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
                                            <RotateCcw className="h-4 w-4 text-green-600 cursor-pointer hover:scale-110 transition-transform" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
}

export default ClientSingleActiveAlerts
