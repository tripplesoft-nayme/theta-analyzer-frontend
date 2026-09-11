// TableRow.tsx
import React from "react";
import { Trash2 } from "lucide-react";
import { CellAddress } from "./DataTableUtils";

interface TableRowProps {
  rowIndex: number;
  rowData: Record<string, any>;
  headers: string[];
  selectedCell: CellAddress | null;
  onCellEdit: (rowIdx: number, header: string, value: any) => void;
  onCellSelect: (rowIdx: number, colIdx: number) => void;
  onDeleteRow: (rowIdx: number) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  rowIndex,
  rowData,
  headers,
  selectedCell,
  onCellEdit,
  onCellSelect,
  onDeleteRow,
}) => {
  return (
    <tr className="hover:bg-blue-50/30 group">
      <td
        className="w-12 min-w-12 max-w-12 border border-gray-300 bg-gray-50 text-center text-xs text-gray-500 font-medium sticky left-0 z-10"
        onClick={() => onCellSelect(rowIndex, -1)}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <span>{rowIndex + 1}</span>
          <button
            onClick={() => onDeleteRow(rowIndex)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
            title="Delete row"
            type="button"
          >
            <Trash2 size={12} className="text-red-500" />
          </button>
        </div>
      </td>
      {headers.map((header, colIdx) => {
        const isSelected =
          selectedCell?.row === rowIndex &&
          selectedCell?.col === colIdx;
        return (
          <td
            key={`${rowIndex}-${colIdx}`}
            className="min-w-32 border border-gray-300 p-0"
            onClick={() => onCellSelect(rowIndex, colIdx)}
          >
            <input
              type="text"
              value={rowData[header] || ""}
              onChange={(e) =>
                onCellEdit(rowIndex, header, e.target.value)
              }
              onFocus={() => onCellSelect(rowIndex, colIdx)}
              className={`w-full h-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-20 relative ${
                isSelected
                  ? "bg-blue-100 ring-1 ring-blue-500"
                  : "hover:bg-gray-50"
              }`}
              placeholder=""
              data-row={rowIndex}
              data-col={colIdx}
            />
          </td>
        );
      })}
    </tr>
  );
};

export default TableRow;
