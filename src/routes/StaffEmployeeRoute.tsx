import { Suspense } from "react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import ProjectReviewContainer from "@/pages/client/ProjectReview/ProjectReviewContainer";
const StaffEmployeeOverview = lazyWithRetry(() => import("@/pages/staffEmployee/Overview/StaffEmployeeOverview"));
const StaffEmployeeProjects = lazyWithRetry(() => import("@/pages/staffEmployee/Projects/StaffEmployeeProjects"));
const StaffEmployeeSettings = lazyWithRetry(() => import("@/pages/staffEmployee/Settings/StaffEmployeeSettings"));
const StaffEmployeeStateCardDetails = lazyWithRetry(() => import("@/pages/staffEmployee/Overview/StaffEmployeeStateCardDetails"));
const StaffEmployeeProjectDetail = lazyWithRetry(() => import("@/pages/staffEmployee/Projects/StaffEmployeeProjectDetail"));
const UploadProject = lazyWithRetry(() => import("@/pages/staffEmployee/Projects/Components/UploadProject"));
const StaffEmployeeSubmissionPreview = lazyWithRetry(() => import("@/pages/staffEmployee/Projects/StaffEmployeeSubmissionPreview"));
const DashboardCardProjects = lazyWithRetry(() => import("@/pages/staffEmployee/Overview/Components/DashboardCardProjects"));
const ProfilePage = lazyWithRetry(() => import("@/pages/commonPage/ProfilePage"));
const NotificationsPage = lazyWithRetry(() => import("@/pages/commonPage/NotificationsPage"));
const StaffEmployeeReviewContainer = lazyWithRetry(() => import("@/pages/commonPage/ProjectReview/ReviewContainer"));
const StaffEmployeeFiles = lazyWithRetry(() => import("@/pages/staffEmployee/Files/StaffEmployeeFiles"));
const ProjectDetails = lazyWithRetry(() => import("@/pages/client/ProjectDetails/ProjectDetails"));
const ReviewDetails = lazyWithRetry(() => import("@/pages/client/ProjectReview/Components/ReviewDetails"));
const ClientProjectReview = lazyWithRetry(() => import("@/pages/client/ProjectReview/ClientProjectReview"));

import ProjectDetailsSkeleton from "@/Common/Skeleton/ProjectDetailsSkeleton";
import ReviewDetailsSkeleton from "@/Common/Skeleton/ReviewDetailsSkeleton";
import ClientProjectReviewSkeleton from "@/Common/Skeleton/ClientProjectReviewSkeleton";
import StaffEmployeeOverviewSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeOverviewSkeleton";
import StaffEmployeeProjectsSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeProjectsSkeleton";
import StaffEmployeeSettingsSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeSettingsSkeleton";
import StaffEmployeeStateCardDetailsSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeStateCardDetailsSkeleton";
import StaffEmployeeProjectDetailSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeProjectDetailSkeleton";
import UploadProjectSkeleton from "@/Common/Skeleton/components/staffEmployee/Projects/UploadProjectSkeleton";
import StaffEmployeeSubmissionPreviewSkeleton from "@/Common/Skeleton/pages/staffEmployee/Projects/StaffEmployeeSubmissionPreviewSkeleton";
import DashboardCardProjectsSkeleton from "@/Common/Skeleton/components/staffEmployee/Overview/DashboardCardProjectsSkeleton";
import ProfilePageSkeleton from "@/Common/Skeleton/pages/commonPage/ProfilePageSkeleton";
import StaffEmployeeFilesSkeleton from "@/Common/Skeleton/pages/staffEmployee/StaffEmployeeFilesSkeleton";

export default function getStaffEmployeeRoutes() {
  return [
    { index: true, element: <Suspense fallback={<StaffEmployeeOverviewSkeleton />}><StaffEmployeeOverview /></Suspense> },
    {
      path: "projects",
      element: <ProjectReviewContainer />,
      children: [
        { index: true, element: <Suspense fallback={<StaffEmployeeProjectsSkeleton />}><StaffEmployeeProjects /></Suspense> },
        { path: "project-details/:projectId", element: <Suspense fallback={<ProjectDetailsSkeleton />}><ProjectDetails /></Suspense> },
        { path: "status/:status", element: <Suspense fallback={<DashboardCardProjectsSkeleton />}><DashboardCardProjects /></Suspense> },
      ],
    },
    { path: "upload-submission", element: <Suspense fallback={<UploadProjectSkeleton />}><UploadProject /></Suspense> },
    {
      path: "project-review",
      element: <StaffEmployeeReviewContainer />,
      children: [
        {
          index: true,
          element: <Suspense fallback={<ClientProjectReviewSkeleton />}><ClientProjectReview /></Suspense>,
        },
        {
          path: ":submissionId/:projectId",
          element: <Suspense fallback={<ReviewDetailsSkeleton />}><ReviewDetails /></Suspense>,
        },
        {
          path: "submission-preview/:submissionId/:projectId",
          element: <Suspense fallback={<StaffEmployeeSubmissionPreviewSkeleton />}><StaffEmployeeSubmissionPreview /></Suspense>,
        },
      ],
    },
    { path: "settings", element: <Suspense fallback={<StaffEmployeeSettingsSkeleton />}><StaffEmployeeSettings /></Suspense> },
    {
      path: "state-card/:cardTitle",
      element: <Suspense fallback={<StaffEmployeeStateCardDetailsSkeleton />}><StaffEmployeeStateCardDetails /></Suspense>,
    },
    {
      path: "projects/:id",
      element: <Suspense fallback={<StaffEmployeeProjectDetailSkeleton />}><StaffEmployeeProjectDetail /></Suspense>,
    },
    { path: "profile", element: <Suspense fallback={<ProfilePageSkeleton />}><ProfilePage /></Suspense> },
    { path: "notifications", element: <Suspense fallback={<ProfilePageSkeleton />}><NotificationsPage /></Suspense> },
    { path: "files", element: <Suspense fallback={<StaffEmployeeFilesSkeleton />}><StaffEmployeeFiles /></Suspense> },

  ];
}
