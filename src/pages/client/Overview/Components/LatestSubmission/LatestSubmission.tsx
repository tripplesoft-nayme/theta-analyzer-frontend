/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  Select,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, ArrowDownUp } from "lucide-react";
import BoxContainer from "@/Common/BoxContainer";
import { useGetAllSubmissionQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import ViewSubmissionDialog from "./ViewSubmissionDialog";
import Pagination from "@/Common/Pagination";

type SortField = "submission" | "project" | "submittedBy" | "date" | "status";
type SortOrder = "asc" | "desc";
type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
  APPROVED: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50",
  REJECTED: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
};

const TABLE_SKELETON_ROWS = 6;

const LatestSubmission = () => {
  // const [startDate, setStartDate] = useState<string>("");
  // const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data, isLoading } = useGetAllSubmissionQuery({
    // startDate: startDate || undefined,
    // endDate: endDate || undefined,
    status: status !== "ALL" ? status : undefined,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ---------- client-side sorting ---------- */
  const sortedSubmissions = useMemo(() => {
    const list = [...(data?.data ?? [])];

    return list.sort((a: any, b: any) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortBy) {
        case "submission":
          aValue = a.submission;
          bValue = b.submission;
          break;
        case "project":
          aValue = a.project?.name ?? "";
          bValue = b.project?.name ?? "";
          break;
        case "submittedBy":
          aValue = a.employee?.user?.name ?? "";
          bValue = b.employee?.user?.name ?? "";
          break;
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data?.data, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedSubmissions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  return (
    <BoxContainer className="p-0!">
      <Card className="border-none shadow-none bg-transparent p-0 space-y-0! gap-0">
        {/* Header */}
        <CardHeader className="flex flex-col p-6!">
          <div className="flex items-center justify-between w-full">
            <h4 className="text-xl font-medium text-gray-900 dark:text-slate-100">Latest Submission</h4>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 border border-gray-200 rounded-md px-3 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 border border-gray-200 rounded-md px-3 text-sm"
              /> */}
              <Select
                onValueChange={(s) => setStatus(s as StatusFilter)}
                value={status}
              >
                <SelectTrigger>
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort By</SelectLabel>
                    {["ALL", "APPROVED", "PENDING", "REJECTED"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0! overflow-hidden">
          <ScrollArea className="w-full min-h-[380px]">
            <table className="w-full text-sm table-fixed">
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-slate-900  z-20">
                <TableRow>
                  {[
                    {
                      label: "Submission",
                      field: "submission",
                      width: "w-[22%]",
                    },
                    { label: "Project", field: "project", width: "w-[20%]" },
                    {
                      label: "Submitted By",
                      field: "submittedBy",
                      width: "w-[18%]",
                    },
                    { label: "Date", field: "date", width: "w-[15%]" },
                    { label: "Status", field: "status", width: "w-[15%]" },
                  ].map((col) => (
                    <TableHead
                      key={col.field}
                      className={`px-6 py-4 cursor-pointer text-left ${col.width} ${col.field === "status" ? "text-center" : ""
                        } text-gray-700 dark:text-slate-300 font-semibold uppercase text-xs tracking-wider`}
                      onClick={() => handleSort(col.field as SortField)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <ArrowDownUp
                          className={`w-4 h-4 transition-transform duration-200 ${sortBy === col.field
                            ? sortOrder === "asc"
                              ? "rotate-180"
                              : "rotate-0"
                            : "opacity-30"
                            }`}
                        />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="px-6 py-4 text-right w-[10%]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: TABLE_SKELETON_ROWS }).map((_, i) => (
                    <TableRow key={i} className="dark:border-slate-800 even:bg-gray-50 dark:even:bg-slate-900/50">
                      <TableCell className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 w-2/3" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 w-1/2" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 w-2/3" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 w-1/3" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="h-6 bg-gray-200 dark:bg-slate-800 w-20 mx-auto rounded-full" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="h-8 bg-gray-200 dark:bg-slate-800 w-8 ml-auto rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedSubmissions.length ? (
                  paginatedSubmissions.map((item: any) => (
                    <TableRow key={item.id} className="dark:border-slate-800 dark:hover:bg-slate-900/50 even:bg-gray-50 dark:even:bg-slate-900/50">
                      <TableCell className="px-6 py-4 font-medium text-gray-600 dark:text-slate-100 align-top">
                        <div className="line-clamp-2 whitespace-normal break-words w-full" title={item.submission}>
                          {item.submission}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-slate-400 align-top">
                        <div className="line-clamp-2 whitespace-normal break-words w-full" title={item.project?.name}>
                          {item.project?.name ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-slate-400 align-top">
                        <div className="line-clamp-2 whitespace-normal break-words w-full" title={item.employee?.user?.name}>
                          {item.employee?.user?.name ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-slate-400 align-top">
                        {new Date(item.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={statusStyles[item.status]}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <ViewSubmissionDialog submission={item} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center text-gray-500 dark:text-slate-400">
                      No submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </ScrollArea>
        </CardContent>

        {sortedSubmissions.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            total={sortedSubmissions.length}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
          />
        )}
      </Card>
    </BoxContainer>
  );
};

export default LatestSubmission;
