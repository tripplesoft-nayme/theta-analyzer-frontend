import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Calendar, HelpCircle } from "lucide-react";
import { IEditEmployeePayload } from "@/types";
import { useUpdateEmployeeMutation } from "@/store/Api/EmployeeApi/EmployeeApi";
import { toast } from "sonner";

interface IEditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee: IEditEmployeePayload;
}

const EditEmployeeModal = ({
  open,
  onClose,
  employee,
}: IEditEmployeeModalProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<IEditEmployeePayload>({
    defaultValues: employee,
  });

  const skills = watch("skills") || [];
  const projects = watch("projects") || [];

  const [skillInput, setSkillInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const inputRef1 = useRef<HTMLInputElement>(null);
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();

  // Reset form when modal opens or employee changes
  useEffect(() => {
    if (open && employee) {
      reset({
        ...employee,
        skills: employee.skills || [],
        projects: employee?.projects || [],
      });
      setSkillInput("");
      setProjectInput("");
    }
  }, [open, employee, reset]);

  const addSkillTag = () => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;
    setValue("skills", [...skills, value]);
    setSkillInput("");
  };

  const removeSkillTag = (skillToRemove: string) => {
    setValue(
      "skills",
      skills.filter((s) => s !== skillToRemove),
    );
  };

  const addProjectTag = () => {
    const value = projectInput.trim();
    if (!value || projects.includes(value)) return;
    setValue("projects", [...projects, value]);
    setProjectInput("");
  };

  const removeProjectTag = (projectToRemove: string) => {
    setValue(
      "projects",
      projects.filter((p) => p !== projectToRemove),
    );
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkillTag();
    }
    if (e.key === "Backspace" && !skillInput && skills.length) {
      removeSkillTag(skills[skills.length - 1]);
    }
  };

  const handleProjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProjectTag();
    }
    if (e.key === "Backspace" && !projectInput && projects.length) {
      removeProjectTag(projects[projects.length - 1]);
    }
  };

  const onSubmit = async (data: IEditEmployeePayload) => {
    if (!skills.length) {
      toast.error("Please add at least one skill and one project");
      return;
    }

    try {
      await updateEmployee(data).unwrap();

      toast.success("Employee update successfully!");
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        toast.error(
          errorData?.message || "Failed to add employee. Please try again.",
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }

    // onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Employee</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5"
        >
          {/* Name, Email, Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", {
                  required: "Name is required",
                })}
                placeholder="Enter employee name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none"
              />
              {errors?.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                })}
                placeholder="Enter employee email"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none"
              />
              {errors?.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                {...register("phoneNumber", {
                  required: "Phone is required",
                })}
                placeholder="Enter employee phone"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none"
              />
              {errors?.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Joined Date */}
          <div>
            <Controller
              name="joinedDate"
              control={control}
              rules={{ required: "Joined date is required" }}
              render={({ field }) => {
                const inputRef = inputRef1;
                const openPicker = () => {
                  inputRef.current?.showPicker?.();
                  inputRef.current?.focus();
                };
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Joined Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        {...field}
                        ref={(e) => {
                          field.ref(e);
                          inputRef.current = e;
                        }}
                        onClick={openPicker}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none pr-16 cursor-pointer no-date-icon"
                      />
                      <button
                        type="button"
                        onClick={openPicker}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Calendar size={16} />
                      </button>
                    </div>
                    {errors.joinedDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.joinedDate.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>

          {/* Skills & Projects */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-gray-300">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillTag(skill)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 min-w-[120px] text-sm outline-none border-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Projects <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-gray-300">
                {projects.map((project) => (
                  <span
                    key={project}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {project}
                    <button
                      type="button"
                      onClick={() => removeProjectTag(project)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  onKeyDown={handleProjectKeyDown}
                  placeholder="Type project and press Enter"
                  className="flex-1 min-w-[120px] text-sm outline-none border-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
              Description <HelpCircle size={14} className="text-gray-400" />
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows={4}
              placeholder="Enter a description..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                isLoading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
