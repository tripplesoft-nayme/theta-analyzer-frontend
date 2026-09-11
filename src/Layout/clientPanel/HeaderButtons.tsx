import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
    Bell,
    Plus,
    Upload,
    Download,
    GitBranch,
    RotateCcw,
    UserPlus
} from "lucide-react";
import PrimaryButton from "@/Common/PrimaryButton";
import { ThemeToggle } from "@/Common/ThemeToggle";
import NotificationModal from "@/Common/NotificationModal";
import VersionHistoryModal from "./header/VersionHistoryModal";
import { setSelectedTemplate } from "@/store/Slices/ChartSlice/ChartSlice";
import { FaRegFilePdf } from "react-icons/fa";

interface HeaderButtonsProps {
    unreadCount: number;
    isNotificationOpen: boolean;
    setIsNotificationOpen: (open: boolean) => void;
    isPage: any;
    activeTab: string;
    isVersionHistoryOpen: boolean;
    setIsVersionHistoryOpen: (open: boolean) => void;
    projectName?: string;
    projectId?: string;
    programName?: string;
    targetProgramId?: string;
    handleDownloadCSV: () => void;
    isCreatingTemplate: boolean;
    isApplyingTemplate: boolean;
    isApplyingProgramTemplate: boolean;
    isPublishDisabled: boolean;
    handlePublish: () => void;
    setIsTemplateModalOpen: (open: boolean) => void;
    setTemplateName: (name: string) => void;
    setActiveModal: (modal: string | null) => void;
    setIsEmployeeModalOpen: (open: boolean) => void;
    setIsProjectModalOpen: (open: boolean) => void;
    setIsApplyConfirmOpen: (open: boolean) => void;
    setIsUploadModalOpen: (open: boolean) => void;
    setIsFilesUploadModalOpen: (open: boolean) => void;
    isPdfDownloadRoute?: boolean;
    handleDownloadPdfImage?: () => void;
    projectStatus?: string;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
    unreadCount,
    isNotificationOpen,
    setIsNotificationOpen,
    isPage,
    activeTab,
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    projectName,
    projectId,
    programName,
    targetProgramId,
    handleDownloadCSV,
    isCreatingTemplate,
    isApplyingTemplate,
    isApplyingProgramTemplate,
    isPublishDisabled,
    handlePublish,
    setIsTemplateModalOpen,
    setTemplateName,
    setActiveModal,
    setIsEmployeeModalOpen,
    setIsProjectModalOpen,
    setIsApplyConfirmOpen,
    setIsUploadModalOpen,
    setIsFilesUploadModalOpen,
    isPdfDownloadRoute = false,
    handleDownloadPdfImage,
    projectStatus,
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedTemplate } = useAppSelector((state) => state.chartSlice);

    // --- BUTTON ALIASES ---
    const NotificationButton = (
        <div className="relative">
            <PrimaryButton
                leftIcon={<Bell className="size-5" />}
                type="Outline"
                onClick={() => setIsNotificationOpen(true)}
                tooltip="Notifications"
                className="w-12 h-12 p-0"
            />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
            <NotificationModal
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
            />
        </div>
    );

    const UploadIconPadded = ({ onClick }: { onClick: () => void }) => (
        <PrimaryButton
            leftIcon={<Download className="size-5" />}
            type="Primary"
            onClick={onClick}
            tooltip="Upload File"
            className="w-12 h-12 p-0"
        />
    );

    const DownloadIconPadded = ({ onClick }: { onClick: () => void }) => (
        <PrimaryButton
            leftIcon={<Upload className="size-5" />}
            type="Primary"
            onClick={onClick}
            tooltip="Download CSV"
            className="w-12 h-12 p-0"
        />
    );

    const ShowVersionButton = (
        <>
            <PrimaryButton
                leftIcon={<GitBranch className="size-5" />}
                // title="Show Version"
                type="Primary"
                onClick={() => setIsVersionHistoryOpen(true)}
                tooltip="Version History"
                className="hidden md:flex h-12"
            />
            <VersionHistoryModal
                isOpen={isVersionHistoryOpen}
                onClose={() => setIsVersionHistoryOpen(false)}
                projectName={projectName || "Project"}
                projectId={projectId as string}
            />
        </>
    );

    const SaveTemplateButtonBare = (
        <PrimaryButton
            leftIcon={<Plus className="size-5" />}
            type="Primary"
            className="w-12 h-12 p-0"
            disabled={isCreatingTemplate}
            tooltip="Save Template"
            onClick={() => {
                setTemplateName(projectName || programName || "");
                setIsTemplateModalOpen(true);
            }}
        />
    );

    const SaveTemplateButtonFull = (
        <PrimaryButton
            leftIcon={<Plus className="size-5" />}
            type="Primary"
            className="w-12 h-12 p-0 border border-blue-500"
            disabled={isCreatingTemplate}
            tooltip="Save Template"
            onClick={() => {
                setTemplateName(projectName || programName || "");
                setIsTemplateModalOpen(true);
            }}
        />
    );

    const ApplyTemplateButton = (
        <PrimaryButton
            title="Apply Template"
            leftIcon={<Upload className="size-5" />}
            type="Primary"
            className="h-12 px-4"
            disabled={isApplyingTemplate || isApplyingProgramTemplate}
            tooltip="Apply Template"
            onClick={() => setIsApplyConfirmOpen(true)}
        />
    );

    const ResetTemplateButton = (
        <PrimaryButton
            // title="Reset"
            leftIcon={<RotateCcw className="size-5" />}
            type="Outline"
            className="h-12 px-6"
            tooltip="Reset Template"
            onClick={() => {
                dispatch(setSelectedTemplate(null));
            }}
        />
    );

    const PublishButton = (
        <PrimaryButton
            title="Publish"
            type="Primary"
            className="h-12 px-6"
            disabled={isPublishDisabled}
            tooltip="Publish Dashboard"
            onClick={handlePublish}
        />
    );

    const PreviewButton = (
        <PrimaryButton
            title="Preview"
            type="Outline"
            className="h-12 px-6"
            disabled={isPublishDisabled}
            tooltip="Preview Page"
            onClick={() => {
                if (isPublishDisabled) return;
                const targetId = isPage.programBuilder ? targetProgramId : projectId;
                const builderPath = isPage.programBuilder ? "program-builder" : "project-builder";
                navigate(`/client-panel/${builderPath}/publish/${targetId}`);
            }}
        />
    );

    const AddEmployeeButton = (
        <PrimaryButton
            title="Add Employee"
            leftIcon={<UserPlus className="size-5" />}
            type="Primary"
            className="h-12 px-6"
            tooltip="Add Employee"
            onClick={() => setIsEmployeeModalOpen(true)}
        />
    );

    const AddProgramButton = (
        <PrimaryButton
            title="Add Program"
            leftIcon={<Plus className="size-5" />}
            type="Primary"
            className="h-12 px-6"
            tooltip="Add Program"
            onClick={() => setActiveModal("Add Program")}
        />
    );

    const AddProjectButton = (
        <PrimaryButton
            title="Add Project"
            leftIcon={<Plus className="size-5" />}
            type="Primary"
            className="h-12 px-6"
            tooltip="Add Project"
            onClick={() => setIsProjectModalOpen(true)}
        />
    );

    const ContactUsButton = (
        <PrimaryButton
            title="Contact Us"
            leftIcon={<Plus className="size-5" />}
            type="Primary"
            className="h-12 px-6"
            tooltip="Contact Us"
            onClick={() => window.dispatchEvent(new CustomEvent("open-contact-us-modal"))}
        />
    );

    const SubmitFeedbackButton = (
        <PrimaryButton
            title="Submit Feedback"
            leftIcon={<Plus className="size-5" />}
            type="Primary"
            className="h-12 px-6"
            tooltip="Submit Feedback"
            onClick={() => window.dispatchEvent(new CustomEvent("open-feedback-modal"))}
        />
    );

    const renderQuickActionButton = () => {
        if (isPage.contactUs) return ContactUsButton;
        if (isPage.feedback) return SubmitFeedbackButton;
        if (isPage.employee) return AddEmployeeButton;
        if (isPage.allProgram) return AddProgramButton;
        if (isPage.isOnProgramDashboardTab) {
            return (
                <div className="flex gap-3">
                    <UploadIconPadded
                        onClick={() =>
                            navigate(
                                `/client-panel/program-builder/file-upload/${targetProgramId}`,
                            )
                        }
                    />
                    <DownloadIconPadded onClick={handleDownloadCSV} />
                </div>
            );
        }
        if (isPage.programOverview || isPage.highway) return AddProjectButton;

        if (isPage.projectBuilder || isPage.programBuilder) {
            if (isPage.importCSV) return null;
            const targetId = isPage.programBuilder ? targetProgramId : projectId;
            const builderPath = isPage.programBuilder
                ? "program-builder"
                : "project-builder";

            const commonActions = (
                <div className="flex gap-3">
                    <UploadIconPadded
                        onClick={() => navigate(`/client-panel/${builderPath}/file-upload/${targetId}`)}
                    />
                    <DownloadIconPadded onClick={handleDownloadCSV} />
                    {selectedTemplate ? (
                        <>
                            {ApplyTemplateButton}
                            {ResetTemplateButton}
                        </>
                    ) : (
                        SaveTemplateButtonBare
                    )}
                </div>
            );

            if (isPage.publish) {
                return (
                    <div className="flex gap-3">
                        {commonActions}
                        {PublishButton}
                    </div>
                );
            }

            return (
                <div className="flex gap-3">
                    {selectedTemplate ? (
                        <>
                            {ApplyTemplateButton}
                            {ResetTemplateButton}
                        </>
                    ) : (
                        SaveTemplateButtonFull
                    )}
                    {PreviewButton}
                </div>
            );
        }

        const shouldHideAddProgram =
            isPage.projectReview ||
            isPage.activityLog ||
            isPage.projectDetails ||
            isPage.support;
        return !shouldHideAddProgram ? AddProgramButton : null;
    };

    return (
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-start sm:justify-end lg:justify-end gap-3 relative w-full sm:w-auto lg:flex-1 lg:min-w-max mt-2 sm:mt-0">
            <ThemeToggle />
            {NotificationButton}
            {isPdfDownloadRoute && handleDownloadPdfImage && (
                <PrimaryButton
                    leftIcon={<FaRegFilePdf className="size-5" />}
                    type="Outline"
                    onClick={handleDownloadPdfImage}
                    tooltip="Download PDF"
                    className="h-12"
                />
            )}
            {isPage.projectReviewDetails && activeTab !== "files" && (
                <div className="flex items-center gap-3">
                    {ShowVersionButton}
                </div>
            )}
            {isPage.projectDetails && (
                <div className="flex items-center gap-3">
                    {String(projectStatus).toLowerCase() === "draft" && (
                        <UploadIconPadded
                            onClick={() => {
                                if (activeTab === "files") {
                                    setIsFilesUploadModalOpen(true);
                                } else {
                                    setIsUploadModalOpen(true);
                                }
                            }}
                        />
                    )}
                    {activeTab !== "files" && (
                        <>
                            <DownloadIconPadded onClick={handleDownloadCSV} />
                            {ShowVersionButton}
                        </>
                    )}
                </div>
            )}
            {renderQuickActionButton()}
        </div>
    );
};

export default HeaderButtons;
