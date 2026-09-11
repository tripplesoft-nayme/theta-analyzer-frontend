/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteSubmissionMutation } from "@/store/Api/staffManagerApi/StaffManagerApi";

interface Props {
  open: boolean;
  onClose: () => void;
  submissionId: any;
}

const DeleteSubmissionModal = ({ open, onClose, submissionId }: Props) => {
  const [deleteSubmission,{isLoading}] = useDeleteSubmissionMutation();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Submission</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          This action cannot be undone. Are you sure?
        </p>

        <DialogFooter className="flex gap-3 mt-4">
          <button className="border px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={()=> {deleteSubmission({submissionId: submissionId.id}); onClose()}}
          >
            {isLoading ? "Deleting...":"Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubmissionModal;
