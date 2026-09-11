import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useNavigate, useParams } from "react-router-dom";
import { Suspense, useEffect } from "react";
const ReviewDetails = lazyWithRetry(() => import("@/pages/client/ProjectReview/Components/ReviewDetails"));
import { toast } from "sonner";

const StaffEmployeeSubmissionPreview = () => {
  const { submissionId, projectId } = useParams<{
    submissionId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!submissionId || !projectId) {
      toast.error("Invalid preview parameters.");
      navigate("/staff-employee-panel/upload-submission");
    }
  }, []);

  if (!submissionId || !projectId) {
    return null;
  }

  return (
    <div className="p-6">
      <Suspense fallback={<div className="animate-pulse bg-skeleton-bg rounded-lg h-screen w-full" />}>
        <ReviewDetails />
      </Suspense>
    </div>
  );
};

export default StaffEmployeeSubmissionPreview;

