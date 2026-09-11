/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  /* Paperclip,
  MessageSquare,
  Share2,
  Settings,
  Eye, */
  Upload,
  Download,
  Search,
  Plus,
  Trash2,
  Save,
  Undo,
  Redo,
  Filter,
  MoreVertical,
  Copy,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";

interface CellAddress {
  row: number;
  col: number;
}

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
  const [clipboard, setClipboard] = useState<string>("");
  const [history, setHistory] = useState<Record<string, any>[][]>([
    JSON.parse(JSON.stringify(initialData)),
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [editingHeader, setEditingHeader] = useState<string | null>(
    null
  );
  const selectedCellRef = useRef<CellAddress | null>(null);
  const tableDataRef = useRef(tableData);
  const headersRef = useRef(headers);

  // Update refs when state changes
  useEffect(() => {
    selectedCellRef.current = selectedCell;
    tableDataRef.current = tableData;
    headersRef.current = headers;
  }, [selectedCell, tableData, headers]);

  // Save state to history
  const saveToHistory = useCallback(
    (newData: Record<string, any>[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newData)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newData = JSON.parse(JSON.stringify(history[newIndex]));
      setTableData(newData);
      onDataChange?.(newData);
    }
  }, [history, historyIndex, onDataChange]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newData = JSON.parse(JSON.stringify(history[newIndex]));
      setTableData(newData);
      onDataChange?.(newData);
    }
  }, [history, historyIndex, onDataChange]);

  // Copy cell value
  const handleCopy = useCallback(async () => {
    const cell = selectedCellRef.current;
    if (cell) {
      const { row, col } = cell;
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
        const text = String(value);
        setClipboard(text);

        try {
          await navigator.clipboard.writeText(text);
          console.log("Copied to clipboard:", text);
        } catch (err) {
          console.error("Failed to copy:", err);
          // Fallback for browsers that don't support clipboard API
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
      }
    }
  }, []);

  // Paste into cell
  const handlePaste = useCallback(async () => {
    const cell = selectedCellRef.current;
    if (cell) {
      try {
        let text = clipboard;

        // If clipboard is empty, try to read from system clipboard
        if (!text) {
          try {
            text = await navigator.clipboard.readText();
            setClipboard(text);
          } catch (err) {
            console.warn("Cannot read from clipboard:", err);
            return;
          }
        }

        if (text) {
          const { row, col } = cell;
          const currentHeaders = headersRef.current;

          if (
            row >= 0 &&
            row < tableDataRef.current.length &&
            col >= 0 &&
            col < currentHeaders.length
          ) {
            const header = currentHeaders[col];
            const currentData = [...tableDataRef.current];

            if (!currentData[row]) {
              currentData[row] = {};
            }

            currentData[row] = {
              ...currentData[row],
              [header]: text,
            };
            setTableData(currentData);
            saveToHistory(currentData);
            onDataChange?.(currentData);
          }
        }
      } catch (err) {
        console.error("Failed to paste:", err);
      }
    }
  }, [clipboard, saveToHistory, onDataChange]);

  // Handle CSV upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const Papa = (await import("papaparse")).default;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (
          results: any
        ) => {
          const newHeaders = Object.keys(results.data[0] || {});
          const newData = results.data;
          setHeaders(newHeaders);
          setTableData(newData);
          saveToHistory(newData);
          onHeadersChange?.(newHeaders);
          onDataChange?.(newData);
        },
        error: (error: Error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  // Handle CSV download
  const handleDownload = async () => {
    const Papa = (await import("papaparse")).default;
    const csv = Papa.unparse(tableData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "spreadsheet_export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle cell editing
  const handleCellEdit = (
    rowIdx: number,
    header: string,
    value: any
  ) => {
    const newData = [...tableData];
    if (!newData[rowIdx]) {
      newData[rowIdx] = {};
    }
    newData[rowIdx] = { ...newData[rowIdx], [header]: value };
    setTableData(newData);
    saveToHistory(newData);
    onDataChange?.(newData);
  };

  // Handle header editing
  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    if (newHeader.trim() === "" || newHeader === oldHeader) return;

    const newHeaders = headers.map((h) =>
      h === oldHeader ? newHeader : h
    );
    const newData = tableData.map((row) => {
      const newRow = { ...row };
      newRow[newHeader] = row[oldHeader];
      delete newRow[oldHeader];
      return newRow;
    });

    setHeaders(newHeaders);
    setTableData(newData);
    saveToHistory(newData);
    onHeadersChange?.(newHeaders);
    onDataChange?.(newData);
    setEditingHeader(null);
  };

  // Add new row
  const addRow = () => {
    const newRow: Record<string, any> = {};
    headers.forEach((h) => (newRow[h] = ""));
    const newData = [...tableData, newRow];
    setTableData(newData);
    saveToHistory(newData);
    onDataChange?.(newData);
  };

  // Delete row
  const deleteRow = (rowIdx: number) => {
    const newData = tableData.filter((_, idx) => idx !== rowIdx);
    setTableData(newData);
    saveToHistory(newData);
    onDataChange?.(newData);
  };

  // Add new column
  const addColumn = () => {
    let columnNumber = 1;
    let newHeader = `Column ${columnNumber}`;

    // Find unique column name
    while (headers.includes(newHeader)) {
      columnNumber++;
      newHeader = `Column ${columnNumber}`;
    }

    const newHeaders = [...headers, newHeader];
    const newData = tableData.map((row) => ({
      ...row,
      [newHeader]: "",
    }));

    setHeaders(newHeaders);
    setTableData(newData);
    saveToHistory(newData);
    onHeadersChange?.(newHeaders);
    onDataChange?.(newData);
  };

  // Delete column
  const deleteColumn = (header: string) => {
    if (headers.length <= 1) return; // Prevent deleting all columns

    const newHeaders = headers.filter((h) => h !== header);
    const newData = tableData.map((row) => {
      const newRow = { ...row };
      delete newRow[header];
      return newRow;
    });

    setHeaders(newHeaders);
    setTableData(newData);
    saveToHistory(newData);
    onHeadersChange?.(newHeaders);
    onDataChange?.(newData);
  };

  // Filter data based on search term
  const filteredData = tableData.filter((row) =>
    headers.some((header) =>
      String(row[header] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when user is typing in an input field (except arrow keys)
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

      // Prevent default only for our shortcuts
      const isUndoRedo =
        (e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "y");
      const isCopyPaste =
        (e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v");

      if (isUndoRedo || isCopyPaste) {
        e.preventDefault();
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        handleUndo();
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        handleRedo();
      }

      // Copy (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        handleCopy();
      }

      // Paste (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        handlePaste();
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
        // const header = headers[col];
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
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    headers,
    filteredData.length,
  ]);

  // Save data
  const handleSave = () => {
    console.log("Saved data:", tableData);
    toast.success("Data saved successfully!");
  };

  // Handle cell click
  const handleCellClick = (rowIdx: number, colIdx: number) => {
    setSelectedCell({ row: rowIdx, col: colIdx });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo size={16} />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!selectedCell}
              className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy (Ctrl+C)"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handlePaste}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                onKeyDown={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
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
            onClick={handleSave}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2"
            type="button"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            title="Import CSV"
            type="button"
          >
            <Upload size={16} className="text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={handleDownload}
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

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <table className="min-w-full border-collapse">
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
                            handleHeaderEdit(header, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleHeaderEdit(
                                header,
                                e.currentTarget.value
                              );
                            } else if (e.key === "Escape") {
                              setEditingHeader(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-blue-500 rounded focus:outline-none"
                        />
                      ) : (
                        <div
                          className="text-xs font-medium text-gray-700 truncate px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => setEditingHeader(header)}
                          title={header}
                        >
                          {header}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteColumn(header)}
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
                  onClick={addColumn}
                  className="w-full h-full flex items-center justify-center p-2 hover:bg-gray-100"
                  title="Add column"
                  type="button"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-blue-50/30 group">
                <td
                  className="w-12 min-w-12 max-w-12 border border-gray-300 bg-gray-50 text-center text-xs text-gray-500 font-medium sticky left-0 z-10"
                  onClick={() =>
                    setSelectedCell({ row: rowIdx, col: -1 })
                  }
                >
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span>{rowIdx + 1}</span>
                    <button
                      onClick={() => deleteRow(rowIdx)}
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
                    selectedCell?.row === rowIdx &&
                    selectedCell?.col === colIdx;
                  return (
                    <td
                      key={`${rowIdx}-${colIdx}`}
                      className="min-w-32 border border-gray-300 p-0"
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    >
                      <input
                        type="text"
                        value={row[header] || ""}
                        onChange={(e) =>
                          handleCellEdit(
                            rowIdx,
                            header,
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          setSelectedCell({
                            row: rowIdx,
                            col: colIdx,
                          })
                        }
                        className={`w-full h-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-20 relative ${
                          isSelected
                            ? "bg-blue-100 ring-1 ring-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                        placeholder=""
                        data-row={rowIdx}
                        data-col={colIdx}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td
                colSpan={headers.length + 2}
                className="border border-gray-300 p-0 sticky left-0"
              >
                <button
                  onClick={addRow}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-2"
                  type="button"
                >
                  <Plus size={16} />
                  Add Row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div>
          {filteredData.length} row
          {filteredData.length !== 1 ? "s" : ""}
          {searchTerm && ` (filtered from ${tableData.length})`}
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
    </div>
  );
};

export default DataTable;
