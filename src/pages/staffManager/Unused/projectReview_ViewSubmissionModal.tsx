/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  submission: any;
}

const ViewSubmissionModal = ({ open, onClose, submission }: Props) => {
  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <Info label="Employee" value={submission.employee.user.name} />
          <Info label="Email" value={submission.employee.user.email} />
          <Info label="Project" value={submission.project.name} />
          <Info label="Status" value={submission.status} />

          <div>
            <p className="text-xs text-gray-500">Information</p>
            <p className="border border-border rounded p-2 mt-1">
              {submission.information}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Submission</p>
            <p className="border border-border rounded p-2 mt-1">
              {submission.submission}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionModal;

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
