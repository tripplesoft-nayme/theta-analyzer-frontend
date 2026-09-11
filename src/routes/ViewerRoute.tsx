import { Suspense } from "react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";

import ViewerPanelOverview from "@/pages/viewerPanel/ViewerPanelOverview/ViewerPanelOverview";
import ProgramOverviewContainer from "@/pages/client/Program/Components/ProgramOverviewContainer";

const ViewerPanelProjects = lazyWithRetry(() => import("@/pages/viewerPanel/ViewerPanelOverview/Components/ViewerPanelProjects"));
const ViewerPanelSettings = lazyWithRetry(() => import("@/pages/viewerPanel/Settings/ViewerPanelSettings"));
const AllProject = lazyWithRetry(() => import("@/pages/viewerPanel/ViewerPanelOverview/Components/AllProject"));
const ProfilePage = lazyWithRetry(() => import("@/pages/commonPage/ProfilePage"));
const NotificationsPage = lazyWithRetry(() => import("@/pages/commonPage/NotificationsPage"));
const ProjectDetails = lazyWithRetry(() => import("@/pages/client/ProjectDetails/ProjectDetails"));
const ViewerPanelAllProgram = lazyWithRetry(() => import("@/pages/viewerPanel/AllProgram/ViewerPanelAllProgram"));
const ProgramDetails = lazyWithRetry(() => import("@/pages/client/ProgramDetails/ProgramDetails"));

import ProjectDetailsSkeleton from "@/Common/Skeleton/ProjectDetailsSkeleton";
import ProgramDetailsSkeleton from "@/Common/Skeleton/ProgramDetailsSkeleton";
import ProfilePageSkeleton from "@/Common/Skeleton/pages/commonPage/ProfilePageSkeleton";
import ViewerPanelProjectsSkeleton from "@/Common/Skeleton/pages/viewerPanel/ViewerPanelProjectsSkeleton";
import ViewerPanelSettingsSkeleton from "@/Common/Skeleton/pages/viewerPanel/ViewerPanelSettingsSkeleton";
import ViewerPanelAllProgramSkeleton from "@/Common/Skeleton/pages/viewerPanel/ViewerPanelAllProgramSkeleton";

export default function getViewerPanelRoutes() {
  return [
    {
      path: "",
      element: <ViewerPanelOverview />,
      children: [
        {
          index: true,
          element: <Suspense fallback={<ProjectDetailsSkeleton />}><AllProject /></Suspense>
        },
        {
          element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense>,
        },
      ],
    },
    { path: "project-details/:projectId", element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense> },
    {
      path: "all-program",
      children: [
        { index: true, element: <Suspense fallback={<ViewerPanelAllProgramSkeleton />}><ViewerPanelAllProgram /></Suspense> },
        {
          path: "program-overview/:programId",
          element: <ProgramOverviewContainer />,
          children: [
            { index: true, element: <Suspense fallback={<ProgramDetailsSkeleton />}><ProgramDetails /></Suspense> },
            { path: "program-details", element: <Suspense fallback={<ProgramDetailsSkeleton />}><ProgramDetails /></Suspense> },
            {
              path: "project-details/:projectId",
              element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense>,
            },
          ],
        },
      ],
    },
    { path: "projects", element: <Suspense fallback={<ViewerPanelProjectsSkeleton />}><ViewerPanelProjects /></Suspense> },
    { path: "settings", element: <Suspense fallback={<ViewerPanelSettingsSkeleton />}><ViewerPanelSettings /></Suspense> },
    { path: "profile", element: <Suspense fallback={<ProfilePageSkeleton />}><ProfilePage /></Suspense> },
    { path: "notifications", element: <Suspense fallback={<ProfilePageSkeleton />}><NotificationsPage /></Suspense> },
  ];
}
