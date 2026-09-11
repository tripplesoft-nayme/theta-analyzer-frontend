/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import PriorityDropdown from "./PriorityDropdown";
import {
  useGetAllProgramQuery,
  useUpdateProgramByIdMutation,
} from "@/store/Api/ProgramApi/ProgramApi";
import Pagination from "@/Common/Pagination";
import { IProgram } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
// import { useNavigate } from "react-router-dom";
import EditProgramModal from "./EditProgramModal";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, ChevronDown, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetManagerByIdQuery } from "@/store/Api/UserApi/UserApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReusableTable, ReusableTableColumn } from "@/components/ui/ReusableTable";

const ManagerCell = ({ managerId }: { managerId?: string }) => {
  const { data, isLoading } = useGetManagerByIdQuery(managerId, {
    skip: !managerId,
  });

  if (!managerId) return <span className="text-gray-400">N/A</span>;
  if (isLoading)
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse border-2 border-slate-300 dark:border-slate-700" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 animate-pulse rounded" />
      </div>
    );

  const manager = data?.data;
  const name = manager?.user?.name || "Unknown Manager";
  const image = manager?.user?.profileImage;

  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:z-10 hover:scale-105 transition-all duration-200 shadow-sm">
        <Avatar className="h-full w-full">
          <AvatarImage src={image} alt={name} className="object-cover" />
          <AvatarFallback className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] w-full h-full flex items-center justify-center font-semibold">
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
};

const ViewerCell = ({ programViewers }: { programViewers?: any[] }) => {
  if (!programViewers || programViewers.length === 0) return <span className="text-gray-400">N/A</span>;

  const maxVisible = 3;
  const visibleViewers = programViewers.slice(0, maxVisible);
  const remainingCount = programViewers.length - maxVisible;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center -space-x-2.5">
        {visibleViewers.map((pv: any) => {
          const viewer = pv.viewer;
          const name = viewer?.user?.name || viewer?.name || "Viewer";
          const image = viewer?.user?.profileImage || viewer?.profileImage;

          return (
            <Tooltip key={pv.id}>
              <TooltipTrigger asChild>
                <div className="h-9 w-9 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:z-10 hover:scale-105 transition-all duration-200 shadow-sm cursor-pointer">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={image} alt={name} className="object-cover" />
                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] w-full h-full flex items-center justify-center">
                      {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="z-50">
                {name}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold text-xs z-10 select-none shadow-sm cursor-pointer">
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="bg-slate-900 text-white border border-slate-800 rounded-lg p-2 text-xs font-semibold shadow-md z-50">
              {remainingCount} more viewers
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

interface IProgramTableProps {
  title?: string;
  hideCreatedOn?: boolean;
}

const priorityOrder: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const ClientAllProgram = ({
  title = "All Program",
  hideCreatedOn = false,
}: IProgramTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "HIGH" | "MEDIUM" | "LOW"
  >("ALL");
  // const navigate = useNavigate();

  const [sortColumn, setSortColumn] = useState<keyof IProgram | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 500);

  // Edit modal
  const [editProgram, setEditProgram] = useState<IProgram | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // API calls
  const { data, isLoading } = useGetAllProgramQuery({
    page: currentPage,
    limit,
    programName: debouncedSearch || undefined,
    priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
    sortBy: (sortColumn && sortColumn !== "priority") ? sortColumn : undefined,
    sortOrder: (sortColumn && sortColumn !== "priority") ? sortOrder : undefined,
  });

  const [updateProgram] = useUpdateProgramByIdMutation();

  const programs = useMemo(() => data?.data?.data ?? [], [data]);
  const meta = data?.data?.meta;
  const navigate = useNavigate();

  const totalPrograms = meta?.total ?? programs.length;
  const itemsPerPage = meta?.limit ?? limit;
  const totalPages =
    meta?.totalPages ?? Math.ceil(totalPrograms / itemsPerPage);

  const handleSort = (column: keyof IProgram) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedPrograms = useMemo(() => {
    const list = [...programs];

    if (!sortColumn || sortColumn !== "priority") {
      return list;
    }

    return list.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      const pA = priorityOrder[valA as string] || 0;
      const pB = priorityOrder[valB as string] || 0;
      return sortOrder === "asc" ? pA - pB : pB - pA;
    });
  }, [programs, sortColumn, sortOrder]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditClick = (program: IProgram) => {
    setEditProgram(program);
    setEditModalOpen(true);
  };

  // const handleDeleteClick = async (programId: string) => {
  //   if (confirm("Are you sure you want to delete this program?")) {
  //     await deleteProgram(programId);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
        <div className="flex md:flex-row flex-col justify-between items-center gap-3 px-6 py-4 border-gray-200 dark:border-slate-800 border-b">
          <Skeleton className="h-7 w-40 bg-gray-200 dark:bg-slate-800" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 bg-gray-100 dark:bg-slate-800 rounded-md" />
            <Skeleton className="h-10 w-32 bg-gray-100 dark:bg-slate-800 rounded-md" />
            <Skeleton className="h-10 w-32 bg-gray-100 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="p-6">
          <SkeletonLoading count={10} height="h-14" direction="vertical" />
        </div>
      </div>
    );
  }

  const handleRowClick = (programId: string) => {
    navigate(`/client-panel/all-program/program-overview/${programId}`);
  };

  const columns: ReusableTableColumn<any>[] = [
    {
      key: "programName",
      header: "programName",
      sortKey: "programName",
    },
    {
      key: "projects",
      header: "projects",
      sortKey: "projects",
      className: "text-center",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => `${program.projects?.length || 0} Projects`,
    },
    {
      key: "assignedManager",
      header: "assigned Manager",
      render: (program) => (
        <div className="flex justify-start">
          <ManagerCell managerId={program.managerId} />
        </div>
      ),
    },
    {
      key: "assignedViewer",
      header: "assigned Viewer",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => (
        <div className="flex justify-center">
          <ViewerCell programViewers={program.programViewers} />
        </div>
      ),
    },
    {
      key: "priority",
      header: "priority",
      sortKey: "priority",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => (
        <div className="flex justify-center">
          <PriorityDropdown defaultPriority={program.priority} />
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "updated On",
      sortKey: "updatedAt",
      className: "text-center",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => formatDate(program.updatedAt),
    },
    {
      key: "deadline",
      header: "deadline",
      sortKey: "deadline",
      className: "text-center",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => formatDate(program.deadline),
    },
    {
      key: "progress",
      header: "progress",
      sortKey: "progress",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => (
        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full max-w-[120px] h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${program.progress}%` }}
            />
          </div>
          <span className="text-gray-600 dark:text-slate-400 text-sm">
            {program.progress}%
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "actions",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="dark:hover:bg-slate-800 p-1.5"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(program.id);
            }}
          >
            <Eye className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400 cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="dark:hover:bg-slate-800 p-1.5"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(program);
            }}
          >
            <Edit className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 cursor-pointer" />
          </Button>
        </div>
      ),
    },
  ];

  if (!hideCreatedOn) {
    columns.splice(5, 0, {
      key: "createdAt",
      header: "created On",
      sortKey: "createdAt",
      className: "text-center",
      headerClassName: "[&>div]:justify-center text-center",
      render: (program: IProgram) => formatDate(program.createdAt),
    });
  }

  return (
    <div className=" min-h-screen">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex md:flex-row flex-col justify-between items-center gap-3 px-6 py-6 border-gray-200 dark:border-slate-800 border-b bg-white dark:bg-slate-900">
          <h1 className="font-medium text-gray-900 dark:text-slate-100 text-xl">{title}</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by program name..."
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              className="px-4 py-2 h-11 border border-gray-300 dark:border-slate-800 rounded-md w-64 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
            {/* Sort By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between gap-2 px-4 h-11 border border-slate-200 dark:border-slate-800 rounded-md min-w-32 font-semibold text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Sort By</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 w-56 space-y-3 z-50"
              >
                {/* Field Selection */}
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-400">By Field</div>
                {[
                  { id: "programName", label: "Program Name" },
                  { id: "updatedAt", label: "Updated At" },
                  { id: "deadline", label: "Deadline" }
                ].map((col) => (
                  <div key={col.id} className="flex items-center gap-2.5 py-0.5">
                    <Checkbox
                      checked={sortColumn === col.id}
                      onCheckedChange={(checked) => {
                        if (checked) setSortColumn(col.id as any);
                      }}
                      id={`sort-col-${col.id}`}
                      className="dark:border-slate-700"
                    />
                    <Label
                      htmlFor={`sort-col-${col.id}`}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      {col.label}
                    </Label>
                  </div>
                ))}

                <div className="border-slate-100 dark:border-slate-800 border-t my-2" />

                {/* Order Selection */}
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-400">By Order</div>
                {[
                  { id: "asc", label: "Ascending" },
                  { id: "desc", label: "Descending" }
                ].map((ord) => (
                  <div key={ord.id} className="flex items-center gap-2.5 py-0.5">
                    <Checkbox
                      checked={sortOrder === ord.id}
                      onCheckedChange={(checked) => {
                        if (checked) setSortOrder(ord.id as any);
                      }}
                      id={`sort-order-${ord.id}`}
                      className="dark:border-slate-700"
                    />
                    <Label
                      htmlFor={`sort-order-${ord.id}`}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      {ord.label}
                    </Label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between gap-2 px-4 h-11 border border-slate-200 dark:border-slate-800 rounded-md min-w-32 font-semibold text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus:outline-none"
                >
                  <span>Filter</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 w-52 space-y-3 z-50"
              >
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-400">By Priority</div>
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <div key={p} className="flex items-center gap-2.5 py-0.5">
                    <Checkbox
                      checked={priorityFilter === p}
                      onCheckedChange={(checked) => {
                        setCurrentPage(1);
                        setPriorityFilter(checked ? (p as any) : "ALL");
                      }}
                      id={`priority-${p}`}
                      className="dark:border-slate-700"
                    />
                    <Label
                      htmlFor={`priority-${p}`}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      {p === "ALL" ? "All Priorities" : p}
                    </Label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <ReusableTable
          data={sortedPrograms}
          columns={columns}
          rowKey={(p) => p.id}
          onRowClick={(p) => handleRowClick(p.id)}
          sortKey={sortColumn}
          sortOrder={sortOrder}
          onSort={(colKey) => handleSort(colKey as keyof IProgram)}
          padEmptyRowsTo={10}
          emptyState={
            <div className="flex justify-center items-center w-full h-[60vh]">
              <h2 className="font-semibold text-gray-200 dark:text-slate-700 text-5xl text-center uppercase">
                No Program Data Available
              </h2>
            </div>
          }
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          total={totalPrograms}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Edit Modal */}
      {editModalOpen && editProgram && (
        <EditProgramModal
          open={editModalOpen}
          program={editProgram}
          onClose={() => setEditModalOpen(false)}
          onSave={async (updatedData: Partial<IProgram>) => {
            await updateProgram({
              id: editProgram.id,
              ...updatedData,
            });
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ClientAllProgram;
