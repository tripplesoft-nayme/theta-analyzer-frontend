import { useEffect, useState } from "react";

export const DebouncedInput = ({
  value,
  onChange,
  debounceTime = 300,
  ...props
}: any) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value && localValue !== undefined) {
        onChange({ target: { value: localValue } } as any);
      }
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [localValue, debounceTime, value, onChange]);

  return (
    <input
      value={localValue !== undefined && localValue !== null ? localValue : ""}
      onChange={(e) => setLocalValue(e.target.value)}
      {...props}
    />
  );
};

export type LegendValue = {
  label: string;
  field: string;
  color: string;
};

export const AssignedByProfile = ({
  assignedBy,
}: {
  assignedBy: { name: string | false | undefined; role: string | false | undefined; image: string | false | undefined };
}) => {
  return (
    <div className="pt-6 border-t border-border dark:border-slate-800">
      <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
        Assigned By
      </label>
      <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-border dark:border-slate-800">
        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-border dark:border-slate-800 shadow-sm relative mr-3 shrink-0">
          {assignedBy?.image ? (
            <img
              src={assignedBy.image}
              alt={assignedBy?.name || "Assigned by"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-blue-600 font-bold text-sm">
              {(assignedBy?.name && typeof assignedBy.name === 'string') ? assignedBy.name.charAt(0).toUpperCase() : "A"}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight">
            {assignedBy?.name || "Admin User"}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
            {assignedBy?.role || "Analyst"}
          </p>
        </div>
      </div>
    </div>
  );
};
