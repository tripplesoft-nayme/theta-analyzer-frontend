
import { Download, HardDriveDownload, FileText, Calendar, CreditCard, Clock } from 'lucide-react';

import { useState, useMemo, ReactNode } from "react";


interface Subscription {
  current: string;
  billingCycle: string;
  nextRenewal: string;
  status: "Paid" | "Unpaid" | "Pending" | "Active";
}

interface Invoice {
  invoiceId: string;
  date: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Pending" | "Active";
}

interface ClientSingleSubscriptionTabProps {
  subscription: Subscription;
  invoices: Invoice[];
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

const ClientSingleSubscriptionTab: React.FC<ClientSingleSubscriptionTabProps> = ({
  subscription,
  invoices,
}) => {
  const statusColors: Record<Subscription["status"], string> = {
    Paid: "bg-green-100 text-green-700",
    Unpaid: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Active: "bg-purple-100 text-purple-700",
  };

  // A simple badge component for styling
  const Badge: React.FC<BadgeProps> = ({ children, className }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full bg-blue-300 text-gray-800 text-sm font-medium ${className}`}>
      {children}
    </span>
  );

  // Subscription details data with icons
  const subscriptionDetails = [
    { label: 'Plan Type', value: subscription.current, icon: <FileText className="h-4 w-4 text-gray-500" /> },
    { label: 'Billing Cycle', value: subscription.billingCycle, icon: <Calendar className="h-4 w-4 text-gray-500" /> },
    { label: 'Next Renewal', value: subscription.nextRenewal, icon: <Clock className="h-4 w-4 text-gray-500" /> },
    { label: 'Status', value: subscription.status, icon: <CreditCard className="h-4 w-4 text-gray-500" /> },
  ];

  // Pagination state and logic for billing history table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return invoices.slice(startIndex, endIndex);
  }, [invoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(invoices.length / itemsPerPage);

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
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Current Subscription Section */}
        <div className="w-2/5 rounded-2xl shadow-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Current Subscription
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg shadow-sm hover:bg-blue-200 transition-all cursor-pointer">
              Change Plan
              <FileText className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-4 pt-5">
            {subscriptionDetails.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 rounded-full p-2">
                    {item.icon}
                  </div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                {item.label === 'Plan Type' || item.label === 'Status' ? (
                  <Badge className={statusColors[item.value as keyof typeof statusColors]}>
                    {item.value}
                  </Badge>
                ) : (
                  <span className="text-sm font-medium text-gray-800">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing History Section */}
        <div className="w-3/5 rounded-2xl shadow-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Billing History
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
              Download All
              <HardDriveDownload className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Invoice ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Amount
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
                {paginatedInvoices.map((invoice, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Badge
                        className={`${statusColors[invoice.status]}`}
                      >
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Download className="h-4 w-4 text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
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
    </div>
  );
};

export default ClientSingleSubscriptionTab;
