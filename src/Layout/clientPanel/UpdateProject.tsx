import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateProjectMutation } from "@/store/Api/ProjectApi/ProjectApi";
import { useGetAllManagersQuery } from "@/store/Api/UserApi/UserApi";
const BaseMap = lazyWithRetry(() => import("@/Common/Maps/BaseMap"));
import useGetAllEmployees from "@/utils/useGetAllEmployees";

// Leaflet configuration moved to BaseMap

// interface IEmployeeProfile {
//   id: string;
//   user: {
//     name: string;
//     profileImage?: string;
//   };
// }

type RepeatEvery = "WEEKLY" | "BI_WEEKLY" | "MONTHLY";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface UpdateProjectForm {
  name: string;
  message: string;
  programId: string;
  description?: string;
  repeatEvery: RepeatEvery;
  repeatOnDays: string[];
  repeatOnDates: number[];
  remindBefore: number;
  priority: Priority;
  startDate: string;
  deadline: string;
  estimatedCompletedDate: string;
  managerId?: string;
  employeeIds: string[];
  currentRate: string;
  budget: string;
  latitude: number;
  longitude: number;
  status: string;
  dataUploadDateDays: string;
  workingDays: string[];
}

// Location Picker Component
// Moved to BaseMap

const UpdateProject = ({
  project,
  onClose,
}: {
  project: any;
  onClose: () => void;
}) => {
  const { allEmployees: allEmployeesData, isLoading: employeeLoading } =
    useGetAllEmployees();
  console.log(allEmployeesData);
  const [updateProject, { isLoading, isSuccess }] = useUpdateProjectMutation();

  // Queries
  const { data: managersData } = useGetAllManagersQuery({});
  const allManagers = managersData?.data?.data || [];

  const allEmployees: any = allEmployeesData;

  const [shareWith, setShareWith] = useState<
    "onlyMe" | "inviteStaff" | "followTemplate"
  >("inviteStaff");

  const [enableDetails, setEnableDetails] = useState(true);
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([]);
  const [mapPosition, setMapPosition] = useState({ lat: 51.505, lng: -0.09 });

  const { register, handleSubmit, watch, setValue, control, reset } =
    useForm<UpdateProjectForm>();

  const repeatEvery = watch("repeatEvery");
  const repeatOnDays = watch("repeatOnDays");
  const workingDays = watch("workingDays");

  const toInputDate = (iso?: string) =>
    iso ? new Date(iso).toISOString().split("T")[0] : "";

  useEffect(() => {
    if (project) {
      const initialEmployeeIds = project.employeeIds || [];
      setSelectedStaffs(initialEmployeeIds);

      const lat = Number(project.latitude) || 0;
      const lng = Number(project.longitude) || 0;
      if (lat !== 0 && lng !== 0) {
        setMapPosition({ lat, lng });
      }

      reset({
        name: project.name || "",
        message: project.message || "",
        programId: project.programId,
        description: project.description || "",
        repeatEvery: project.repeatEvery || "WEEKLY",
        repeatOnDays: project.repeatOnDays || [],
        repeatOnDates: project.repeatOnDates || [],
        remindBefore: project.remindBefore || 30,
        priority: project.priority || "MEDIUM",
        startDate: toInputDate(project.startDate),
        deadline: toInputDate(project.deadline),
        estimatedCompletedDate: toInputDate(project.estimatedCompletedDate),
        managerId: project.managerId || "",
        employeeIds: initialEmployeeIds,
        currentRate: project.currentRate || "",
        budget: project.budget || "",
        latitude: lat,
        longitude: lng,
        status: project.status || "Active",
        workingDays: project.workingDays || [],
        dataUploadDateDays:
          String(Math.floor((project.remindBefore || 4320) / (24 * 60))) || "3",
      });

      if (project.description || project.managerId || project.budget) {
        setEnableDetails(true);
      }

      if (initialEmployeeIds.length > 0) {
        setShareWith("inviteStaff");
      }
    }
  }, [project, reset]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Project updated successfully");
      onClose();
    }
  }, [isSuccess, onClose]);

  if (employeeLoading) {
    return <div>Loading...</div>;
  }

  const toggleDay = (day: string) => {
    const map: Record<string, string> = {
      Mon: "MONDAY",
      Tue: "TUESDAY",
      Wed: "WEDNESDAY",
      Thu: "THURSDAY",
      Fri: "FRIDAY",
      Sat: "SATURDAY",
      Sun: "SUNDAY",
    };
    const apiDay = map[day] || day.toUpperCase();

    const current = repeatOnDays || [];
    const updated = current.includes(apiDay)
      ? current.filter((d) => d !== apiDay)
      : [...current, apiDay];
    setValue("repeatOnDays", updated);
  };

  const isDaySelected = (shortDay: string) => {
    const map: Record<string, string> = {
      Mon: "MONDAY",
      Tue: "TUESDAY",
      Wed: "WEDNESDAY",
      Thu: "THURSDAY",
      Fri: "FRIDAY",
      Sat: "SATURDAY",
      Sun: "SUNDAY",
    };
    return (repeatOnDays || []).includes(map[shortDay]);
  };

  const toggleWorkingDay = (day: string) => {
    const map: Record<string, string> = {
      Mon: "MONDAY",
      Tue: "TUESDAY",
      Wed: "WEDNESDAY",
      Thu: "THURSDAY",
      Fri: "FRIDAY",
      Sat: "SATURDAY",
      Sun: "SUNDAY",
    };
    const apiDay = map[day] || day.toUpperCase();

    const current = workingDays || [];
    const updated = current.includes(apiDay)
      ? current.filter((d) => d !== apiDay)
      : [...current, apiDay];
    setValue("workingDays", updated);
  };

  const isWorkingDaySelected = (shortDay: string) => {
    const map: Record<string, string> = {
      Mon: "MONDAY",
      Tue: "TUESDAY",
      Wed: "WEDNESDAY",
      Thu: "THURSDAY",
      Fri: "FRIDAY",
      Sat: "SATURDAY",
      Sun: "SUNDAY",
    };
    return (workingDays || []).includes(map[shortDay]);
  };

  const handleStaffSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedStaffs.includes(value)) {
      const newStaffs = [...selectedStaffs, value];
      setSelectedStaffs(newStaffs);
      setValue("employeeIds", newStaffs);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    setMapPosition({ lat, lng });
  };

  const toISO = (date: string) => (date ? new Date(date).toISOString() : null);

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

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      const initialEmployeeIds = project.employeeIds || [];
      const addEmployeeIds = selectedStaffs.filter(
        (id) => !initialEmployeeIds.includes(id)
      );
      const removeEmployeeIds = initialEmployeeIds.filter(
        (id: string) => !selectedStaffs.includes(id)
      );

      const payload = {
        name: data.name,
        priority: data.priority,
        description: data.description,
        deadline: toISO(data.deadline),
        startDate: toISO(data.startDate),
        projectCompleteDate: toISO(data.estimatedCompletedDate),
        progress: project.progress || 0,
        currentRate: data.currentRate || "0",
        budget: data.budget || "0",
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0,
        chartList: project.chartList || [],
        managerId: data.managerId || null,
        addEmployeeIds: addEmployeeIds,
        removeEmployeeIds: removeEmployeeIds,
      };

      const cleanedPayload = cleanPayload(payload);

      await updateProject({
        id: project.id,
        ...cleanedPayload,
      }).unwrap();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to update project");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-semibold dark:text-slate-100">Update Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 font-bold text-3xl leading-none flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
        >
          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Share With
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1 text-sm dark:text-slate-400">
                  <input
                    type="radio"
                    name="shareWith"
                    checked={shareWith === "onlyMe"}
                    onChange={() => setShareWith("onlyMe")}
                    className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                  />
                  Only Me
                </label>
                <label className="flex items-center gap-1 text-sm dark:text-slate-400">
                  <input
                    type="radio"
                    name="shareWith"
                    checked={shareWith === "inviteStaff"}
                    onChange={() => setShareWith("inviteStaff")}
                    className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                  />
                  Invite Staff
                </label>
                <label className="flex items-center gap-1 text-sm dark:text-slate-400">
                  <input
                    type="radio"
                    name="shareWith"
                    checked={shareWith === "followTemplate"}
                    onChange={() => setShareWith("followTemplate")}
                    className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                  />
                  Follow Template Settings
                </label>
              </div>
              {shareWith === "inviteStaff" && (
                <div className="mt-2">
                  <select
                    onChange={handleStaffSelect}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select staff</option>
                    {allEmployees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                  {selectedStaffs.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {selectedStaffs.map((staffId, index) => {
                          const staff = allEmployees.find(
                            (e: any) => e.id === staffId
                          );
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                const newStaffs = selectedStaffs.filter(
                                  (id) => id !== staffId
                                );
                                setSelectedStaffs(newStaffs);
                                setValue("employeeIds", newStaffs);
                              }}
                              className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-600 overflow-hidden cursor-pointer hover:border-red-500 hover:z-10 transition-all"
                              title={`Click to remove ${staff?.name}`}
                            >
                              {staff?.profileImage ? (
                                <img
                                  src={staff.profileImage}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                staff?.name.charAt(0)
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-sm text-gray-600">
                        Staffs Preview
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Data Date
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Cycle Settings */}           <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Data Date Uploading Cycle
            </h3>
            <Controller
              control={control}
              name="repeatEvery"
              render={({ field }) => (
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 text-sm dark:text-slate-400">
                    <input
                      type="radio"
                      {...field}
                      value="WEEKLY"
                      checked={field.value === "WEEKLY"}
                      className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                    />
                    Weekly
                  </label>
                  <label className="flex items-center gap-2 text-sm dark:text-slate-400">
                    <input
                      type="radio"
                      {...field}
                      value="BI_WEEKLY"
                      checked={field.value === "BI_WEEKLY"}
                      className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                    />
                    Bi Weekly
                  </label>
                  <label className="flex items-center gap-2 text-sm dark:text-slate-400">
                    <input
                      type="radio"
                      {...field}
                      value="MONTHLY"
                      checked={field.value === "MONTHLY"}
                      className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                    />
                    Monthly
                  </label>
                </div>
              )}
            />

            {repeatEvery !== "MONTHLY" && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Select days
                </label>
                <div className="flex gap-4 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-xs text-gray-500 dark:text-slate-500">{day}</span>
                        <input
                          type="checkbox"
                          checked={isDaySelected(day)}
                          onChange={() => toggleDay(day)}
                          className="rounded text-blue-600 dark:bg-slate-900 dark:border-slate-800 focus:ring-blue-500"
                        />
                      </div>
                    )
                  )}
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Data Upload Date
                </label>
                <div className="flex gap-6">
                  {["3", "4", "5"].map((days) => (
                    <label
                      key={days}
                      className="flex items-center gap-2 text-sm dark:text-slate-400"
                    >
                      <input
                        type="radio"
                        {...register("dataUploadDateDays")}
                        value={days}
                        className="text-blue-600 dark:bg-slate-900 dark:border-slate-800"
                      />
                      {days} Days
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Enable Details Switch */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
              Enable Project Details settings
            </span>
            <button
              type="button"
              onClick={() => setEnableDetails(!enableDetails)}
              className={`w-10 h-5 rounded-full transition-colors relative ${enableDetails ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform ${enableDetails ? "translate-x-5" : ""
                  }`}
              />
            </button>
          </div>

          {enableDetails && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}               <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Project Description <span className="text-gray-400 dark:text-slate-500">?</span>
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Write a short description..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] bg-white dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Project Short name (Message)
                  </label>
                  <input
                    type="text"
                    {...register("message")}
                    placeholder="Jhon Doe"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Assign Project Manager
                  </label>
                  <select
                    {...register("managerId")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="">Select Manager</option>
                    {allManagers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register("status")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      type="button"
                      className="p-2 border border-gray-300 dark:border-slate-800 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Current Rate
                  </label>
                  <input
                    type="text"
                    {...register("currentRate")}
                    placeholder="Enter hourly rate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Starting Date
                  </label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Working Days
                  </label>
                  <div className="flex gap-4">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div
                          key={day}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-xs text-gray-500 dark:text-slate-500">{day}</span>
                          <input
                            type="checkbox"
                            checked={isWorkingDaySelected(day)}
                            onChange={() => toggleWorkingDay(day)}
                            className="rounded text-blue-600 dark:bg-slate-900 dark:border-slate-800 focus:ring-blue-500"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Estimated Completion Date
                  </label>
                  <input
                    type="date"
                    {...register("estimatedCompletedDate")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="LOW">Default (Low)</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Budget
                  </label>
                  <input
                    type="text"
                    {...register("budget")}
                    placeholder="Total budget for this project"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Map Section */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Project Location
            </h3>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:bg-slate-800">
              <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800" />}>
                <BaseMap
                  center={[mapPosition.lat, mapPosition.lng]}
                  markerPosition={[mapPosition.lat, mapPosition.lng]}
                  onLocationSelect={handleLocationSelect}
                  zoom={13}
                />
              </React.Suspense>
            </div>
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProject;
