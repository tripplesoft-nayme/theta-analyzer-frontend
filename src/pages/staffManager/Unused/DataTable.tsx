import React, { useRef, useState } from "react";
import {
  Paperclip,
  MessageSquare,
  Share2,
  Settings,
  Eye,
  Upload,
  Download,
  Search,
} from "lucide-react";
import Papa from "papaparse";

interface DataTableProps {
  headers: string[];
  tableData: any[];
  onUpload?: (data: any[]) => void;
  onClear?: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
  headers,
  tableData,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          if (onUpload) onUpload(results.data);
        },
      });
    }
  };

  const handleDownload = () => {
    const csv = Papa.unparse(tableData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "exported_data.csv";
    link.click();
  };

  // ✅ Dynamic search filter
  const filteredData = tableData.filter((row) =>
    headers.some((header) =>
      String(row[header] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 my-2">
        {/* Left Icons */}
        <div className="flex items-center gap-3 text-gray-500">
          <button className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">
            <Paperclip size={16} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">
            <MessageSquare size={16} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">
            <Share2 size={16} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">
            <Settings size={16} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">
            <Eye size={16} />
          </button>
        </div>

        {/* 🔍 Search Box */}
        <div className="flex items-center border border-gray-200 rounded-md px-3 py-1.5 w-64 bg-gray-50 outline-none">
          <Search size={14} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search anything here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-transparent focus:outline-none text-gray-700"
          />
        </div>

        {/* Upload + Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer"
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
            className="p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <Download size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {headers.map((header, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
