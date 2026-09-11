/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  RotateCcw,
  Download,
  // Trash2,
  User,
  Paperclip,
  Link2,
  Calendar,
  Activity,
  Trash,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllChartHistoryQuery,
  useRestoreChartHistoryMutation,
} from "@/store/Api/ChartApi/ChartApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId?: string;
  className?: string;
}

// Mock versions removed in favor of API data

const getIcon = (type: string) => {
  switch (type) {
    case "assignee":
      return <User className="w-4 h-4 text-purple-500" />;
    case "file":
      return <Paperclip className="w-4 h-4 text-blue-500" />;
    case "link":
    case "link_removed":
      return <Link2 className="w-4 h-4 text-cyan-500" />;
    case "date":
      return <Calendar className="w-4 h-4 text-blue-400" />;
    case "progress":
      return <Activity className="w-4 h-4 text-purple-400" />;
    case "subtask_removed":
      return <Trash className="w-4 h-4 text-red-400" />;
    default:
      return <Paperclip className="w-4 h-4 text-gray-400" />;
  }
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  projectName,
  projectId,
  className,
}) => {
  const [search, setSearch] = useState("");
  const [changeType, setChangeType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const { data: historyData } = useAllChartHistoryQuery(projectId, {
    skip: !isOpen || !projectId,
  });
  const [restoreHistory, { isLoading: isRestoring }] =
    useRestoreChartHistoryMutation();
  console.log(historyData);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    versionId?: string;
    chartId?: string;
    versionDescription?: string;
  }>({ isOpen: false });

  const fetchedVersions = useMemo(() => {
    // Defensively check for data array, as RTK responses can sometimes be double-nested depending on the transform wrapper
    const rawData =
      historyData?.data?.data ||
      historyData?.data ||
      (Array.isArray(historyData) ? historyData : []);
    if (!Array.isArray(rawData)) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((item: any) => {
      const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
      // Ensure cross-browser safety instead of toLocaleDateString:
      const dateStr = `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`;

      let hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      return {
        id: item.id,
        chartId: item.chartId,
        type: item.chart?.category?.toLowerCase() || "chart",
        description: item.chart?.title || "Unknown Chart",
        category: item.chart?.category || "Unknown",
        date: dateStr,
        time: timeStr,
        value: item.value,
        chart: item.chart,
        changedBy: {
          name: item.user?.name || "Unknown",
          email: item.user?.email || "",
          avatar: item.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || "User")}&background=random`,
          role: item.user?.role?.name || item.user?.role || (item.user?.name === "Manager" ? "Manager" : "Staff"),
        },
      };
    });
  }, [historyData]);

  const handleRestore = async () => {
    if (!confirmModal.versionId || !confirmModal.chartId) return;
    const loadingToastId = toast.loading("Restoring version...");
    try {
      await restoreHistory({
        historyId: confirmModal.versionId,
        chartId: confirmModal.chartId,
      }).unwrap();
      toast.success("Version restored successfully", { id: loadingToastId });
      setConfirmModal({ isOpen: false });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to restore version", { id: loadingToastId });
    }
  };

  const handleDownloadCSV = async (version: any) => {
    try {
      const toastId = toast.loading("Downloading...");
      // Check for xAxis logic as per user requirement, using version's historical value or current chart's xAxis
      let xAxis = version.value || version.chart?.xAxis || [];
      if (typeof xAxis === "string") {
        try {
          xAxis = JSON.parse(xAxis);
        } catch {
          /* ignore fallback */
        }
      }

      const rawData =
        xAxis && !Array.isArray(xAxis) && xAxis.labels ? xAxis.labels : xAxis;

      if (!Array.isArray(rawData) || rawData.length === 0) {
        toast.error("No valid data found to download", { id: toastId });
        return;
      }

      let currentAOA: any[][] = [];
      const node = version.chart || {};

      if (Array.isArray(rawData[0])) {
        // 2D arrays based processing
        const isHeader = rawData[0].every(
          (item: any) => typeof item === "string",
        );
        const headerRow = isHeader ? [...rawData[0]] : [];
        if (isHeader) {
          headerRow[0] = "Label";
        } else {
          const legends = (
            node.widgets ||
            node.barChart?.widgets ||
            node.splineChart?.widgets ||
            node.areaChart?.widgets ||
            node.multiAxisChart?.widgets ||
            []
          ).map((w: any) => w.legendName || "Legend");
          headerRow.push(
            "Label",
            ...(legends.length > 0
              ? legends
              : Array(rawData[0].length - 1).fill("Legend")),
          );
        }

        const dataRows = isHeader ? rawData.slice(1) : rawData;
        const rows = dataRows.map((row: any[]) =>
          row.map((cell: any, cIdx: number) => {
            if (cIdx === 0) return cell;
            return cell !== undefined && cell !== null ? cell : 0;
          }),
        );
        currentAOA = [headerRow, ...rows];
      } else {
        // Flat array label list processing
        const isHeader =
          typeof rawData[0] === "string" && isNaN(Number(rawData[0]));
        const legends = (
          node.widgets ||
          node.barChart?.widgets ||
          node.splineChart?.widgets ||
          node.areaChart?.widgets ||
          node.multiAxisChart?.widgets ||
          []
        ).map((w: any) => w.legendName || "Legend");
        if (legends.length === 0) legends.push("Value");

        const headers = ["Label", ...legends];
        const dataLabels = isHeader ? rawData.slice(1) : rawData;

        const rows = dataLabels
          .filter((lbl: any) => String(lbl || "").trim() !== "")
          .map((lbl: any) => [String(lbl || ""), ...legends.map(() => 0)]);
        currentAOA = [headers, ...rows];
      }

      if (currentAOA.length === 0) {
        toast.error("Invalid chart data structure", { id: toastId });
        return;
      }

      const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(currentAOA);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const fileName = `${version.description.replace(/[^a-zA-Z0-9_-]/g, "_")}_v_${version.date}.csv`;
      XLSX.writeFile(wb, fileName, { bookType: "csv" });

      toast.success("CSV downloaded successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to download CSV");
    }
  };

  const filteredVersions = useMemo(() => {
    return fetchedVersions.filter((v: any) => {
      const matchesSearch = v.description
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = changeType === "all" || v.type === changeType;
      const matchesDate = dateFilter === "all" || v.date === dateFilter;
      const matchesUser =
        userFilter === "all" || v.changedBy.name === userFilter;
      return matchesSearch && matchesType && matchesDate && matchesUser;
    });
  }, [fetchedVersions, search, changeType, dateFilter, userFilter]);

  const uniqueUsers = useMemo(() => {
    return Array.from(
      new Set(fetchedVersions.map((v: any) => v.changedBy.name)),
    );
  }, [fetchedVersions]);

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(fetchedVersions.map((v: any) => v.date)));
  }, [fetchedVersions]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(fetchedVersions.map((v: any) => v.type)));
  }, [fetchedVersions]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/5 dark:bg-black/40 z-50" onClick={onClose} />
      <div
        className={cn(
          "absolute right-0 top-14 w-[850px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-border dark:border-slate-800",
          className,
        )}
      >
        <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-border dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Version History - {projectName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-gray-400 dark:text-slate-500" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-50 dark:border-slate-800">
          <div className="relative flex-1 max-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:text-slate-100 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5 min-w-fit">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                Changes:
              </span>
              <Select value={changeType} onValueChange={setChangeType}>
                <SelectTrigger className="h-9 min-w-24 border-[#E4E7EC] dark:border-slate-800 text-xs font-medium dark:bg-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="all" className="dark:text-slate-100 dark:focus:bg-slate-800">All</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize dark:text-slate-100 dark:focus:bg-slate-800">
                      {type.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5 min-w-fit">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                Date:
              </span>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9 min-w-24 border-[#E4E7EC] dark:border-slate-800 text-xs font-medium dark:bg-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="all" className="dark:text-slate-100 dark:focus:bg-slate-800">All</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date} className="dark:text-slate-100 dark:focus:bg-slate-800">
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5 min-w-fit">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                Changed By:
              </span>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-9 min-w-32 border-[#E4E7EC] dark:border-slate-800 text-xs font-medium dark:bg-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="all" className="dark:text-slate-100 dark:focus:bg-slate-800">All</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user} className="dark:text-slate-100 dark:focus:bg-slate-800">
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[60vh] scrollbar-hide bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F9FAFB] dark:bg-slate-900 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider w-[35%]">
                  Description
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider">
                  Changed By
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider text-right pr-10">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-[#F2F4F7] dark:divide-slate-800">
              {filteredVersions.length > 0 ? (
                filteredVersions.map((version) => (
                  <tr
                    key={version.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F9FAFB] dark:bg-slate-900 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          {getIcon(version.type)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-[#344054] dark:text-slate-200 font-medium">
                            {version.description}
                          </span>
                          <span className="w-fit text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                            {version.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#344054] dark:text-slate-200 font-medium whitespace-nowrap">
                        {version.date}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-slate-400 font-normal whitespace-nowrap">
                        {version.time}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-white dark:border-slate-800 shadow-sm shrink-0">
                          <AvatarImage src={version.changedBy.avatar} />
                          <AvatarFallback className="text-xs bg-gray-100 dark:bg-slate-800 dark:text-slate-400 font-medium">
                            {version.changedBy.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm text-gray-900 dark:text-slate-200 font-semibold truncate">
                            {version.changedBy.name}
                          </span>
                          {version.changedBy.email && (
                            <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                              {version.changedBy.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {version.changedBy.role ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 capitalize">
                          {version.changedBy.role}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-slate-600 font-normal">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Restore"
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              versionId: version.id,
                              chartId: version.chartId,
                              versionDescription: version.description,
                            })
                          }
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Download"
                          onClick={() => handleDownloadCSV(version)}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500 dark:text-slate-500 text-sm"
                  >
                    No versions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Restore Confirmation Modal */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) =>
          setConfirmModal({ ...confirmModal, isOpen: open })
        }
      >
        <DialogContent className="sm:max-w-[425px] rounded-xl border border-border dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 z-60">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Restore Version
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-2 space-y-3">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Are you sure you want to restore the version{" "}
              <span className="font-medium text-gray-900 dark:text-slate-100">
                "{confirmModal.versionDescription}"
              </span>
              ?
            </p>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-xs border border-blue-100/50 dark:border-blue-500/20">
              <RotateCcw className="w-4 h-4 shrink-0" />
              <p>
                This will revert the selected chart back to its state in this
                version.
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t border-border dark:border-slate-800 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmModal({ isOpen: false })}
              className="px-4 py-2 text-sm font-medium rounded-lg dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              {isRestoring ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionHistoryModal;
