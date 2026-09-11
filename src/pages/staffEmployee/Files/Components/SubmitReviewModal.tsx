import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SubmitReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isResubmitting: boolean;
  selectedProjectName: string;
  recentUploadsCount: number;
  isSubmittingReview: boolean;
  onSubmitReview: (notes: string) => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  isOpen,
  onOpenChange,
  isResubmitting,
  selectedProjectName,
  recentUploadsCount,
  isSubmittingReview,
  onSubmitReview,
}) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [noteError, setNoteError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdminNotes("");
      setNoteError(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!adminNotes.trim()) {
      setNoteError(true);
      return;
    }
    onSubmitReview(adminNotes);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setNoteError(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col gap-0 animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            {isResubmitting ? "Resubmit Files for Review" : "Submit Files for Review"}
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
            Submit your recent updates to the project management team. They will be logged under project review logs.
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2 space-y-6 w-full min-w-0">
          <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-855">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-normal">Selected Project:</span>
              <span className="text-slate-900 dark:text-white font-normal">
                {selectedProjectName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-normal">Recently Uploaded Files:</span>
              <span className="text-slate-900 dark:text-white font-normal">
                {recentUploadsCount} document(s)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-200 flex justify-between font-normal">
              Review Notes
              <span className="text-xs text-red-500 dark:text-red-400 font-normal">Required</span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => {
                setAdminNotes(e.target.value);
                setNoteError(false);
              }}
              placeholder="Share context, summaries, or details about the files you are submitting..."
              className={cn(
                "w-full min-h-[100px] p-4 text-sm rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-normal outline-none",
                noteError
                  ? "border border-red-500 dark:border-red-500 focus:ring-red-500"
                  : "border border-gray-200 dark:border-slate-800 focus:ring-blue-100"
              )}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md text-xs border border-blue-100 dark:border-blue-500/20 font-normal">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>Submitted uploads cannot be modified or deleted without a revision request.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-955/50 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-4 h-11 border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-md font-normal"
          >
            Cancel
          </Button>
          <Button
            className="bg-btn-primary-gradient border border-[var(--brand-primary,#4881FF)] text-white hover:text-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)] cursor-pointer rounded-md font-normal px-4 h-11 transition-colors duration-300"
            onClick={handleSubmit}
            disabled={isSubmittingReview}
          >
            {isSubmittingReview && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isResubmitting ? "Resubmit" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
