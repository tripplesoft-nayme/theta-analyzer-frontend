// AddRowButton.tsx
import React from "react";
import { Plus } from "lucide-react";

interface AddRowButtonProps {
  onAddRow: () => void;
  colSpan: number;
}

const AddRowButton: React.FC<AddRowButtonProps> = ({
  onAddRow,
  colSpan,
}) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="border border-gray-300 p-0 sticky left-0"
      >
        <button
          onClick={onAddRow}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-2"
          type="button"
        >
          <Plus size={16} />
          Add Row
        </button>
      </td>
    </tr>
  );
};

export default AddRowButton;
