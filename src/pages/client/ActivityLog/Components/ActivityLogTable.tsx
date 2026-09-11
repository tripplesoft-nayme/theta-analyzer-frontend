import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IActivityLog } from "@/store/Api/ActivityLogApi/ActivityLogApi";

const getActionIcon = (action: string) => {
  const normalizedAction = action.toLowerCase();
  switch (normalizedAction) {
    case "assignee_added":
      return "👤";
    case "file_added":
      return "📎";
    case "link_added":
      return "🔗";
    case "link_removed":
      return "🔗";
    case "due_date_changed":
      return "📅";
    case "progress_changed":
      return "📊";
    case "subtask_removed":
      return "➖";
    default:
      return "📝";
  }
};

const getActionIconFromDescription = (description: string) => {
  const action = description.split(":")[0].trim(); // "link_added"
  return getActionIcon(action);
};

export type ActivityLogEntry = (Omit<Partial<IActivityLog>, "user"> & {
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
  };
}) & {
  [key: string]: string | number | boolean | null | undefined | object;
};

interface ActivityLogTableProps {
  paginatedData?: ActivityLogEntry[];
  tableHeaders: string[];
  sortConfig?: {
    key: "user" | "date" | "time" | "ipAddress" | null;
    direction: "asc" | "desc" | null;
  };
  onSort?: (key: "user" | "date" | "time" | "ipAddress") => void;
}

const ActivityLogTable = ({
  paginatedData,
  tableHeaders,
  sortConfig,
  onSort,
}: ActivityLogTableProps) => {
  const formatHeader = (header: string) => {
    if (header === "projectName") return "Project Name";
    if (header === "ipAddress") return "IP Address";
    return header;
  };

  return (
    <div className="overflow-x-auto ">
      <Table className="rounded-lg">
        <TableHeader>
          <TableRow className="border border-[#E2E8F0] dark:border-slate-800 bg-[#F7F9FA] dark:bg-slate-900">
            {tableHeaders
              .filter((header) => header.toLowerCase() !== "id")
              .map((header) => {
                const isSortable = ["user", "date", "time", "ipAddress"].includes(header);
                const isSorted = sortConfig?.key === header;
                const direction = sortConfig?.direction;

                return (
                  <TableHead
                    key={header}
                    className={`text-base font-medium text-[#1D2028] dark:text-slate-300 px-6 py-3.5 transition-colors select-none ${
                      isSortable ? "cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40" : ""
                    }`}
                    onClick={() => {
                      if (isSortable && onSort) {
                        onSort(header as "user" | "date" | "time" | "ipAddress");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{formatHeader(header)}</span>
                      {isSortable && (
                        <span className="shrink-0">
                          {isSorted ? (
                            direction === "asc" ? (
                              <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
          </TableRow>
        </TableHeader>
        <TableBody className="rounded-lg">
          {paginatedData?.map((entry, idx) => (
            <TableRow
              key={String(entry.id || idx)}
              className="border-b border-[#E2E8F0] dark:border-slate-800/50 hover:bg-muted/30 dark:hover:bg-slate-800/50 transition-colors odd:bg-white dark:odd:bg-slate-900 even:bg-[#F7F9FA] dark:even:bg-slate-800/30"
            >
              {tableHeaders
                .filter((header) => header.toLowerCase() !== "id")
                .map((key) => (
                  <TableCell
                    key={key}
                    className="px-6 py-3.5 text-sm text-gray-600 dark:text-slate-200"
                  >
                    {key === "user" ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={entry?.user?.avatar || ""}
                            alt={entry?.user?.name || "Unknown user"}
                          />
                          <AvatarFallback>
                            {entry.user?.name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="dark:text-slate-200">{entry.user?.name}</span>
                      </div>
                    ) : key === "description" ? (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">
                          {entry.actionType
                            ? getActionIcon(String(entry.actionType))
                            : entry.description && typeof entry.description === "string"
                              ? getActionIconFromDescription(entry.description as string)
                              : null}
                        </span>
                        <span className="dark:text-slate-200">{typeof entry.description === "string" ? entry.description : String(entry.description || "")}</span>
                      </div>
                    ) : key === "date" ? (
                      <span>
                        {entry.timestamp && (typeof entry.timestamp === "string" || typeof entry.timestamp === "number") ? new Date(entry.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }) : ""}
                      </span>
                    ) : key === "time" ? (
                      <span>
                        {entry.timestamp && (typeof entry.timestamp === "string" || typeof entry.timestamp === "number") ? new Date(entry.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true
                        }) : ""}
                      </span>
                    ) : (
                      (() => {
                        const value = entry[key as keyof typeof entry];
                        return typeof value === "string" ||
                          typeof value === "number"
                          ? value
                          : null;
                      })()
                    )}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default ActivityLogTable;
