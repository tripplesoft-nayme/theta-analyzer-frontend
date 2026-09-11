import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrimaryButton from "@/Common/PrimaryButton";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  variant?: "Primary" | "Danger";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "Primary",
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white dark:bg-slate-900 border dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{title}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <PrimaryButton
            title={cancelText}
            type="Outline"
            onClick={handleCancel}
          />
          <PrimaryButton
            title={confirmText}
            type={variant === "Danger" ? "Danger" : "Primary"}
            disabled={isLoading}
            onClick={onConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
