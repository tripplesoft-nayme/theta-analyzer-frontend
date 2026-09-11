import { useState } from "react";
import { Plus, Filter, Flag, SlidersVertical } from "lucide-react";
import {
  useGetEmployeeTaskByIdQuery,
  useGetEmployeeTaskStatisticsQuery,
} from "@/store/Api/EmployeeApi/EmployeeApi";
import { UserType } from "@/types/Auth/Auth";

const EmployeeTaskData = ({
  selectedEmployee,
}: {
  selectedEmployee: UserType;
}) => {
  const { data, isLoading: isTasksLoading } = useGetEmployeeTaskByIdQuery(
    selectedEmployee?.id
  );
  const { data: statistics, isLoading: isStatsLoading } =
    useGetEmployeeTaskStatisticsQuery(selectedEmployee?.id);
  console.log(data);
  const [showModal, setShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [project, setProject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [tasks, setTasks] = useState([
    {
      name: "Mobilization at Site",
      project: "Carlyle Hall",
      priority: "High",
      progress: 85,
    },
    {
      name: "Surveying & Layout",
      project: "Carlyle Hall",
      priority: "High",
      progress: 75,
    },
    {
      name: "Excavation",
      project: "Carlyle Hall",
      priority: "High",
      progress: 80,
    },
    {
      name: "Footing",
      project: "Carlyle Hall",
      priority: "Medium",
      progress: 30,
    },
    {
      name: "Column upto Plinth Level",
      project: "High way Expension",
      priority: "Low",
      progress: 70,
    },
    {
      name: "Backfilling in Footing",
      project: "Road Repair",
      priority: "Default",
      progress: 75,
    },
  ]);

  const filterOptions = [
    {
      name: "Priority",
      options: ["Critical", "Very High", "High", "Low", "Very Low", "None"],
    },
    {
      name: "Progress",
      options: ["Not Started", "Started", "Halfway", "Almost Done", "Done"],
    },
    {
      name: "Project",
      options: ["Carlyle Hall", "Project B", "Project C", "Project D"],
    },
    {
      name: "Tags",
      options: [
        "Attachment",
        "Change",
        "Communication",
        "Issue",
        "Materials",
        "Nothing",
        "Project Plan",
        "Regulations",
        "Risk",
        "Scope",
      ],
    },
    {
      name: "Due Date",
      options: ["Scope", "Today", "This week", "Next Week", "Later"],
    },
  ];

  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  if (isTasksLoading || isStatsLoading) {
    return (
      <div className="min-h-screen">
        <div className="w-full bg-white rounded-lg border border-gray-200 shadow-lg p-6 animate-pulse">
          {/* Skeleton Header */}
          <div className="flex justify-between mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Skeleton Stats */}
          <div className="flex justify-between p-5 m-4 border border-gray-200 rounded-lg">
            <div className="flex gap-12 w-full">
              <div className="w-full">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="flex gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-32 h-32 bg-gray-200 rounded-full shrink-0"></div>
          </div>

          {/* Skeleton Table */}
          <div className="mt-8 space-y-4">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const priorities = ["High", "Medium", "Low", "Default"];

  const getRandomPriority = () => {
    return priorities[Math.floor(Math.random() * priorities.length)];
  };

  const getRandomProgress = () => {
    return Math.floor(Math.random() * 100) + 1;
  };

  const handleAddTask = () => {
    if (taskName && project) {
      const newTask = {
        name: taskName,
        project: project,
        priority: getRandomPriority(),
        progress: getRandomProgress(),
      };
      setTasks([...tasks, newTask]);
      setTaskName("");
      setProject("");
      setDueDate("");
      setShowModal(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className={`w-4 h-4 ${getPriorityColor(priority)}`} />;
  };

  return (
    <div className="min-h-screen">
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedEmployee?.name}'s Task
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Task</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <SlidersVertical className="w-4 h-4" />
                <span>Show</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Project</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Priority</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Progress</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Due</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Tages</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">
                        Estimated Hours
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">
                        Logged Hours
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Assignees</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">Task Type</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {filterOptions.map((filter) => (
                      <div key={filter.name} className="relative group">
                        {/* Parent button */}
                        <button
                          onClick={() =>
                            setOpenSubDropdown(
                              openSubDropdown === filter.name
                                ? null
                                : filter.name
                            )
                          }
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex justify-between items-center"
                        >
                          <span className="text-gray-700 font-medium">
                            {filter.name}
                          </span>
                          <span className="text-gray-400">
                            {openSubDropdown === filter.name ? "-" : "+"}
                          </span>
                        </button>

                        {/* Sub-dropdown */}
                        {openSubDropdown === filter.name && (
                          <div className="mt-1 pl-4 space-y-1">
                            {filter.options.map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center gap-2 text-gray-600 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  className="form-checkbox"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Status */}
        <div className="flex justify-between p-5 m-4 rounded-lg border border-gray-200">
          <div className="flex gap-12">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Task Status
              </h2>
              <div className="flex gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {statistics?.data?.inProgressTasks || 0}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {statistics?.data?.completedTasks || 0}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Overdue</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {statistics?.data?.overdueTasks || 0}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Not Started</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {statistics?.data?.notStartedTasks || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
                strokeDasharray={`${
                  ((statistics?.data?.overdueTasks || 0) /
                    (statistics?.data?.totalTasks || 1)) *
                    314 || 0
                } 314`}
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray={`${
                  ((statistics?.data?.completedTasks || 0) /
                    (statistics?.data?.totalTasks || 1)) *
                    314 || 0
                } 314`}
                strokeDashoffset={`-${
                  ((statistics?.data?.overdueTasks || 0) /
                    (statistics?.data?.totalTasks || 1)) *
                  314
                }`}
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="10"
                strokeDasharray={`${
                  ((statistics?.data?.inProgressTasks || 0) /
                    (statistics?.data?.totalTasks || 1)) *
                    314 || 0
                } 314`}
                strokeDashoffset={`-${
                  (((statistics?.data?.overdueTasks || 0) +
                    (statistics?.data?.completedTasks || 0)) /
                    (statistics?.data?.totalTasks || 1)) *
                  314
                }`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500">Total Task</div>
              <div className="text-2xl font-semibold">
                {statistics?.data?.totalTasks || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  Task Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  Project
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  Priority
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.project}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(task.priority)}
                      <span
                        className={`text-sm ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-40">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add to Project
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTaskData;
