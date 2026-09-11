import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateProgramMutation } from "@/store/Api/ProgramApi/ProgramApi";
import { toast } from "sonner";
import { useGetAllManagersQuery } from "@/store/Api/UserApi/UserApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { Calendar } from "@/components/ui/calendar";

interface ICreateProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: ({ programName, id }: { programName: string; id: string }) => void;
  title: string;
}
interface Manager {
  id: string;
  name: string;
  profileImage: string;
  role: string;
}
interface ProgramFormData {
  programName: string;
  dateTime: string;
  programDescription: string;
  // assignedPerson: string;
  managerId: string;
  // priority: "HIGH" | "MEDIUM" | "LOW";
  // deadline: string;
}

export default function CreateProgramModal({
  open,
  onOpenChange,
  onSuccess,
  title,
}: ICreateProgramModalProps) {
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [assignedManager, setAssignedManager] = useState<Manager | null>(null);
  const [createProgramMutation] = useCreateProgramMutation();
  const { data, isLoading } = useGetAllManagersQuery({});
  const managers = data?.data?.data?.map(
    (user: {
      id: string;
      user: { name: string; profileImage: string; role: string };
    }) => ({
      id: user?.id,
      name: user?.user?.name,
      profileImage: user?.user?.profileImage,
      role: user?.user?.role,
    }),
  );
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProgramFormData>({
    defaultValues: {
      programName: "",
      dateTime: "",
      programDescription: "",
      managerId: "",
      // priority: "HIGH",
      // deadline: "",
    },
  });

  useEffect(() => {
    if (selectedManager) {
      const manager = managers?.find(
        (manager: Manager) => manager.id === selectedManager,
      );
      setAssignedManager(manager);
    }
  }, [selectedManager]);

  const onSubmit = async (data: ProgramFormData) => {
    const payload = {
      programName: data.programName,
      datetime: data.dateTime
        ? new Date(data.dateTime).toISOString()
        : new Date().toISOString(),
      ...(data.programDescription && {
        programDescription: data.programDescription,
      }),
      managerId: selectedManager,
      // priority: data.priority,
      // deadline: data.deadline
      //   ? new Date(data.deadline).toISOString()
      //   : undefined,
    };
    try {
      const res = await createProgramMutation(payload).unwrap();
      if (res.success) {
        toast.success("Program created successfully");
        onSuccess({
          programName: res?.data?.programName as string,
          id: res?.data?.id as string,
        });
      }
    } catch {
      toast.error("Failed to create program");
    }
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogTitle className="text-lg font-medium text-primary-text dark:text-slate-100">{title}</DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
          {/* <h3 className="text-lg font-medium text-gray-700">Program details</h3> */}

          {/* Program Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-300">
              Program Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("programName", {
                required: "Program Name is required",
              })}
              placeholder="Enter Program Name"
              className="h-10 border border-[#E2E8F0] dark:border-slate-800 mt-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
            {errors.programName && (
              <p className="text-red-500 text-sm">
                {errors.programName.message}
              </p>
            )}
          </div>

          {/* Starting Date — commented out (date picker removed)
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Starting Date
            </label>
            <Input
              type="datetime-local"
              {...register("startingDate", {
                required: "Starting Date is required",
              })}
              className="h-10 border border-[#E2E8F0] mt-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-300">
              Starting Date
            </label>
            <Controller
              control={control}
              name="dateTime"
              rules={{ required: "Starting Date is required" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-10 justify-start mt-2 text-left font-normal border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all ${!field.value && "text-muted-foreground dark:text-slate-500"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                      {field.value ? (
                        <span className="text-gray-900 dark:text-slate-300">{format(field.value, "PPP")}</span>
                      ) : (
                        "Pick a date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString() : "");
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dateTime && (
              <p className="text-red-500 text-sm">{errors.dateTime.message}</p>
            )}
          </div>
          */}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-300">
              Program Description
            </label>
            <Textarea
              {...register("programDescription", {
              })}
              placeholder="Enter a description..."
              className="min-h-20 resize-none border-[#E2E8F0] dark:border-slate-800 mt-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
            {errors.programDescription && (
              <p className="text-red-500 text-sm">
                {errors.programDescription.message}
              </p>
            )}
          </div>

          {/* Assigned Person */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-300">
              Assign Person
            </label>
            <Controller
              control={control}
              name="managerId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedManager(value);
                  }}
                >
                  <SelectTrigger className="h-10 border border-[#E2E8F0] dark:border-slate-800 mt-2 w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-300">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800">
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <>
                        {managers?.map((manager: Manager) => {
                          return (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          );
                        })}
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {assignedManager && (
            <div className="pt-2">
              <label className="text-sm font-medium text-gray-900 dark:text-slate-300">
                Assign Manager
              </label>
              <div className="flex items-center gap-3 mt-2 p-2 rounded-lg border border-border dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30">
                <Avatar className="size-10 border border-gray-200 dark:border-slate-800">
                  <AvatarImage src={assignedManager?.profileImage || ""} />
                  <AvatarFallback className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                    {assignedManager?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="">
                  <p className="font-medium text-sm text-gray-900 dark:text-slate-100">{assignedManager?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    {assignedManager?.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 bg-transparent border-[#E2E8F0] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-all"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 bg-[#1C73E0] hover:bg-blue-600 text-white cursor-pointer"
            >
              Create Program
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
