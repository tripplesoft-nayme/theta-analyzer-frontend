/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Command, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useSearchProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";

export default function StaffEmployeeGlobalSearch() {
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useSearchProjectsQuery(searchText, {
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text h-4 w-4" />

        <Input
          placeholder="Search anything here..."
          className="pl-10 py-6 border border-border bg-primary-bg text-primary-text placeholder:text-muted-text focus:ring-1 focus:ring-brand-primary"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-secondary-bg text-muted-text rounded-md p-1.5 flex items-center gap-1 text-xs font-medium">
          <Command className="h-3 w-3" /> K
        </div>
      </div>

      {/* Result dropdown */}
      {showDropdown && (
        <div className="min-h-44 absolute z-50 mt-2 w-full rounded-lg border border-border bg-primary-bg shadow-lg">
          {isLoading && (
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-full bg-secondary-bg" />
              <Skeleton className="h-4 w-3/4 bg-secondary-bg/50" />
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-muted-text text-center">
              Something went wrong in searching result.
            </div>
          )}

          {!isLoading && data?.data?.projects?.data?.length === 0 && data?.data?.programs?.data?.length === 0 && data?.data?.employees?.data?.length === 0 && (
            <div className="h-44 p-6 text-sm flex justify-center items-center text-muted-text">
              No project/program/employee information found.
            </div>
          )}

          <div className="p-2 max-h-[450px] overflow-y-auto custom-scrollbar">
            <div className="space-y-6 p-1">
              {/* --- PROJECTS --- */}
              {data?.data?.projects?.data.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2 px-2 border-b border-border">
                    <div className="h-1 w-1 bg-brand-primary rounded-full" />
                    <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted-text pb-1">Projects</h3>
                  </div>
                  <div className="grid gap-1.5">
                    {data.data.projects.data.map((project: any) => (
                      <Link
                        key={project.id}
                        to={`/staff-employee-panel/projects/project-details/${project.id}`}
                        className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all duration-200"
                        onClick={() => setSearchText("")}
                      >
                        <div>
                          <h6 className="text-sm font-medium text-primary-text group-hover:text-brand-primary transition-colors">
                            {project.name}
                          </h6>
                          <p className="text-xs text-secondary-text mt-0.5">
                            Program: <span className="text-brand-primary font-medium">{project?.program?.programName}</span>
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
