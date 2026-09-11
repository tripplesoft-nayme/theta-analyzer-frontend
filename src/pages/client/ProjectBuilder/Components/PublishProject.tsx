import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setIsPublished } from "@/store/Slices/ChartSlice/ChartSlice";
import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Suspense } from "react";
const ProjectDashboardView = lazyWithRetry(() => import("./ProjectDashboardView/ProjectDashboardView"));

const PublishProject = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { projectId: paramProjectId, programId: paramProgramId } = useParams();
  const {
    projectId: reduxProjectId,
    programId: reduxProgramId,
    selectedWidgets,
  } = useAppSelector((state) => state.chartSlice);

  const isProgramBuilderRoute = location.pathname.includes("program-builder");
  const projectId = paramProjectId || (!isProgramBuilderRoute ? reduxProjectId : undefined);
  const programId = paramProgramId || (isProgramBuilderRoute ? reduxProgramId : undefined);
  const isProgramBuilder = isProgramBuilderRoute;
  console.log(programId)

  useEffect(() => {
    dispatch(setIsPublished(true));
    return () => {
      dispatch(setIsPublished(false));
    };
  }, [dispatch]);

  return (
    <div className="bg-transparent transition-colors duration-300">
      <Suspense fallback={<div className="w-full animate-pulse bg-skeleton-bg rounded-lg h-[600px]" />}>
        <ProjectDashboardView
          projectId={projectId as string}
          isProgramBuilder={isProgramBuilder}
          isPreviewOrPublished={true}
          selectedWidgets={selectedWidgets}
          hiddenDefaultWidgets={[]}
          handleDefaultDelete={() => { }}
          handleDefaultCopy={() => { }}
          handleWidgetDelete={() => { }}
        />
      </Suspense>
    </div>
  );
};

export default PublishProject;
