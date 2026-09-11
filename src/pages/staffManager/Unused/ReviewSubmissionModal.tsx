/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEditSubmissionMutation } from "@/store/Api/staffManagerApi/StaffManagerApi";

interface Props {
  open: boolean;
  onClose: () => void;
  submission: any;
}

const ReviewSubmissionModal = ({
  open,
  onClose,
  submission
}: Props) => {
  const [editSubmission,{data, isLoading}] = useEditSubmissionMutation();
  if (!submission) return null;
  const handleEdit = (status: string)=>{
    editSubmission({submissionId: submission.id, action: status});
    if(data){ alert(data.message);}
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Are you sure you want to update the status for{" "}
          <strong>{submission.employee.user.name}</strong>?
        </p>

        <DialogFooter className="flex gap-3 mt-4">
          <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={() => handleEdit("REJECTED")}
          >
            Return
          </button>

          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={() => handleEdit("APPROVED")}
          >
            {isLoading ? "Approving...":"Approve"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionModal;
