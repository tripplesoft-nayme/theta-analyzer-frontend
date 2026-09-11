import { X, Check } from "lucide-react";
import { ColDef } from "../types";

export function ColumnModal({
  isOpen,
  onClose,
  newColName,
  setNewColName,
  newColType,
  setNewColType,
  createCustomColumn,
  FULL_COLUMNS,
  customCols,
  visibleColIds,
  toggleColumn,
}: {
  isOpen: boolean;
  onClose: () => void;
  newColName: string;
  setNewColName: (v: string) => void;
  newColType: string;
  setNewColType: (v: string) => void;
  createCustomColumn: () => void;
  FULL_COLUMNS: ColDef[];
  customCols: ColDef[];
  visibleColIds: string[];
  toggleColumn: (id: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-[2px] p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[440px] rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-[17px] font-semibold text-slate-800 dark:text-slate-100">
            Column settings
          </h2>
          <X
            className="w-5 h-5 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            onClick={onClose}
          />
        </div>

        <div className="p-6">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Add Custom Column
          </p>
          <div className="flex gap-2 mb-8">
            <input
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[13px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-slate-400"
              placeholder="Column name"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
            />
            <select
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[13px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400 transition-all"
              value={newColType}
              onChange={(e) => setNewColType(e.target.value)}
            >
              <option className="dark:bg-slate-900">Text</option>
              <option className="dark:bg-slate-900">Number</option>
              <option className="dark:bg-slate-900">Date</option>
            </select>
            <button
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all border border-blue-200 dark:border-blue-900/50 shadow-sm active:scale-95"
              onClick={createCustomColumn}
            >
              Add
            </button>
          </div>

          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Toggle Columns
          </p>
          <div className="max-h-[360px] overflow-y-auto pr-2 gc-scrollbar flex flex-col gap-1">
            {[...FULL_COLUMNS, ...customCols].map((col) => {
              const isVisible = visibleColIds.includes(col.id);
              return (
                <div
                  key={col.id}
                  className="group flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => toggleColumn(col.id)}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-md flex items-center justify-center transition-all ${isVisible
                        ? "bg-blue-600 shadow-sm shadow-blue-200 dark:shadow-none"
                        : "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                  >
                    {isVisible && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    )}
                  </div>
                  <span
                    className={`text-[13px] font-medium transition-colors ${isVisible ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {col.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl text-[14px] font-bold transition-all shadow-md active:scale-[0.98]"
            onClick={onClose}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
