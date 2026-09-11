// StatusBar.tsx
import React from "react";

interface StatusBarProps {
  filteredCount: number;
  totalCount: number;
  searchTerm: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  filteredCount,
  totalCount,
  searchTerm,
}) => {
  return (
    <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
      <div>
        {filteredCount} row{filteredCount !== 1 ? "s" : ""}
        {searchTerm && ` (filtered from ${totalCount})`}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span>Undo/Redo:</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
            Ctrl+Z
          </kbd>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
            Ctrl+Y
          </kbd>
        </div>
        <div className="flex items-center gap-2">
          <span>Copy/Paste:</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
            Ctrl+C
          </kbd>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
            Ctrl+V
          </kbd>
        </div>
        <div className="flex items-center gap-2">
          <span>Navigate:</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
            Arrow Keys
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
