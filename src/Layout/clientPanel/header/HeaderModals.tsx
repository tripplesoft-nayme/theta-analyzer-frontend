import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { Suspense } from "react";
import type { HeaderData } from "./useHeaderData";
import type { HeaderHandlers } from "./useHeaderHandlers";
import FileUploadModal from "@/Common/FileUploadModal";
const CreateProgramModal = lazyWithRetry(
  () => import("@/Layout/clientPanel/CreateProgramModal"),
);
const SuccessModal = lazyWithRetry(
  () => import("@/Layout/clientPanel/CreateProject/SuccessModal"),
);
const AddEmployeeModal = lazyWithRetry(
  () => import("@/pages/client/NewEmployee/Components/AddEmployeeModal"),
);
const NewProjectModal = lazyWithRetry(
  () => import("./NewProjectModal"),
);
const FilesUploadModal = lazyWithRetry(
  () => import("./FilesUploadModal"),
);
const CreateProject = lazyWithRetry(
  () => import("@/Layout/clientPanel/CreateProject/CreateProject"),
);
const ConfirmationModal = lazyWithRetry(
  () =>
    import(
      "@/Common/Charts/CompletedCharts/Common/Modal/ConfirmationModal"
    ),
);
const SaveTemplateModal = lazyWithRetry(
  () =>
    import("@/Common/Charts/CompletedCharts/Common/Modal/SaveTemplateModal"),
);
const PdfExportModal = lazyWithRetry(
  () => import("@/Layout/clientPanel/Components/PdfExportModal"),
);

interface HeaderModalsProps {
  data: HeaderData;
  handlers: HeaderHandlers;
  programId?: string;
}

/**
 * HeaderModals
 *
 * Collects all modal declarations for the header under a single Suspense
 * boundary. Each modal reads its open/close state and callbacks from the
 * `data` and `handlers` objects passed down from the orchestrator.
 */
const HeaderModals: React.FC<HeaderModalsProps> = ({ data, handlers, programId }) => {
  const {
    isPage,
    projectId,
    selectedTemplate,
    isEmployeeModalOpen, setIsEmployeeModalOpen,
    isProjectModalOpen, setIsProjectModalOpen,
    activeModal, setActiveModal,
    successData, successOpen, setSuccessOpen,
    projectSuccessData, projectSuccessOpen, setProjectSuccessOpen,
    isUploadModalOpen, setIsUploadModalOpen,
    isFilesUploadModalOpen, setIsFilesUploadModalOpen,
    isTemplateModalOpen, setIsTemplateModalOpen,
    templateName, setTemplateName,
    isApplyConfirmOpen, setIsApplyConfirmOpen,
    isPdfModalOpen,
    pdfProgress,
    navigate,
  } = data;

  const {
    handleProgramSuccess,
    handleProjectSuccess,
    handleTemplate,
    handleApplyTemplateConfirm,
    handleModalClose,
    handleDownloadClick,
    handleViewClick,
    handleDownloadPdfImage,
    isCreatingTemplate,
    isCreatingProgramTemplate,
    isApplyingTemplate,
    isApplyingProgramTemplate,
  } = handlers;

  return (
    <Suspense fallback={null}>
      {/* Add Employee modal */}
      {isEmployeeModalOpen && (
        <AddEmployeeModal
          open={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
        />
      )}

      {/* Create Project modal — shown on program-overview pages */}
      {isProjectModalOpen && isPage.programOverview && (
        <CreateProject
          programId={programId as string}
          onClose={() => setIsProjectModalOpen(false)}
          onSuccess={handleProjectSuccess}
        />
      )}

      {/* New Project modal — shown on highway pages */}
      {isProjectModalOpen && isPage.highway && (
        <NewProjectModal
          open={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSuccess={(name: string) => {
            setIsProjectModalOpen(false);
            // Reuse the program success modal to show creation confirmation
            data.setSuccessData({ programName: name || "New Project", id: "" });
            data.setSuccessOpen(true);
          }}
        />
      )}

      {/* Create Program modal */}
      {activeModal === "Add Program" && (
        <CreateProgramModal
          open
          onOpenChange={(open) => !open && setActiveModal(null)}
          onSuccess={handleProgramSuccess}
          title="Add Program"
        />
      )}

      {/* Program created — success modal */}
      {successOpen && (
        <SuccessModal
          open={successOpen}
          onOpenChange={setSuccessOpen}
          title="Program Created!"
          itemName={successData.programName}
          description="has been successfully created."
          primaryActionLabel="Open Program Builder"
          programId={successData.id}
          onPrimaryAction={() => {
            navigate("/client-panel/program-builder");
          }}
        />
      )}

      {/* Project created — success modal */}
      {projectSuccessOpen && projectSuccessData && (
        <SuccessModal
          open={projectSuccessOpen}
          onOpenChange={setProjectSuccessOpen}
          title="Project Created!"
          itemName={projectSuccessData.projectName}
          description="has been successfully created."
          primaryActionLabel="Open Project Builder"
          projectId={projectSuccessData.projectId}
          programId={programId}
          onPrimaryAction={() =>
            navigate("/client-panel/project-builder", {
              state: {
                projectId: projectSuccessData.projectId,
                programId,
              },
            })
          }
        />
      )}

      {/* Upload Dialog — CSV chart upload (project-details only) */}
      {isPage.projectDetails && (
        <>
          <FileUploadModal
            open={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            projectId={projectId as string}
          />

          <FilesUploadModal
            open={isFilesUploadModalOpen}
            onClose={() => setIsFilesUploadModalOpen(false)}
            projectId={projectId as string}
          />
        </>
      )}

      {/* Save Template modal */}
      <SaveTemplateModal
        isOpen={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        templateName={templateName}
        setTemplateName={setTemplateName}
        onSave={handleTemplate}
        isSaving={isCreatingTemplate || isCreatingProgramTemplate}
      />

      {/* Apply Template confirmation modal */}
      <ConfirmationModal
        isOpen={isApplyConfirmOpen}
        onOpenChange={setIsApplyConfirmOpen}
        title="Confirm Application"
        description={
          <>
            Are you sure you want to apply the template "{selectedTemplate?.name}"?
            This will add all template charts to your current{" "}
            {isPage.programBuilder ? "program" : "project"}.
          </>
        }
        confirmText="Confirm Apply"
        onConfirm={handleApplyTemplateConfirm}
        isLoading={isApplyingTemplate || isApplyingProgramTemplate}
      />

      {/* PDF Export modal — blur background with staggered chevron conversion animation */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        progress={pdfProgress}
        onClose={handleModalClose}
        onDownload={handleDownloadClick}
        onView={handleViewClick}
        onRetry={handleDownloadPdfImage}
      />
    </Suspense>
  );
};

export default HeaderModals;
