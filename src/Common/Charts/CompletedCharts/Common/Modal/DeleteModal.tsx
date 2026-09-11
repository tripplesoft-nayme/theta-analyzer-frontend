/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  deletingItemId: string;
  deletingItemTitle?: string;
  onDelete: (deletingItemId: string) => void;
}

const DeleteModal = ({
  deletingItemTitle,
  deletingItemId,
  onDelete,
}: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" title="Delete">
          <Trash2 size={25} className=" text-[#B00020] hover:cursor-pointer" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">
            Delete {deletingItemTitle ? deletingItemTitle : ""}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 dark:text-slate-400">
          This action cannot be undone. Are you sure to delete this?
        </p>

        <DialogFooter className="flex gap-3 mt-4">
          <button
            className="border dark:border-slate-700 dark:text-slate-300 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <DialogClose asChild>
            <button
              className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              onClick={() => onDelete(deletingItemId)}
            >
              Delete
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
