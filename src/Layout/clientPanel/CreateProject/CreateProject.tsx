import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from "@/store/Api/ProjectApi/ProjectApi";
import {
  useGetAllManagersQuery,
  useGetAllViewersQuery,
} from "@/store/Api/UserApi/UserApi";
import { useGetProjectTagsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { Skeleton } from "@/components/ui/skeleton";
import AddProjectStatusModal from "./AddProjectStatusModal";
const ProjectLocationPicker = lazyWithRetry(() => import("@/Common/Maps/ProjectLocationPicker"));
import { Slider } from "@/components/ui/slider"
import {
  X,
  HelpCircle,
  Flag,
  Lock,
  Users,
  CalendarIcon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useGetAllEmployeesQuery } from "@/store/Api/EmployeeApi/EmployeeApi";

// Leaflet icon configuration moved to BaseMap

type UploadCycle = "Daily" | "Weekly" | "By_Weekly" | "Monthly";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type DaysEnum = "Sun" | "Mon" | "Tue" | "Wed" | "Thurs" | "Fri" | "Sat";

interface CreateProjectForm {
  programId: string;
  name: string;
  shareWith: "Only_Me" | "Invite_Staff"; //Invite_Staff
  managerId: string;
  viewerIds: string[];
  employeeIds: string[];
  dateDate: string;
  uploadCycle: UploadCycle;
  SelectDays: string; // Days { Sun, Mon, Tue, Wed, Thurs, Fri, Sat}
  selectDate: string;
  UploadData: string;
  progress: number;
  description: string;
  startDate: string;
  workingDay: string;
  sortName: string;
  deadline: string;
  priority: Priority;
  status: string;
  projectTagId: string;
  budget: string;
  currentRate: string;
  location: string;
  latitude: string;
  longitude: string;
}

const TeamMemberTag = ({
  name,
  role,
  image,
  onRemove,
  variant = "blue",
}: {
  name: string;
  role: string;
  image?: string;
  onRemove: () => void;
  variant?: "emerald" | "blue" | "indigo";
}) => {
  const styles = {
    emerald: {
      tagBorder: "border-emerald-100 dark:border-emerald-500/20",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconBorder: "border-emerald-50 dark:border-emerald-500/20",
      initialsText: "text-emerald-600 dark:text-emerald-400",
      roleText: "text-emerald-500/80 dark:text-emerald-400/60",
    },
    blue: {
      tagBorder: "border-slate-100 dark:border-slate-800",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconBorder: "border-slate-50 dark:border-slate-800",
      initialsText: "text-blue-600 dark:text-blue-400",
      roleText: "text-blue-500/80 dark:text-blue-400/60",
    },
    indigo: {
      tagBorder: "border-slate-100 dark:border-slate-800",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconBorder: "border-slate-50 dark:border-slate-800",
      initialsText: "text-indigo-600 dark:text-indigo-400",
      roleText: "text-indigo-500/80 dark:text-indigo-400/60",
    },
  };

  const s = styles[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md p-1 pr-2.5 border border-slate-100 dark:border-slate-800 rounded-full transition-all group",
        s.tagBorder,
      )}
    >
      <div
        className={cn(
          "rounded-full w-8 h-8 flex items-center justify-center overflow-hidden shrink-0 border",
          s.iconBg,
          s.iconBorder,
        )}
      >
        {image ? (
          <img src={image} className="w-full h-full object-cover" />
        ) : (
          <span className={cn("font-bold text-[10px]", s.initialsText)}>
            {name?.[0]}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] leading-none">
          {name}
        </span>
        <span
          className={cn(
            "text-[8px] uppercase font-bold tracking-tighter leading-none mt-0.5",
            s.roleText,
          )}
        >
          {role}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-red-500 text-slate-300 dark:text-slate-500 ml-1 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// Map components moved to MapComponents.tsx

export const LocationAutocomplete = ({
  locationName,
  setLocationName,
  onSelect,
}: {
  locationName: string;
  setLocationName: (val: string) => void;
  onSelect: (lat: number, lon: number, name: string) => void;
}) => {
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!locationName) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName,
        )}&accept-language=en`,
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="relative w-full z-10">
      <div className="flex gap-2">
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Location (e.g., New York, London)"
          className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 text-sm text-slate-700 dark:text-slate-300 transition-all flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 h-12 font-semibold text-sm rounded-lg transition-colors"
        >
          Search
        </button>
      </div>
      {results.length > 0 && (
        <ul className="absolute top-[52px] left-0 right-0 max-h-[200px] overflow-y-auto bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
          {results.slice(0, 5).map((r, i) => (
            <li
              key={i}
              className="p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                setResults([]);
              }}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CreateProject = ({
  programId,
  onClose,
  onSuccess,
  project,
}: {
  programId: string;
  onClose: () => void;
  onSuccess?: (projectName: string, projectId: string) => void;
  project?: any;
}) => {
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const isLoading = isCreating || isUpdating;
  const isUpdate = !!project;

  const isValidDate = (val: any) => {
    if (!val) return false;
    const d = new Date(val);
    return !isNaN(d.getTime());
  };

  const parseSelectDate = (d: any) => {
    if (d === undefined || d === null || d === "") return new Date();
    // If it's a number or a short numeric string (like "15"), treat as day of month
    if (!isNaN(Number(d)) && String(d).trim().length <= 2) {
      return new Date(new Date().getFullYear(), new Date().getMonth(), Number(d));
    }
    // Otherwise try parsing it directly as ISO date string
    const parsed = new Date(d);
    return !isNaN(parsed.getTime()) ? parsed : new Date();
  };
  const { data: managersData } = useGetAllManagersQuery({});
  const allManagers = managersData?.data?.data || managersData?.data || [];
  const { data: employeesData } = useGetAllEmployeesQuery({});
  const { data: viewerData } = useGetAllViewersQuery({});
  const { data: tagsData, isLoading: isTagsLoading } = useGetProjectTagsQuery({});
  const allEmployees: any =
    employeesData?.data?.data || employeesData?.data || [];
  const allViewer = viewerData?.data?.data || viewerData?.data || [];
  const allTags = (tagsData?.data || []).map((tag: any) => tag.name || tag);
  const [enableDetails, setEnableDetails] = useState(false);
  const [isAddStatusModalOpen, setIsAddStatusModalOpen] = useState(false);

  const computedDefaults = React.useMemo(() => {
    if (!project) {
      return {
        programId,
        name: "",
        shareWith: "Only_Me" as const,
        managerId: "",
        viewerIds: [] as string[],
        employeeIds: [] as string[],
        dateDate: new Date().toISOString(),
        uploadCycle: "Weekly" as const,
        SelectDays: "[]",
        selectDate: "[]",
        UploadData: "3",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        workingDay: "[]",
        sortName: "",
        deadline: "",
        priority: "MEDIUM" as const,
        status: "DRAFT",
        projectTagId: "DRAFT",
        budget: "",
        currentRate: "",
        location: "",
        latitude: "",
        longitude: "",
        progress: 0,
      };
    }

    const toDateStr = (iso?: string) => {
      if (!iso) return "";
      const d = new Date(iso);
      return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
    };
    const toJsonArr = (val: any) =>
      val ? (Array.isArray(val) ? JSON.stringify(val) : val) : "[]";

    const hasSharedStaff =
      project.shareWith === "Invite_Staff" ||
      (project.employeeIds && project.employeeIds.length > 0) ||
      (project.viewerIds && project.viewerIds.length > 0) ||
      (project.projectEmployees && project.projectEmployees.length > 0) ||
      (project.projectViewers && project.projectViewers.length > 0);

    return {
      programId: project.programId || programId,
      name: project.name || "",
      shareWith: (hasSharedStaff ? "Invite_Staff" : "Only_Me") as
        | "Only_Me"
        | "Invite_Staff",
      managerId: project.managerId || project.manager?.id || "",
      viewerIds:
        project.viewerIds ||
        project.projectViewers?.map((v: any) => v.viewerId) ||
        [],
      employeeIds:
        project.employeeIds ||
        project.projectEmployees?.map((e: any) => e.employeeId) ||
        [],
      dateDate:
        project.dateDate || project.dataDate || new Date().toISOString(),
      uploadCycle: (project.uploadCycle || "Weekly") as
        | "Daily"
        | "Weekly"
        | "By_Weekly"
        | "Monthly",
      SelectDays: toJsonArr(project.SelectDays),
      selectDate: toJsonArr(project.selectDate),
      UploadData: String(project.UploadData || "3"),
      description: project.description || "",
      startDate: toDateStr(project.startDate),
      workingDay: toJsonArr(project.workingDay),
      sortName: project.sortName || "",
      deadline: toDateStr(project.deadline),
      priority: (project.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
      status: project.status || "",
      projectTagId: project.status || project.projectTagId || project.projectTag?.id || "",
      budget: project.budget || "",
      currentRate: project.currentRate || "",
      location: project.location || "",
      latitude: project.latitude || "",
      longitude: project.longitude || "",
      progress: project?.progress || 0,
    };
  }, [project, programId]);

  const { register, handleSubmit, watch, setValue, control, reset } =
    useForm<CreateProjectForm>({
      defaultValues: computedDefaults,
    });

  useEffect(() => {
    if (project) {
      reset(computedDefaults);
    }
  }, [project, reset, computedDefaults]);

  const uploadCycle = watch("uploadCycle");
  const startDateVal = watch("startDate");
  const SelectDays = watch("SelectDays");
  const workingDay = watch("workingDay");
  const shareWith = watch("shareWith");
  const employeeIds = watch("employeeIds");
  const viewerIds = watch("viewerIds");
  const selectedManagerId = watch("managerId");
  const selectedEmployeeIds = employeeIds.filter(Boolean);
  const selectedViewerIds = viewerIds.filter(Boolean);
  const toggleDay = (day: string) => {
    const map: Record<string, DaysEnum> = {
      Mon: "Mon",
      Tue: "Tue",
      Wed: "Wed",
      Thu: "Thurs",
      Fri: "Fri",
      Sat: "Sat",
      Sun: "Sun",
    };
    const apiDay = map[day] || (day.toUpperCase() as any);
    let current: DaysEnum[] = [];
    try {
      if (Array.isArray(SelectDays)) {
        current = SelectDays;
      } else {
        current = JSON.parse(SelectDays || "[]");
      }
    } catch {
      current = [];
    }
    const updated = current.includes(apiDay)
      ? current.filter((d) => d !== apiDay)
      : [...current, apiDay];
    setValue("SelectDays", JSON.stringify(updated));
  };

  const isDaySelected = (shortDay: string) => {
    const map: Record<string, DaysEnum> = {
      Mon: "Mon",
      Tue: "Tue",
      Wed: "Wed",
      Thu: "Thurs",
      Fri: "Fri",
      Sat: "Sat",
      Sun: "Sun",
    };
    let current: DaysEnum[] = [];
    try {
      if (Array.isArray(SelectDays)) {
        current = SelectDays;
      } else {
        current = JSON.parse(SelectDays || "[]");
      }
    } catch {
      current = [];
    }
    return current.includes(map[shortDay]);
  };

  const toggleWorkingDay = (day: string) => {
    const map: Record<string, DaysEnum> = {
      Mon: "Mon",
      Tue: "Tue",
      Wed: "Wed",
      Thu: "Thurs",
      Fri: "Fri",
      Sat: "Sat",
      Sun: "Sun",
    };
    const apiDay = map[day] || (day.toUpperCase() as any);
    let current: DaysEnum[] = [];
    try {
      if (Array.isArray(workingDay)) {
        current = workingDay;
      } else {
        current = JSON.parse(workingDay || "[]");
      }
    } catch {
      current = [];
    }
    const updated = current.includes(apiDay)
      ? current.filter((d) => d !== apiDay)
      : [...current, apiDay];
    setValue("workingDay", JSON.stringify(updated));
  };

  const isWorkingDaySelected = (shortDay: string) => {
    const map: Record<string, DaysEnum> = {
      Mon: "Mon",
      Tue: "Tue",
      Wed: "Wed",
      Thu: "Thurs",
      Fri: "Fri",
      Sat: "Sat",
      Sun: "Sun",
    };
    let current: DaysEnum[] = [];
    try {
      if (Array.isArray(workingDay)) {
        current = workingDay;
      } else {
        current = JSON.parse(workingDay || "[]");
      }
    } catch {
      current = [];
    }
    return current.includes(map[shortDay]);
  };

  const toISO = (date: string) => {
    if (!date) return null;
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toISOString() : null;
  };

  const cleanPayload = (obj: any) => {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        newObj[key] = value;
      }
    });
    return newObj;
  };

  // Auto-expand details section if project already has details data
  useEffect(() => {
    if (project && (project.description || project.budget)) {
      setEnableDetails(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      const parsedSelectDays = JSON.parse(data.SelectDays || "[]");
      const parsedWorkingDay = JSON.parse(data.workingDay || "[]");
      const parsedSelectDates = JSON.parse(data.selectDate || "[]");

      // Convert day numbers to ISO dates for Prisma DateTime[]
      const formattedSelectDates = parsedSelectDates.map((val: any) => {
        if (!val) return new Date().toISOString();
        if (typeof val === "string" && isNaN(Number(val)) && !isNaN(Date.parse(val))) {
          return new Date(val).toISOString();
        }
        const d = new Date();
        d.setDate(Number(val));
        return d.toISOString();
      });

      const payload: any = {
        ...data,
        SelectDays: parsedSelectDays,
        workingDay: parsedWorkingDay,
        selectDate: uploadCycle === 'Monthly' ? [isValidDate(data.dateDate)
          ? new Date(data.dateDate).toISOString()
          : new Date().toISOString()] : formattedSelectDates,
        dateDate: isValidDate(data.dateDate)
          ? new Date(data.dateDate).toISOString()
          : new Date().toISOString(),
        startDate: toISO(data.startDate),
        deadline: toISO(data.deadline),
        managerId: data.managerId || null,
        status: data.projectTagId || "DRAFT",
        progress: data.progress || 0,
      };
      delete payload.projectTagId;
      console.log(payload, "Payload 2");
      if (isUpdate) {
        delete payload.programId;

        // Calculate differences for employee and viewer access updates
        const initialEmployeeIds = project.employeeIds || project.projectEmployees?.map((e: any) => e.employeeId) || [];
        const initialViewerIds = project.viewerIds || project.projectViewers?.map((v: any) => v.viewerId) || [];

        payload.addEmployeeIds = (data.employeeIds || []).filter(
          (id) => !initialEmployeeIds.includes(id)
        );
        payload.removeEmployeeIds = initialEmployeeIds.filter(
          (id: string) => !(data.employeeIds || []).includes(id)
        );

        payload.addViewerIds = (data.viewerIds || []).filter(
          (id) => !initialViewerIds.includes(id)
        );
        payload.removeViewerIds = initialViewerIds.filter(
          (id: string) => !(data.viewerIds || []).includes(id)
        );

        delete payload.employeeIds;
        delete payload.viewerIds;
      }

      if (!enableDetails) {
        // Remove detail fields if section is closed (Status is always sent as it is separate)
        const detailsFields = [
          "description",
          "sortName",
          "currentRate",
          "startDate",
          "workingDay",
          "deadline",
          "priority",
          "budget",
          "location",
          "latitude",
          "longitude",
          "progress",
        ];
        detailsFields.forEach((field) => {
          delete payload[field];
        });
      }

      const cleaned = cleanPayload(payload);

      if (isUpdate) {
        const res = await updateProject({
          id: project.id,
          ...cleaned,
        }).unwrap();
        if (res.success) {
          toast.success("Project updated successfully");
          onClose();
        }
      } else {
        const res = await createProject({ ...cleaned, status: data.projectTagId || "DRAFT" }).unwrap();
        if (res.success) {
          const pId = res.data?.project?.id || res.data?.id;
          if (onSuccess) {
            onSuccess(data.name, pId);
          }
        }
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-lg w-full max-w-4xl max-h-[98vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-slate-200 dark:border-slate-800 border-b bg-white dark:bg-slate-900">
          <h2 className="font-semibold text-lg text-primary-text dark:text-slate-100">
            {isUpdate ? "Update Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 p-6 max-h-[calc(90vh-140px)] overflow-y-auto scrollbar-hide"
        >
          {/* Project Details Section */}
          <section className="space-y-6">
            <div className="gap-x-8 gap-y-6 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <div className="group relative">
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      placeholder="Enter project name"
                      className="bg-slate-50/50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>
                {/* Data Date */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    Data Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-[400px]">
                    <Controller
                      control={control}
                      name="dateDate"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "justify-start bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 border-slate-200 dark:border-slate-800 rounded-lg w-full h-12 font-normal text-left transition-all text-slate-900 dark:text-slate-100",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                              {isValidDate(field.value) ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-auto" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                isValidDate(field.value) ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(date?.toISOString())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-[11px] text-blue-600/70 text-sm uppercase tracking-tight">
                      Data Date Uploading Cycle <span className="text-red-500">*</span>
                    </h4>
                    <Controller
                      control={control}
                      name="uploadCycle"
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-x-8 gap-y-4">
                          {["Weekly", "By_Weekly", "Monthly"].map((label) => {
                            const value = label as UploadCycle;
                            const displayLabel = label.replace("_", " ");
                            return (
                              <label
                                key={label}
                                className="group flex items-center gap-2.5 cursor-pointer"
                              >
                                <div className="relative flex justify-center items-center">
                                  <input
                                    type="radio"
                                    {...field}
                                    value={value}
                                    checked={field.value === value}
                                    className="peer border-2 border-slate-300 dark:border-slate-800 checked:border-blue-600 dark:checked:border-blue-500 rounded-full w-5 h-5 transition-all appearance-none dark:bg-slate-900"
                                  />
                                  <div className="absolute bg-blue-600 dark:bg-blue-500 rounded-full w-2.5 h-2.5 scale-0 peer-checked:scale-100 transition-transform" />
                                </div>
                                <span
                                  className={cn(
                                    "font-semibold text-xs transition-colors",
                                    field.value === value
                                      ? "text-slate-900 dark:text-slate-100"
                                      : "text-slate-500 dark:text-slate-400",
                                  )}
                                >
                                  {displayLabel}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  </div>

                  {uploadCycle === "Weekly" && (
                    <div className="space-y-3 slide-in-from-top-2 animate-in duration-300 fade-in">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Select days <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => {
                            const isSelected = isDaySelected(day);
                            return (
                              <div
                                key={day}
                                className="flex flex-col items-center gap-2 min-w-[42px]"
                              >
                                <span className="font-bold text-[10px] text-slate-400 uppercase">
                                  {day}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleDay(day)}
                                  className={cn(
                                    "flex justify-center items-center border-2 rounded-md w-5 h-5 transition-all",
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                                  )}
                                >
                                  {isSelected && (
                                    <svg
                                      width="10"
                                      height="8"
                                      viewBox="0 0 10 8"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M1 4L3.5 6.5L8.5 1.5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {uploadCycle === "By_Weekly" && (
                    <div className="space-y-3 slide-in-from-top-2 animate-in duration-300 fade-in">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Select 2 Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          control={control}
                          name="selectDate"
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 border-slate-200 dark:border-slate-800 rounded-lg w-full h-12 font-normal text-left transition-all group",
                                    !field.value || field.value === "[]"
                                      ? "text-slate-400 dark:text-slate-600"
                                      : "text-slate-900 dark:text-slate-100",
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      let dates = [];
                                      try {
                                        dates = JSON.parse(field.value || "[]");
                                      } catch {
                                        dates = [];
                                      }
                                      if (dates && dates.length > 0) {
                                        return (
                                          <span className="text-slate-700 dark:text-slate-300">
                                            {dates
                                              .slice(0, 2)
                                              .map((d: any, i: number) => {
                                                const dateObj = parseSelectDate(d);
                                                return (
                                                  <React.Fragment key={d}>
                                                    {format(
                                                      dateObj,
                                                      "dd/MM/yyyy",
                                                    )}
                                                    {i === 0 &&
                                                      dates.length > 1 &&
                                                      " & "}
                                                  </React.Fragment>
                                                );
                                              })}
                                            {dates.length === 1 &&
                                              " & DD/MM/YYYY"}
                                          </span>
                                        );
                                      }
                                      return (
                                        <span>DD/MM/YYYY & DD/MM/YYYY</span>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <HelpCircle
                                      size={16}
                                      className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors"
                                    />
                                    <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                  </div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="p-0 w-auto"
                                align="start"
                              >
                                <Calendar
                                  mode="multiple"
                                  max={2}
                                  selected={(() => {
                                    let dates = [];
                                    try {
                                      dates = JSON.parse(field.value || "[]");
                                    } catch {
                                      dates = [];
                                    }
                                    return dates.map(
                                      (d: any) => parseSelectDate(d)
                                    );
                                  })()}
                                  onSelect={(dates) => {
                                    const dayNumbers =
                                      dates?.map((d) => d.getDate()) || [];
                                    field.onChange(JSON.stringify(dayNumbers));
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {uploadCycle === "Monthly" && (
                    <div className="space-y-3 slide-in-from-top-2 animate-in duration-300 fade-in">
                      {/* <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Select Date
                      </label>
                      <div className="relative">
                        <Controller
                          control={control}
                          name="selectDate"
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 border-slate-200 dark:border-slate-800 rounded-lg w-full h-12 font-normal text-left transition-all group",
                                    !field.value || field.value === "[]"
                                      ? "text-slate-400 dark:text-slate-600"
                                      : "text-slate-900 dark:text-slate-100",
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      let dates = [];
                                      try {
                                        dates = JSON.parse(field.value || "[]");
                                      } catch {
                                        dates = [];
                                      }
                                      if (dates && dates.length > 0) {
                                        const dateObj = parseSelectDate(dates[0]);
                                        return (
                                          <span className="text-slate-700 dark:text-slate-300">
                                            {format(dateObj, "dd/MM/yyyy")}
                                          </span>
                                        );
                                      }
                                      return <span>DD/MM/YYYY</span>;
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <HelpCircle
                                      size={16}
                                      className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors"
                                    />
                                    <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                  </div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="p-0 w-auto"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={(() => {
                                    let dates = [];
                                    try {
                                      dates = JSON.parse(field.value || "[]");
                                    } catch {
                                      dates = [];
                                    }
                                    return dates[0]
                                      ? parseSelectDate(dates[0])
                                      : undefined;
                                  })()}
                                  onSelect={(date) => {
                                    field.onChange(
                                      date
                                        ? JSON.stringify([date.getDate()])
                                        : "[]",
                                    );
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div> */}
                    </div>
                  )}

                  {/* Move Data Upload Date and Project Status after all cycle options */}
                  <div className="space-y-6 slide-in-from-top-2 animate-in duration-300 fade-in">
                    <div className="space-y-3">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Data Upload Date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-8">
                        {["3", "4", "5"].map((days) => (
                          <label
                            key={days}
                            className="group flex items-center gap-2.5 cursor-pointer"
                          >
                            <div className="relative flex justify-center items-center">
                              <input
                                type="radio"
                                {...register("UploadData")}
                                value={days}
                                className="peer border-2 border-slate-300 dark:border-slate-700 checked:border-blue-600 dark:checked:border-blue-500 rounded-full w-5 h-5 transition-all appearance-none cursor-pointer"
                              />
                              <div className="absolute bg-blue-600 dark:bg-blue-500 rounded-full w-2.5 h-2.5 scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                            <span className="font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 text-xs transition-colors">
                              {days} Days
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-3">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Project Status <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Controller
                            control={control}
                            name="projectTagId"
                            render={({ field }) =>
                              isTagsLoading ? (
                                <Skeleton className="h-12 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
                              ) : (
                                <Select
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    setValue("status", val);
                                  }}
                                  value={field.value ? String(field.value) : ""}
                                >
                                  <SelectTrigger className="bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:ring-blue-500/20 w-full h-11! text-slate-700 dark:text-slate-300 text-sm transition-all focus:outline-none">
                                    <SelectValue placeholder="Select Status" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
                                    {allTags?.map((tag: string) => (
                                      <SelectItem
                                        key={tag}
                                        value={tag}
                                      >
                                        {tag}
                                      </SelectItem>
                                    ))}
                                    {/* Fallback for existing project status if not in the current list */}
                                    {project?.status &&
                                      !allTags?.includes(project.status) && (
                                        <SelectItem
                                          key={project.status}
                                          value={project.status}
                                        >
                                          {project.status}
                                        </SelectItem>
                                      )}
                                  </SelectContent>
                                </Select>
                              )
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddStatusModalOpen(true)}
                          className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all active:scale-90"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-12">
                {/* Share With */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[11px] text-blue-600/70 dark:text-blue-400/80 text-sm uppercase tracking-tight">
                    Sharing & Access
                  </h4>
                  <Controller
                    control={control}
                    name="shareWith"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-4 pt-1">
                        {[
                          { id: "Only_Me", label: "Only Me", icon: Lock },
                          {
                            id: "Invite_Staff",
                            label: "Invite Staff",
                            icon: Users,
                          },
                        ].map((option) => (
                          <label
                            key={option.id}
                            className="group flex items-center gap-2 cursor-pointer"
                          >
                            <div className="relative flex justify-center items-center">
                              <input
                                type="radio"
                                name="shareWith"
                                checked={field.value === option.id}
                                onChange={() => {
                                  field.onChange(option.id);
                                  if (option.id !== "Invite_Staff") {
                                    setValue("employeeIds", []);
                                    setValue("viewerIds", []);
                                  }
                                }}
                                className="peer border-2 border-slate-300 dark:border-slate-700 checked:border-blue-600 dark:checked:border-blue-500 rounded-full w-5 h-5 transition-all appearance-none cursor-pointer"
                              />
                              <div className="absolute bg-blue-600 dark:bg-blue-500 rounded-full w-2.5 h-2.5 scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                            <span
                              className={cn(
                                "font-medium text-xs transition-colors",
                                field.value === option.id
                                  ? "text-slate-900 dark:text-slate-100"
                                  : "text-slate-500 dark:text-slate-500",
                              )}
                            >
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  />

                  {shareWith === "Invite_Staff" && (
                    <div className="relative space-y-6 slide-in-from-top-2 mt-4 pt-6 border-slate-100 dark:border-slate-800 border-t animate-in">
                      <h4 className="font-bold text-[11px] text-blue-600/70 dark:text-blue-400/80 uppercase tracking-widest">
                        Configure Team Access
                      </h4>
                      {/* Employee Select */}
                      <div className="space-y-2">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Assign Project Employees
                        </label>
                        <div className="relative">
                          <Controller
                            control={control}
                            name="employeeIds"
                            render={({ field }) => (
                              <Select
                                value=""
                                onValueChange={(val) => {
                                  if (val) {
                                    const current = field.value
                                      ? field.value
                                      : [];
                                    if (!current.includes(val)) {
                                      field.onChange([...current, val]);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:ring-blue-500/20 w-full h-11! text-slate-700 dark:text-slate-300 text-sm transition-all">
                                  <SelectValue placeholder="Add Employee" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                  {allEmployees.map((emp: any) => {
                                    const employeeName =
                                      emp?.name || emp?.user?.name || "Unknown";
                                    return (
                                      <SelectItem key={emp.id} value={emp.id}>
                                        {employeeName}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      {/* Viewer Select */}
                      <div className="space-y-2">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Assign Project Viewers
                        </label>
                        <div className="relative">
                          <Controller
                            control={control}
                            name="viewerIds"
                            render={({ field }) => (
                              <Select
                                value=""
                                onValueChange={(val) => {
                                  if (val) {
                                    const current = field.value
                                      ? field.value
                                      : [];
                                    if (!current.includes(val)) {
                                      field.onChange([...current, val]);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:ring-blue-500/20 w-full h-11! text-slate-700 dark:text-slate-300 text-sm transition-all">
                                  <SelectValue placeholder="Add Viewer" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                  {allViewer.map((v: any) => (
                                    <SelectItem key={v.id} value={v.id}>
                                      {v.user?.name || v?.name || "Unknown"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Manager Select */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    Assign Project Manager <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="managerId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:ring-blue-500/20 w-full h-11! text-slate-700 dark:text-slate-300 text-sm transition-all">
                            <SelectValue placeholder="Select Manager" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            {allManagers.map((m: any) => {
                              const mId = m.id || m.userId;
                              const mName = m.user?.name || m.name || "Unknown";
                              return (
                                <SelectItem
                                  key={String(mId)}
                                  value={String(mId)}
                                >
                                  {mName}
                                </SelectItem>
                              );
                            })}
                            {/* Fallback for project manager if not in the list */}
                            {project?.manager &&
                              !allManagers.find((m: any) => {
                                const mId = m.id || m.userId || m.manager?.id;
                                return (
                                  String(mId) === String(field.value) ||
                                  String(m.user?.id) === String(field.value)
                                );
                              }) && (
                                <SelectItem
                                  key={String(project.manager.id)}
                                  value={String(project.manager.id)}
                                >
                                  {project.manager.user?.name ||
                                    project.manager.name ||
                                    "Project Manager"}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {(selectedManagerId ||
                  selectedEmployeeIds.length > 0 ||
                  selectedViewerIds.length > 0) && (
                    <div className="flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/50 slide-in-from-top-1 p-3 border border-slate-100 dark:border-slate-800 rounded-xl animate-in fade-in">
                      <div className="flex justify-between items-center px-1">
                        <span className="flex items-center gap-2 font-bold text-[10px] text-slate-400 dark:text-slate-300 uppercase tracking-widest">
                          <Users size={12} className="text-blue-500/70 dark:text-blue-400/70" />
                          Team Preview
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedManagerId &&
                          (() => {
                            const managerFromList = allManagers.find((m: any) => {
                              const mId = m.id || m.manager?.id;
                              const mUserId =
                                m.userId || m.manager?.userId || m.user?.id;
                              return (
                                String(mId) === String(selectedManagerId) ||
                                String(mUserId) === String(selectedManagerId)
                              );
                            });

                            const managerFallback =
                              !managerFromList &&
                                project?.manager &&
                                (String(project.managerId) ===
                                  String(selectedManagerId) ||
                                  String(project.manager?.id) ===
                                  String(selectedManagerId) ||
                                  String(project.manager?.userId) ===
                                  String(selectedManagerId) ||
                                  String(project.manager?.user?.id) ===
                                  String(selectedManagerId))
                                ? project.manager
                                : null;

                            const manager = managerFromList || managerFallback;
                            if (!manager) return null;

                            const name =
                              manager.user?.name || manager.name || "Manager";
                            const profileImage =
                              manager.user?.profileImage || manager.profileImage;

                            return (
                              <TeamMemberTag
                                key={String(selectedManagerId)}
                                name={name}
                                role="Manager"
                                image={profileImage}
                                variant="emerald"
                                onRemove={() => setValue("managerId", "")}
                              />
                            );
                          })()}

                        {selectedEmployeeIds.map((empId) => {
                          const empRecord = allEmployees.find((e: any) => {
                            const eId = e.id || e.employee?.id;
                            const eUserId =
                              e.userId || e.employee?.userId || e.user?.id;
                            return (
                              String(eId) === String(empId) ||
                              String(eUserId) === String(empId)
                            );
                          });
                          const empProjectData = project?.projectEmployees?.find(
                            (pe: any) => {
                              const peId = pe.employeeId || pe.employee?.id;
                              return String(peId) === String(empId);
                            },
                          )?.employee;

                          const emp = empRecord || empProjectData;
                          if (!emp) return null;
                          const name = emp?.name || emp?.user?.name || "Unknown";
                          const profileImage =
                            emp?.profileImage || emp?.user?.profileImage;

                          return (
                            <TeamMemberTag
                              key={empId}
                              name={name}
                              role="Employee"
                              image={profileImage}
                              variant="blue"
                              onRemove={() =>
                                setValue(
                                  "employeeIds",
                                  selectedEmployeeIds.filter(
                                    (id) => id !== empId,
                                  ),
                                )
                              }
                            />
                          );
                        })}

                        {selectedViewerIds.map((vId) => {
                          const viewerRecord = allViewer.find((v: any) => {
                            const vIdShort = v.id || v.viewer?.id;
                            const vUserId =
                              v.userId || v.viewer?.userId || v.user?.id;
                            return (
                              String(vIdShort) === String(vId) ||
                              String(vUserId) === String(vId)
                            );
                          });
                          const viewerProjectData = project?.projectViewers?.find(
                            (pv: any) => {
                              const pvId = pv.viewerId || pv.viewer?.id;
                              return String(pvId) === String(vId);
                            },
                          )?.viewer;

                          const viewer = viewerRecord || viewerProjectData;
                          if (!viewer) return null;
                          const name =
                            viewer?.user?.name || viewer?.name || "Unknown";
                          const profileImage =
                            viewer?.user?.profileImage || viewer?.profileImage;

                          return (
                            <TeamMemberTag
                              key={vId}
                              name={name}
                              role="Viewer"
                              image={profileImage}
                              variant="indigo"
                              onRemove={() =>
                                setValue(
                                  "viewerIds",
                                  selectedViewerIds.filter((id) => id !== vId),
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-4 py-2 pt-6 border-slate-100 dark:border-slate-800 border-t">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Enable Project Details settings
              </span>
              <button
                type="button"
                onClick={() => setEnableDetails(!enableDetails)}
                className={cn(
                  "inline-flex relative border-2 border-transparent rounded-full focus:outline-none w-11 h-6 transition-colors duration-200 ease-in-out cursor-pointer shrink-0",
                  enableDetails ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600",
                )}
              >
                <span
                  className={cn(
                    "inline-block bg-white dark:bg-slate-100 shadow rounded-full ring-0 w-5 h-5 transition duration-200 ease-in-out pointer-events-none transform",
                    enableDetails ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </section>

          {enableDetails && (
            <div className="slide-in-from-bottom-2 space-y-8 animate-in duration-500 fade-in pb-4">
              <div className="">
                <label className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Progress</label>
                <Controller
                  name="progress"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex items-center gap-2 w-full">
                      <Slider
                        value={[value || 0]}
                        onValueChange={(val) => onChange(Number(val[0]))}
                        max={100}
                        step={1}
                        className="w-full cursor-pointer"
                      />
                      <input
                        type="number"
                        value={value || 0}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                          onChange(val);
                        }}
                        max={100}
                        min={0}
                        step={1}
                        className="border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[40px] placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100 px-5 w-20 transition-all resize-none cursor-pointer"
                      />
                    </div>
                  )}
                />

              </div>
              <div className="gap-x-12 gap-y-10 grid grid-cols-1 md:grid-cols-2 items-start justify-center">
                {/* Column 1 */}
                <div className="space-y-8">
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Project Description{" "}
                      <HelpCircle size={14} className="text-slate-400 dark:text-slate-500" />
                    </label>
                    <textarea
                      {...register("description")}
                      placeholder="Write a short description..."
                      className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-[155px] placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100 transition-all resize-none"
                    />
                  </div>

                  {/* sort Name */}
                  <div className="space-y-2 -mt-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Project Short Name
                    </label>
                    <div className="group relative">
                      <input
                        type="text"
                        {...register("sortName")}
                        placeholder="Enter Project Short Name here"
                        className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Current Rate
                    </label>
                    <input
                      type="text"
                      {...register("currentRate")}
                      placeholder="Enter hourly rate"
                      className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 text-sm text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>

                  {/* Coordinates Grid */}
                  <div className="gap-4 grid grid-cols-2">
                    <div className="space-y-2">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Latitude
                      </label>
                      <input
                        type="text"
                        {...register("latitude")}
                        placeholder="Latitude"
                        className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 text-sm text-slate-900 dark:text-slate-100 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Longitude
                      </label>
                      <input
                        type="text"
                        {...register("longitude")}
                        placeholder="Longitude"
                        className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 text-sm text-slate-900 dark:text-slate-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-8">
                  {/* Starting Date */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Starting Date
                    </label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="startDate"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 border-slate-200 dark:border-slate-800 rounded-lg w-full h-12 font-normal text-left transition-all text-slate-700 dark:text-slate-300",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                {isValidDate(field.value) ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="p-0 w-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  isValidDate(field.value)
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(date?.toISOString())
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>
                  </div>

                  {/* Working Days */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Working Days
                    </label>
                    <div className="flex gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => {
                          const isSelected = isWorkingDaySelected(day);
                          return (
                            <div
                              key={day}
                              className="flex flex-col items-center gap-2 min-w-[42px]"
                            >
                              <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                                {day}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleWorkingDay(day)}
                                className={cn(
                                  "flex justify-center items-center border-2 rounded-md w-5 h-5 transition-all",
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300",
                                )}
                              >
                                {isSelected && (
                                  <svg
                                    width="10"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M1 4L3.5 6.5L8.5 1.5"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Completion Date */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Estimated Completion Date
                    </label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="deadline"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 border-slate-200 dark:border-slate-800 rounded-lg w-full h-12 font-normal text-left transition-all text-slate-700 dark:text-slate-300",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                {isValidDate(field.value) ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="p-0 w-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  isValidDate(field.value)
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(date?.toISOString())
                                }
                                disabled={(date) => {
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                  let boundaryDate = new Date();
                                  if (startDateVal && isValidDate(startDateVal)) {
                                    boundaryDate = new Date(startDateVal);
                                  }
                                  const compareBoundary = new Date(
                                    boundaryDate.getFullYear(),
                                    boundaryDate.getMonth(),
                                    boundaryDate.getDate()
                                  );
                                  return compareDate <= compareBoundary;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Priority
                    </label>
                    <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-900 pl-12 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:ring-blue-500/20 w-full h-11! text-slate-700 dark:text-slate-300 text-sm transition-all relative">
                            <Flag
                              size={18}
                              className="left-4 z-10 absolute text-slate-500 dark:text-slate-400 -translate-y-1/2 top-1/2"
                            />
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
                            <SelectItem value="LOW">Default</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Budget
                    </label>
                    <input
                      type="text"
                      {...register("budget")}
                      placeholder="Total budget for this project"
                      className="bg-slate-50 dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full h-12 text-sm text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>

                {/* Map Section */}
                <div className="col-span-1 md:col-span-2 space-y-4 pt-4">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Select Project Location on Map
                  </label>

                  <div className="relative group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-[400px] w-full z-0">
                    <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800" />}>
                      <ProjectLocationPicker
                        latitude={watch("latitude")}
                        longitude={watch("longitude")}
                        onLocationSelect={(lat: any, lng: any, placeName?: string) => {
                          setValue("latitude", lat.toString(), {
                            shouldDirty: true,
                          });
                          setValue("longitude", lng.toString(), {
                            shouldDirty: true,
                          });
                          if (placeName)
                            setValue("location", placeName, {
                              shouldDirty: true,
                            });
                        }}
                      />
                    </React.Suspense>

                    {/* Search Overlay inside Map Container */}
                    <div className="top-4 right-4 absolute z-[1000] w-[300px] md:w-[400px]">
                      <LocationAutocomplete
                        locationName={watch("location")}
                        setLocationName={(val) =>
                          setValue("location", val, { shouldDirty: true })
                        }
                        onSelect={(lat, lon, name) => {
                          setValue("latitude", lat.toString(), {
                            shouldDirty: true,
                          });
                          setValue("longitude", lon.toString(), {
                            shouldDirty: true,
                          });
                          setValue("location", name, { shouldDirty: true });
                        }}
                      />
                    </div>

                    <div className="bottom-4 left-4 absolute z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {watch("latitude") && watch("longitude")
                          ? `POS: ${parseFloat(watch("latitude")).toFixed(4)}, ${parseFloat(watch("longitude")).toFixed(4)}`
                          : "No location selected"}
                      </p>
                    </div>
                  </div>
                  <input type="hidden" {...register("location")} />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex justify-between items-center mt-12 pt-8 border-slate-100 dark:border-slate-800 border-t">
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3.5 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-blue-500/20 shadow-lg px-10 py-3.5 rounded-lg font-bold text-white text-sm active:scale-95 disabled:active:scale-100 transition-all"
            >
              {isLoading
                ? isUpdate
                  ? "Updating..."
                  : "Creating..."
                : isUpdate
                  ? "Update Project"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div >
      {isAddStatusModalOpen && (
        <AddProjectStatusModal
          onClose={() => setIsAddStatusModalOpen(false)}
          onSuccess={(newTag) => {
            setValue("projectTagId", newTag.id);
          }}
        />
      )}
    </div >
  );
};

export default CreateProject;
