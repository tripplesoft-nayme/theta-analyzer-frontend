import { Suspense } from "react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import StaffManagerHelp from "@/pages/staffManager/Support/StaffManagerHelp";
import StaffManagerSupport from "@/pages/staffManager/Support/StaffManagerSupport";
import ClientProjectBuilderContainer from "@/pages/client/ProjectBuilder/ClientProjectBuilderContainer";
import ClientAllProgramContainer from "@/pages/client/Program/ClientAllProgramContainer";
import ProjectReviewContainer from "@/pages/client/ProjectReview/ProjectReviewContainer";
import ReviewContainer from "@/pages/commonPage/ProjectReview/ReviewContainer";
import ProgramOverviewContainer from "@/pages/client/Program/Components/ProgramOverviewContainer";

const StaffManagerOverview = lazyWithRetry(() => import("@/pages/staffManager/Overview/StaffManagerOverview"));
const StaffManagerProjects = lazyWithRetry(() => import("@/pages/staffManager/Projects/StaffManagerProjects"));
const StaffManagerProgramName = lazyWithRetry(() => import("@/pages/staffManager/Program/StaffManagerProgramName"));
const StaffManagerSupportTickets = lazyWithRetry(() => import("@/pages/staffManager/Support/Components/StaffManagerSupportTickets"));
const StaffManagerSettings = lazyWithRetry(() => import("@/pages/staffManager/Settings/StaffManagerSettings"));
const StaffManagerAllProgram = lazyWithRetry(() => import("@/pages/staffManager/Program/StaffManagerAllProgram"));
const StaffManagerCreateTicket = lazyWithRetry(() => import("@/pages/staffManager/Support/Components/StaffManagerCreateTicket"));
const StaffManagerStateCardDetails = lazyWithRetry(() => import("@/pages/staffManager/Overview/StaffManagerStateCardDetails"));
const StaffManagerUploadSubmission = lazyWithRetry(() => import("@/pages/staffManager/Projects/StaffManagerUploadSubmission"));
const AllProjectsReview = lazyWithRetry(() => import("@/pages/staffManager/ProjectReview/AllProjectsReview"));
const StaffManagerProgramOverview = lazyWithRetry(() => import("@/pages/staffManager/Program/StaffManagerProgramOverview"));
const DashboardCardProjects = lazyWithRetry(() => import("@/pages/staffManager/Projects/DashboardCardProjects"));
const ClientProjectBuilder = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/ClientProjectBuilder"));
const ProfilePage = lazyWithRetry(() => import("@/pages/commonPage/ProfilePage"));
const NotificationsPage = lazyWithRetry(() => import("@/pages/commonPage/NotificationsPage"));
const PublishProject = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/PublishProject"));
const FileUpload = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/FileUpload"));
const ProjectDetails = lazyWithRetry(() => import("@/pages/client/ProjectDetails/ProjectDetails"));
const ReviewDetails = lazyWithRetry(() => import("@/pages/client/ProjectReview/Components/ReviewDetails"));
const ProgramDetails = lazyWithRetry(() => import("@/pages/client/ProgramDetails/ProgramDetails"));

import ProjectDetailsSkeleton from "@/Common/Skeleton/ProjectDetailsSkeleton";
import ReviewDetailsSkeleton from "@/Common/Skeleton/ReviewDetailsSkeleton";
import ProgramDetailsSkeleton from "@/Common/Skeleton/ProgramDetailsSkeleton";
import ProfilePageSkeleton from "@/Common/Skeleton/pages/commonPage/ProfilePageSkeleton";
import StaffManagerOverviewSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerOverviewSkeleton";
import StaffManagerProjectsSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerProjectsSkeleton";
import StaffManagerProgramNameSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerProgramNameSkeleton";
import StaffManagerSupportTicketsSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerSupportTicketsSkeleton";
import StaffManagerSettingsSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerSettingsSkeleton";
import StaffManagerAllProgramSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerAllProgramSkeleton";
import StaffManagerCreateTicketSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerCreateTicketSkeleton";
import StaffManagerStateCardDetailsSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerStateCardDetailsSkeleton";
import StaffManagerUploadSubmissionSkeleton from "@/Common/Skeleton/pages/staffManager/StaffManagerUploadSubmissionSkeleton";
import DashboardCardProjectsSkeleton from "@/Common/Skeleton/pages/staffManager/DashboardCardProjectsSkeleton";
import ClientProjectBuilderSkeleton from "@/Common/Skeleton/pages/client/ProjectBuilder/ClientProjectBuilderSkeleton";
import ClientProjectReviewSkeleton from "@/Common/Skeleton/ClientProjectReviewSkeleton";

export function getStaffManagerRoutes() {
  return [
    { index: true, element: <Suspense fallback={<StaffManagerOverviewSkeleton />}><StaffManagerOverview /></Suspense> },
    {
      path: "projects",
      element: <ProjectReviewContainer />,
      children: [
        { index: true, element: <Suspense fallback={<StaffManagerProjectsSkeleton />}><StaffManagerProjects /></Suspense> },
        { path: "project-details/:projectId", element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense> },
        { path: "status/:status", element: <Suspense fallback={<DashboardCardProjectsSkeleton />}><DashboardCardProjects /></Suspense> },
      ],
    },
    {
      path: "projects/upload-submission",
      element: <Suspense fallback={<StaffManagerUploadSubmissionSkeleton />}><StaffManagerUploadSubmission /></Suspense>,
    },
    {
      path: "all-program",
      element: <ClientAllProgramContainer />,
      children: [
        { index: true, element: <Suspense fallback={<StaffManagerAllProgramSkeleton />}><StaffManagerAllProgram /></Suspense> },
        {
          path: "program-overview/:programId",
          element: <ProgramOverviewContainer />,
          children: [
            { index: true, element: <Suspense fallback={<ProgramDetailsSkeleton />}><StaffManagerProgramOverview /></Suspense> },
            { path: "program-details", element: <Suspense fallback={<ProgramDetailsSkeleton />}><ProgramDetails /></Suspense> },
            {
              path: "project-details/:projectId",
              element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense>,
            },
          ],
        },
      ],
    },

    { path: "program-name", element: <Suspense fallback={<StaffManagerProgramNameSkeleton />}><StaffManagerProgramName /></Suspense> },
    {
      path: "project-builder",
      element: <ClientProjectBuilderContainer />,
      children: [
        { index: true, element: <Suspense fallback={<ClientProjectBuilderSkeleton />}><ClientProjectBuilder /></Suspense> },
        { path: "publish/:projectId", element: <Suspense fallback={<ProjectDetailsSkeleton />}><PublishProject /></Suspense> },
        { path: "file-upload/:projectId", element: <Suspense fallback={null}><FileUpload /></Suspense> },
        { path: "project-details/:projectId", element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense> },
      ],
    },
    {
      path: "project-review",
      element: <ReviewContainer />,
      children: [
        { index: true, element: <Suspense fallback={<ClientProjectReviewSkeleton />}><AllProjectsReview /></Suspense> },
        {
          path: ":submissionId/:projectId",
          element: <Suspense fallback={<ReviewDetailsSkeleton />}><ReviewDetails /></Suspense>,
        },
      ],
    },
    {
      path: "help",
      element: <StaffManagerHelp />,
      children: [
        {
          path: "support",
          element: <StaffManagerSupport />,
          children: [
            { index: true, element: <Suspense fallback={<StaffManagerSupportTicketsSkeleton />}><StaffManagerSupportTickets /></Suspense> },
            { path: "create-tickets", element: <Suspense fallback={<StaffManagerCreateTicketSkeleton />}><StaffManagerCreateTicket /></Suspense> },
          ],
        },
      ],
    },
    { path: "settings", element: <Suspense fallback={<StaffManagerSettingsSkeleton />}><StaffManagerSettings /></Suspense> },
    {
      path: "state-card/:cardTitle",
      element: <Suspense fallback={<StaffManagerStateCardDetailsSkeleton />}><StaffManagerStateCardDetails /></Suspense>,
    },
    { path: "profile", element: <Suspense fallback={<ProfilePageSkeleton />}><ProfilePage /></Suspense> },
    { path: "notifications", element: <Suspense fallback={<ProfilePageSkeleton />}><NotificationsPage /></Suspense> },
  ];
}
