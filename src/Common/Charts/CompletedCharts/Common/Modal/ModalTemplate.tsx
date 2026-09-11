import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";

interface AppDialogProps {
  triggerButton: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AppDialog = ({
  triggerButton,
  title,
  description,
  children,
  footer,
}: AppDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <button className="bg-[#262f30] hover:bg-[#303b3c] text-white font-medium px-4 py-2 rounded-md border border-white/10"> */}
          {triggerButton}
        {/* </button> */}
      </DialogTrigger>

      <DialogContent className="max-h-[99vh] overflow-y-auto bg-white dark:bg-slate-900 border dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-100">
            {title}
          </DialogTitle>

          {description && (
            <div className="text-xs text-gray-700 dark:text-slate-400">
              {description}
            </div>
          )}
        </DialogHeader>

        {/* Main Content */}
        <div className="py-2 dark:text-slate-200">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <DialogFooter className="dark:border-t dark:border-slate-800 pt-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
