import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useRedux";
import { setProgramId } from "@/store/Slices/ChartSlice/ChartSlice";
import { useGetProgramBuilderChartQuery } from "@/store/Api/ChartApi/ChartApi";
import { Suspense } from "react";
const ProjectDashboardView = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/ProjectDashboardView/ProjectDashboardView"));
import ChartSkeleton from "@/Common/Skeleton/ChartSkeleton";

const ProgramDetails = () => {
  const { programId } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const resolvedProgramId = location.state?.programId || programId;

  useEffect(() => {
    if (resolvedProgramId) {
      dispatch(setProgramId(resolvedProgramId));
    }
  }, [resolvedProgramId, dispatch]);

  const { data, isLoading } = useGetProgramBuilderChartQuery(
    resolvedProgramId as string,
    {
      skip: !resolvedProgramId,
    },
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        <ChartSkeleton />
        <div className="grid grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const resData = data?.data;
  let charts: any[] = [];
  if (Array.isArray(resData)) {
    charts = resData;
  } else if (resData?.charts && Array.isArray(resData.charts)) {
    charts = resData.charts;
  } else if (Array.isArray(data)) {
    charts = data;
  }

  // Double check isLoading and isFetching for safety
  if (!isLoading && charts.length === 0) {
    return (
      <h1 className="w-full h-[60vh] flex items-center justify-center text-5xl md:text-7xl lg:text-8xl font-bold text-gray-100 dark:text-slate-800 uppercase text-center animate-pulse">
        No Data Available
      </h1>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 transition-colors duration-300">
      <Suspense fallback={<ChartSkeleton />}>
        <ProjectDashboardView
          projectId={""}
          isProgramBuilder={true}
          isPreviewOrPublished={true}
          isReadOnly={true}
          selectedWidgets={[]}
          hiddenDefaultWidgets={[]}
          handleDefaultDelete={() => { }}
          handleDefaultCopy={() => { }}
          handleWidgetDelete={() => { }}
        />
      </Suspense>
    </div>
  );
};

export default ProgramDetails;

