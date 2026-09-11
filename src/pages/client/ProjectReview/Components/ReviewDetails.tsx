import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetSubmissionPreviewQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import { Suspense, useMemo } from "react";
// import { ProjectTableSkeleton } from "@/Common/Skeleton/Skeleton";
import ProjectBuilderPlaceholderChartSkeleton from "@/Common/Skeleton/ProjectBuilderPlaceholderChartSkeleton";
import ClientWorkInProgress from "@/Common/ClientWorkInProgress";

const ProjectDashboardView = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/ProjectDashboardView/ProjectDashboardView"));
const SheetTab = lazyWithRetry(() => import("@/pages/client/ProjectDetails/AllDataTab/SheetTab"));
const GanttTab = lazyWithRetry(() => import("@/pages/client/ProjectDetails/AllDataTab/GanttTab"));
const StaffEmployeeFiles = lazyWithRetry(() => import("@/pages/staffEmployee/Files/StaffEmployeeFiles"));
const RaidLogTab = lazyWithRetry(() => import("@/pages/client/ProjectDetails/AllDataTab/RaidLogTab"));

import SheetTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/SheetTabSkeleton";
import GanttTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/GanttTabSkeleton";
import StaffEmployeeFilesSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeFilesSkeleton";
import RaidLogTabSkeleton from "@/Common/Skeleton/pages/client/ProjectDetails/AllDataTab/RaidLogTabSkeleton";

const EMPTY_GROUPS: any[] = [];

const ReviewDetails = () => {
  const { submissionId, projectId } = useParams<{
    submissionId: string;
    projectId: string;
  }>();

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  // Fetch submission preview data
  const {
    data: submissionData,
    isLoading: isSubmissionLoading,
    isError: isSubmissionError,
  } = useGetSubmissionPreviewQuery(
    {
      submittedId: submissionId as string,
      projectId: projectId as string,
    },
    {
      skip: !submissionId || !projectId,
    }
  );

  const groups = useMemo(() => submissionData?.data?.groups || EMPTY_GROUPS, [submissionData]);

  if (!submissionId || !projectId) {
    return null;
  }

  if (isSubmissionLoading) {
    return (
      <div className="container mx-auto space-y-6 animate-pulse">
        <ProjectBuilderPlaceholderChartSkeleton />
      </div>
    );
  }

  if (isSubmissionError || !submissionData?.success) {
    return <ClientWorkInProgress message="No charts available" />;
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="mb-6">
        <div className={activeTab === "sheet" ? "block" : "hidden"}>
          <Suspense fallback={<SheetTabSkeleton />}>
            <SheetTab />
          </Suspense>
        </div>
        {activeTab === "gantt" && (
          <Suspense fallback={<GanttTabSkeleton />}>
            <GanttTab />
          </Suspense>
        )}
        {activeTab === "dashboard" && (
          <>
            <Suspense fallback={<ProjectBuilderPlaceholderChartSkeleton />}>
              <ProjectDashboardView
                projectId={projectId as string}
                groups={groups}
                isPreviewOrPublished={true}
                isReadOnly={true}
              />
            </Suspense>

            {(!groups || groups.length === 0) && (
              <div className="mt-6 p-12 text-center text-gray-500 dark:text-slate-500 border-2 border-dashed rounded-xl border-border dark:border-slate-800/50">
                No charts available for this submission.
              </div>
            )}
          </>
        )}
        {activeTab === "files" && (
          <Suspense fallback={<StaffEmployeeFilesSkeleton />}>
            <StaffEmployeeFiles />
          </Suspense>
        )}
        {activeTab === "raidlog" && (
          <Suspense fallback={<RaidLogTabSkeleton />}>
            <RaidLogTab />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default ReviewDetails;

