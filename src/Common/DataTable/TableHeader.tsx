// TableHeader.tsx
import React from "react";
import { Trash2, Plus } from "lucide-react";

interface TableHeaderProps {
  headers: string[];
  editingHeader: string | null;
  onHeaderEditStart: (header: string) => void;
  onHeaderEditComplete: (
    oldHeader: string,
    newHeader: string
  ) => void;
  onDeleteColumn: (header: string) => void;
  onAddColumn: () => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  headers,
  editingHeader,
  onHeaderEditStart,
  onHeaderEditComplete,
  onDeleteColumn,
  onAddColumn,
}) => {
  return (
    <thead className="sticky top-0 z-10 bg-gray-50">
      <tr>
        <th className="w-12 min-w-12 max-w-12 border border-gray-300 bg-gray-50 text-center text-xs font-medium text-gray-500 p-0 sticky left-0 z-20">
          <div className="px-4 py-3">#</div>
        </th>
        {headers.map((header, idx) => (
          <th
            key={idx}
            className="min-w-32 border border-gray-300 bg-gray-50 relative group sticky"
            style={{ left: idx === 0 ? "48px" : "unset" }}
          >
            <div className="px-2 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {editingHeader === header ? (
                  <input
                    type="text"
                    defaultValue={header}
                    onBlur={(e) =>
                      onHeaderEditComplete(header, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onHeaderEditComplete(
                          header,
                          e.currentTarget.value
                        );
                      } else if (e.key === "Escape") {
                        onHeaderEditStart("");
                      }
                    }}
                    autoFocus
                    className="w-full px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-blue-500 rounded focus:outline-none"
                  />
                ) : (
                  <div
                    className="text-xs font-medium text-gray-700 truncate px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => onHeaderEditStart(header)}
                    title={header}
                  >
                    {header}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDeleteColumn(header)}
                className="opacity-0 group-hover:opacity-100 ml-1 p-1 hover:bg-red-100 rounded transition-opacity"
                title="Delete column"
                type="button"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
          </th>
        ))}
        <th className="w-12 min-w-12 max-w-12 border border-gray-300 bg-gray-50 sticky right-0 z-10">
          <button
            onClick={onAddColumn}
            className="w-full h-full flex items-center justify-center p-2 hover:bg-gray-100"
            title="Add column"
            type="button"
          >
            <Plus size={16} className="text-gray-600" />
          </button>
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
