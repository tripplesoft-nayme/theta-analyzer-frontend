// DataTable.tsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import Toolbar from "./Toolbar";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import StatusBar from "./StatusBar";
import AddRowButton from "./AddRowButton";
import {
  HistoryManager,
  parseCSV,
  exportToCSV,
  filterData,
  addNewColumn,
  updateDataWithNewColumn,
  updateDataWithRenamedColumn,
  CellAddress,
  copyToClipboard,
  pasteFromClipboard,
} from "./DataTableUtils";
import { toast } from "sonner";

interface DataTableProps {
  initialHeaders?: string[];
  initialData?: Record<string, any>[];
  onDataChange?: (data: Record<string, any>[]) => void;
  onHeadersChange?: (headers: string[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  initialHeaders = ["Task name", "Duration", "Start Date"],
  initialData = [],
  onDataChange,
  onHeadersChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [tableData, setTableData] =
    useState<Record<string, any>[]>(initialData);
  const [selectedCell, setSelectedCell] =
    useState<CellAddress | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(
    null
  );
  const [historyManager] = useState(
    () => new HistoryManager(initialData)
  );

  // Ref for current state in event handlers
  const selectedCellRef = useRef<CellAddress | null>(null);
  const tableDataRef = useRef(tableData);
  const headersRef = useRef(headers);

  // Update refs when state changes
  useEffect(() => {
    selectedCellRef.current = selectedCell;
    tableDataRef.current = tableData;
    headersRef.current = headers;
  }, [selectedCell, tableData, headers]);

  // Filtered data
  const filteredData = filterData(tableData, headers, searchTerm);

  // Upload handler
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { headers: newHeaders, data: newData } = await parseCSV(
          file
        );
        setHeaders(newHeaders);
        setTableData(newData);
        historyManager.push(newData);
        onHeadersChange?.(newHeaders);
        onDataChange?.(newData);
      } catch (error) {
        console.error("Error parsing CSV:", error);
      }
    }
  };

  // Download handler
  const handleDownload = () => {
    exportToCSV(tableData);
  };

  // Cell edit handler
  const handleCellEdit = useCallback(
    (rowIdx: number, header: string, value: any) => {
      const newData = [...tableData];
      if (!newData[rowIdx]) {
        newData[rowIdx] = {};
      }
      newData[rowIdx] = { ...newData[rowIdx], [header]: value };
      setTableData(newData);
      historyManager.push(newData);
      onDataChange?.(newData);
    },
    [tableData, onDataChange]
  );

  // Header edit handler
  const handleHeaderEdit = useCallback(
    (oldHeader: string, newHeader: string) => {
      if (newHeader.trim() === "" || newHeader === oldHeader) return;

      const newHeaders = headers.map((h) =>
        h === oldHeader ? newHeader : h
      );
      const newData = updateDataWithRenamedColumn(
        tableData,
        oldHeader,
        newHeader
      );

      setHeaders(newHeaders);
      setTableData(newData);
      historyManager.push(newData);
      onHeadersChange?.(newHeaders);
      onDataChange?.(newData);
      setEditingHeader(null);
    },
    [headers, tableData, onHeadersChange, onDataChange]
  );

  // Add row handler
  const handleAddRow = useCallback(() => {
    const newRow: Record<string, any> = {};
    headers.forEach((h) => (newRow[h] = ""));
    const newData = [...tableData, newRow];
    setTableData(newData);
    historyManager.push(newData);
    onDataChange?.(newData);
  }, [headers, tableData, onDataChange]);

  // Delete row handler
  const handleDeleteRow = useCallback(
    (rowIdx: number) => {
      const newData = tableData.filter((_, idx) => idx !== rowIdx);
      setTableData(newData);
      historyManager.push(newData);
      onDataChange?.(newData);
    },
    [tableData, onDataChange]
  );

  // Add column handler
  const handleAddColumn = useCallback(() => {
    const newHeader = addNewColumn(headers);
    const newHeaders = [...headers, newHeader];
    const newData = updateDataWithNewColumn(tableData, newHeader);

    setHeaders(newHeaders);
    setTableData(newData);
    historyManager.push(newData);
    onHeadersChange?.(newHeaders);
    onDataChange?.(newData);
  }, [headers, tableData, onHeadersChange, onDataChange]);

  // Delete column handler
  const handleDeleteColumn = useCallback(
    (header: string) => {
      if (headers.length <= 1) return;

      const newHeaders = headers.filter((h) => h !== header);
      const newData = tableData.map((row) => {
        const newRow = { ...row };
        delete newRow[header];
        return newRow;
      });

      setHeaders(newHeaders);
      setTableData(newData);
      historyManager.push(newData);
      onHeadersChange?.(newHeaders);
      onDataChange?.(newData);
    },
    [headers, tableData, onHeadersChange, onDataChange]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when user is typing in an input field
      if (
        e.target instanceof HTMLInputElement &&
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Escape",
          "Enter",
        ].includes(e.key)
      ) {
        return;
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const undoneData = historyManager.undo();
        if (undoneData) {
          setTableData(undoneData);
          onDataChange?.(undoneData);
        }
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        const redoneData = historyManager.redo();
        if (redoneData) {
          setTableData(redoneData);
          onDataChange?.(redoneData);
        }
      }

      // Copy (Ctrl+C)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "c" &&
        selectedCellRef.current
      ) {
        e.preventDefault();
        const { row, col } = selectedCellRef.current;
        const currentHeaders = headersRef.current;
        const currentData = tableDataRef.current;

        if (
          row >= 0 &&
          row < currentData.length &&
          col >= 0 &&
          col < currentHeaders.length
        ) {
          const header = currentHeaders[col];
          const value = currentData[row]?.[header] || "";
          copyToClipboard(String(value));
        }
      }

      // Paste (Ctrl+V)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "v" &&
        selectedCellRef.current
      ) {
        e.preventDefault();
        pasteFromClipboard().then((text) => {
          if (text && selectedCellRef.current) {
            const { row, col } = selectedCellRef.current;
            const currentHeaders = headersRef.current;
            const currentData = [...tableDataRef.current];

            if (
              row >= 0 &&
              row < currentData.length &&
              col >= 0 &&
              col < currentHeaders.length
            ) {
              const header = currentHeaders[col];
              if (!currentData[row]) {
                currentData[row] = {};
              }
              currentData[row] = {
                ...currentData[row],
                [header]: text,
              };
              setTableData(currentData);
              historyManager.push(currentData);
              onDataChange?.(currentData);
            }
          }
        });
      }

      // Arrow key navigation
      if (
        selectedCell &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.key
        )
      ) {
        e.preventDefault();
        const { row, col } = selectedCell;

        switch (e.key) {
          case "ArrowUp":
            if (row > 0) setSelectedCell({ row: row - 1, col });
            break;
          case "ArrowDown":
            if (row < filteredData.length - 1)
              setSelectedCell({ row: row + 1, col });
            break;
          case "ArrowLeft":
            if (col > 0) setSelectedCell({ row, col: col - 1 });
            break;
          case "ArrowRight":
            if (col < headers.length - 1)
              setSelectedCell({ row, col: col + 1 });
            break;
        }
      }

      // Enter key to edit
      if (e.key === "Enter" && selectedCell) {
        const { row, col } = selectedCell;
        const cellInput = document.querySelector(
          `input[data-row="${row}"][data-col="${col}"]`
        ) as HTMLInputElement;
        if (cellInput) {
          cellInput.focus();
          cellInput.select();
        }
      }

      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedCell(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCell,
    filteredData.length,
    headers.length,
    onDataChange,
  ]);

  // Save data
  const handleSave = () => {
    console.log("Saved data:", tableData);
    toast.success("Data saved successfully!");
  };

  // Cell click handler
  const handleCellClick = (rowIdx: number, colIdx: number) => {
    setSelectedCell({ row: rowIdx, col: colIdx });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toolbar */}
      <Toolbar
        onUndo={() => {
          const undoneData = historyManager.undo();
          if (undoneData) {
            setTableData(undoneData);
            onDataChange?.(undoneData);
          }
        }}
        onRedo={() => {
          const redoneData = historyManager.redo();
          if (redoneData) {
            setTableData(redoneData);
            onDataChange?.(redoneData);
          }
        }}
        onCopy={async () => {
          if (selectedCell) {
            const { row, col } = selectedCell;
            const header = headers[col];
            const value = tableData[row]?.[header] || "";
            await copyToClipboard(String(value));
          }
        }}
        onPaste={async () => {
          if (selectedCell) {
            const text = await pasteFromClipboard();
            if (text) {
              const { row, col } = selectedCell;
              const header = headers[col];
              handleCellEdit(row, header, text);
            }
          }
        }}
        onSave={handleSave}
        onUpload={() => fileInputRef.current?.click()}
        onDownload={handleDownload}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        canUndo={historyManager.canUndo()}
        canRedo={historyManager.canRedo()}
        selectedCell={selectedCell}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <table className="min-w-full border-collapse">
          <TableHeader
            headers={headers}
            editingHeader={editingHeader}
            onHeaderEditStart={setEditingHeader}
            onHeaderEditComplete={handleHeaderEdit}
            onDeleteColumn={handleDeleteColumn}
            onAddColumn={handleAddColumn}
          />

          <tbody className="bg-white">
            {filteredData.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                rowIndex={rowIdx}
                rowData={row}
                headers={headers}
                selectedCell={selectedCell}
                onCellEdit={handleCellEdit}
                onCellSelect={handleCellClick}
                onDeleteRow={handleDeleteRow}
              />
            ))}

            <AddRowButton
              onAddRow={handleAddRow}
              colSpan={headers.length + 2}
            />
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <StatusBar
        filteredCount={filteredData.length}
        totalCount={tableData.length}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default DataTable;
