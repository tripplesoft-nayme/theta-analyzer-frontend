import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTagsMutation } from "@/store/Api/ProgramApi/ProgramApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
}

export function CreateTagModal({
  open,
  onOpenChange,
  programId,
}: CreateTagModalProps) {
  const [tagName, setTagName] = useState("");
  const [createTag, { isLoading }] = useCreateTagsMutation();

  const handleCreate = async () => {
    if (!tagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const res = await createTag({
        name: tagName.trim(),
        programId,
      }).unwrap();

      if (res.success) {
        toast.success("Tag created successfully");
        setTagName("");
        onOpenChange(false);
      } else {
        toast.error(res.message || "Failed to create tag");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "An error occurred while creating the tag";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-0 overflow-hidden bg-white dark:bg-slate-900">
        <DialogHeader className="px-6 py-4 border-b border-border dark:border-slate-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Create New Tag
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="tagName"
              className="text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              Tag Name
            </Label>
            <Input
              id="tagName"
              placeholder="e.g. High Priority"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="rounded-lg border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 h-10"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
              Note: A random color will be assigned to this tag automatically.
            </p>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg font-semibold border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-300 flex-1 h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isLoading || !tagName.trim()}
            className="rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white flex-1 h-10 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Tag"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
