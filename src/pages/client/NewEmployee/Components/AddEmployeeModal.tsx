/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Mail, Calendar as CalendarIcon, HelpCircle, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { IAddEmployeePayload } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/store/Api/EmployeeApi/EmployeeApi";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { EyeOff } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
interface IAddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: any;
}

const today = new Date().toISOString().split("T")[0];

const AddEmployeeModal = ({
  open,
  onClose,
  employee,
}: IAddEmployeeModalProps) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<IAddEmployeePayload>({
    defaultValues: {
      joinedDate: today,
      description: "",
      sendWelcomeEmail: true,
      notifyProjectManager: false,
      skills: ["Civil Eng", "Architect"],
      projects: [],
      role: "EMPLOYEE",
      notifyManager: false,
      welcomeEmail: true,
    },
  });

  useEffect(() => {
    if (employee) {
      const { password, ...rest } = employee;
      let projects: string[] = [];
      let skills: string[] = [];
      let description = "";
      let joinedDate = today;

      if (employee.role === "MANAGER" && employee.manager) {
        projects = employee.manager.projects?.map((p: any) => p.id) || [];
        skills = employee.manager.skills || [];
        description = employee.manager.description || "";
        joinedDate = employee.manager.joinedDate || today;
      } else if (employee.role === "EMPLOYEE" && employee.employee) {
        projects =
          employee.employee.projectEmployees?.map((pe: any) => pe.projectId) ||
          [];
        skills = employee.employee.skills || [];
        description = employee.employee.description || "";
        joinedDate = employee.employee.joinedDate || today;
      } else if (employee.role === "VIEWER" && employee.viewer) {
        projects =
          employee.viewer.projectViewers?.map((pv: any) => pv.projectId) || [];
        skills = employee.viewer.skills || [];
        description = employee.viewer.description || "";
        joinedDate = employee.viewer.joinedDate || today;
      }

      reset({
        ...rest,
        projects,
        skills,
        description,
        joinedDate,
      });
    }
  }, [employee, reset, open]);
  const selectedRole = watch("role");

  const [showPassword, setShowPassword] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  // const [projectInput, setProjectInput] = useState("");
  const [addEmployee, { isLoading: employeeLoading }] =
    useAddEmployeeMutation();
  const [updateEmployee, { isLoading: updateLoading }] =
    useUpdateEmployeeMutation();

  const isUpdate = !!employee;
  const isLoading = employeeLoading || updateLoading;
  const [projectSearch, setProjectSearch] = useState("");
  const [openProject, setOpenProject] = useState(false);

  const { data: allProjectsData } = useGetAllProjectsQuery({
    limit: 10,
  });

  const allProjects = useMemo(() => {
    const projectsList =
      allProjectsData?.data?.projects?.data ||
      allProjectsData?.data?.projects ||
      allProjectsData?.data?.data ||
      allProjectsData?.data ||
      [];
    return Array.isArray(projectsList)
      ? projectsList.map((p: any) => ({
        id: p.id,
        name: p.name || p.projectName,
      }))
      : [];
  }, [allProjectsData]);

  // Sync project names mapping
  const projectIdNameMap = useMemo(() => {
    const map: Record<string, string> = {};

    // 1. Map fetched projects
    allProjects.forEach((p) => {
      if (p.id && p.name) {
        map[p.id] = p.name;
      }
    });

    // 2. Map existing employee projects
    if (employee) {
      // Managers
      if (employee.manager?.projects) {
        employee.manager.projects.forEach((p: any) => {
          if (p && p.id && p.name) {
            map[p.id] = p.name;
          }
        });
      }

      // Employees
      if (employee.employee?.projectEmployees) {
        employee.employee.projectEmployees.forEach((pe: any) => {
          if (pe && pe.projectId && pe.project?.name) {
            map[pe.projectId] = pe.project.name;
          }
        });
      }

      // Viewers
      if (employee.viewer?.projectViewers) {
        employee.viewer.projectViewers.forEach((pv: any) => {
          if (pv && pv.projectId && pv.project?.name) {
            map[pv.projectId] = pv.project.name;
          }
        });
      }
    }

    return map;
  }, [allProjects, employee]);

  // Reset search when popover closes
  useEffect(() => {
    if (!openProject) {
      setProjectSearch("");
    }
  }, [openProject]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset({
        joinedDate: today,
        description: "",
        sendWelcomeEmail: true,
        notifyProjectManager: false,
        skills: [],
        projects: [],
        role: "EMPLOYEE",
        notifyManager: false,
        welcomeEmail: true,
      });
      setSkillInput("");
      // setProjectInput("");
    }
  }, [open, reset]);

  const cleanObject = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        newObj[key] = value;
      }
    });
    return newObj;
  };
  const email = watch("email");
  const onSubmit = async (data: IAddEmployeePayload) => {
    try {
      let payload: any = {};
      payload = {
        name: data.name,
        email: data.email,
        ...(isUpdate && { password: data.password }),
        role: data.role,
        skills: data.skills,
        description: data.description,
        joinedDate: data.joinedDate,
        projects: data.projects,
        sendWelcomeEmail: data.sendWelcomeEmail,
        notifyProjectManager: data.notifyProjectManager,
      };
      const cleanedPayload = cleanObject(payload);

      if (isUpdate) {
        await updateEmployee({ id: employee.id, ...cleanedPayload }).unwrap();
        toast.success(`${selectedRole} updated successfully!`);
      } else {
        await addEmployee(cleanedPayload).unwrap();
        toast.success(`${selectedRole} added successfully!`);
      }
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        toast.error(
          errorData?.message ||
          `Failed to ${isUpdate ? "update" : "add"} ${selectedRole}. Please try again.`,
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (!open) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-lg w-full min-w-xl max-w-2xl max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-gray-200 dark:border-slate-800 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 text-lg">
            {isUpdate ? "Update Employee" : "Add New Employee"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 px-6 py-5 max-h-[calc(90vh-140px)] overflow-y-auto scrollbar-hide"
        >
          {/* Employee Name and Email */}
          <div className="gap-4 grid grid-cols-2">
            <div>
              <label className="block mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                Employee Name{" "}
                {!isUpdate && <span className="text-red-500">*</span>}
              </label>
              <input
                {...register("name", {
                  required: isUpdate ? false : "Name is required",
                })}
                placeholder="Enter employee name"
                className="px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none w-full text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                Employee Email{" "}
                {!isUpdate && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Mail
                  className="top-1/2 left-3 absolute text-gray-400 dark:text-slate-500 -translate-y-1/2"
                  size={16}
                />
                <input
                  type="email"
                  disabled={isUpdate}
                  {...register("email", {
                    required: isUpdate ? false : "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email",
                    },
                  })}
                  placeholder="Enter employee email"
                  className="py-2 pr-3 pl-9 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none w-full text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 disabled:bg-gray-100 dark:disabled:bg-slate-800/50 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone and Password */}
          <div
            className={`gap-4 grid ${isUpdate ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {/* <div>
              <label className="block mb-1.5 font-medium text-gray-700 text-sm">
                Employee Phone <span className="text-red-500">*</span>
              </label>
              <input
                {...register("phoneNumber", {
                  required: "Phone is required",
                  minLength: {
                    value: 10,
                    message: "Phone must be at least 10 digits",
                  },
                })}
                placeholder="Enter employee phone"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none w-full text-sm"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div> */}
            {/* Role Selection */}
            <div>
              <label className="block mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                Select Role{" "}
                {!isUpdate && <span className="text-red-500">*</span>}
              </label>

              <Controller
                name="role"
                control={control}
                rules={{ required: isUpdate ? false : "Role is required" }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md w-full text-sm dark:text-slate-300">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent className="bg-white dark:bg-slate-900 dark:border-slate-800">
                      <SelectItem value="EMPLOYEE" className="hover:bg-gray-50 dark:hover:bg-slate-900 dark:text-slate-300">
                        Employee
                      </SelectItem>
                      <SelectItem value="MANAGER" className="hover:bg-gray-50 dark:hover:bg-slate-900 dark:text-slate-300">
                        Manager
                      </SelectItem>
                      <SelectItem value="VIEWER" className="hover:bg-gray-50 dark:hover:bg-slate-900 dark:text-slate-300">
                        Viewer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {isUpdate && (
              <div>
                <label className="block mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                  Employee Password{" "}
                  {!isUpdate && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: isUpdate ? false : "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    placeholder="Enter employee password"
                    className="py-2 pr-3 pl-4 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none w-full text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                  {showPassword ? (
                    <Eye
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                      className="top-1/2 right-3 absolute text-gray-400 -translate-y-1/2"
                      size={16}
                    />
                  ) : (
                    <EyeOff
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                      className="top-1/2 right-3 absolute text-gray-400 -translate-y-1/2"
                      size={16}
                    />
                  )}
                </div>
                {errors.password && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Skills & Projects */}

          <div className="gap-4 grid grid-cols-2">
            <Controller
              name="joinedDate"
              control={control}
              rules={{ required: isUpdate ? false : "Joined date is required" }}
              render={({ field }) => {
                const isValidDate = (val: any) => {
                  if (!val) return false;
                  const d = new Date(val);
                  return !isNaN(d.getTime());
                };
                return (
                  <div>
                    <label className="block mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                      Joined Date{" "}
                      {!isUpdate && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-left font-normal flex items-center justify-between h-[38px] hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all",
                              !field.value && "text-gray-400 dark:text-slate-600"
                            )}
                          >
                            <span>
                              {isValidDate(field.value) ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                "Pick a date"
                              )}
                            </span>
                            <CalendarIcon size={16} className="text-gray-400 dark:text-slate-500" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto z-[110]" align="start">
                          <Calendar
                            mode="single"
                            selected={isValidDate(field.value) ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {errors.joinedDate && (
                      <p className="mt-1 text-red-500 text-xs">
                        {errors.joinedDate.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />

            <Controller
              name="projects"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block mb-1.5 font-medium text-gray-700 text-sm">
                    Project
                  </label>

                  <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-slate-800 rounded-md focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-slate-800 min-h-[42px] bg-white dark:bg-slate-900">
                    {field?.value?.map((projectId: string) => (
                      <span
                        key={projectId}
                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md text-gray-700 dark:text-slate-300 text-xs"
                      >
                        {projectIdNameMap[projectId] || projectId}
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = field.value?.filter(
                              (p: string) => p !== projectId,
                            );
                            field.onChange(newVal);
                          }}
                          className="text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <Popover open={openProject} onOpenChange={setOpenProject}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-semibold outline-none px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700/50"
                        >
                          <Plus size={14} /> Select project
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-0 z-[100] rounded-xl overflow-hidden border dark:border-slate-800 shadow-2xl">
                        <Command shouldFilter={false} className="dark:bg-slate-900">
                          <CommandInput
                            placeholder="Search project..."
                            value={projectSearch}
                            onValueChange={(val) => setProjectSearch(val)}
                            className="h-9 text-[13px]"
                          />
                          <CommandList className="max-h-60">
                            {allProjects.filter((p) => !field.value?.includes(p.id) && (projectSearch === "" || p.name?.toLowerCase().includes(projectSearch.toLowerCase()))).length === 0 && (
                              <CommandEmpty className="text-xs text-slate-400 py-3 text-center">No projects found.</CommandEmpty>
                            )}
                            <CommandGroup>
                              {allProjects
                                .filter((p) => !field.value?.includes(p.id) && (projectSearch === "" || p.name?.toLowerCase().includes(projectSearch.toLowerCase())))
                                .map((project) => (
                                  <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => {
                                      field.onChange([...(field.value || []), project.id]);
                                      setOpenProject(false);
                                    }}
                                    className="cursor-pointer text-[13px] rounded-lg py-2"
                                  >
                                    <span className="truncate">{project.name}</span>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {errors.projects && (
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.projects.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Joined Date */}
          <div className="gap-4 grid grid-cols-1">
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                    Skill
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-slate-800 rounded-md focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-slate-800 min-h-[42px] bg-white dark:bg-slate-900">
                    {field.value.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md text-gray-700 dark:text-slate-300 text-xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = field.value?.filter(
                              (s) => s !== skill,
                            );
                            field.onChange(newVal);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="flex flex-1 items-center min-w-[120px]">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = skillInput.trim();
                            if (val && !field.value.includes(val)) {
                              field.onChange([...field.value, val]);
                              setSkillInput("");
                            }
                          }
                        }}
                        placeholder="Type a skill..."
                        className="bg-transparent border-none outline-none w-full text-sm dark:text-slate-100"
                      />
                      {skillInput.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            const val = skillInput.trim();
                            if (val && !field.value.includes(val)) {
                              field.onChange([...field.value, val]);
                              setSkillInput("");
                            }
                          }}
                          className="bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md text-blue-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {errors.skills && (
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.skills.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
          {/* Description */}
          <div className="gap-4 grid grid-cols-2">
            <div className="">
              <label className="flex items-center gap-1 mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                Program Description{" "}
                <HelpCircle size={14} className="text-gray-400 dark:text-slate-500" />{" "}
              </label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Enter a description..."
                className="px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none w-full text-sm resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              />
              {errors.description && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-1 mb-1.5 font-medium text-gray-700 dark:text-slate-300 text-sm">
                Login Email Preview
              </label>
              <input
                type="email"
                value={email}
                disabled={true}
                placeholder="Enter employee password"
                className="py-2 pr-3 pl-4 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none w-full text-sm disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-500 dark:disabled:text-slate-400"
              />
              <div className="">
                <FieldGroup className="flex flex-col gap-2">
                  <Field orientation="horizontal">
                    <Checkbox
                      id="welcome-email"
                      {...register("welcomeEmail")}
                      className="dark:border-slate-700"
                    />
                    <Label
                      htmlFor="welcome-email"
                      className="text-sm font-normal dark:text-slate-300"
                    >
                      Send Welcome Email
                    </Label>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="notify-manager"
                      {...register("notifyManager")}
                      className="dark:border-slate-700"
                    />
                    <Label
                      htmlFor="notify-manager"
                      className="text-sm font-normal dark:text-slate-300"
                    >
                      Notify Manager
                    </Label>
                  </Field>
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-3 py-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 px-4 py-2 border border-gray-300 dark:border-slate-800 rounded-md font-medium text-gray-700 dark:text-slate-300 text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${isLoading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {isLoading
                ? `${isUpdate ? "Updating" : "Adding"} ${selectedRole}...`
                : `${isUpdate ? "Update" : "Add"} ${selectedRole}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
