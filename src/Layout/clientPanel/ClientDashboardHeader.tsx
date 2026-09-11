/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useHeaderData } from "./header/useHeaderData";
import { useHeaderHandlers } from "./header/useHeaderHandlers";
import HeaderTitle from "./header/HeaderTitle";
import HeaderCenterSection from "./header/HeaderCenterSection";
import HeaderBreadcrumb from "./header/HeaderBreadcrumb";
import HeaderModals from "./header/HeaderModals";
import HeaderButtons from "./HeaderButtons";

interface ClientDashboardHeaderProps {
  name?: string;
}

const ClientDashboardHeader: React.FC<ClientDashboardHeaderProps> = () => {
  /* ── Data & handlers ──────────────────────────────────────────────────── */
  const data = useHeaderData();
  const handlers = useHeaderHandlers(data);

  /* ── Common center-section props (shared between desktop & mobile) ───── */
  const centerProps = {
    isPage: data.isPage,
    activeTab: data.activeTab,
    searchParams: data.searchParams,
    setSearchParams: data.setSearchParams,
    programId: data.programId,
    searchTerm: data.searchTerm,
    setSearchTerm: data.setSearchTerm,
    filteredPrograms: data.filteredPrograms,
    filteredProjects: data.filteredProjects,
    navigate: data.navigate,
    currentPath: data.currentPath,
  };

  return (
    <div>
      {/* ─────────────────────────────────────────────────────────────
          HEADER BAR
          Layout: flex row on lg+, stacked column on mobile.
          Contains 3 logical sections:
            Part 1 – Left  : Page title / subtitle (flex-1, grows to fill space)
            Part 2 – Center: Search bar or tab switcher (fixed width, desktop only)
            Part 3 – Right : Action buttons via <HeaderButtons />
          Below the row, a mobile-only Part 2 fallback is rendered (lg:hidden).
      ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 py-5 ">
        {/* Main row: all 3 parts sit here on desktop */}
        {(() => {
          const isCenterRendered = !(data.isPage.publish || data.isPage.programBuilder);
          return (
            <div className={
              isCenterRendered
                ? "flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] items-start lg:items-center justify-between w-full gap-4 lg:gap-2 relative"
                : "flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4 lg:gap-2 relative"
            }>
              {/* ── PART 1: LEFT – Page title + optional subtitle ── */}
              <div className={
                isCenterRendered
                  ? "lg:min-w-0 lg:flex lg:items-center lg:justify-start min-w-0"
                  : "lg:flex-1 lg:min-w-0 lg:flex lg:items-center lg:justify-start min-w-0"
              }>
                <HeaderTitle
                  isPage={data.isPage}
                  programName={data.programName}
                  projectName={data.projectName}
                  projectStatus={data.projectStatus}
                  allTags={data.allTags}
                  name={data.name}
                  currentPath={data.currentPath}
                  currentRoute={data.currentRoute}
                  statusColor={data.statusColor}
                  handleSelectStatus={handlers.handleSelectStatus}
                  isStatusPopoverOpen={data.isStatusPopoverOpen}
                  setIsStatusPopoverOpen={data.setIsStatusPopoverOpen}
                />
              </div>

              {/* ── PART 2: CENTER – Search bar or tab switcher (desktop only, hidden on mobile) ── */}
              {isCenterRendered && (
                <div className="hidden lg:flex lg:items-center lg:justify-center">
                  <HeaderCenterSection {...centerProps} />
                </div>
              )}

              {/* ── PART 3: RIGHT – Action buttons (<HeaderButtons />) ── */}
              {/* Renders context-aware buttons: theme, notifications, publish, preview, etc. */}
              <div className={
                isCenterRendered
                  ? "lg:min-w-max lg:flex lg:items-center lg:justify-end min-w-0"
                  : "lg:flex-none lg:flex lg:items-center lg:justify-end min-w-0"
              }>
                <HeaderButtons
                  unreadCount={data.unreadCount}
                  isNotificationOpen={data.isNotificationOpen}
                  setIsNotificationOpen={data.setIsNotificationOpen}
                  isPage={data.isPage}
                  activeTab={data.activeTab}
                  isVersionHistoryOpen={data.isVersionHistoryOpen}
                  setIsVersionHistoryOpen={data.setIsVersionHistoryOpen}
                  projectName={data.projectName}
                  projectId={data.projectId}
                  programName={data.programName}
                  targetProgramId={data.targetProgramId}
                  handleDownloadCSV={handlers.handleDownloadCSV}
                  isCreatingTemplate={handlers.isCreatingTemplate}
                  isApplyingTemplate={handlers.isApplyingTemplate}
                  isApplyingProgramTemplate={handlers.isApplyingProgramTemplate}
                  isPublishDisabled={data.isPublishDisabled}
                  handlePublish={handlers.handlePublish}
                  setIsTemplateModalOpen={data.setIsTemplateModalOpen}
                  setTemplateName={data.setTemplateName}
                  setActiveModal={data.setActiveModal}
                  setIsEmployeeModalOpen={data.setIsEmployeeModalOpen}
                  setIsProjectModalOpen={data.setIsProjectModalOpen}
                  setIsApplyConfirmOpen={data.setIsApplyConfirmOpen}
                  setIsUploadModalOpen={data.setIsUploadModalOpen}
                  setIsFilesUploadModalOpen={data.setIsFilesUploadModalOpen}
                  isPdfDownloadRoute={data.isPdfDownloadRoute}
                  handleDownloadPdfImage={handlers.handleDownloadPdfImage}
                  projectStatus={data.projectStatus}
                />
              </div>
            </div>
          );
        })()}

        {/* ── MOBILE PART 2 FALLBACK: Center tabs/search below the title row (lg:hidden) ── */}
        {/* This mirrors the desktop Part 2 center section but stacks below on smaller screens */}
        <HeaderCenterSection {...centerProps} mobile />
      </div>

      {/* Breadcrumb row */}
      <HeaderBreadcrumb
        breadcrumbData={data.breadcrumbData}
        isPreview={data.isPreview}
        isPublished={data.isPublished}
        dispatch={data.dispatch}
        currentPath={data.currentPath}
      />

      {/* All lazy-loaded modals */}
      <HeaderModals
        data={data}
        handlers={handlers}
        programId={data.programId}
      />
    </div>
  );
};

export default ClientDashboardHeader;
