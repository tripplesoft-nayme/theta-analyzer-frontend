/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Paperclip,
  Activity,
  ChevronRight,
  ChevronDown,
  Check,
  Calendar as CalendarIcon,
  ChevronsUpDown,
  Tag,
  Type,
} from "lucide-react";
import { ColDef, TaskItem } from "../types/index";
import { useLocation } from "react-router-dom";
import { getTaskSummary, fmtDate } from "../utils/ganttUtils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGetAllManagersQuery } from "@/store/Api/UserApi/UserApi";
import { cn } from "@/lib/utils";

interface GridCellProps {
  col: ColDef;
  task: TaskItem;
  rowNum: number;
  onToggleCollapse: (id: number) => void;
  allTasks: TaskItem[];
  deps?: any[];
  isEditing?: boolean;
  onStartEdit?: () => void;
  onUpdate?: (value: any) => void;
  onSave?: (value: any) => void;
  onCancel?: () => void;
}
export function GridCell({
  col,
  task,
  rowNum,
  onToggleCollapse,
  allTasks,
  deps = [],
  isEditing,
  onStartEdit,
  onUpdate,
  onSave,
  onCancel,
}: GridCellProps) {
  const { pathname } = useLocation();
  const isEmployee = pathname.includes("staff-employee-panel");
  const summary = getTaskSummary(task, allTasks);
  const { data: managersData } = useGetAllManagersQuery({});
  const managers = Array.isArray(managersData?.data?.data)
    ? managersData.data.data
    : [];

  const cellStyle =
    "text-[12px] whitespace-nowrap overflow-hidden text-ellipsis leading-tight";

  const handleKeyDown = (e: React.KeyboardEvent, value: any) => {
    if (e.key === "Enter") {
      onSave?.(value);
    } else if (e.key === "Escape") {
      onCancel?.();
    }
  };

  switch (col.id) {
    case "id":
      return (
        <span className="text-[11px] font-mono text-slate-400">
          {String(task.id).replace(/_/g, "")}
        </span>
      );
    case "link": {
      const links = deps
        .filter((d) => d.to === task.id)
        .map((d) => String(d.from).replace(/_/g, ""))
        .join(", ");
      return (
        <span className="text-[11px] font-medium text-slate-500">
          {links || "—"}
        </span>
      );
    }
    case "wbs":
      return (
        <span className={`${cellStyle} text-slate-500`}>
          {task.wbs || rowNum}
        </span>
      );
    case "info":
      return (
        <div className="flex items-center gap-1.5 justify-center text-slate-400 bg-white dark:bg-slate-900">
          {(task.id === 1 || task.id === 6) && (
            <>
              <Paperclip className="w-3.5 h-3.5" />
              <Activity className="w-3.5 h-3.5" />
            </>
          )}
        </div>
      );
    case "name":
      if (isEditing) {
        return (
          <input
            autoFocus
            className="w-full h-full bg-blue-50 dark:bg-blue-950 border-none outline-none text-[12px] px-1 font-medium text-slate-900 dark:text-slate-100"
            value={task.name}
            onChange={(e) => onUpdate?.(e.target.value)}
            onBlur={(e) => onSave?.(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, e.currentTarget.value)}
          />
        );
      }
      return (
        <div
          className="flex items-center min-w-0 h-full w-full cursor-text"
          onClick={onStartEdit}
        >
          {!task.group && <div className="w-6 shrink-0" />}
          <div className="flex items-center gap-2 min-w-0">
            {task.group && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(task.id);
                }}
                className="w-[14px] h-[14px] border border-gray-400 dark:border-slate-700 rounded-sm flex items-center justify-center shrink-0 cursor-pointer text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                {task.collapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </div>
            )}
            <span
              className={`${cellStyle} ${task.group ? "font-semibold text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400"}`}
            >
              {task.name}
            </span>
          </div>
        </div>
      );
    case "duration":
      if (isEditing) {
        return (
          <input
            autoFocus
            type="number"
            className="w-full h-full bg-blue-50 dark:bg-blue-950 border-none outline-none text-[12px] px-1 text-slate-900 dark:text-slate-100"
            value={summary.dur || ""}
            onChange={(e) => onUpdate?.(Number(e.target.value))}
            onBlur={(e) => onSave?.(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, Number(e.currentTarget.value))}
          />
        );
      }
      return (
        <span
          className={`${cellStyle} cursor-text w-full`}
          onClick={onStartEdit}
        >
          {summary.dur !== null ? `${summary.dur}d` : "—"}
        </span>
      );
    case "planned_start":
    case "actual_start":
    case "baseline_start":
    case "planned_finish":
    case "actual_finish":
    case "baseline_finish":
    case "milestone_date": {
      const isStart = col.id.includes("start") || col.id === "milestone_date";
      const dateVal = col.id === "milestone_date"
        ? task.milestone_date || task.start || summary.start
        : (isStart
          ? task.start || (task as any)[col.id] || summary.start
          : task.end || (task as any)[col.id] || summary.end);


      if (isEditing) {
        return (
          <Popover open={true} onOpenChange={(open) => !open && onCancel?.()}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-full justify-start text-left font-normal text-[12px] px-2 bg-blue-50 dark:bg-blue-950 border-none hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-slate-900 dark:text-slate-100",
                  !dateVal && "text-slate-400",
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {dateVal ? fmtDate(dateVal) : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl" align="start">
              <Calendar
                mode="single"
                selected={dateVal}
                onSelect={(date) => {
                  if (date) onSave?.(date);
                }}
                initialFocus
                className="dark:bg-slate-900 dark:text-slate-100"
              />
            </PopoverContent>
          </Popover>
        );
      }
      return (
        <span
          className={`${cellStyle} cursor-text w-full`}
          onClick={onStartEdit}
        >
          {fmtDate(dateVal)}
        </span>
      );
    }
    case "status": {
      const statuses = [
        "not-started",
        "in-progress",
        "complete",
        "at-risk",
        "overdue",
      ];
      if (isEditing) {
        return (
          <Popover open={true} onOpenChange={(open) => !open && onCancel?.()}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-full justify-between text-[12px] px-2 bg-blue-50 dark:bg-blue-950 border-none hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-slate-900 dark:text-slate-100"
              >
                {task.status || "not-started"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0 z-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
              <Command className="dark:bg-slate-900">
                <CommandList>
                  <CommandGroup>
                    {statuses.map((s) => (
                      <CommandItem
                        key={s}
                        value={s}
                        onSelect={() => onSave?.(s)}
                        className="dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            task.status === s ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {s}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }
      return (
        <span
          onClick={onStartEdit}
          className={`${cellStyle} cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-medium ${task.status === "complete"
              ? "bg-green-50 dark:bg-emerald-950 text-green-600 dark:text-emerald-400"
              : task.status === "in-progress"
                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                : "bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400"
            }`}
        >
          {task.status || "not-started"}
        </span>
      );
    }
    case "priority": {
      const priorities = ["Low", "Medium", "High"];
      if (isEditing) {
        return (
          <Popover open={true} onOpenChange={(open) => !open && onCancel?.()}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-full justify-between text-[12px] px-2 bg-blue-50 dark:bg-blue-950 border-none hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-slate-900 dark:text-slate-100"
              >
                {task.priority || "Medium"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0 z-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
              <Command className="dark:bg-slate-900">
                <CommandList>
                  <CommandGroup>
                    {priorities.map((p) => (
                      <CommandItem
                        key={p}
                        value={p}
                        onSelect={() => onSave?.(p)}
                        className="dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            task.priority === p ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {p}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }
      return (
        <span
          className={`${cellStyle} cursor-pointer w-full`}
          onClick={onStartEdit}
        >
          {task.priority || "Medium"}
        </span>
      );
    }
    case "percent_complete":
      if (isEditing) {
        return (
          <input
            autoFocus
            type="number"
            className="w-full h-full bg-blue-50 dark:bg-blue-950 border-none outline-none text-[12px] px-2 text-slate-900 dark:text-slate-100"
            value={task.progress || 0}
            onChange={(e) => onUpdate?.(Number(e.target.value))}
            onBlur={(e) => onSave?.(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, Number(e.currentTarget.value))}
          />
        );
      }
      return (
        <div
          className="w-full flex items-center gap-2 px-2 cursor-pointer h-full"
          onClick={onStartEdit}
        >
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 w-7">
            {task.progress || 0}%
          </span>
        </div>
      );
    case "assigned":
      if (isEditing) {
        return (
          <Popover open={true} onOpenChange={(open) => !open && onCancel?.()}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-full justify-between text-[12px] px-2 bg-blue-50 dark:bg-blue-950 border-none hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-slate-900 dark:text-slate-100"
              >
                {managers.find((m: any) => m.id === task.assigned)?.user?.name ||
                  managers.find((m: any) => m.id === task.assigned)?.user?.email ||
                  task.assigned ||
                  "Select manager..."}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 z-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
              <Command className="dark:bg-slate-900">
                <CommandInput placeholder="Search manager..." className="dark:text-slate-100" />
                <CommandList>
                  <CommandEmpty className="dark:text-slate-400">No manager found.</CommandEmpty>
                  <CommandGroup>
                    {managers.map((manager: any) => {
                      const displayName =
                        manager.user?.name || manager.user?.email || "Unknown";
                      return (
                        <CommandItem
                          key={manager.id}
                          value={displayName}
                          onSelect={() => {
                            onSave?.(manager.id);
                          }}
                          className="dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              task.assigned === manager.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {displayName}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }
      return (
        <div
          className="flex items-center gap-2 cursor-text w-full h-full"
          onClick={onStartEdit}
        >
          {(() => {
            const manager = managers.find((m: any) => m.id === task.assigned);
            const name = manager?.user?.name || manager?.user?.email || task.assigned || "Unassigned";
            return (
              <>
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-400 font-medium shrink-0">
                  {name[0] || "?"}
                </div>
                <span className={`${cellStyle} text-slate-600 dark:text-slate-400`}>
                  {name}
                </span>
              </>
            );
          })()}
        </div>
      );

    case "planned_hours":
    case "actual_hours":
    case "remaining_hours":
      if (isEditing) {
        return (
          <input
            autoFocus
            type="number"
            className="w-full h-full bg-blue-50 dark:bg-blue-950 border-none outline-none text-[12px] px-2 text-right text-slate-900 dark:text-slate-100"
            value={(task as any)[col.id] || 0}
            onChange={(e) => onUpdate?.(Number(e.target.value))}
            onBlur={(e) => onSave?.(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, Number(e.currentTarget.value))}
          />
        );
      }
      return (
        <span
          className={`${cellStyle} w-full text-right pr-2 cursor-pointer h-full flex items-center justify-end`}
          onClick={onStartEdit}
        >
          {((task as any)[col.id] || 0).toFixed(1)} h
        </span>
      );
    case "planned_cost":
    case "actual_cost":
    case "resource_cost_planned":
    case "resource_cost_actual":
      if (isEditing) {
        return (
          <input
            autoFocus
            type="number"
            className="w-full h-full bg-blue-50 dark:bg-blue-950 border-none outline-none text-[12px] px-2 text-right text-slate-900 dark:text-slate-100"
            value={(task as any)[col.id] || 0}
            onChange={(e) => onUpdate?.(Number(e.target.value))}
            onBlur={(e) => onSave?.(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, Number(e.currentTarget.value))}
          />
        );
      }
      return (
        <span
          className={`${cellStyle} w-full text-right pr-2 cursor-pointer h-full flex items-center justify-end`}
          onClick={onStartEdit}
        >
          ${((task as any)[col.id] || 0).toFixed(2)}
        </span>
      );
    case "milestone":
      return (
        <div
          className="w-full flex justify-center cursor-pointer h-full items-center"
          onClick={(e) => {
            if (isEmployee) return;
            e.stopPropagation();
            onSave?.(!(task as any).milestone);
          }}
        >
          <div
            className={cn(
              "w-2.5 h-2.5 rotate-45 transition-colors shadow-sm",
              (task as any).milestone ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-slate-800",
            )}
          />
        </div>
      );
    case "tags":
      if (isEditing) {
        return (
          <div className="flex items-center w-full h-full bg-blue-50 dark:bg-blue-950 px-2 gap-2">
            <Tag className="w-3 h-3 text-blue-400 dark:text-blue-500 shrink-0" />
            <input
              autoFocus
              className="w-full bg-transparent border-none outline-none text-[12px] text-slate-900 dark:text-slate-100"
              placeholder="Add tags separated by comma..."
              value={Array.isArray(task.tags) ? task.tags.join(", ") : ""}
              onChange={(e) =>
                onUpdate?.(e.target.value.split(",").map((s) => s.trim()))
              }
              onBlur={(e) =>
                onSave?.(e.target.value.split(",").map((s) => s.trim()))
              }
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  e.currentTarget.value.split(",").map((s) => s.trim()),
                )
              }
            />
          </div>
        );
      }
      return (
        <div
          className={`${cellStyle} cursor-pointer w-full h-full flex items-center px-2 gap-1 overflow-hidden`}
          onClick={onStartEdit}
        >
          {Array.isArray(task.tags) && task.tags.length > 0 ? (
            task.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1 rounded-[2px] text-[10px]"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-300 dark:text-slate-600">Add Tags...</span>
          )}
        </div>
      );
    case "task_type":
      if (isEditing) {
        return (
          <input
            autoFocus
            className="w-full h-full bg-blue-50 dark:bg-blue-950 border-none outline-none text-[12px] px-2 font-medium text-slate-900 dark:text-slate-100"
            value={task.type || "Task"}
            onChange={(e) => onUpdate?.(e.target.value)}
            onBlur={(e) => onSave?.(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, e.currentTarget.value)}
          />
        );
      }
      return (
        <div
          className={`${cellStyle} cursor-pointer w-full h-full flex items-center px-2 gap-1.5`}
          onClick={onStartEdit}
        >
          <Type className="w-3 h-3 text-gray-400" />
          <span>{task.type || "Task"}</span>
        </div>
      );
    case "linked_from": {
      const fromLinks = deps
        .filter((d) => d.to === task.id)
        .map((d) => String(d.from).replace(/_/g, ""))
        .join(", ");
      return (
        <span className={`${cellStyle} text-slate-500 font-mono text-[10px]`}>
          {fromLinks || "—"}
        </span>
      );
    }
    case "linked_to": {
      const toLinks = deps
        .filter((d) => d.from === task.id)
        .map((d) => String(d.to).replace(/_/g, ""))
        .join(", ");
      return (
        <span className={`${cellStyle} text-slate-500 font-mono text-[10px]`}>
          {toLinks || "—"}
        </span>
      );
    }
    case "complete":
      return (
        <div
          className="w-full flex justify-center items-center h-full cursor-pointer z-50 group/check"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            if (isEmployee) return;
            e.stopPropagation();
            onSave?.(task.status === "complete" ? "not-started" : "complete");
          }}
        >
          <div
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              task.status === "complete"
                ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                : "border-gray-200 dark:border-slate-800 group-hover/check:border-blue-400 bg-white dark:bg-slate-900",
            )}
          >
            {task.status === "complete" && (
              <Check className="w-3 h-3 text-white stroke-[3px]" />
            )}
          </div>
        </div>
      );
    case "actual_duration":
      if (isEditing) {
        return (
          <input
            autoFocus
            type="number"
            className="w-full h-full bg-blue-50 dark:bg-blue-900/20 border-none outline-none text-[12px] px-2 text-slate-900 dark:text-slate-100"
            value={(task as any).actual_duration || 0}
            onChange={(e) => onUpdate?.(Number(e.target.value))}
            onBlur={(e) => onSave?.(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, Number(e.currentTarget.value))}
          />
        );
      }
      return (
        <span
          className={`${cellStyle} cursor-pointer w-full h-full flex items-center px-2`}
          onClick={onStartEdit}
        >
          {(task as any).actual_duration || 0}d
        </span>
      );
    default:
      return <span className={cellStyle}>—</span>;
  }
}
