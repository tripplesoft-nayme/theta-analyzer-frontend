/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateProjectTagMutation } from "@/store/Api/ProjectApi/ProjectApi";

interface AddProjectStatusModalProps {
  onClose: () => void;
  onSuccess: (tag: any) => void;
}

const AddProjectStatusModal = ({ onClose, onSuccess }: AddProjectStatusModalProps) => {
  const [createProjectTag, { isLoading }] = useCreateProjectTagMutation();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async (data: { title: string }) => {
    try {
      const formattedStatus = data.title.toUpperCase().replace(/\s+/g, '_');
      const res = await createProjectTag({ status: formattedStatus }).unwrap();
      if (res.success) {
        toast.success("Project status added successfully");
        onSuccess(res.data);
        reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add project status");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-border dark:border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Add Project Status</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 dark:text-slate-500 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Status Name</label>
            <Input
              {...register("title", { required: true })}
              placeholder="e.g. Planning"
              className="h-11 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 border-gray-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              {isLoading ? "Adding..." : "Add Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectStatusModal;
