/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  UploadCloud,
  ChevronDown,
  Upload,
  Calendar as CalendarIcon,
  HelpCircle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { FaRoad } from "react-icons/fa";
import { format } from "date-fns";
import { useGetAllProgramQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useGetAllTheLeafChartQuery } from "@/store/Api/ChartApi/ChartApi";
import { useUploadChartDataMutation } from "@/store/Api/ChartApi/ChartApi";
import PrimaryButton from "@/Common/PrimaryButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { processExcelFile } from "@/utils/excelProcessing";

const UploadProject: React.FC = () => {
  // ── URL search params (pre-filled when navigating from project-details) ────
  const [searchParams] = useSearchParams();
  const presetProgramId = searchParams.get("programId") ?? "";
  const presetProjectId = searchParams.get("projectId") ?? "";
  // const [uploadChartData] = useUploadChartDataMutation();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [program, setProgram] = useState(presetProgramId);
  const [project, setProject] = useState(presetProjectId);
  const [information, setInformation] = useState("");
  const [datasetDate, setDatasetDate] = useState<Date>(new Date());
  const [file, setFile] = useState<File | null>(null);
  const [addNotes, setAddNotes] = useState(false);
  const projectNoteRef = useRef<HTMLTextAreaElement>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);
  const [chartsPayload, setChartsPayload] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Sync URL params → state when params change
  useEffect(() => {
    if (presetProgramId) setProgram(presetProgramId);
    if (presetProjectId) setProject(presetProjectId);
  }, [presetProgramId, presetProjectId]);



  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: programs } = useGetAllProgramQuery({});
  const { data: projects } = useGetAllProjectsQuery({ limit: 100 });
  const { data: leafChartsData } = useGetAllTheLeafChartQuery(project, {
    skip: !project,
  });

  // const [createSubmission, { isLoading: isSubmitting }] = useCreateEmployeeSubmissionMutation();
  const [uploadChartData, { isLoading: isUploading }] =
    useUploadChartDataMutation();

  const allProjects: any[] = useMemo(
    () => projects?.data?.projects?.data || projects?.data?.data || [],
    [projects],
  );

  const filteredProjects = useMemo(() => {
    if (!program) return allProjects;
    return allProjects.filter(
      (p: any) => p.programId === program || p.program?.id === program,
    );
  }, [program, allProjects]);

  // Flat list of leaf charts (for full UUID matching)
  const allLeafCharts: any[] = useMemo(
    () => (leafChartsData?.data || []).flatMap((g: any) => g.charts || []),
    [leafChartsData],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };
  const handleImportClick = () => fileInputRef.current?.click();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      processFile(droppedFile);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  const handleClearData = () => {
    setFile(null);
    setParseComplete(false);
    setChartsPayload([]);
    if (projectNoteRef.current) projectNoteRef.current.value = "";
    setAddNotes(false);
    setInformation("");
  };

  // Reset project when program changes and selected project no longer belongs
  const handleProgramChange = (newProgramId: string) => {
    setProgram(newProgramId);
    const stillBelongs = allProjects.some(
      (p: any) =>
        p.id === project &&
        (p.programId === newProgramId || p.program?.id === newProgramId),
    );
    if (!stillBelongs) setProject("");
  };

  // Resolve full chart UUID from the 8-char suffix in the sheet name
  const resolveChartId = (idSuffix: string): string => {
    if (!idSuffix) return idSuffix;
    const matched = allLeafCharts.find(
      (c: any) => c.id === idSuffix || c.id?.slice(-8) === idSuffix,
    );
    return matched?.id ?? idSuffix;
  };

  const processFile = async (selectedFile: File) => {
    if (!project) {
      toast.error("Please select a project first.");
      setFile(null);
      return;
    }

    setIsParsing(true);
    setParseComplete(false);

    try {
      const processedSheets = await processExcelFile({
        file: selectedFile,
        datasetDate,
        resolveId: resolveChartId,
      });

      if (processedSheets.length === 0) {
        toast.error("Could not build chart elements from file.");
        setIsParsing(false);
        return;
      }

      setChartsPayload(processedSheets);
      setTimeout(() => {
        setIsParsing(false);
        setParseComplete(true);
        toast.success("File processed successfully!");
      }, 1500);
    } catch (error) {
      console.error("File processing error:", error);
      toast.error("Error processing file.");
      setIsParsing(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file || chartsPayload.length === 0) {
      toast.error("Please select and process a file first.");
      return;
    }
    if (!project) {
      toast.error("Please select a project.");
      return;
    }

    try {
      const toastId = toast.loading("Uploading chart data...");
      await uploadChartData({ charts: chartsPayload }).unwrap();
      toast.success(`${chartsPayload.length} chart(s) updated!`, {
        id: toastId,
      });

      toast.success("Submission sent for review!");

      setFile(null);
      if (projectNoteRef.current) projectNoteRef.current.value = "";
      setAddNotes(false);
      setInformation("");
      setParseComplete(false);
      setChartsPayload([]);
      navigate(`/staff-manager-panel/projects/project-details/${project}`);
    } catch (apiError: unknown) {
      const err = apiError as {
        data?: { message?: string };
        status?: number;
      };
      toast.error(
        err?.data?.message || "Failed to submit. Please try again.",
      );
    }
  };

  const isProcessing = isUploading;
  const preselected = !!(presetProgramId && presetProjectId);

  return (
    <div className="min-h-screen w-full my-6 bg-white text-black border border-gray-200 rounded-lg flex items-start justify-center px-4 pt-10">
      <div className="w-full max-w-xl">
        <h2 className="text-center text-lg font-semibold mb-2">
          Upload Project Submission
        </h2>

        {preselected ? (
          <p className="text-center text-xs text-blue-600 mb-6">
            Program and project are pre-selected from the project details page.
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500 mb-6">
            Select a Program &amp; Project first, then upload your filled Excel
            template.
          </p>
        )}

        {/* Program Select */}
        <div className="mb-4">
          <label className="text-sm mb-1 block">Program Name *</label>
          <div className="relative">
            <select
              value={program}
              onChange={(e) => handleProgramChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-2 rounded-md appearance-none"
            >
              <option value="">Select program name</option>
              {programs?.data?.data?.map(
                (p: { id: string; programName: string }) => (
                  <option key={p.id} value={p.id}>
                    {p.programName}
                  </option>
                ),
              )}
            </select>
            <ChevronDown
              className="absolute right-3 top-2.5 text-gray-500"
              size={16}
            />
          </div>
        </div>

        {/* Project Select – filtered by selected program */}
        <div className="mb-4">
          <label className="text-sm mb-1 block">Project Name *</label>
          <div className="relative">
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-2 rounded-md appearance-none"
              disabled={!program}
            >
              <option value="">
                {program ? "Select Project Name" : "Select a program first"}
              </option>
              {filteredProjects.map((p: { id: string; name: string }) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-2.5 text-gray-500"
              size={16}
            />
          </div>
        </div>

        {/* Submission Information */}
        <div className="mb-4">
          <label className="text-sm mb-1 block">Submission Information</label>
          <input
            type="text"
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            placeholder="e.g. Monthly performance report for Q1"
            className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-2 rounded-md text-sm"
          />
        </div>

        {/* Leaf Charts Info */}
        {project && leafChartsData?.data && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-xs text-blue-700 font-medium">
              {allLeafCharts.length} chart(s) found for this project. Upload the
              Excel file downloaded from the project details page — each sheet
              corresponds to one chart and will update its values directly.
            </p>
          </div>
        )}

        {/* Dataset Date – matches client panel exactly */}
        <div className="mb-8">
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            Data Set Date
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50",
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

        {/* Upload drop zone */}
        {program && project && !file && !isParsing && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FaRoad size={32} className="text-gray-500" />
              </div>
            </div>
            <h3 className="text-center text-lg font-semibold mb-2">
              No File Added Yet
            </h3>
            <p className="text-center text-sm text-gray-400 mb-6">
              Upload the Excel file you downloaded from the project details
              page. Each sheet corresponds to one chart and its values will be
              updated immediately.
            </p>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border border-dashed border-gray-500 rounded-lg p-10 text-center mb-4"
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your XLSX file here
              </p>
              <p className="text-sm text-gray-400 mb-2">or</p>
              <label className="text-blue-400 cursor-pointer">
                Browse your device →
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 text-center mb-6">
              Supported formats: .xlsx | Max file size: 10 MB
            </p>
            <div className="flex justify-center mb-4">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-black px-6 py-2 rounded-md text-sm"
              >
                <UploadCloud size={16} />
                Import Project File
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        )}

        {/* Processing State */}
        {isParsing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-8 text-center mb-6 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-blue-700">
              Analyzing file content...
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Please wait while we validate your charts.
            </p>
          </div>
        )}

        {/* Selected file confirmation */}
        {file && !isParsing && (
          <div
            className={cn(
              "border rounded-md p-5 text-center mb-6 relative group transition-all",
              parseComplete
                ? "bg-green-50 border-green-200"
                : "bg-gray-900 border-gray-700",
            )}
          >
            <button
              onClick={handleClearData}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-white/10 rounded transition-colors"
              title="Remove selected file"
            >
              <X size={16} />
            </button>

            {parseComplete ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm text-green-700 font-semibold">
                  File Ready for Submission
                </p>
                <p className="text-xs text-green-600 mt-1">{file.name}</p>
                {chartsPayload.length > 0 && (
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    {chartsPayload.length} chart(s) detected
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-green-400 mb-2">
                  File Selected Successfully
                </p>
                <p className="text-xs text-gray-300">{file.name}</p>
              </>
            )}
          </div>
        )}

        {/* Notes + Submit */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={addNotes}
                onChange={(e) => setAddNotes(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Add Notes for Project Admin/Manager
              </span>
            </div>
            <textarea
              ref={projectNoteRef}
              disabled={!addNotes}
              placeholder="Write a short description…"
              className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm resize-none h-32 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={handleClearData}
                className="px-5 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <PrimaryButton
                leftIcon={<Upload className="text-2xl" />}
                title={isProcessing ? "Processing…" : "Submit for Review"}
                type={"Primary"}
                onClick={handleSubmit}
                disabled={isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProject;
