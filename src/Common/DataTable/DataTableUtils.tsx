// dataTableUtils.ts


export interface CellAddress {
  row: number;
  col: number;
}

export interface TableData {
  headers: string[];
  data: Record<string, any>[];
}

// CSV Operations
export const parseCSV = async (file: File): Promise<TableData> => {
  const Papa = (await import("papaparse")).default;
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const headers = Object.keys(results.data[0] || {});
        resolve({ headers, data: results.data });
      },
      error: (error: Error) => reject(error),
    });
  });
};

export const exportToCSV = async (
  data: Record<string, any>[],
  filename: string = "spreadsheet_export.csv"
) => {
  const Papa = (await import("papaparse")).default;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// History Management
export class HistoryManager {
  private history: Record<string, any>[][] = [];
  private index: number = 0;

  constructor(initialData: Record<string, any>[]) {
    this.history = [JSON.parse(JSON.stringify(initialData))];
  }

  push(newData: Record<string, any>[]) {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(JSON.parse(JSON.stringify(newData)));
    this.index = this.history.length - 1;
  }

  undo(): Record<string, any>[] | null {
    if (this.index > 0) {
      this.index--;
      return JSON.parse(JSON.stringify(this.history[this.index]));
    }
    return null;
  }

  redo(): Record<string, any>[] | null {
    if (this.index < this.history.length - 1) {
      this.index++;
      return JSON.parse(JSON.stringify(this.history[this.index]));
    }
    return null;
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.history.length - 1;
  }

  getCurrentIndex(): number {
    return this.index;
  }
}

// Clipboard Operations
export const copyToClipboard = async (
  text: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for browsers that don't support clipboard API
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    } catch (fallbackErr) {
      console.error("Fallback copy failed:", fallbackErr);
      return false;
    }
  }
};

export const pasteFromClipboard = async (): Promise<
  string | null
> => {
  try {
    return await navigator.clipboard.readText();
  } catch (err) {
    console.warn("Cannot read from clipboard:", err);
    return null;
  }
};

// Data Filtering
export const filterData = (
  data: Record<string, any>[],
  headers: string[],
  searchTerm: string
): Record<string, any>[] => {
  if (!searchTerm.trim()) return data;

  return data.filter((row) =>
    headers.some((header) =>
      String(row[header] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );
};

// Column Operations
export const addNewColumn = (
  headers: string[],
  baseName: string = "Column"
): string => {
  let columnNumber = 1;
  let newHeader = `${baseName} ${columnNumber}`;

  while (headers.includes(newHeader)) {
    columnNumber++;
    newHeader = `${baseName} ${columnNumber}`;
  }

  return newHeader;
};

export const updateDataWithNewColumn = (
  data: Record<string, any>[],
  newHeader: string
): Record<string, any>[] => {
  return data.map((row) => ({
    ...row,
    [newHeader]: "",
  }));
};

export const updateDataWithRenamedColumn = (
  data: Record<string, any>[],
  oldHeader: string,
  newHeader: string
): Record<string, any>[] => {
  return data.map((row) => {
    const newRow = { ...row };
    newRow[newHeader] = row[oldHeader];
    delete newRow[oldHeader];
    return newRow;
  });
};
