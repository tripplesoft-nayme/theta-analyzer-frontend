/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  HelpCircle,
  // Plus,
  Send,
  ArrowRight,
  Waypoints,
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  useUploadChartDataMutation,
  useLazyGetAllTheLeafChartQuery,
  useUpdateProgramChartsMutation,
  useLazyGetProgramBuilderChartQuery,
} from "@/store/Api/ChartApi/ChartApi";
import { useAppSelector } from "@/hooks/useRedux";
import ProjectUploadSuccessModal from "./ProjectUploadSuccessModal";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { processExcelFile } from "@/utils/excelProcessing";

interface FileUploadProps {
  onFileUpload?: (file: File) => void;
  projectId?: string;
  isModal?: boolean;
  customSubmitHandler?: (chartsPayload: any[]) => Promise<void>;
  isCustomSubmitLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  projectId: propProjectId,
  isModal = false,
  customSubmitHandler,
  isCustomSubmitLoading = false,
}) => {
  const [uploadChartData, { isLoading: isUploading }] =
    useUploadChartDataMutation();
  const [updateProgramCharts, { isLoading: isUpdatingProgram }] =
    useUpdateProgramChartsMutation();
  const [getAllTheLeafChart] = useLazyGetAllTheLeafChartQuery();
  const [getProgramBuilderCharts] = useLazyGetProgramBuilderChartQuery();
  const { projectId: paramProjectId, programId: paramProgramId } = useParams();
  const reduxProjectId = useAppSelector((state) => state.chartSlice.projectId);
  const reduxProgramId = useAppSelector((state) => state.chartSlice.programId);
  const navigate = useNavigate();
  const location = useLocation();
  const isProgramBuilderRoute = location.pathname.includes("program-builder");
  const projectId = paramProjectId || paramProgramId || propProjectId || (isProgramBuilderRoute ? reduxProgramId : reduxProjectId);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [projectNote, setProjectNote] = useState("");
  const [addNotesChecked, setAddNotesChecked] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [datasetDate, setDatasetDate] = useState<Date>(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);
  const [chartsPayload, setChartsPayload] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = [".csv", ".xls", ".xlsx", ".ods"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (validExtensions.includes(fileExtension)) {
      if (selectedFile.size <= 10 * 1024 * 1024) {
        setFile(selectedFile);
        setUploadStatus(null);
        processFile(selectedFile);
      } else {
        setUploadStatus("error");
        toast.error("File size exceeds 10MB limit");
      }
    } else {
      setUploadStatus("error");
      toast.error("Please upload a valid file format: CSV, XLS, XLSX, or ODS");
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus(null);
    setParseComplete(false);
    setChartsPayload([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (selectedFile: File) => {
    setIsParsing(true);
    setParseComplete(false);

    try {
      const isProgram = location.pathname.includes("/program-builder");
      // Fetch existing charts to enable tree structure merging and ID resolution
      let existingCharts: any[] = [];
      if (projectId) {
        if (isProgram) {
          const res = await getProgramBuilderCharts(projectId).unwrap();
          existingCharts = res?.data?.charts || res?.data || [];
        } else {
          const res = await getAllTheLeafChart(projectId).unwrap();
          const groups = res?.data || [];
          existingCharts = groups.flatMap((g: any) => g.charts || []);
        }
      }

      const resolveId = (suffix: string) => {
        // If suffix looks like a full UUID (36 chars), return it
        if (suffix.length > 20) return suffix;

        // Find matching chart in existingCharts by checking the end of the full ID
        const match = existingCharts.find((c: any) =>
          (c.id || "").toLowerCase().endsWith(suffix.toLowerCase())
        );
        return match ? match.id : suffix;
      };

      const processedSheets = await processExcelFile({
        file: selectedFile,
        datasetDate,
        existingCharts, // Pass existing charts for merging logic
        resolveId,      // Map 8-char suffix to full ID
      });
      console.log("processedSheets", processedSheets);
      if (processedSheets.length === 0) {
        toast.error("No valid sheets found in the file.");
        setIsParsing(false);
        return;
      }

      setChartsPayload(processedSheets);

      setTimeout(() => {
        setIsParsing(false);
        setParseComplete(true);
        toast.success("File processed successfully!");
      }, 1500);
    } catch (error: any) {
      console.error("Error processing file:", error);
      setIsParsing(false);
      toast.error(error?.message || "Failed to process file.");
    }
  };

  const [sheetCount, setSheetCount] = useState(0);

  const handleSubmit = async () => {
    if (!file || chartsPayload.length === 0) {
      toast.error("Please select and process a file first.");
      return;
    }

    const isProgram = location.pathname.includes("/program-builder");
    const toastId = toast.loading("Uploading file data...");

    try {
      if (customSubmitHandler) {
        await customSubmitHandler(chartsPayload);
      } else if (isProgram) {
        // For Program Builder, update each chart's xAxis only
        await Promise.all(
          chartsPayload.map((chart: any) => {
            if (!chart.id) return Promise.resolve();
            return updateProgramCharts({
              id: chart.id,
              data: { xAxis: chart.xAxis },
            }).unwrap();
          }),
        );
      } else {
        const payload = {
          charts: chartsPayload,
        };
        await uploadChartData(payload).unwrap();
      }

      toast.success("File uploaded successfully", { id: toastId });
      setSheetCount(chartsPayload.length);
      setUploadStatus("success");
      setShowSuccessModal(true);

      if (onFileUpload) {
        onFileUpload(file);
      }
    } catch (uploadError) {
      console.error("Upload failed", uploadError);
      toast.error("Failed to upload the data. Please try again.", {
        id: toastId,
      });
      setUploadStatus("error");
    }
  };

  const handleOpenProject = () => {
    const isProgram = location.pathname.includes("/program-builder");
    const basePath = location.pathname.includes("/staff-manager-panel")
      ? "/staff-manager-panel"
      : "/client-panel";

    if (isProgram) {
      navigate(`${basePath}/all-program/program-overview/${projectId}/program-details`);
    } else {
      navigate(`${basePath}/project-builder/project-details/${projectId}`);
    }
  };

  return (
    <>
      <div
        className={`flex font-sans text-[#111827] dark:text-slate-100 ${isModal ? "h-auto" : "min-h-[80vh] bg-white dark:bg-slate-900 transition-colors duration-300"
          }`}
      >
        {/* Main Upload Area */}
        <div
          className={`flex-1 p-8 md:p-12 flex flex-col items-center justify-center dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm ${isModal ? "border-none shadow-none p-6 md:p-10" : ""
            }`}
        >
          <div className="w-full max-w-3xl flex flex-col items-center">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#F3F4F6] dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                {/* Road/Map icon placeholder */}
                <Waypoints className="w-10 h-10 text-slate-500 dark:text-slate-400" />
              </div>
              <h1 className="text-2xl font-semibold text-[#111827] dark:text-slate-100 mb-3">
                No file Added to this {isProgramBuilderRoute ? "Program" : "Project"} Yet
              </h1>
              <p className="text-[#6B7280] dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                You haven't uploaded any data for this {isProgramBuilderRoute ? "program" : "project"}. Start by
                importing a CSV or spreadsheet file to populate tasks or
                resources.
              </p>
            </div>

            {/* Processing State */}
            {isParsing && (
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center mb-6 flex flex-col items-center w-full max-w-md">
                <Loader2 className="w-10 h-10 text-blue-500 dark:text-blue-400 animate-spin mb-4" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Analyzing file content...
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                  Please wait while we validate your charts.
                </p>
              </div>
            )}

            {!file && !isParsing ? (
              <>
                {/* Drag & Drop Zone */}
                <div
                  className={`w-full border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 mb-4 ${isDragging
                    ? "border-blue-500 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/10"
                    : "border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700"
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Upload className="w-6 h-6 text-[#374151] dark:text-slate-300" />
                  </div>
                  <p className="text-[#374151] dark:text-slate-200 font-medium text-sm">
                    Drag and drop your CSV/XLSX file here
                  </p>
                </div>

                {/* Supported Formats */}
                <p className="text-[#9CA3AF] text-xs text-center mb-6">
                  Supported formats: .csv, .xls, .xlsx, .mpp | Max file size :
                  10 MB
                </p>

                {/* OR Divider */}
                <div className="text-[#111827] dark:text-slate-400 font-medium text-sm mb-6">
                  OR
                </div>

                {/* Browse Button */}
                <button
                  onClick={handleBrowse}
                  className="bg-[#1D64D8] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mb-10"
                >
                  Browse your device
                  <ArrowRight className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx,.ods"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </>
            ) : (
              file &&
              !isParsing && (
                <div className="w-full mb-10 max-w-2xl mx-auto">
                  <div
                    className={cn(
                      "border rounded-lg p-5 flex items-center justify-between transition-all",
                      parseComplete
                        ? "bg-green-50 dark:bg-emerald-500/10 border-green-200 dark:border-emerald-500/20"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          parseComplete ? "bg-green-100 dark:bg-emerald-500/20" : "bg-blue-50 dark:bg-blue-500/20",
                        )}
                      >
                        {parseComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4
                          className={cn(
                            "text-sm font-medium",
                            parseComplete ? "text-green-900 dark:text-emerald-400" : "text-gray-900 dark:text-slate-100",
                          )}
                        >
                          {file.name}
                          {parseComplete && (
                            <span className="ml-2 text-[10px] bg-green-200 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                              Ready
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {(file.size / 1024).toFixed(2)} KB
                          {parseComplete &&
                            chartsPayload.length > 0 &&
                            ` | ${chartsPayload.length} sheets`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {uploadStatus === "success" && (
                    <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-emerald-400 text-sm justify-center">
                      <CheckCircle className="w-4 h-4" />
                      <span>File uploaded successfully</span>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Footer Section - Notes */}
            <div className="w-full max-w-md mx-auto self-start">
              {/* Data Set Date Selector */}
              <div className="mb-6">
                <label className="flex items-center gap-1.5 text-xs text-[#374151] dark:text-slate-400 font-medium mb-2">
                  Data Set Date
                  <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF] dark:text-slate-600" />
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-[#E5E7EB] dark:border-slate-800 dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200",
                        !datasetDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datasetDate ? (
                        format(datasetDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datasetDate}
                      onSelect={(date) => date && setDatasetDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Toggle Header */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setAddNotesChecked(!addNotesChecked)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${addNotesChecked ? "bg-[#1D64D8]" : "bg-gray-200 dark:bg-slate-800"
                    }`}
                >
                  <span
                    className={`${addNotesChecked ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-200 transition-transform`}
                  />
                </button>
                <span className="text-sm font-medium text-[#374151] dark:text-slate-300">
                  Add Notes for Project Admin/Manager
                </span>

                {/* Persistent Open Project Button (Only visible after success) */}
                {uploadStatus === "success" && (
                  <button
                    onClick={handleOpenProject}
                    className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                  >
                    {isProgramBuilderRoute ? "Open Program" : "Open Project"} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Note Input */}
              {addNotesChecked && (
                <div className="mb-4">
                  <label className="flex items-center gap-1.5 text-xs text-[#374151] dark:text-slate-400 font-medium mb-2">
                    Project Note
                    <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF] dark:text-slate-600" />
                  </label>
                  <div className="relative">
                    <textarea
                      value={projectNote}
                      onChange={(e) => setProjectNote(e.target.value)}
                      placeholder="Write a short description..."
                      className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-lg text-sm placeholder:text-[#9CA3AF] dark:placeholder:text-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={!file || isUploading || isUpdatingProgram || isCustomSubmitLoading}
                  className="bg-[#1D64D8] hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4 fill-current" />
                  {isUploading || isUpdatingProgram || isCustomSubmitLoading ? "Uploading..." : "Submit Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProjectUploadSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        projectId={projectId}
        sheetCount={sheetCount}
      />
    </>
  );
};

export default FileUpload;
