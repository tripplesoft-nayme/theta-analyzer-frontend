import React, { cloneElement, useState, useMemo } from "react";
import SearchBar from "@/Common/SearchBar";
import PrimaryButton from "@/Common/PrimaryButton";
import { Bell, LayoutDashboard, Folder, Layers, Briefcase } from "lucide-react";
import {
  useLocation,
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import DateRangePicker from "@/Common/DateRange";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getViewerPanelSidebarItems } from "./viewerPanelSidebarItems";
import NotificationModal from "@/Common/NotificationModal";
import { useGetProjectByIdQuery, useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useGetProgramByIdQuery, useGetAllProgramQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { useGetNotificationsQuery } from "@/store/Api/NotificationApi/NotificationApi";
import { useGetUser } from "@/hooks/useGetUser";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/Common/ThemeToggle";

const ViewerPanelHeader = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const ClientSidebarGroups = getViewerPanelSidebarItems();
  const { id: currentUserId, name } = useGetUser();

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const { projectId, programId } = useParams();
  const { data } = useGetProjectByIdQuery(projectId!, {
    skip: !projectId,
  });
  const projectDetails = data?.data;

  const { data: programData } = useGetProgramByIdQuery(programId!, {
    skip: !programId,
  });
  const programDetails = programData?.data;

  const currentPath = location.pathname;

  const allRoutes = ClientSidebarGroups.flatMap((group) => group.items);
  const currentRoute = useMemo(() => {
    let found = allRoutes.find((route) => route.path === currentPath);
    if (!found) {
      if (currentPath.endsWith("/profile")) {
        return { name: "Profile", header: "Profile", description: "View and manage your profile details", path: "/viewer-panel/profile" };
      }
      if (currentPath.endsWith("/notifications")) {
        return { name: "Notifications", header: "Notifications", description: "Manage and view all your notifications", path: "/viewer-panel/notifications" };
      }
    }
    return found;
  }, [allRoutes, currentPath]);

  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: allProgramsData } = useGetAllProgramQuery({});
  const { data: allProjectsData } = useGetAllProjectsQuery({});
  const { data: notificationData } = useGetNotificationsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const unreadCount = useMemo(() => {
    const notifications = notificationData?.data || [];
    return notifications.filter((n: any) => n.isRead === false || n.status === "new").length;
  }, [notificationData]);

  const filteredPrograms = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const programs = allProgramsData?.data?.data || [];
    return Array.isArray(programs)
      ? programs.filter((p: any) => {
        const isAssigned =
          p.viewerIds?.includes(currentUserId) ||
          p.programViewers?.some(
            (pv: any) =>
              pv.viewerId === currentUserId ||
              pv.viewer?.userId === currentUserId ||
              pv.viewer?.user?.id === currentUserId
          );
        const matchesSearch = p.programName
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
        return isAssigned && matchesSearch;
      })
      : [];
  }, [debouncedSearchTerm, allProgramsData, currentUserId]);

  const filteredProjects = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const projects =
      allProjectsData?.data?.projects?.data ||
      allProjectsData?.data?.data ||
      [];
    return Array.isArray(projects)
      ? projects.filter((p: any) => {
        const isAssigned = p.projectViewers?.some(
          (pv: any) =>
            pv.viewerId === currentUserId || pv.viewer?.userId === currentUserId,
        );
        const matchesSearch = p.name
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
        return isAssigned && matchesSearch;
      })
      : [];
  }, [debouncedSearchTerm, allProjectsData, currentUserId]);

  const dateRange =
    startDate && endDate ? [new Date(startDate), new Date(endDate)] : null;

  const handleSetDateRange = (val: [Date, Date] | null) => {
    if (!val) {
      searchParams.delete("startDate");
      searchParams.delete("endDate");
      setSearchParams(searchParams);
      return;
    }
    const [start, end] = val;

    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    searchParams.set("startDate", formatDate(start));
    searchParams.set("endDate", formatDate(end));
    setSearchParams(searchParams);
  };

  // Removed getActiveFilterLabel

  return (
    <div>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 py-5">
        <div className="flex flex-row items-center justify-between w-full gap-4 relative">
          {/* Greeting */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <SidebarTrigger className="md:hidden shrink-0" />
            <div className="min-w-0">
              {currentPath === "/viewer-panel" || currentPath === "/viewer-panel/" ? (
                <h1 className="text-2xl md:text-3xl font-semibold text-primary-text dark:text-slate-100 truncate">
                  {`Welcome, ${name || ""} 👋`}
                </h1>
              ) : currentPath.includes("/project-details/") &&
                projectDetails?.project?.name ? (
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold leading-tight text-primary-text dark:text-slate-100 truncate capitalize">
                    {projectDetails.project.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-slate-400 truncate">Project details overview</p>
                </div>
              ) : currentPath.includes("/program-overview/") &&
                programDetails?.programName ? (
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold leading-tight text-primary-text dark:text-slate-100 truncate">
                    {programDetails.programName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                    Program overview and management
                  </p>
                </div>
              ) : (
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-semibold truncate text-primary-text dark:text-slate-100">
                    {currentRoute?.header ||
                      (typeof currentRoute?.name === "string"
                        ? currentRoute.name
                        : "Dashboard")}
                  </h1>
                  <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 truncate">
                    {currentRoute?.description ||
                      `Manage your ${typeof currentRoute?.name === "string"
                        ? currentRoute.name.toLowerCase()
                        : "activities"
                      } here`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Search (Desktop only) */}
          <div className="lg:flex-none lg:w-[320px] xl:w-[450px] 2xl:w-[600px] w-full relative group px-0 lg:px-4 hidden lg:block">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} className="w-full" />
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 mx-0 lg:mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border dark:border-slate-800 max-h-[400px] overflow-y-auto z-50 py-2">
                {filteredPrograms.length === 0 && filteredProjects.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">
                    No results found
                  </div>
                ) : (
                  <>
                    {filteredPrograms.length > 0 && (
                      <div className="mb-2">
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                          Programs
                        </h3>
                        {filteredPrograms.map((program: any) => (
                          <div
                            key={program.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors"
                            onClick={() => {
                              setSearchTerm("");
                              navigate(
                                `/viewer-panel/all-program/program-overview/${program.id}`,
                              );
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                {program.programName || program.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-500">Program</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {filteredProjects.length > 0 && (
                      <div>
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                          Projects
                        </h3>
                        {filteredProjects.map((project: any) => (
                          <div
                            key={project.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors"
                            onClick={() => {
                              setSearchTerm("");
                              navigate(
                                `/viewer-panel/all-program/program-overview/${project.programId}/project-details/${project.id}`,
                              );
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                {project.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-500">Project</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-end gap-3 relative flex-1 min-w-0">
            <ThemeToggle />
            {/* Notifications */}
            <div className="relative">
              <PrimaryButton
                leftIcon={<Bell className="size-5" />}
                type={"Outline"}
                onClick={() => setIsOpen(true)}
                tooltip="Notifications"
                className="h-12 w-12 p-0 flex items-center justify-center shrink-0"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 pointer-events-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <NotificationModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
            <div>
              {(currentPath.includes("/project-details") || currentPath.includes("/program-details")) && (
                <DateRangePicker
                  dateRange={dateRange}
                  setDateRange={handleSetDateRange}
                />
              )}
            </div>
          </div>
        </div>

        {/* Search (Mobile/Tablet only) */}
        <div className="w-full relative group px-0 mt-2 block lg:hidden">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} className="w-full" />
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 mx-0 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border dark:border-slate-800 max-h-[400px] overflow-y-auto z-50 py-2">
              {filteredPrograms.length === 0 && filteredProjects.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">
                  No results found
                </div>
              ) : (
                <>
                  {filteredPrograms.length > 0 && (
                    <div className="mb-2">
                      <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                        Programs
                      </h3>
                      {filteredPrograms.map((program: any) => (
                        <div
                          key={program.id}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors"
                          onClick={() => {
                            setSearchTerm("");
                            navigate(
                              `/viewer-panel/all-program/program-overview/${program.id}`,
                            );
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                              {program.programName || program.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Program</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredProjects.length > 0 && (
                    <div>
                      <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                        Projects
                      </h3>
                      {filteredProjects.map((project: any) => (
                        <div
                          key={project.id}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors"
                          onClick={() => {
                            setSearchTerm("");
                            navigate(
                              `/viewer-panel/all-program/program-overview/${project.programId}/project-details/${project.id}`,
                            );
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                              {project.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Project</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="flex items-center gap-1">
                <Link to="/viewer-panel">
                  <LayoutDashboard className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {currentRoute ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#356DF0] dark:text-blue-400 flex items-center justify-center gap-1 ">
                  {currentRoute.icon && React.isValidElement(currentRoute.icon)
                    ? cloneElement(
                      currentRoute.icon as React.ReactElement<{
                        className?: string;
                      }>,
                      { className: "w-4 h-4" },
                    )
                    : null}
                  {currentRoute.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : currentPath.includes("/project-details/") ? (
              <>
                {currentPath.includes("/all-program/") ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild className="text-[#356DF0] dark:text-blue-400 flex items-center gap-1">
                        <Link to="/viewer-panel/all-program">
                          <Folder className="w-4 h-4" />
                          All Program
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {projectDetails?.project?.program?.programName && (
                      <>
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild className="text-[#356DF0] dark:text-blue-400 flex items-center gap-1">
                            <Link
                              to={`/viewer-panel/all-program/program-overview/${projectDetails.project.programId}`}
                            >
                              <Layers className="w-4 h-4" />
                              {projectDetails.project.program.programName}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild className="text-[#356DF0] dark:text-blue-400 flex items-center gap-1">
                        <Link to="/viewer-panel">
                          <LayoutDashboard className="w-4 h-4" />
                          Overview
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1 text-gray-900 dark:text-slate-100">
                    <Briefcase className="w-4 h-4" />
                    {projectDetails?.project?.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : currentPath.includes("/program-overview/") ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="text-[#356DF0] dark:text-blue-400 flex items-center gap-1">
                    <Link to="/viewer-panel/all-program">
                      <Folder className="w-4 h-4" />
                      All Program
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1 text-gray-900 dark:text-slate-100">
                    <Layers className="w-4 h-4" />
                    {programDetails?.programName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default ViewerPanelHeader;
