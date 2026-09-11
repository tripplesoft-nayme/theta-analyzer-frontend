import React from "react";

/** Shape of the `isPage` route-detection map */
export interface IsPageMap {
  employee: boolean;
  highway: boolean;
  allProgram: boolean;
  programOverview: boolean;
  projectDetails: boolean;
  projectReview: boolean;
  projectBuilder: boolean;
  programBuilder: boolean;
  publish: boolean;
  importCSV: boolean;
  projectReviewDetails: boolean;
  activityLog: boolean;
  support: boolean;
  overviewProjectDetails: boolean;
  programDetails: boolean;
  isOnProgramDashboardTab: boolean;
  showProgramOverviewBreadcrumb: boolean;
}

/** Single item in the breadcrumb trail */
export interface BreadcrumbItemData {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  isPage?: boolean;
}

/** PDF export progress state */
export interface PdfProgress {
  status: "idle" | "capturing" | "generating" | "success" | "error";
  current?: number;
  total?: number;
  pdfUrl: string | null;
  errorMsg?: string;
}
