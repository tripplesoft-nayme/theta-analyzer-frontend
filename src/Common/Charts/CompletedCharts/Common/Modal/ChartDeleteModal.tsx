import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChartDeleteModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onConfirm: () => void;
  widgetTitle: string;
}

const ChartDeleteModal: React.FC<ChartDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  widgetTitle,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="z-[999] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-xl rounded-xl sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full border-4 border-red-50 dark:border-slate-800 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <AlertDialogTitle className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Delete Chart?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to remove{" "}
                <span className="font-bold text-gray-700 dark:text-slate-200">
                  "{widgetTitle}"
                </span>
                ?
                <br />
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3">
          <AlertDialogCancel className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 transition-all font-semibold px-8 py-3 h-auto sm:w-auto w-full">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white border-0 transition-all shadow-sm shadow-red-200 dark:shadow-none font-semibold px-8 py-3 h-auto sm:w-auto w-full"
          >
            Yes, Delete It
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChartDeleteModal;
