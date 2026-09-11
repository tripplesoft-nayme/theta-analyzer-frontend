import { useState, useEffect } from "react";
import { X, Calendar, User, Type, Palette, FolderPlus, FilePlus } from "lucide-react";
import { TaskItem } from "../types";
import { useGetAllManagersQuery } from "@/store/Api/UserApi/UserApi";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<TaskItem>) => void;
  groups: { id: number; name: string }[];
  task?: TaskItem | null;
  color?: string;
  taskColors?: Record<number, string>;
}

export function TaskModal({ isOpen, onClose, onSave, groups, task, color: initialColor, taskColors }: TaskModalProps) {
  const { data: managersData } = useGetAllManagersQuery({});
  const managers = Array.isArray(managersData?.data?.data) ? managersData.data.data : [];

  const [type, setType] = useState<"task" | "group">("task");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | "none">("none");
  const [assigned, setAssigned] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [duration, setDuration] = useState<number>(0);
  const [milestone, setMilestone] = useState(false);
  const [milestoneDate, setMilestoneDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setType(task.group ? "group" : "task");
        setName(task.name || "");
        setParentId(task.parentId || "none");
        setAssigned(task.assigned || "");
        setStart(task.start ? task.start.toISOString().split("T")[0] : "");
        setEnd(task.end ? task.end.toISOString().split("T")[0] : "");
        setMilestone(task.milestone || false);
        setMilestoneDate(task.milestone_date ? task.milestone_date.toISOString().split("T")[0] : "");
        setColor(initialColor || "#3b82f6");
      } else {
        setType("task");
        setName("");
        setParentId("none");
        setAssigned("");
        setStart("");
        setEnd("");
        setMilestone(false);
        setMilestoneDate("");
        setColor("#3b82f6");
      }
    }
  }, [isOpen, task, initialColor]);

  // Effect to calculate duration
  useEffect(() => {
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      setDuration(diff > 0 ? diff : 0);
    } else {
      setDuration(0);
    }
  }, [start, end]);

  // Effect to set color based on parent group
  useEffect(() => {
    if (parentId !== "none" && taskColors) {
      const parentColor = taskColors[parentId as number];
      if (parentColor) {
        setColor(parentColor);
      }
    }
  }, [parentId, taskColors]);


  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name) return;
    onSave({
      ...task,
      name,
      group: type === "group",
      parentId: parentId === "none" ? undefined : (parentId as number),
      assigned: type === "task" ? assigned : undefined,
      start: start ? new Date(start) : undefined,
      end: end ? new Date(end) : undefined,
      milestone,
      milestone_date: milestoneDate ? new Date(milestoneDate) : (start ? new Date(start) : undefined),
      color,
    });
    onClose();
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[14px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400";
  const labelClass = "text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block px-1";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[500px] rounded-[24px] shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              {type === "group" ? <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <FilePlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{task ? "Update" : "Create New"} {type === "group" ? "Group" : "Task"}</h2>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">{task ? "Modify the properties of this item" : "Add a new entry to your project timeline"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </button>
        </div>

        <div className="p-7 space-y-6">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setType("task")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-xl transition-all ${type === "task" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              <FilePlus className="w-4 h-4" /> Task
            </button>
            <button
              onClick={() => setType("group")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-xl transition-all ${type === "group" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              <FolderPlus className="w-4 h-4" /> Group
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className={labelClass}>{type === "group" ? "Group Name" : "Task Name"}</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-11`}
                  placeholder={`Enter ${type} name...`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {type === "task" && (
              <>
                <div>
                  <label className={labelClass}>Parent Group</label>
                  <select
                    className={inputClass}
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value === "none" ? "none" : Number(e.target.value))}
                  >
                    <option value="none" className="dark:bg-slate-900">Independent Task</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id} className="dark:bg-slate-900">{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Assignee</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      className={`${inputClass} pl-11`}
                      value={assigned}
                      onChange={(e) => setAssigned(e.target.value)}
                    >
                      <option value="" className="dark:bg-slate-900">Unassigned</option>
                      {managers.map((manager: any) => (
                        <option key={manager.id} value={manager.id} className="dark:bg-slate-900">
                          {manager.user?.name || manager.user?.email || "Unknown User"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className={`${inputClass} pl-11 ${type === 'group' ? 'bg-slate-100 dark:bg-slate-800 opacity-60' : ''}`}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  disabled={type === 'group'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>End Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className={`${inputClass} pl-11 ${type === 'group' ? 'bg-slate-100 dark:bg-slate-800 opacity-60' : ''}`}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  disabled={type === 'group'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Duration</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 uppercase tracking-tight">Days</div>
                <input
                  className={inputClass}
                  value={duration}
                  readOnly
                  placeholder="0"
                />
              </div>
            </div>

            <div className="col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Milestone Marker</span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Display as a point on the timeline</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMilestone(!milestone);
                    if (!milestone && !milestoneDate) setMilestoneDate(start);
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative ${milestone ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${milestone ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {milestone && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className={labelClass}>Milestone Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      className={`${inputClass} pl-11`}
                      value={milestoneDate}
                      onChange={(e) => setMilestoneDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Theme Color</label>
              <div className="relative">
                <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-inner flex-shrink-0 relative overflow-hidden group/color ${parentId !== 'none' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    <input
                      type="color"
                      className={`absolute inset-0 opacity-0 cursor-pointer ${parentId !== 'none' ? 'pointer-events-none' : ''}`}
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      disabled={parentId !== 'none'}
                    />
                  </div>
                  <input
                    className={`${inputClass} pl-4 flex-1 font-mono uppercase text-[12px] ${parentId !== 'none' ? 'bg-slate-100 dark:bg-slate-800 opacity-60' : ''}`}
                    value={color}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-blue-200/50 dark:shadow-none active:scale-[0.98]"
          >
            {task ? "Update" : "Create"} Timeline Item
          </button>
        </div>
      </div>
    </div>
  );
}
