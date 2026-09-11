import { lazyWithRetry } from "@/utils/lazyWithRetry";
import ChartSkeleton from "@/Common/Skeleton/ChartSkeleton";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import {
  useGetRootChartQuery,
  useGetProjectInformationTableQuery,
} from "@/store/Api/ChartApi/ChartApi";
import { useGetProjectFilesByGroupQuery } from "@/store/Api/Files/FilesApi";
import { Suspense, useMemo } from "react";
const ProjectDashboardView = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/ProjectDashboardView/ProjectDashboardView"));
import ClientWorkInProgress from "@/Common/ClientWorkInProgress";

const DashboardTab = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isViewerPanel = location.pathname.includes("/viewer-panel");

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const queryArg = useMemo(() => {
    if (isViewerPanel && startDate && endDate) {
      return {
        id: projectId as string,
        startDate: `${startDate}T00:00:00.000Z`,
        asOf: `${endDate}T00:00:00.000Z`,
      };
    }
    return projectId as string;
  }, [projectId, isViewerPanel, startDate, endDate]);

  const { data: rootChart, isLoading: rootChartLoading } = useGetRootChartQuery(
    queryArg,
    {
      skip: !projectId,
    },
  );

  const { data: tableConfigRes, isLoading: tableLoading } = useGetProjectInformationTableQuery(
    projectId as string,
    {
      skip: !projectId,
    },
  );

  const { data: filesData, isLoading: filesLoading } = useGetProjectFilesByGroupQuery(
    projectId as string,
    {
      skip: !projectId,
    },
  );

  const isLoading = rootChartLoading || tableLoading || filesLoading;

  // Helper to determine if we have any actual data to show
  const hasData = () => {
    // Check charts data
    const res = rootChart as any;
    const chartData = res?.data || res;
    const hasCharts = Array.isArray(chartData?.data) ? chartData.data.length > 0 : Array.isArray(chartData) ? chartData.length > 0 : false;

    // Check table data
    const tableBody = tableConfigRes as any;
    const tableData = tableBody?.data || tableBody;
    const hasTable = (Array.isArray(tableData) && tableData.length > 0) || (tableData?.columns && Array.isArray(tableData.columns) && tableData.columns.length > 0);

    // Check files data
    const filesBody = filesData?.data || filesData;
    const hasFiles = Array.isArray(filesBody) && filesBody.some((g: any) => Array.isArray(g.files) && g.files.length > 0);

    return hasCharts || hasTable || hasFiles;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <ChartSkeleton />
        <div className="grid grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!hasData()) {
    return <ClientWorkInProgress message="No Data Available" />;
  }

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ProjectDashboardView
        projectId={projectId as string}
        isPreviewOrPublished={true}
        isReadOnly={true}
        selectedWidgets={[]}
        hiddenDefaultWidgets={[]}
        handleDefaultDelete={() => { }}
        handleDefaultCopy={() => { }}
        handleWidgetDelete={() => { }}
      />
    </Suspense>
  );
};

export default DashboardTab;
