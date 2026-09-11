import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const FileUpload = lazyWithRetry(
  () => import("@/pages/client/ProjectBuilder/Components/FileUpload"),
);

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** Optional custom submit handler (e.g. submission-preview mode in SheetTab) */
  customSubmitHandler?: (chartsPayload: any[]) => Promise<void>;
  isCustomSubmitLoading?: boolean;
}

/**
 * FileUploadModal
 *
 * Single, reusable wrapper around the CSV/Excel <FileUpload> component.
 * Use this everywhere you need to open the data-import uploader in a modal —
 * both from the header and from within page-level sheet / review views.
 *
 * For document/file uploads (Files tab), use FilesUploadModal instead.
 */
const FileUploadModal = ({
  open,
  onClose,
  projectId,
  customSubmitHandler,
  isCustomSubmitLoading = false,
}: FileUploadModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-[95vw] md:w-full p-0 overflow-y-auto overflow-x-hidden border-none shadow-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-xl [&>button]:right-4 [&>button]:top-4 [&>button]:bg-white dark:[&>button]:bg-slate-800 [&>button]:rounded-full [&>button]:p-1 [&>button]:shadow-sm [&>button]:z-50">
        <Suspense fallback={null}>
          <div className="px-2 pb-4">
            <FileUpload
              isModal
              projectId={projectId}
              onFileUpload={onClose}
              customSubmitHandler={customSubmitHandler}
              isCustomSubmitLoading={isCustomSubmitLoading}
            />
          </div>
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;
