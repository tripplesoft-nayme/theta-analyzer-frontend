import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { setProjectId, setProgramId } from "@/store/Slices/ChartSlice/ChartSlice";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  projectId?: string;
  programId?: string;
}

export default function SuccessModal({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  primaryActionLabel,
  onPrimaryAction,
  projectId,
  programId,
}: SuccessModalProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      if (projectId) {
        dispatch(setProjectId(projectId));
        sessionStorage.setItem("chartBuilder_projectId", projectId);
      }
      if (programId) {
        dispatch(setProgramId(programId));
        sessionStorage.setItem("chartBuilder_programId", programId);
      }
    }
  }, [open, projectId, programId, dispatch]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
      <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-60 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 focus:outline-none animate-in zoom-in-95 duration-200 border dark:border-slate-800">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Success Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-green-100/50 dark:bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-200 dark:border-green-500/30">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400 stroke-[3px]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-300 text-sm mx-auto leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300 italic">
                "{itemName}"
              </span>{" "}
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full pt-2">
            <DialogPrimitive.Close asChild>
              <Button
                variant="outline"
                className="flex-1 h-12 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border shadow-none border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[12px] rounded-lg "
              >
                Close
              </Button>
            </DialogPrimitive.Close>
            <Button
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold uppercase tracking-wider text-[12px] rounded-lg  active:scale-95 flex items-center justify-center gap-2"
              onClick={() => {
                onOpenChange(false);
                onPrimaryAction();
              }}
            >
              {primaryActionLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  );
}
