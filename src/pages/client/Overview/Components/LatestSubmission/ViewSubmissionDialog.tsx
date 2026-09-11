/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ViewSubmissionDialogProps {
  submission: any;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  RETURNED: "bg-red-50 text-red-700 border-red-200",
};

const ViewSubmissionDialog = ({ submission }: ViewSubmissionDialogProps) => {
  if (!submission) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0">
          <Eye className="w-5 h-5 text-blue-600" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Submission Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Submission</p>
              <p className="font-medium">
                {submission?.submission ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant="outline"
                className={`mt-1 ${statusStyles[submission?.status] ??
                  "bg-gray-50 text-gray-600"
                  }`}
              >
                {submission?.status ?? "UNKNOWN"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-500">Project</p>
              <p className="font-medium">
                {submission?.project?.name ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Submitted On</p>
              <p className="font-medium">
                {submission?.createdAt
                  ? new Date(submission.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Submitted By</p>
              <p className="font-medium">
                {submission?.employee?.user?.name ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="font-medium">
                {submission?.employee?.user?.email ?? "-"}
              </p>
            </div>
          </div>

          {/* Description / Notes */}
          {submission?.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {submission.description}
              </p>
            </div>
          )}

          {/* File / Attachment */}
          {submission?.fileUrl && (
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Attachment
              </p>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm"
              >
                View uploaded file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionDialog;
