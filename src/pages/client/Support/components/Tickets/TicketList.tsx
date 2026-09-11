import React from "react";
import { Ticket } from "./types";
import ClientCreateTicket from "./ClientCreateTicket";

interface TicketListProps {
  tickets: Ticket[] | undefined;
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  isLoading?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  isLoading,
}) => {
  return (
    <div
      className={`flex-1 flex flex-col transition-all dark:bg-slate-900 h-full ${selectedTicket ? "hidden lg:flex" : "flex"
        }`}
    >
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-medium dark:text-slate-100">Support Center</h2>
        <ClientCreateTicket />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-slate-900 shadow-sm min-h-full overflow-x-auto">
          <table className="w-full text-left min-w-[450px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap">ID</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Subject</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-8" />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                    </td>
                  </tr>
                ))
              ) : !tickets || tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium"
                  >
                    No tickets available
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: Ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={
                      selectedTicket?.id === ticket.id
                        ? "bg-blue-50 dark:bg-slate-800 cursor-pointer transition-colors"
                        : "hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    }
                  >
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {ticket.ticketId || ticket.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {ticket?.issueType}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TicketList;
