/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useCreateGanttChartMutation } from "@/store/Api/ChartApi/GanttChartApi";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onSuccess: (task: any) => void;
  existingGroups?: Array<{ name: string; color: string; data: any[] }>;
}

interface TaskFormData {
  taskName: string;
  duration: string;
  startDate: string;
  finishedDate: string;
  color?: string;
  groupId?: string; // "new" or group name
}

const ROOT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Orange", value: "#f97316" },
  { name: "Rose", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Yellow", value: "#eab308" },
  { name: "Navy", value: "#2563eb" },
  { name: "Teal", value: "#0d9488" },
];

export default function AddTaskModal({
  open,
  onOpenChange,
  projectId,
  onSuccess,
  existingGroups = [],
}: AddTaskModalProps) {
  const [createGanttChart, { isLoading }] = useCreateGanttChartMutation();

  const { projectId: urlProjectId } = useParams();
  const finalProjectId = projectId || urlProjectId || "";

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      taskName: "",
      duration: "",
      startDate: "",
      finishedDate: "",
      color: "#3b82f6",
      groupId: "new",
    },
  });

  const startDate = watch("startDate");
  const finishedDate = watch("finishedDate");

  useEffect(() => {
    if (startDate && finishedDate) {
      const start = new Date(startDate);
      const end = new Date(finishedDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = differenceInDays(end, start);
        // Ensure duration is at least 0 or positive as expected by business logic
        const calculatedDuration = diff >= 0 ? diff : 0;
        setValue("duration", calculatedDuration.toString());
      }
    }
  }, [startDate, finishedDate, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    const formattedDate = (dateStr: string) => dateStr ? format(new Date(dateStr), "MM/dd/yy") : "";
    
    const newTaskRow = [
      data.taskName,
      data.duration.includes("Days") ? data.duration : `${data.duration} Days`,
      formattedDate(data.startDate),
      formattedDate(data.finishedDate),
      "", // Assigned
      "0%", // % Complete
      "Medium", // Priority
      "0 hours", // Planned Hours
      "0 hours", // Actual Hours
      "$0.00", // Planned Cost
      "$0.00" // Actual Cost
    ];

    let updatedXAxis: any[] = [];

    if (data.groupId === "new") {
      // Create a new group
      updatedXAxis = [...existingGroups, {
        color: data.color,
        data: [newTaskRow]
      }];
    } else {
      // Add to existing group
      updatedXAxis = existingGroups.map(group => {
        // We identify group by the first task's name (group name)
        const groupName = group.data?.[0]?.[0];
        if (groupName === data.groupId) {
          return {
            ...group,
            data: [...group.data, newTaskRow]
          };
        }
        return group;
      });
    }

    const payload = {
      title: "Project Timeline",
      xAxis: JSON.stringify(updatedXAxis),
      projectId: finalProjectId,
    };

    try {
      const res = await createGanttChart(payload).unwrap();
      if (res.success) {
        toast.success("Task added successfully");
        onSuccess(data);
        onOpenChange(false);
        reset();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 bg-white border border-[#E2E8F0] overflow-hidden rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add New Task
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          {/* Group Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Select Group (Root Task)
            </label>
            <Controller
              control={control}
              name="groupId"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full h-11 border-[#E2E8F0] rounded-lg px-3 focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="new">Create New Group</option>
                  {existingGroups.map((group) => {
                    const groupName = group.data?.[0]?.[0] || "Unnamed Group";
                    return (
                      <option key={groupName} value={groupName}>
                        {groupName}
                      </option>
                    );
                  })}
                </select>
              )}
            />
          </div>

          {/* Task Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Task Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("taskName", { required: "Task name is required" })}
              placeholder="e.g. Planning Phase"
              className="h-11 border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.taskName && (
              <p className="text-red-500 text-xs italic">
                {errors.taskName.message}
              </p>
            )}
          </div>

          {/* Color Selection (Only for New Group) */}
          {watch("groupId") === "new" && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Group Color
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {ROOT_COLORS.map((c) => (
                  <Controller
                    key={c.value}
                    control={control}
                    name="color"
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          field.value === c.value
                            ? "border-gray-900 scale-110 shadow-sm"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Start Date
              </label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full h-11 justify-start text-left font-normal border-[#E2E8F0] ${
                          !field.value && "text-gray-400"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(new Date(field.value), "PP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-60" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Finished Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Finished Date
              </label>
              <Controller
                control={control}
                name="finishedDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full h-11 justify-start text-left font-normal border-[#E2E8F0] ${
                          !field.value && "text-gray-400"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(new Date(field.value), "PP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-60" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Duration (Days) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register("duration", { required: "Duration is required" })}
              placeholder="e.g. 5"
              className="h-11 border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.duration && (
              <p className="text-red-500 text-xs italic">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border-[#E2E8F0] hover:bg-gray-50 text-gray-600 rounded-lg transition-colors font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold shadow-md active:scale-95"
            >
              {isLoading ? "Adding Task..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
