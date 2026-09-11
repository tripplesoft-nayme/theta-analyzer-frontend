import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProjectName: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onOpenChange,
  selectedProjectName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-8 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-xl text-slate-955 dark:text-white font-semibold">
              Submission Logged
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              Your file review request for{" "}
              <span className="text-slate-900 dark:text-white font-normal">
                {selectedProjectName || "the project"}
              </span>{" "}
              has been successfully registered.
            </p>
          </div>

          <div className="w-full pt-4">
            <Button
              className="w-full bg-btn-primary-gradient border border-[var(--brand-primary,#4881FF)] text-white hover:text-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)] h-11 rounded-md transition-colors cursor-pointer font-normal"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
