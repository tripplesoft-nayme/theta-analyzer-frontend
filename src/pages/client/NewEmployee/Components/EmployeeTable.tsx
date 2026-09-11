/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useBulkDeleteUsersMutation,
} from "@/store/Api/UserApi/UserApi";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ViewUserModal from "./ViewUserModal";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import AddEmployeeModal from "@/pages/client/NewEmployee/Components/AddEmployeeModal";
import { useDebounce } from "@/hooks/useDebounce";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Allowed sort fields per the API guide
type ApiSortField = "name" | "email" | "createdAt" | "updatedAt";

// Map table column keys → API-allowed sortBy values
const SORT_FIELD_MAP: Record<string, ApiSortField> = {
  name: "name",
  email: "email",
  lastActive: "updatedAt",
  role: "name", // API doesn't support role sort; fall back to name
};

const EmployeeTable = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // ── Filter / sort state ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ── Pagination ───────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const PAGE_SIZE = 10;

  // ── Mutations ────────────────────────────────────────────────────────────
  const [deleteUser] = useDeleteUserMutation();
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation();

  // ── Debounce search so we don't hammer the API on every keystroke ────────
  const debouncedSearch = useDebounce(search, 500);

  // ── Map UI status string → API boolean (undefined = no filter) ───────────
  const apiStatus: boolean | undefined =
    statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;

  // ── Map column sort key → API-allowed sortBy field ───────────────────────
  const apiSortBy: ApiSortField | undefined = sortBy
    ? SORT_FIELD_MAP[sortBy] ?? undefined
    : undefined;

  // ── API query — all params are server-side ───────────────────────────────
  const { data, isLoading, isFetching } = useGetAllUsersQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(roleFilter !== "All" ? { role: roleFilter } : {}),
    ...(apiStatus !== undefined ? { status: apiStatus } : {}),
    ...(apiSortBy ? { sortBy: apiSortBy } : {}),
    ...(apiSortBy ? { sortOrder } : {}),
  });

  const loading = isLoading || isFetching || pageLoading;
  const users: any[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  // ── Reset to page 1 whenever any filter/search/sort changes ──────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, sortBy, sortOrder]);

  // ── Page-loading shimmer helper ──────────────────────────────────────────
  useEffect(() => {
    if (currentPage !== 1) setPageLoading(true);
  }, [currentPage]);

  useEffect(() => {
    if (!isFetching) setPageLoading(false);
  }, [isFetching]);

  // ── Clear selection when data or page changes ────────────────────────────
  useEffect(() => {
    setSelectedIds([]);
  }, [data, currentPage]);

  // ── Pagination meta ──────────────────────────────────────────────────────
  const totalUsers = meta?.total || 0;
  const totalPages = meta?.totalPages || 1;
  const startUser = totalUsers === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endUser = Math.min(currentPage * PAGE_SIZE, totalUsers);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  // ── Selection ────────────────────────────────────────────────────────────
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? users.map((u: any) => u.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((userId) => userId !== id),
    );
  };

  // ── Skeleton rows ────────────────────────────────────────────────────────
  const renderSkeleton = () =>
    Array.from({ length: PAGE_SIZE }).map((_, i) => (
      <tr key={i} className="even:bg-[#F7F9FA] dark:even:bg-slate-900 odd:bg-white dark:odd:bg-slate-800/30 animate-pulse h-12">
        {Array(8)
          .fill(0)
          .map((_, idx) => (
            <td
              key={idx}
              className={`${idx === 1 ? "px-6 w-[200px]" : "px-4"} ${idx === 2 ? "w-[300px]" : ""
                } py-3.5`}
            >
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
            </td>
          ))}
      </tr>
    ));

  // ── Delete handlers ──────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const Swal = (await import("sweetalert2")).default;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        await deleteUser(id).unwrap();
        Swal.fire("Deleted!", "Employee removed.", "success");
      }
    } catch (err: any) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire("Error", err?.data?.message || "Something went wrong", "error");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const Swal = (await import("sweetalert2")).default;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        const res = await bulkDeleteUsers({ ids }).unwrap();
        if (res.success) {
          Swal.fire("Deleted!", "Employee(s) removed.", "success");
          setSelectedIds([]);
        }
      }
    } catch (err: any) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire("Error", err?.data?.message || "Something went wrong", "error");
      setSelectedIds([]);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ── Visible page numbers (window of 5) ──────────────────────────────────
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="border border-gray-200 dark:border-slate-800 w-full rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center py-6 px-6 gap-4 bg-white dark:bg-slate-900 border-b border-border dark:border-slate-800">
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <span className="text-sm text-blue-400 font-medium bg-[#CAD2DB]/10 dark:bg-blue-400/10 border-r border-gray-200 dark:border-slate-800 p-3 ">
              {selectedIds.length} selected
            </span>
            <Button
              variant="ghost"
              onClick={() => handleBulkDelete(selectedIds)}
              className="text-sm dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 className=" h-4 w-4 text-red-500" /> Delete
            </Button>
          </div>
        ) : (
          <h2 className="text-xl font-medium text-gray-900 dark:text-slate-100">Employee List</h2>
        )}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Search — debounced, server-side */}
          <input
            type="text"
            placeholder="Search name, email, role, project…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 dark:border-slate-800 rounded-md px-3 py-1 h-11 max-w-64 focus:outline-none focus:border-gray-500 dark:focus:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
          {/* Filter dropdown — server-side role & status */}
          <Select>
            <SelectTrigger className="min-w-32 h-11! bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="space-y-2 bg-white dark:bg-slate-900 dark:border-slate-800">
              <FieldGroup className="flex flex-col gap-2 p-2 space-y-2">
                <Label className="text-xs font-medium dark:text-slate-400">By Role</Label>
                {["MANAGER", "EMPLOYEE", "VIEWER"].map((role) => (
                  <div key={role} className="flex items-center gap-2">
                    <Checkbox
                      checked={roleFilter === role}
                      onCheckedChange={(checked) => {
                        setRoleFilter(checked ? role : "All");
                      }}
                      className="dark:border-slate-700"
                    />
                    <Label
                      className="dark:text-slate-300 cursor-pointer"
                      onClick={() => setRoleFilter(roleFilter === role ? "All" : role)}
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </FieldGroup>
              <FieldGroup className="flex flex-col gap-2 p-2 space-y-2">
                <Label className="text-xs font-medium dark:text-slate-400">By Status</Label>
                {["Active", "Inactive"].map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <Checkbox
                      checked={statusFilter === status}
                      onCheckedChange={(checked) => {
                        setStatusFilter(checked ? status : "All");
                      }}
                      className="dark:border-slate-700"
                    />
                    <Label
                      className="dark:text-slate-300 cursor-pointer"
                      onClick={() =>
                        setStatusFilter(statusFilter === status ? "All" : status)
                      }
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </FieldGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-[#F7F9FA] dark:bg-slate-900 h-14">
            <tr>
              <th className="px-6 py-3.5 text-left w-[50px] border-b border-[#E2E8F0] dark:border-slate-800">
                <Checkbox
                  checked={users.length > 0 && selectedIds.length === users.length}
                  className="size-[18px]"
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  style={{ borderColor: "#1C73E0" }}
                />
              </th>
              <th
                className="px-6 py-3.5 text-left text-sm font-medium w-[350px] cursor-pointer text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800"
                onClick={() => handleSort("name")}
              >
                Profile Name {renderSortIcon("name")}
              </th>
              <th
                className="px-4 py-3.5 text-left text-sm font-medium w-[300px] cursor-pointer text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800"
                onClick={() => handleSort("email")}
              >
                Email {renderSortIcon("email")}
              </th>
              <th
                className="px-4 py-3.5 text-left text-sm font-medium cursor-pointer text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800"
                onClick={() => handleSort("role")}
              >
                Role {renderSortIcon("role")}
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-medium w-[300px] text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800">
                Assign Project
              </th>
              <th
                className="px-4 py-3.5 text-left text-sm font-medium cursor-pointer text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800"
                onClick={() => handleSort("lastActive")}
              >
                Last Active {renderSortIcon("lastActive")}
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800">
                Level
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-slate-300 border-b border-[#E2E8F0] dark:border-slate-800">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderSkeleton()
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center w-full h-[60vh]">
                    <h2 className="font-semibold text-gray-200 dark:text-slate-600 text-5xl text-center uppercase">
                      No Employee Data Available
                    </h2>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {users.map((user: any) => (
                  <tr
                    key={user.id}
                    className={`even:bg-[#F7F9FA] dark:even:bg-slate-900 odd:bg-white dark:odd:bg-slate-800/30 hover:bg-gray-100 dark:hover:bg-slate-800 transition h-12 border-b border-[#E2E8F0] dark:border-slate-800 ${selectedIds.includes(user.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                  >
                    <td className="px-6 py-3.5 w-[50px] align-middle">
                      <Checkbox
                        className="size-[18px] dark:border-slate-700"
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(user.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-6 py-3 w-[350px] align-middle">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            user?.profileImage ||
                            "https://randomuser.me/api/portraits/men/19.jpg"
                          }
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                        />
                        <span className="font-medium text-gray-900 dark:text-slate-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-slate-400 w-[300px] align-middle">
                      {user.email}
                    </td>
                    <td className="px-4 py-3.5 text-sm align-middle">
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 font-medium ${user.role === "MANAGER"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                          : user.role === "EMPLOYEE"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                            : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                          }`}
                      >
                        {user.role === "MANAGER"
                          ? "Manager"
                          : user.role === "EMPLOYEE"
                            ? "Employee"
                            : "Viewer"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 align-middle w-[300px]">
                      {(() => {
                        let projects: string[] = [];
                        if (user.role === "MANAGER" && user.manager?.projects) {
                          projects = user.manager.projects.map((p: any) => p.name || p.projectName);
                        } else {
                          const empProjects = user.employee?.projectEmployees?.map((pe: any) => pe.project?.name) || [];
                          const viewProjects = user.viewer?.projectViewers?.map((pv: any) => pv.project?.name) || [];
                          projects = [...empProjects, ...viewProjects];
                        }
                        projects = Array.from(new Set(projects.filter(Boolean)));

                        if (projects.length === 0) {
                          return <span className="text-gray-400 dark:text-slate-600 text-xs">No projects</span>;
                        }

                        return (
                          <TooltipProvider>
                            <div className="flex flex-wrap gap-1">
                              {projects.slice(0, 5).map((projectName: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0.5 border-gray-200 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-800/30 truncate max-w-[120px] block text-center"
                                  title={projectName}
                                >
                                  {projectName}
                                </Badge>
                              ))}
                              {projects.length > 5 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0.5 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all font-semibold"
                                    >
                                      +{projects.length - 5} more
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-2.5 rounded-lg max-w-60 text-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold border-b border-border pb-1 mb-1.5 text-muted-foreground">Assigned Projects</p>
                                      {projects.map((projectName: string, index: number) => (
                                        <div key={index} className="truncate py-0.5 text-foreground">{projectName}</div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TooltipProvider>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-slate-500 align-middle">
                      {user.lastActive
                        ? new Date(user.lastActive).toLocaleDateString("en-US")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3.5 text-sm align-middle">
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 font-medium ${user.userStatus === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          }`}
                      >
                        {user.userStatus === "ACTIVE" ? "Active" : "In Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:hover:bg-slate-800"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer dark:hover:bg-slate-800"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUpdateModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-green-500 cursor-pointer" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer dark:hover:bg-slate-800"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600 cursor-pointer" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Fill remaining rows to maintain table height */}
                {users.length < PAGE_SIZE &&
                  Array.from({ length: PAGE_SIZE - users.length }).map((_, i) => (
                    <tr
                      key={`empty-${i}`}
                      className="h-12 even:bg-[#F7F9FA] dark:even:bg-slate-900/50 odd:bg-white dark:odd:bg-slate-900"
                    >
                      {Array(8)
                        .fill(0)
                        .map((_, idx) => (
                          <td
                            key={idx}
                            className={`${idx === 1 ? "px-6 w-[200px]" : "px-4"
                              } ${idx === 2 ? "w-[300px]" : ""} py-3.5`}
                          ></td>
                        ))}
                    </tr>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200 dark:border-slate-800">
        <div className="text-sm text-gray-600 dark:text-slate-400">
          {totalUsers === 0
            ? "No users found"
            : `Showing ${startUser}–${endUser} of ${totalUsers} users`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft />
          </Button>
          {visiblePages.map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              className={`${page === currentPage
                ? "bg-blue-500 text-white"
                : "dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              onClick={() => goToPage(page)}
              disabled={loading}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <ViewUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
      <AddEmployeeModal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        employee={selectedUser}
      />
    </div>
  );
};

export default EmployeeTable;
