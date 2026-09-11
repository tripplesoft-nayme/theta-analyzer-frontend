import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { Suspense } from "react";
import ViewerPanelSkeleton from "@/Common/Skeleton/ViewerPanelSkeleton";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useParams } from "react-router-dom";

const CostOverview = lazyWithRetry(() => import("@/Common/Charts/CostOverview"));
const PhasePlan = lazyWithRetry(() => import("@/Common/Charts/PhasePlan"));
const ProgressChart = lazyWithRetry(() => import("@/Common/Charts/Progress"));
const ProgressRing = lazyWithRetry(() => import("@/Common/Charts/ProgressRingTest"));
const ProjectCostChart = lazyWithRetry(() => import("@/Common/Charts/ProjectCost"));
const ProjectInformation = lazyWithRetry(() => import("@/Common/Charts/ProjectInfo"));
const EmployeeWorkloadChart = lazyWithRetry(() => import("@/Common/Charts/WorkLoad"));

const FavoriteProjects = () => {
  const { projectId } = useParams();
  const { data, isLoading } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });
  const projectData = data?.data?.project;

  return (
    <div className="">
      {!projectId ? (
        <div className="text-center text-6xl font-semibold text-gray-200 grid place-content-center h-[60vh]">
          No Project Found
        </div>
      ) : isLoading ? (
        <ViewerPanelSkeleton />
      ) : (
        <Suspense fallback={<ViewerPanelSkeleton />}>
          <div>
            <div className="flex 2xl:flex-row flex-col gap-6 items-stretch">
              <div className="flex-1 2xl:min-h-[600px]">
                <ProjectInformation projectData={projectData} />
              </div>
              <div className="flex-1 2xl:min-h-[600px]">
                <ProgressRing />
              </div>
              <div className="flex-1 2xl:min-h-[600px]">
                <EmployeeWorkloadChart />
              </div>
            </div>
            <div className="flex xl:flex-row flex-col gap-6 mt-6">
              <ProgressChart />
              <ProjectCostChart />
            </div>
            <div className="flex xl:flex-row flex-col gap-6 mt-6">
              <div className="flex-1 2xl:min-h-[400px]">
                <CostOverview />
              </div>
              <div className="flex-1 2xl:min-h-[400px]">
                <PhasePlan />
              </div>
            </div>
            <div className="flex justify-end gap-6 mt-6">
              <img src="/man.png" className="" alt="Not Found" />
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
};
export default FavoriteProjects;
