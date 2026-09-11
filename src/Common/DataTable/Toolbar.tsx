// Toolbar.tsx
import React from "react";
import {
  Undo,
  Redo,
  Copy,
  ClipboardPaste,
  Filter,
  Save,
  Upload,
  Download,
  MoreVertical,
  Search,
} from "lucide-react";
import { CellAddress } from "./DataTableUtils";

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSave: () => void;
  onUpload: () => void;
  onDownload: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedCell: CellAddress | null;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onSave,
  onUpload,
  onDownload,
  searchTerm,
  onSearchChange,
  canUndo,
  canRedo,
  selectedCell,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap p-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            disabled={!selectedCell}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy (Ctrl+C)"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onPaste}
            disabled={!selectedCell}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Paste (Ctrl+V)"
          >
            <ClipboardPaste size={16} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-md"
            title="Filter"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-center">
        <div className="relative">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 w-64 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <Search
              size={14}
              className="text-gray-400 mr-2 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search in sheet..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="ml-2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2"
          type="button"
        >
          <Save size={14} />
          Save
        </button>
        <button
          onClick={onUpload}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          title="Import CSV"
          type="button"
        >
          <Upload size={16} className="text-gray-600" />
        </button>
        <button
          onClick={onDownload}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          title="Export as CSV"
          type="button"
        >
          <Download size={16} className="text-gray-600" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-md"
          type="button"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
