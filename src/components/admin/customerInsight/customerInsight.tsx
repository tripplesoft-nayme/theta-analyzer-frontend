import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table, Filter } from "lucide-react";
import BoardCustomerInsight from "../boardCustomerInsight/boardCustomerInsight";
import TableCustomerInsight from "../tableCustomerInsight/tableCustomerInsight";
import { ClientData } from "@/types/client";

export function CustomerInsights() {
  const [customers, setCustomers] = useState<ClientData[]>([]);

  useEffect(() => {
    fetch("/customerData.json")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
      });
  }, []);

  const [viewMode, setViewMode] = useState("Boards");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Calculate the total number of pages
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  // Calculate the customers to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 mt-11">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Customer Insight
        </h2>

        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === "Boards" ? "secondary" : "outline"}
            size="sm"
            className={
              viewMode === "Boards"
                ? "bg-gray-800 text-white gap-2 cursor-pointer"
                : "gap-2 cursor-pointer"
            }
            onClick={() => setViewMode("Boards")}
          >
            <LayoutGrid className="h-4 w-4" />
            Boards
          </Button>
          <Button
            size="sm"
            className={
              viewMode === "Tables"
                ? "bg-gray-800 text-white gap-2 cursor-pointer"
                : "gap-2 cursor-pointer"
            }
            onClick={() => setViewMode("Tables")}
          >
            <Table className="h-4 w-4" />
            Tables
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter By
          </Button>
        </div>
      </div>

      {viewMode === "Boards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCustomers.map((customer) => (
            <BoardCustomerInsight key={customer.id} customer={customer} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Company Name</th>
                <th className="px-4 py-3 text-left">Subscription Plan</th>
                <th className="px-4 py-3">Dashboard Updates</th>
                <th className="px-4 py-3">Alerts</th>
                <th className="px-4 py-3">Users</th>
                <th className="px-4 py-3">Storage Usage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCustomers.map((customer) => (
                <TableCustomerInsight key={customer.id} customer={customer} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button
          className="border border-green-500 text-green-500 cursor-pointer"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-blue-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          className="border border-blue-500 text-blue-500 cursor-pointer"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
