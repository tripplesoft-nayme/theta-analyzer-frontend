import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import PrimaryButton from "@/Common/PrimaryButton";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onOpenChange,
  templateName,
  setTemplateName,
  onSave,
  isSaving,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">Save as Template</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium text-gray-900 dark:text-slate-300">
            Template Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            className="mt-1 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            onKeyDown={(e) => {
              if (e.key === "Enter" && templateName.trim() && !isSaving) {
                e.preventDefault();
                onSave();
              }
            }}
          />
        </div>
        <DialogFooter>
          <PrimaryButton
            title="Cancel"
            type="Outline"
            onClick={() => onOpenChange(false)}
          />
          <PrimaryButton
            title="Save Template"
            type="Primary"
            disabled={isSaving || !templateName.trim()}
            onClick={onSave}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateModal;
