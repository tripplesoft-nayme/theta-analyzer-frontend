import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import App from "../App";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import RouteErrorElement from "@/Common/RouteErrorElement";
const Home = lazyWithRetry(() => import("../pages/Home"));
const Login = lazyWithRetry(() => import("@/pages/Auth/Login"));
const Signup = lazyWithRetry(() => import("@/pages/Auth/Signup"));
const Forgot = lazyWithRetry(() => import("@/pages/Auth/Forgot"));
const Reset = lazyWithRetry(() => import("@/pages/Auth/ResetPassword"));
const EmailCode = lazyWithRetry(() => import("@/pages/Auth/EmailCode"));
const TwoStepVerification = lazyWithRetry(() => import("@/pages/Auth/TwoStepVerification"));
const NotFound = lazyWithRetry(() => import("../pages/NotFound"));

import HomeSkeleton from "@/Common/Skeleton/pages/HomeSkeleton";
import LoginSkeleton from "@/Common/Skeleton/pages/Auth/LoginSkeleton";
import SignupSkeleton from "@/Common/Skeleton/pages/Auth/SignupSkeleton";
import ForgotSkeleton from "@/Common/Skeleton/pages/Auth/ForgotSkeleton";
import ResetPasswordSkeleton from "@/Common/Skeleton/pages/Auth/ResetPasswordSkeleton";
import EmailCodeSkeleton from "@/Common/Skeleton/pages/Auth/EmailCodeSkeleton";
import TwoStepVerificationSkeleton from "@/Common/Skeleton/pages/Auth/TwoStepVerificationSkeleton";
import NotFoundSkeleton from "@/Common/Skeleton/pages/NotFoundSkeleton";
import UnauthorizedSkeleton from "@/Common/Skeleton/Common/UnauthorizedSkeleton";
// const StaffManagerDashboardLayout = lazy(() => import("@/Layout/staffManagerPanel/StaffManagerDashboardLayout"));
import StaffManagerDashboardLayout from "@/Layout/staffManagerPanel/StaffManagerDashboardLayout";
// import ClientOverviewSkeleton from "@/Common/Skeleton/ClientOverviewSkeleton";
// import LayoutSkeleton from "@/Common/Skeleton/LayoutSkeleton";
// const ClientDashboardLayout = lazy(() => import("@/Layout/clientPanel/ClientDashboardLayout"));
import ClientDashboardLayout from "@/Layout/clientPanel/ClientDashboardLayout";
import { getClientRoutes } from "./ClientRoute";
import { getStaffManagerRoutes } from "./StaffManagerRoute";
// const ViewerPanelDashboardLayout = lazy(() => import("./../Layout/ViewerPanel/ViewerPanelDashboardLayout"));
import ViewerPanelDashboardLayout from "./../Layout/ViewerPanel/ViewerPanelDashboardLayout";
import getViewerPanelRoutes from "./ViewerRoute";
import ProtectedRoute from "./ProtectedRoute";
const Unauthorized = lazyWithRetry(() => import("@/Common/Unauthorized"));
// const StaffEmployeeDashboardLayout = lazy(() => import("@/Layout/staffEmployeePanel/StaffEmployeeDashboardLayout"));
import StaffEmployeeDashboardLayout from "@/Layout/staffEmployeePanel/StaffEmployeeDashboardLayout";
// import ViewerPanelSkeleton from "@/Common/Skeleton/ViewerPanelSkeleton";
import getStaffEmployeeRoutes from "./StaffEmployeeRoute";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<HomeSkeleton />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<LoginSkeleton />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <Suspense fallback={<SignupSkeleton />}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: "/forgot",
        element: (
          <Suspense fallback={<ForgotSkeleton />}>
            <Forgot />
          </Suspense>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <Suspense fallback={<ResetPasswordSkeleton />}>
            <Reset />
          </Suspense>
        ),
      },
      {
        path: "/verification",
        element: (
          <Suspense fallback={<TwoStepVerificationSkeleton />}>
            <TwoStepVerification />
          </Suspense>
        ),
      },
      {
        path: "/emailcode",
        element: (
          <Suspense fallback={<EmailCodeSkeleton />}>
            <EmailCode />
          </Suspense>
        ),
      },
      {
        path: "/client-panel",
        element: (
          <ProtectedRoute allowedRoles={["CLIENT"]}>
            {/* <Suspense fallback={<LayoutSkeleton><ClientOverviewSkeleton /></LayoutSkeleton>}> */}
            <ClientDashboardLayout />
            {/* </Suspense> */}
          </ProtectedRoute>
        ),
        children: getClientRoutes(),
      },
      {
        path: "/staff-manager-panel",
        element: (
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            {/* <Suspense fallback={<LayoutSkeleton><ClientOverviewSkeleton /></LayoutSkeleton>}> */}
            <StaffManagerDashboardLayout />
            {/* </Suspense> */}
          </ProtectedRoute>
        ),
        children: getStaffManagerRoutes(),
      },
      {
        path: "/staff-employee-panel",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            {/* <Suspense fallback={<LayoutSkeleton><ClientOverviewSkeleton /></LayoutSkeleton>}> */}
            <StaffEmployeeDashboardLayout />
            {/* </Suspense> */}
          </ProtectedRoute>
        ),
        children: getStaffEmployeeRoutes(),
      },
      {
        path: "/viewer-panel",
        element: (
          <ProtectedRoute allowedRoles={["VIEWER"]}>
            {/* <Suspense fallback={<LayoutSkeleton><ViewerPanelSkeleton /></LayoutSkeleton>}> */}
            <ViewerPanelDashboardLayout />
            {/* </Suspense> */}
          </ProtectedRoute>
        ),
        children: getViewerPanelRoutes(),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<NotFoundSkeleton />}>
        <NotFound />
      </Suspense>
    ),
  },
  {
    path: "/unauthorized",
    element: (
      <Suspense fallback={<UnauthorizedSkeleton />}>
        <Unauthorized />
      </Suspense>
    ),
  },
]);

export default routes;
