/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Command, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetGlobalSearchItemsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function GlobalSearch() {
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useGetGlobalSearchItemsQuery(searchText, {
    skip: !searchText,
  });

  const showDropdown = searchText.length > 0;

  // if click outside then hiding the popover 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSearchText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // focus search text input field on "Ctrl + K" key press
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        containerRef.current?.querySelector("input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // close search result showing on "Esc" button press 
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchText("");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);


  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

        <Input
          placeholder="Search anything here..."
          className="pl-10 py-6 border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-lg p-1.5 flex items-center gap-1 text-sm border border-border dark:border-slate-700">
          <Command className="h-3.5 w-3.5 " /> K
        </div>
      </div>

      {/* Result dropdown */}
      {showDropdown && (
        <div className="min-h-44 absolute z-[100] mt-2 w-full rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {isLoading && (
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-full bg-gray-100 dark:bg-slate-800" />
              <Skeleton className="h-4 w-3/4 bg-gray-50 dark:bg-slate-800/50" />
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-gray-400 dark:text-slate-500 text-center">
              Something went wrong in searching result.
            </div>
          )}

          {!isLoading && data.data.projects.length === 0 && data.data.programs.length === 0 && data.data.employees.length === 0 && (
            <div className="h-44 p-6 text-sm flex justify-center items-center text-gray-400 dark:text-slate-500 italic">
              No project/program/employee information found.
            </div>
          )}

          <div className="p-2 max-h-[450px] overflow-y-auto custom-scrollbar">
            {!isLoading && data?.data && (
              <div className="space-y-6 p-1">
                {/* --- PROJECTS --- */}
                {data.data.projects?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2 px-2 border-b border-border dark:border-slate-800">
                      <div className="h-1 w-1 bg-indigo-500 rounded-full" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 pb-1">Projects</h3>
                    </div>
                    <div className="grid gap-1.5">
                      {data.data.projects.map((project: any) => (
                        <Link
                          key={project.id}
                          to={`/staff-manager-panel/projects/project-details/${project.id}`}
                          className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                          onClick={() => setSearchText("")}
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                              {project.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                              Program: <span className="text-indigo-400 dark:text-indigo-300 font-medium">{project.programName}</span>
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* --- PROGRAMS --- */}
                {data.data.programs?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2 px-2 border-b border-border dark:border-slate-800">
                      <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 pb-1">Programs</h3>
                    </div>
                    <div className="grid gap-1.5">
                      {data.data.programs.map((program: any) => (
                        <Link
                          key={program.id}
                          to={`/staff-manager-panel/all-program/program-overview/${program.id}`}
                          className="group p-3 rounded-xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all"
                          onClick={() => setSearchText("")}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{program.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight 
                    ${program.priority === 'high' ? 'bg-red-100 dark:bg-rose-500/20 text-red-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'}`}>
                              {program.priority}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* --- EMPLOYEES --- */}
                {data.data.employees?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2 px-2 border-b border-border dark:border-slate-800">
                      <div className="h-1 w-1 bg-orange-500 rounded-full" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 pb-1">Team Members</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {data.data.employees.map((employee: any) => (
                        <Link
                          key={employee.id}
                          to="#"
                          className="group flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-orange-100 dark:hover:border-orange-900/30 hover:bg-orange-50/40 dark:hover:bg-orange-900/20 transition-all"
                        >
                          <div className="relative">
                            <img
                              src={employee.image || 'https://ui-avatars.com/api/?name=' + employee.name}
                              className="h-10 w-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform border border-border dark:border-slate-800"
                              alt=""
                            />
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 dark:text-slate-200 group-hover:text-orange-700 dark:group-hover:text-orange-400 line-clamp-1">{employee.name}</span>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium line-clamp-1">{employee.email}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
