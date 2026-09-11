import React, { useState } from "react";
import { X, Calendar, Info, Lock, Plus } from "lucide-react";

type UploadCycle = "Weekly" | "By Weekly" | "Monthly";
type UploadDate = "3 Days" | "4 Days" | "5 Days";
type ShareWith = "Only Me" | "Invite Stuff" | "Follow Template Settings";

interface FormData {
  projectName: string;
  dataDate: string;
  uploadCycle: UploadCycle;
  selectedDays: boolean[];
  uploadDate: UploadDate;
  enableSettings: boolean;
  projectDescription: string;
  startingDate: string;
  workingDays: boolean[];
  completionDate: string;
  shortName: string;
  projectManager: string;
  priority: string;
  status: string;
  budget: string;
  currentRate: string;
  shareWith: ShareWith;
  selectedStuffs: string[];
}

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (projectName: string) => void;
}

const NewProjectModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    dataDate: "Today",
    uploadCycle: "Weekly",
    selectedDays: [true, true, true, true, true, false, false],
    uploadDate: "3 Days",
    enableSettings: false,
    projectDescription: "",
    startingDate: "Today",
    workingDays: [true, true, true, true, true, false, false],
    completionDate: "",
    shortName: "Jhon Doe",
    projectManager: "Jhon Doe",
    priority: "Default",
    status: "Draft",
    budget: "",
    currentRate: "",
    shareWith: "Only Me",
    selectedStuffs: [],
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleDayToggle = (index: number) => {
    const newDays = [...formData.selectedDays];
    newDays[index] = !newDays[index];
    setFormData({ ...formData, selectedDays: newDays });
  };

  const handleWorkingDayToggle = (index: number) => {
    const newDays = [...formData.workingDays];
    newDays[index] = !newDays[index];
    setFormData({ ...formData, workingDays: newDays });
  };

  const handleSubmit = () => {
    if (onSuccess) onSuccess(formData.projectName);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Project Details Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
              Project details
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Data
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.dataDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-20 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Info size={16} className="text-gray-400 dark:text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Calendar size={16} className="text-gray-400 dark:text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Data Uploading Cycle
                  </label>
                  <div className="flex gap-4">
                    {(["Weekly", "By Weekly", "Monthly"] as UploadCycle[]).map(
                      (cycle) => (
                        <label key={cycle} className="flex items-center">
                          <input
                            type="radio"
                            checked={formData.uploadCycle === cycle}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                uploadCycle: cycle,
                              })
                            }
                            className="w-4 h-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                            {cycle}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    {formData.uploadCycle === "Monthly"
                      ? "Select Upload Date"
                      : "Select days"}
                  </label>

                  {formData.uploadCycle === "Monthly" ? (
                    <input
                      type="date"
                      value={formData.completionDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          completionDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <div className="flex gap-2">
                      {weekDays.map((day, index) => (
                        <button
                          key={day}
                          onClick={() => handleDayToggle(index)}
                          className={`w-10 h-10 rounded-md text-xs font-medium transition-colors cursor-pointer ${formData.selectedDays[index]
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700"
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Data Upload Date
                  </label>
                  <div className="flex gap-4">
                    {(["3 Days", "4 Days", "5 Days"] as UploadDate[]).map(
                      (days) => (
                        <label key={days} className="flex items-center">
                          <input
                            type="radio"
                            checked={formData.uploadDate === days}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                uploadDate: days,
                              })
                            }
                            className="w-4 h-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                            {days}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md text-sm hover:bg-blue-50 transition-colors cursor-pointer">
                  Import File
                </button>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Share With
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        "Only Me",
                        "Invite Stuff",
                        "Follow Template Settings",
                      ] as ShareWith[]
                    ).map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.shareWith === option}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              shareWith: option,
                            })
                          }
                          className="w-4 h-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-slate-300 flex items-center gap-1">
                          {option}
                          {option === "Only Me" && (
                            <Lock size={14} className="text-gray-400 dark:text-slate-500" />
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.shareWith === "Invite Stuff" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                        Select Stuffs
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
                        <option>Jhon Doe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                        Stuffs Preview
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-700 border-2 border-white dark:border-slate-800"
                            />
                          ))}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                          +8
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enable Settings Toggle */}
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSettings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enableSettings: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-slate-300">
              Enable Project Details settings
            </span>
          </div>

          {/* Expanded Settings */}
          {formData.enableSettings && (
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border dark:border-slate-800">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-1">
                    Project Description{" "}
                    <Info size={14} className="text-gray-400 dark:text-slate-500" />
                  </label>
                  <textarea
                    placeholder="Write a short description..."
                    value={formData.projectDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDescription: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Project Short name
                  </label>
                  <select
                    value={formData.shortName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  >
                    <option className="dark:bg-slate-900">Jhon Doe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Assign Project Manager
                  </label>
                  <select
                    value={formData.projectManager}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectManager: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  >
                    <option className="dark:bg-slate-900">Jhon Doe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    >
                      <option className="dark:bg-slate-900">Draft</option>
                    </select>
                    <button className="w-10 h-10 border border-gray-300 dark:border-slate-800 rounded-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Plus size={18} className="text-gray-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Current Rate
                  </label>
                  <input
                    type="text"
                    placeholder="Enter hourly rate"
                    value={formData.currentRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentRate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Starting Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.startingDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startingDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-20 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Info size={16} className="text-gray-400 dark:text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Calendar size={16} className="text-gray-400 dark:text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Working Days
                  </label>
                  <div className="flex gap-2">
                    {weekDays.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => handleWorkingDayToggle(index)}
                        className={`w-10 h-10 rounded-md text-xs font-medium transition-colors cursor-pointer ${formData.workingDays[index]
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700"
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Estimated Completion Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="--/--/----"
                      value={formData.completionDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          completionDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-20 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Info size={16} className="text-gray-400 dark:text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Calendar size={16} className="text-gray-400 dark:text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  >
                    <option className="dark:bg-slate-900">Default</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-400 mb-2">
                    Budget
                  </label>
                  <input
                    type="text"
                    placeholder="Total budget for this project"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors border border-gray-200 dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
