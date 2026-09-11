/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  AlignStartHorizontal,
  ArrowDownUp,
  ChevronDown,
  Filter,
  TableIcon,
  Flag,
  Layers,
} from "lucide-react";
import { useGetAllProgramQuery } from "@/store/Api/ProgramApi/ProgramApi";
import PrimaryButton from "@/Common/PrimaryButton";
import DropdownSelect from "@/Common/DropdownSelect";
import Pagination from "@/Common/Pagination";
import { IProgram } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import ProjectCardSkeleton from "@/Common/Skeleton/ProjectCardSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RenderStaffAvatars from "@/pages/viewerPanel/Components/RenderStaffAvater";
import { useGetManagerByIdQuery } from "@/store/Api/UserApi/UserApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProgramCard = ({
  program,
  renderStatusBadge,
  priorityColors,
  formatDate,
  navigate,
}: {
  program: any;
  renderStatusBadge: (status: string) => React.ReactNode;
  priorityColors: Record<string, string>;
  formatDate: (dateStr?: string) => string;
  navigate: any;
}) => {
  const { data: managerData } = useGetManagerByIdQuery(program.managerId, {
    skip: !program.managerId,
  });
  const managerUser = managerData?.data?.user;

  return (
    <Card className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col py-2">
      <CardContent className="flex flex-col justify-between p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 dark:border-slate-800 pb-4 px-4 pt-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#069576] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-primary-text dark:text-slate-100 leading-tight">
                {program.programName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-1 mt-1 truncate">
                {program.programDescription}
              </p>
            </div>
          </div>
          {renderStatusBadge("PENDING")}
        </div>
        {/* Assigned People */}
        <div className="py-4 px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Assigned People</h3>
              <RenderStaffAvatars
                staff={[
                  ...(managerUser ? [{
                    name: managerUser.name || "Manager",
                    avatar: managerUser.profileImage || "",
                    role: managerUser.role || "MANAGER",
                  }] : []),
                  ...(program.programViewers || []).map((pv: any) => ({
                    name: pv?.viewer?.user?.name || "Viewer",
                    avatar: pv?.viewer?.user?.profileImage || "",
                    role: pv?.viewer?.user?.role || "VIEWER",
                  }))
                ]}
              />
            </div>

            <div className="flex flex-col gap-y-3 text-xs text-right shrink-0">
              <div>
                <p className="text-gray-500 dark:text-slate-500">Program start</p>
                <p className="text-sm font-medium text-primary-text dark:text-slate-200">{formatDate(program.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-500">Program finish</p>
                <p className="text-sm font-medium text-primary-text dark:text-slate-200">{formatDate(program.deadline)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">Priority</p>
          <div className="flex items-center gap-1">
            <Flag className={`w-4 h-4 ${priorityColors[program.priority] || priorityColors.MEDIUM}`} />
            <span className={`text-sm font-bold ${priorityColors[program.priority] || priorityColors.MEDIUM}`}>
              {program.priority}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4 px-4 pb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-slate-400 font-medium">Overall Progress</span>
            <span className="font-bold text-gray-900 dark:text-slate-100">{program.progress}%</span>
          </div>
          <Progress value={program.progress} className="h-2" />
          <PrimaryButton
            onClick={() => navigate(`/viewer-panel/all-program/program-overview/${program.id}`)}
            title="View Program Details"
            type="Primary"
            className="w-full h-11 text-sm font-semibold rounded-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ProgramTableRow = ({
  program,
  renderStatusBadge,
  priorityColors,
  formatDate,
  navigate,
}: {
  program: any;
  renderStatusBadge: (status: string) => React.ReactNode;
  priorityColors: Record<string, string>;
  formatDate: (dateStr?: string) => string;
  navigate: any;
}) => {
  const { data: managerData } = useGetManagerByIdQuery(program.managerId, {
    skip: !program.managerId,
  });
  const managerUser = managerData?.data?.user;

  return (
    <TableRow onClick={() => navigate(`/viewer-panel/all-program/program-overview/${program.id}`)} className="border-b border-gray-200 dark:border-slate-800 hover:bg-muted/30 dark:hover:bg-slate-800/50 odd:bg-white dark:odd:bg-slate-900 even:bg-[#F7F9FA] dark:even:bg-slate-900/50 cursor-pointer">
      <TableCell className="px-6 py-3.5 font-medium dark:text-slate-200">{program.programName}</TableCell>
      <TableCell className="px-6 py-3.5">{renderStatusBadge("PENDING")}</TableCell>
      <TableCell className="px-6 py-3.5">
        <RenderStaffAvatars
          staff={[
            ...(managerUser ? [{
              name: managerUser.name || "Manager",
              avatar: managerUser.profileImage || "",
              role: managerUser.role || "MANAGER",
            }] : []),
            ...(program.programViewers || []).map((pv: any) => ({
              name: pv?.viewer?.user?.name || "Viewer",
              avatar: pv?.viewer?.user?.profileImage || "",
              role: pv?.viewer?.user?.role || "VIEWER",
            }))
          ]}
        />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <div className="flex items-center gap-1">
          <Flag className={`w-4 h-4 ${priorityColors[program.priority] || priorityColors.MEDIUM}`} />
          <span className={`text-sm font-medium ${priorityColors[program.priority] || priorityColors.MEDIUM}`}>
            {program.priority}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-3.5 text-muted-foreground dark:text-slate-400">{formatDate(program.createdAt)}</TableCell>
      <TableCell className="px-6 py-3.5 text-muted-foreground dark:text-slate-400">{formatDate(program.deadline)}</TableCell>
      <TableCell className="px-6 py-3.5 text-muted-foreground dark:text-slate-400 flex items-center gap-2">
        <Progress value={program.progress} className="h-2 w-20" />
        <span className="font-medium dark:text-slate-300">{program.progress}%</span>
      </TableCell>
    </TableRow>
  );
};

const ViewerPanelAllProgram = () => {
  const [viewMode, setViewMode] = useState<"table" | "board">("board");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<keyof IProgram>("updatedAt");
  const [currentPage, setCurrentPage] = useState(1);
  const search = "";
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 8;

  const { data, isLoading } = useGetAllProgramQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    programName: debouncedSearch || undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
  });

  const programs = useMemo(() => data?.data?.data ?? [], [data]);
  const meta = data?.data?.meta;
  const totalPrograms = meta?.total ?? programs.length;
  const totalPages = meta?.totalPages ?? Math.ceil(totalPrograms / ITEMS_PER_PAGE);

  const priorityOptions = [
    { value: "all", title: "All Priority" },
    { value: "HIGH", title: "High" },
    { value: "MEDIUM", title: "Medium" },
    { value: "LOW", title: "Low" },
  ];

  const sortedPrograms = useMemo(() => {
    return [...programs].sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "deadline") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [programs, sortBy, sortOrder]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "01 Jan 1970";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyles: any = {
    LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    IN_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
    RETURNED: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    OVERDUE: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };

  const priorityColors: Record<string, string> = {
    HIGH: "text-[#DA4352] dark:text-red-400",
    MEDIUM: "text-[#F59E0B] dark:text-orange-400",
    LOW: "text-[#16A34A] dark:text-emerald-400",
  };

  const renderStatusBadge = (status: string) => (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-1 font-medium ${statusStyles[status] || statusStyles.PENDING}`}
    >
      {(status || "PENDING").replace("_", " ")}
    </Badge>
  );

  return (
    <div className="pb-6 min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-center justify-between pb-6 gap-4">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 w-full xl:w-auto">
          All Program
        </h4>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* View Toggle */}
          <div className="flex items-center gap-3">
            <PrimaryButton
              type="Primary"
              title="Boards"
              leftIcon={<AlignStartHorizontal className="w-4 h-4" />}
              className={`${viewMode === "board"
                ? "bg-black text-white border-black dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100 hover:bg-black! hover:text-white!"
                : "bg-white border-black text-black! dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300! hover:text-black!"
                }`}
              onClick={() => setViewMode("board")}
            />
            <PrimaryButton
              type="Primary"
              title="Tables"
              leftIcon={<TableIcon className="w-4 h-4" />}
              className={`${viewMode === "table"
                ? "bg-black text-white border-black dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100 hover:bg-black! hover:text-white!"
                : "bg-white border-black text-black! dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300! hover:text-black!"
                }`}
              onClick={() => setViewMode("table")}
            />
          </div>

          {/* Sort By */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] dark:border-slate-800 h-12 dark:text-slate-300">
                <ArrowDownUp className="size-5" /> Sort By <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800 p-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Field</div>
              <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>Last Updated</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("programName")}>Program Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("deadline")}>Deadline</DropdownMenuItem>
              <div className="my-1 border-t border-border dark:border-slate-800" />
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Order</div>
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>Ascending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>Descending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] dark:border-slate-800 h-12 dark:text-slate-300">
                <Filter className="size-5" /> Filter By <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-[#CAD2DB] dark:border-slate-800">
              <div className="p-2">
                <DropdownSelect
                  placeholderText="Priority"
                  dropdownItem={priorityOptions}
                  onChange={setPriorityFilter}
                  label="Priority"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <Card className="w-full shadow-none border-none bg-white dark:bg-slate-900 p-0 overflow-hidden">
          <CardContent className="p-0 border border-[#E2E8F0] dark:border-slate-800 rounded-lg w-full min-h-[420px] bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-slate-800 bg-[#F7F9FA] dark:bg-slate-900">
                  {["Program", "Status", "Assigned People", "Priority", "Started On", "Deadline", "Progress"].map((col) => (
                    <TableHead key={col} className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="px-6 py-3.5">
                          <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-full"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sortedPrograms.length > 0 ? (
                  sortedPrograms.map((program) => (
                    <ProgramTableRow
                      key={program.id}
                      program={program}
                      renderStatusBadge={renderStatusBadge}
                      priorityColors={priorityColors}
                      formatDate={formatDate}
                      navigate={navigate}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 text-center text-gray-500 text-xl">No programs found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)
          ) : sortedPrograms.length > 0 ? (
            sortedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                renderStatusBadge={renderStatusBadge}
                priorityColors={priorityColors}
                formatDate={formatDate}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="col-span-full h-96 flex items-center justify-center text-gray-400 dark:text-slate-500 text-lg border-2 border-dashed border-border dark:border-slate-800 rounded-xl">
              No programs found
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            total={sortedPrograms.length}
            itemsPerPage={ITEMS_PER_PAGE}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default ViewerPanelAllProgram;
