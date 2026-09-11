import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { Suspense } from "react";
const CreateProject = lazyWithRetry(() => import("@/Layout/clientPanel/CreateProject/CreateProject"));

interface UpdateProjectModalProps {
  open: boolean;
  project: any;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export default function UpdateProjectModal({
  open,
  project,
  onClose,
}: UpdateProjectModalProps) {
  if (!open) return null;
  return (
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />}>
      <CreateProject project={project} onClose={onClose} programId={project?.programId} />
    </Suspense>
  );
}
