import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { Suspense } from "react";
import ViewerPanelSkeleton from "@/Common/Skeleton/ViewerPanelSkeleton";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useLocation } from "react-router-dom";

const CostOverview = lazyWithRetry(() => import("@/Common/Charts/CostOverview"));
const PhasePlan = lazyWithRetry(() => import("@/Common/Charts/PhasePlan"));
const ProgressChart = lazyWithRetry(() => import("@/Common/Charts/Progress"));
const ProgressRing = lazyWithRetry(() => import("@/Common/Charts/ProgressRingTest"));
const ProjectCostChart = lazyWithRetry(() => import("@/Common/Charts/ProjectCost"));
const ProjectInformation = lazyWithRetry(() => import("@/Common/Charts/ProjectInfo"));
const EmployeeWorkloadChart = lazyWithRetry(() => import("@/Common/Charts/WorkLoad"));

const ViewerPanelProjects = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const { data, isLoading } = useGetProjectByIdQuery(id, {
    skip: !id,
  });
  const projectData = data?.data?.project;

  return (
    <div className="">
      {!id ? (
        <div className="text-center text-6xl font-semibold text-gray-200 dark:text-slate-800 grid place-content-center h-[60vh]">
          No Project Found
        </div>
      ) : isLoading ? (
        <ViewerPanelSkeleton />
      ) : (
        <Suspense fallback={<ViewerPanelSkeleton />}>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 relative">
              <div className="h-full">
                <ProjectInformation projectData={projectData} />
              </div>
              <div className="h-full">
                <ProgressRing />
              </div>
              <div className="h-full md:col-span-2 xl:col-span-1">
                <EmployeeWorkloadChart />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ProgressChart />
              <ProjectCostChart />
            </div>
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <CostOverview />
                <PhasePlan />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <img src="man.png" alt="Not Found" className="max-w-full h-auto" />
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
};
export default ViewerPanelProjects;

