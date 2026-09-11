// src/routes/clientRoutes.tsx
import { Suspense } from "react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
const Employee = lazyWithRetry(() => import("@/pages/client/NewEmployee/Employee"));
const ProjectDetails = lazyWithRetry(() => import("@/pages/client/ProjectDetails/ProjectDetails"));
const SupportDashboard = lazyWithRetry(() => import("@/pages/client/Support/SupportDashboard"));
const ClientOverview = lazyWithRetry(() => import("@/pages/client/Overview/ClientOverview"));
const ClientProgramBuilder = lazyWithRetry(() => import("@/pages/client/ProgramBuilder/ClientProgramBuilder"));
const ClientProjectReview = lazyWithRetry(() => import("@/pages/client/ProjectReview/ClientProjectReview"));
const ClientProjectBuilder = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/ClientProjectBuilder"));
const ClientSettings = lazyWithRetry(() => import("@/pages/client/Settings/ClientSettings"));
const ClientActivityLog = lazyWithRetry(() => import("@/pages/client/ActivityLog/ClientActivityLog"));
const ClientHelp = lazyWithRetry(() => import("@/pages/client/Support/ClientHelp"));
const ClientCreateTicket = lazyWithRetry(() => import("@/pages/client/Support/components/Tickets/ClientCreateTicket"));
const ClientFeedback = lazyWithRetry(() => import("@/pages/client/Support/components/Feedback/ClientFeedback"));
const ClientContactUs = lazyWithRetry(() => import("@/pages/client/Support/components/ContactUs/ClientContactUs"));
const ClientWorkInProgress = lazyWithRetry(() => import("@/Common/ClientWorkInProgress"));
const ClientAllProgramContainer = lazyWithRetry(() => import("@/pages/client/Program/ClientAllProgramContainer"));
const ProgramOverviewContainer = lazyWithRetry(() => import("@/pages/client/Program/Components/ProgramOverviewContainer"));
const ProjectReviewContainer = lazyWithRetry(() => import("@/pages/client/ProjectReview/ProjectReviewContainer"));
const ClientOverviewContainer = lazyWithRetry(() => import("@/pages/client/Overview/ClientOverviewContainer"));
const ClientProjectBuilderContainer = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/ClientProjectBuilderContainer"));
const PublishProject = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/PublishProject"));
const FileUpload = lazyWithRetry(() => import("@/pages/client/ProjectBuilder/Components/FileUpload"));
const ProfilePage = lazyWithRetry(() => import("@/pages/commonPage/ProfilePage"));
const NotificationsPage = lazyWithRetry(() => import("@/pages/commonPage/NotificationsPage"));
const ReviewDetails = lazyWithRetry(() => import("@/pages/client/ProjectReview/Components/ReviewDetails"));
const ClientAllProgram = lazyWithRetry(() => import("@/pages/client/Program/Components/ClientAllProgram"));
const ProgramOverview = lazyWithRetry(() => import("@/pages/client/Program/Components/ProgramOverview"));
const ProgramDetails = lazyWithRetry(() => import("@/pages/client/ProgramDetails/ProgramDetails"));

import ClientOverviewSkeleton from "@/Common/Skeleton/ClientOverviewSkeleton";
import ProjectDetailsSkeleton from "@/Common/Skeleton/ProjectDetailsSkeleton";
import ReviewDetailsSkeleton from "@/Common/Skeleton/ReviewDetailsSkeleton";
import ClientProjectReviewSkeleton from "@/Common/Skeleton/ClientProjectReviewSkeleton";
import ProgramDetailsSkeleton from "@/Common/Skeleton/ProgramDetailsSkeleton";
import EmployeeSkeleton from "@/Common/Skeleton/pages/client/NewEmployee/EmployeeSkeleton";
import ClientAllProgramSkeleton from "@/Common/Skeleton/pages/client/Program/Components/ClientAllProgramSkeleton";
import ProgramOverviewSkeleton from "@/Common/Skeleton/pages/client/Program/Components/ProgramOverviewSkeleton";
import ClientProjectBuilderSkeleton from "@/Common/Skeleton/pages/client/ProjectBuilder/ClientProjectBuilderSkeleton";
import PublishProjectSkeleton from "@/Common/Skeleton/pages/client/ProjectBuilder/Components/PublishProjectSkeleton";
import FileUploadSkeleton from "@/Common/Skeleton/pages/client/ProjectBuilder/Components/FileUploadSkeleton";
import ClientActivityLogSkeleton from "@/Common/Skeleton/pages/client/ActivityLog/ClientActivityLogSkeleton";
import SupportDashboardSkeleton from "@/Common/Skeleton/pages/client/Support/SupportDashboardSkeleton";
import ClientCreateTicketSkeleton from "@/Common/Skeleton/pages/client/Support/components/Tickets/ClientCreateTicketSkeleton";
import ClientFeedbackSkeleton from "@/Common/Skeleton/pages/client/Support/components/Feedback/ClientFeedbackSkeleton";
import ClientContactUsSkeleton from "@/Common/Skeleton/pages/client/Support/components/ContactUs/ClientContactUsSkeleton";
import ClientSettingsSkeleton from "@/Common/Skeleton/pages/client/Settings/ClientSettingsSkeleton";
import ClientWorkInProgressSkeleton from "@/Common/Skeleton/Common/ClientWorkInProgressSkeleton";
import ProfilePageSkeleton from "@/Common/Skeleton/pages/commonPage/ProfilePageSkeleton";

export function getClientRoutes() {
  return [
    {
      path: "",
      element: (
        <Suspense fallback={<ClientOverviewSkeleton />}>
          <ClientOverviewContainer />
        </Suspense>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<ClientOverviewSkeleton />}>
              <ClientOverview />
            </Suspense>
          ),
        },
        {
          path: "overview/project-details/:projectId",
          element: (
            <Suspense fallback={<ProjectDetailsSkeleton />}>
              <ProjectDetails />
            </Suspense>
          ),
        },
      ],
    },

    { path: "employees", element: <Suspense fallback={<EmployeeSkeleton />}><Employee /></Suspense> },
    {
      path: "all-program",
      element: <ClientAllProgramContainer />,
      children: [
        { index: true, element: <Suspense fallback={<ClientAllProgramSkeleton />}><ClientAllProgram /></Suspense> },
        {
          path: "program-overview/:programId",
          element: <ProgramOverviewContainer />,
          children: [
            { index: true, element: <Suspense fallback={<ProgramOverviewSkeleton />}><ProgramOverview /></Suspense> },
            { path: "program-details", element: <Suspense fallback={<ProgramDetailsSkeleton />}><ProgramDetails /></Suspense> },
            {
              path: "project-details/:projectId",
              element: (
                <Suspense fallback={<ProjectDetailsSkeleton />}>
                  <ProjectDetails />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "project-details/:projectId",
      element: (
        <Suspense fallback={<ProjectDetailsSkeleton />}>
          <ProjectDetails />
        </Suspense>
      ),
    },
    {
      path: "project-review",
      element: <ProjectReviewContainer />,
      children: [
        { index: true, element: <Suspense fallback={<ClientProjectReviewSkeleton />}><ClientProjectReview /></Suspense> },
        {
          path: ":submissionId/:projectId",
          element: <Suspense fallback={<ReviewDetailsSkeleton />}><ReviewDetails /></Suspense>,
        },
      ],
    },
    {
      path: "program-builder",
      element: <Suspense fallback={<ClientProjectBuilderSkeleton />}><ClientProjectBuilderContainer /></Suspense>,
      children: [
        { index: true, element: <Suspense fallback={<ClientProjectBuilderSkeleton />}><ClientProgramBuilder /></Suspense> },
        { path: "publish/:programId", element: <Suspense fallback={<PublishProjectSkeleton />}><PublishProject /></Suspense> },
        { path: "file-upload/:programId", element: <Suspense fallback={<FileUploadSkeleton />}><FileUpload /></Suspense> },
        {
          path: "program-details/:programId",
          element: (
            <Suspense fallback={<ProgramDetailsSkeleton />}>
              <ProgramDetails />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "project-builder",
      element: <Suspense fallback={<ClientProjectBuilderSkeleton />}><ClientProjectBuilderContainer /></Suspense>,
      children: [
        { index: true, element: <Suspense fallback={<ClientProjectBuilderSkeleton />}><ClientProjectBuilder /></Suspense> },
        { path: "publish/:projectId", element: <Suspense fallback={<PublishProjectSkeleton />}><PublishProject /></Suspense> },
        { path: "file-upload/:projectId", element: <Suspense fallback={<FileUploadSkeleton />}><FileUpload /></Suspense> },
        {
          path: "project-details/:projectId",
          element: (
            <Suspense fallback={<ProjectDetailsSkeleton />}>
              <ProjectDetails />
            </Suspense>
          ),
        },
      ],
    },
    { path: "activity-log", element: <Suspense fallback={<ClientActivityLogSkeleton />}><ClientActivityLog /></Suspense> },
    {
      path: "help",
      element: <ClientHelp />,
      children: [
        {
          path: "support",
          element: <Suspense fallback={<SupportDashboardSkeleton />}><SupportDashboard /></Suspense>,
          children: [
            {
              path: "create-tickets",
              element: <Suspense fallback={<ClientCreateTicketSkeleton />}><ClientCreateTicket /></Suspense>,
            },
          ],
        },
        { path: "feedback", element: <Suspense fallback={<ClientFeedbackSkeleton />}><ClientFeedback /></Suspense> },
        // { path: "product-tour", element: <Suspense fallback={<ClientWorkInProgressSkeleton />}><ClientWorkInProgress /></Suspense> },
        { path: "contact-us", element: <Suspense fallback={<ClientContactUsSkeleton />}><ClientContactUs /></Suspense> },
      ],
    },
    { path: "settings", element: <Suspense fallback={<ClientSettingsSkeleton />}><ClientSettings /></Suspense> },
    { path: "work-in-progress", element: <Suspense fallback={<ClientWorkInProgressSkeleton />}><ClientWorkInProgress /></Suspense> },
    { path: "profile", element: <Suspense fallback={<ProfilePageSkeleton />}><ProfilePage /></Suspense> },
    { path: "notifications", element: <Suspense fallback={<ProfilePageSkeleton />}><NotificationsPage /></Suspense> },
  ];
}
