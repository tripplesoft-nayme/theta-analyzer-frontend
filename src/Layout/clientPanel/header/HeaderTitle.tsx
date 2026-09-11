/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { IsPageMap } from "./types";

interface HeaderTitleProps {
  isPage: IsPageMap;
  programName?: string;
  projectName?: string;
  projectStatus?: string;
  allTags: string[];
  name?: string;
  currentPath: string;
  currentRoute: any;
  statusColor: (status?: string) => string;
  handleSelectStatus: (tag: string) => void;
  isStatusPopoverOpen: boolean;
  setIsStatusPopoverOpen: (open: boolean) => void;
}

/**
 * HeaderTitle — PART 1 (Left column)
 *
 * Renders the mobile sidebar trigger + the page title block.
 * The title switches between:
 *   - Program name (program builder / overview pages)
 *   - Project name + editable status badge (project detail pages)
 *   - Welcome greeting (dashboard home)
 *   - Generic route name / description (all other pages)
 */
const HeaderTitle: React.FC<HeaderTitleProps> = ({
  isPage,
  programName,
  projectName,
  projectStatus,
  allTags,
  name,
  currentPath,
  currentRoute,
  statusColor,
  handleSelectStatus,
  isStatusPopoverOpen,
  setIsStatusPopoverOpen,
}) => {
  return (
    <div className="flex items-center gap-4 w-full sm:w-auto lg:flex-1 min-w-0">
      {/* Mobile sidebar hamburger trigger */}
      <SidebarTrigger className="md:hidden shrink-0" />

      {currentPath.includes("/client-panel") && (
        <div className="min-w-0">
          {/* Title text — switches between program name, project name, welcome, or route name */}

          {(isPage.programOverview || isPage.programDetails || isPage.programBuilder) &&
            programName ? (
            /* Program name + subtitle */
            <>
              <h1 className="text-[28px] font-semibold text-primary-text dark:text-slate-100 truncate">
                {programName}
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 truncate">
                {isPage.programBuilder
                  ? "Build your programs dashboard"
                  : "Program overview and management"}
              </p>
            </>
          ) : (isPage.projectDetails || isPage.projectReviewDetails) && projectName ? (
            /* Project name + status badge (clickable popover for owners, static for reviewers) */
            <div>
              <h1 className="text-[28px] text-wrap font-semibold dark:text-slate-100 leading-tight inline items-center">
                <span className="mr-2 text-primary-text dark:text-slate-100">
                  {projectName}
                </span>
                {projectStatus && (
                  isPage.projectReviewDetails ? (
                    /* Review mode — status is read-only */
                    <span
                      className={`inline-block align-middle px-1.5 py-0.5 rounded-md text-[10px] font-semibold capitalize border cursor-default ${statusColor(projectStatus)}`}
                    >
                      {projectStatus}
                    </span>
                  ) : (
                    /* Builder mode — status opens an editable popover */
                    <Popover
                      open={isStatusPopoverOpen}
                      onOpenChange={setIsStatusPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <span
                          className={`inline-block align-middle px-1.5 py-0.5 rounded-md text-[10px] font-semibold capitalize border cursor-pointer hover:opacity-85 transition-all ${statusColor(projectStatus)}`}
                        >
                          {projectStatus}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-xl z-50">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 px-2 py-1">
                            Update Status
                          </p>
                          {allTags?.map((tag: string) => (
                            <button
                              key={tag}
                              onClick={() => handleSelectStatus(tag)}
                              className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${String(projectStatus).toLowerCase() === tag.toLowerCase()
                                ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                                : "text-slate-700 dark:text-slate-300"
                                }`}
                            >
                              <span>{tag}</span>
                              {String(projectStatus).toLowerCase() ===
                                tag.toLowerCase() && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                )}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                )}
              </h1>
            </div>
          ) : currentPath === "/client-panel" ? (
            /* Dashboard home — personalised welcome */
            <>
              <h1 className="text-[28px] font-semibold text-primary-text dark:text-slate-100 truncate">
                {`Welcome, ${name || ""} 👋`}
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 truncate">
                {currentRoute?.description ||
                  "This is dashboard overview of Theta Analyzer"}
              </p>
            </>
          ) : (
            /* Generic route title */
            <>
              <h1 className="text-[28px] font-semibold text-primary-text dark:text-slate-100 truncate">
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderTitle;
