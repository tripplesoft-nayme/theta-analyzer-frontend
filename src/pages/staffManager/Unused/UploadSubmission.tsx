import AppDialog from "@/Common/Charts/CompletedCharts/Common/Modal/ModalTemplate";
import PrimaryButton from "@/Common/PrimaryButton";
import { Upload, FileText, X } from "lucide-react";
import { useState } from "react";

const UploadSubmission = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  return (
    <div className="p-6">
      <AppDialog
        triggerButton={
          <PrimaryButton
            title={"Upload Submission"}
            leftIcon={<Upload size={18} />}
            type={"Primary"}
          />
        }
        title="Upload Submission"
        description="Click the below area to upload your CSV file."
        footer={
          <div className="w-full flex gap-3">
            <button
              disabled={!selectedFile}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save & Upload
            </button>
          </div>
        }
      >
        {/* Main Modal Content */}
        <div className="mt-4">
          <div className="mb-8 space-y-4">
            {/* Program Select */}
            <div >
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                Select Program
              </label>
              <select
                id="program"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="">Choose a program...</option>
                <option value="program1">Program 1</option>
                <option value="program2">Program 2</option>
                <option value="program3">Program 3</option>
              </select>
            </div>

            {/* Project Select */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                id="project"
                className="w-full px-3 py-2 border border-gray-300 rounded-md  bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="">Choose a project...</option>
                <option value="project1">Project A</option>
                <option value="project2">Project B</option>
                <option value="project3">Project C</option>
              </select>
            </div>
          </div>
          <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">

            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-500" />
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only (max. 10MB)</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-white border rounded-md shadow-sm">
                <FileText className="text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                  }}
                  className="ml-2 p-1 hover:bg-red-100 rounded-full text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </AppDialog>
    </div>
  );
};

export default UploadSubmission;