/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  List,
  LayoutGrid,
  Clock,
  FileText,
  Layers,
  Briefcase,
} from "lucide-react";
import SearchBar from "@/Common/SearchBar";
import type { IsPageMap } from "./types";

/** 5-tab definition for project / review detail pages */
const PROJECT_TABS = [
  { id: "gantt", name: "Gantt", icon: List },
  { id: "sheet", name: "Sheet", icon: LayoutGrid },
  { id: "dashboard", name: "Dashboard", icon: Clock },
  { id: "files", name: "Files", icon: FileText },
];

interface HeaderCenterSectionProps {
  isPage: IsPageMap;
  activeTab: string;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  programId?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredPrograms: any[];
  filteredProjects: any[];
  navigate: (path: string) => void;
  currentPath: string;
  /** When true renders the mobile fallback version (lg:hidden, stacked below title row) */
  mobile?: boolean;
}

/**
 * HeaderCenterSection — PART 2 (Center column)
 *
 * Renders one of three variants depending on the current page:
 *   Variant A — 5-tab switcher (Gantt / Sheet / Dashboard / Files / Raid Log)
 *               shown on project-detail and review-detail pages
 *   Variant B — 2-tab switcher (Overview / Dashboard)
 *               shown on program-overview pages
 *   Variant C — Global search bar with live program/project results dropdown
 *               shown on all other pages
 *
 * The `mobile` prop switches the container class:
 *   desktop → hidden lg:flex (inside the main row)
 *   mobile  → lg:hidden (stacked below the row)
 */
const HeaderCenterSection: React.FC<HeaderCenterSectionProps> = ({
  isPage,
  activeTab,
  searchParams,
  setSearchParams,
  programId,
  searchTerm,
  setSearchTerm,
  filteredPrograms,
  filteredProjects,
  navigate,
  currentPath,
  mobile = false,
}) => {
  if (isPage.publish || isPage.programBuilder) {
    return null;
  }

  /* ── Outer wrapper class switches between desktop / mobile modes ── */
  const wrapperClass = mobile
    ? "flex-1 w-full lg:w-auto flex justify-center mt-2 lg:mt-0 relative group px-0 lg:px-4 lg:hidden"
    : "lg:flex-none lg:w-[320px] xl:w-[450px] 2xl:w-[650px] w-full flex justify-center mt-2 lg:mt-0 relative group px-0 lg:px-4 hidden lg:flex z-10";

  return (
    <div className={wrapperClass}>
      {isPage.projectDetails || isPage.projectReviewDetails ? (
        // Variant A: Project/Review details page → 5-tab switcher
        <div className="w-full grid grid-cols-4 bg-white dark:bg-slate-900 items-center border border-gray-200 dark:border-slate-800 rounded-lg gap-1 p-1">
          {PROJECT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("tab", tab.id);
                  setSearchParams(params);
                }}
                className={`flex items-center justify-center ${mobile ? "gap-1.5 py-2 text-xs md:text-sm" : "gap-2 py-2.5 text-sm"} px-2 font-medium transition-all cursor-pointer rounded-lg ${isActive
                  ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
              >
                <Icon size={mobile ? 16 : 18} className="shrink-0" />
                <span className="hidden sm:inline truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>
      ) : isPage.programOverview ? (
        // Variant B: Program overview page → 2-tab switcher (Overview / Dashboard)
        <div className="flex bg-white dark:bg-slate-900 items-center border border-gray-200 dark:border-slate-800 rounded-lg space-x-1 p-1">
          {[
            { id: "overview", name: "Overview", icon: Layers },
            { id: "dashboard", name: "Dashboard", icon: LayoutGrid },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.id === "dashboard"
                ? currentPath.includes("/program-details")
                : !currentPath.includes("/program-details");

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "overview") {
                    navigate(
                      `/client-panel/all-program/program-overview/${programId}`,
                    );
                  } else {
                    navigate(
                      `/client-panel/all-program/program-overview/${programId}/program-details`,
                    );
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer rounded-lg ${isActive
                  ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        // Variant C: All other pages — global search bar with live results dropdown
        <>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border dark:border-slate-800 max-h-[400px] overflow-y-auto z-50 py-2">
              {/* Search results dropdown — programs listed first, then projects */}
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
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors"
                          onClick={() => {
                            setSearchTerm("");
                            navigate(
                              `/client-panel/all-program/program-overview/${program.id}`,
                            );
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {program.programName || program.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Program
                            </p>
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
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors"
                          onClick={() => {
                            setSearchTerm("");
                            navigate(
                              `/client-panel/all-program/program-overview/${project.programId}/project-details/${project.id}`,
                            );
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {project.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Project
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HeaderCenterSection;
