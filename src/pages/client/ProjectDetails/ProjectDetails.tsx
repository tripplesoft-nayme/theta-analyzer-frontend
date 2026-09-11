import { lazyWithRetry } from "@/utils/lazyWithRetry";
import React, { useEffect, Suspense } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const SheetTab = lazyWithRetry(() => import("./AllDataTab/SheetTab"));
const GanttTab = lazyWithRetry(() => import("./AllDataTab/GanttTab"));
const DashboardTab = lazyWithRetry(() => import("./AllDataTab/DashboardTab"));
const FileTab = lazyWithRetry(() => import("./AllDataTab/FileTab"));
const RaidLogTab = lazyWithRetry(() => import("./AllDataTab/RaidLogTab"));

import SheetTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/SheetTabSkeleton";
import GanttTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/GanttTabSkeleton";
import DashboardTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/DashboardTabSkeleton";
import FileTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/FileTabSkeleton";
import RaidLogTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/RaidLogTabSkeleton";

const ProjectDetails: React.FC = () => {
  const location = useLocation();
  const isViewerPanel = location.pathname.includes("/viewer-panel");

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  useEffect(() => {
    if (!isViewerPanel && activeTab) {
      localStorage.setItem("activeCarlyleTab", activeTab);
    }
  }, [activeTab, isViewerPanel]);

  return (
    <div className="min-h-screen bg-white dark:bg-transparent transition-colors duration-300">
      {/* Tabs handled by ClientDashboardHeader */}

      {/* Tab Content */}
      <div>
        {isViewerPanel ? (
          <Suspense fallback={<DashboardTabSkeleton />}>
            <DashboardTab />
          </Suspense>
        ) : (
          <>
            {activeTab === "sheet" && (
              <Suspense fallback={<SheetTabSkeleton />}>
                <SheetTab />
              </Suspense>
            )}
            {activeTab === "gantt" && (
              <Suspense fallback={<GanttTabSkeleton />}>
                <GanttTab />
              </Suspense>
            )}
            {activeTab === "dashboard" && (
              <Suspense fallback={<DashboardTabSkeleton />}>
                <DashboardTab />
              </Suspense>
            )}
            {activeTab === "files" && (
              <Suspense fallback={<FileTabSkeleton />}>
                <FileTab />
              </Suspense>
            )}
            {activeTab === "raidlog" && (
              <Suspense fallback={<RaidLogTabSkeleton />}>
                <RaidLogTab />
              </Suspense>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;

