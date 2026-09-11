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
  AlertTriangle,
  ArrowRight,
  Search,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { useGetAllProgramQuery, useGetProgramByIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { useGetAllProjectsQuery, useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { useGetAllTheLeafChartQuery } from "@/store/Api/ChartApi/ChartApi";
import { useCreateEmployeeSubmissionMutation } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { processExcelFile } from "@/utils/excelProcessing";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { FaRoad } from "react-icons/fa";

const UploadProject: React.FC = () => {
  // ── URL search params (pre-filled when navigating from project details) ────
  const [searchParams] = useSearchParams();
  const presetProgramId = searchParams.get("programId") ?? "";
  const presetProjectId = searchParams.get("projectId") ?? "";

  // ── Form state ─────────────────────────────────────────────────────────────
  const [program, setProgram] = useState(presetProgramId);
  const [project, setProject] = useState(presetProjectId);
  const [information, setInformation] = useState("");
  const [ipAddress, setIpAddress] = useState<string>("::1");
  const [datasetDate, setDatasetDate] = useState<Date>(new Date());
  const [file, setFile] = useState<File | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // ── Popovers Open States ───────────────────────────────────────────────────
  const [isProgramPopoverOpen, setIsProgramPopoverOpen] = useState(false);
  const [isProjectPopoverOpen, setIsProjectPopoverOpen] = useState(false);

  // ── Programs Search/Pagination States ──────────────────────────────────────
  const [programSearchInput, setProgramSearchInput] = useState("");
  const debouncedProgramSearch = useDebounce(programSearchInput, 300);
  const [programPage, setProgramPage] = useState(1);
  const [programsList, setProgramsList] = useState<any[]>([]);

  // ── Projects Search/Pagination States ──────────────────────────────────────
  const [projectSearchInput, setProjectSearchInput] = useState("");
  const debouncedProjectSearch = useDebounce(projectSearchInput, 300);
  const [projectPage, setProjectPage] = useState(1);
  const [projectsList, setProjectsList] = useState<any[]>([]);

  // Sync URL params → state when params change
  useEffect(() => {
    if (presetProgramId) setProgram(presetProgramId);
    if (presetProjectId) setProject(presetProjectId);
  }, [presetProgramId, presetProjectId]);

  // Fetch device public IP; fallback to "::1"
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) setIpAddress(data.ip);
      })
      .catch(() => { });
  }, []);

  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: programsData, isFetching: isFetchingPrograms } = useGetAllProgramQuery({
    page: programPage,
    limit: 10,
    search: debouncedProgramSearch,
  });

  const { data: projectsData, isFetching: isFetchingProjects } = useGetAllProjectsQuery({
    page: projectPage,
    limit: 10,
    search: debouncedProjectSearch,
    programId: program || undefined,
  }, {
    skip: !program,
  });

  // Query details for preset or selected program & project
  const { data: currentProgramData } = useGetProgramByIdQuery(program, {
    skip: !program,
  });
  const currentProgram = currentProgramData?.data;

  const { data: currentProjectData } = useGetProjectByIdQuery(project, {
    skip: !project,
  });
  const currentProject = currentProjectData?.data?.project || currentProjectData?.data;

  const { data: leafChartsData } = useGetAllTheLeafChartQuery(project, {
    skip: !project,
  });

  const [createEmployeeSubmission, { isLoading: isSubmitting }] =
    useCreateEmployeeSubmissionMutation();

  // ── Programs List Appending & Reset ────────────────────────────────────────
  useEffect(() => {
    setProgramsList([]);
    setProgramPage(1);
  }, [debouncedProgramSearch]);

  useEffect(() => {
    const newPrograms = programsData?.data?.data || programsData?.data || [];
    if (newPrograms.length > 0) {
      setProgramsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newPrograms.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [programsData]);

  // ── Projects List Appending & Reset ─────────────────────────────────────────
  useEffect(() => {
    setProjectsList([]);
    setProjectPage(1);
  }, [debouncedProjectSearch, program]);

  useEffect(() => {
    if (!program) return;
    const newProjects = projectsData?.data?.projects?.data || projectsData?.data?.data || [];
    if (newProjects.length > 0) {
      setProjectsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newProjects.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [projectsData, program]);

  // ── Pagination Helpers ─────────────────────────────────────────────────────
  const hasMorePrograms = useMemo(() => {
    const metaTotal = programsData?.data?.meta?.total || programsData?.meta?.total;
    const currentLen = programsList.length;
    const lastPageLen = programsData?.data?.data?.length || programsData?.data?.length || 0;
    if (metaTotal !== undefined) return currentLen < metaTotal;
    return lastPageLen === 10;
  }, [programsData, programsList]);

  const hasMoreProjects = useMemo(() => {
    const metaTotal = projectsData?.data?.projects?.meta?.total || projectsData?.data?.meta?.total;
    const currentLen = projectsList.length;
    const lastPageLen = projectsData?.data?.projects?.data?.length || projectsData?.data?.data?.length || 0;
    if (metaTotal !== undefined) return currentLen < metaTotal;
    return lastPageLen === 10;
  }, [projectsData, projectsList]);

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
    setParsedData(null);
    setInformation("");
  };

  // Reset project when program changes
  const handleProgramChange = (newProgramId: string) => {
    setProgram(newProgramId);
    setProject("");
    setProjectsList([]);
    setProjectPage(1);
    setProjectSearchInput("");
  };

  // Resolve full chart UUID from the 8-char suffix in the sheet name
  const resolveChartId = (idSuffix: string): string => {
    if (!idSuffix) return idSuffix;
    const matched = allLeafCharts.find(
      (c: any) => c.id === idSuffix || c.id?.slice(-8) === idSuffix,
    );
    return matched?.id ?? idSuffix;
  };

  // ── Process File (Automatic after selection) ──────────────────────────────
  const processFile = async (selectedFile: File) => {
    if (!project) {
      toast.error("Please select a project first.");
      setFile(null);
      return;
    }

    setIsParsing(true);
    setParseComplete(false);

    try {
      // 1. Process via shared utility
      const processedSheets = await processExcelFile({
        file: selectedFile,
        datasetDate,
        resolveId: resolveChartId, // Link to local UUID resolver
      });

      if (processedSheets.length === 0) {
        toast.error("No valid sheets found to update charts.");
        setIsParsing(false);
        return;
      }

      // 2. Map component-specific field names if necessary (e.g. chartId instead of id)
      const elements = processedSheets.map((item) => ({
        chartId: item.id,
        xAxis: item.xAxis,
        yAxis: "", // Staff panel uses empty strings instead of empty JSON arrays []
        zAxis: "",
        datasettime: item.datasettime,
      }));

      // 3. Prepare data for preview
      const payload = {
        projectId: project,
        information: information || "Submission from staff employee panel",
        submission: "Draft submission for manager review",
        ipAddress,
        elements,
      };

      setParsedData(payload);

      // Simulate short delay for UX
      setTimeout(() => {
        setIsParsing(false);
        setParseComplete(true);
        toast.success("File processed successfully!");
      }, 1500);
    } catch (error: any) {
      console.error("File processing error:", error);
      toast.error(error?.message || "Error processing file.");
      setIsParsing(false);
    }
  };

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSeePreview = async () => {
    if (!parsedData) return;

    try {
      const res = await createEmployeeSubmission(parsedData).unwrap();
      // Expecting res.data.id or res.id based on typical API structure
      const submissionId = res?.data?.submission?.id || res?.id;

      if (submissionId) {
        navigate(
          `/staff-employee-panel/project-review/submission-preview/${submissionId}/${project}`,
        );
      } else {
        toast.error("Failed to get submission ID.");
      }
    } catch (error: any) {
      console.error("Preview creation error:", error);
      const errMsg = error?.data?.message || "Failed to create preview.";
      if (
        errMsg.toLowerCase().includes("active or rejected submission") ||
        errMsg.toLowerCase().includes("please wait for approval")
      ) {
        setErrorMessage(errMsg);
        setShowErrorModal(true);
      } else {
        toast.error(errMsg);
      }
    }
  };

  const preselected = !!(presetProgramId && presetProjectId);

  return (
    <div className="min-h-fit mb-10 w-full bg-white dark:bg-slate-900 text-black dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-lg flex items-start justify-center px-4 py-10 transition-colors duration-300">
      <div className="w-full max-w-xl">
        <h2 className="text-center text-2xl font-semibold mb-2 text-black dark:text-slate-100">
          Upload Project Submission
        </h2>

        {preselected ? (
          <p className="text-center text-base text-blue-600 dark:text-blue-400 mb-6">
            Program and project are pre-selected from the project details page.
          </p>
        ) : (
          <p className="text-center text-base text-gray-500 dark:text-slate-400 mb-6">
            Select a Program &amp; Project first, then upload your filled Excel
            template.
          </p>
        )}

        {/* Program Select */}
        <div className="mb-4">
          <label className="text-sm mb-1 block text-black dark:text-slate-300 font-medium">Program Name *</label>

          <Popover open={isProgramPopoverOpen} onOpenChange={setIsProgramPopoverOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 border border-gray-200 dark:border-slate-800 mt-1 flex items-center justify-between px-3 bg-gray-50 dark:bg-slate-800 text-black dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-normal"
                disabled={!!presetProgramId}
              >
                <span>
                  {currentProgram?.programName || "Select program name"}
                </span>
                <ChevronDown className="size-4 text-gray-500 dark:text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[450px] max-w-[90vw] p-1 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 z-50"
              align="start"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearchInput}
                    onChange={(e) => setProgramSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div
                className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 scrollbar-hide py-1"
                onWheel={(e) => e.stopPropagation()}
              >
                {isFetchingPrograms && programsList.length === 0 ? (
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-8 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded" />
                    <Skeleton className="h-8 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded" />
                  </div>
                ) : programsList.length > 0 ? (
                  <>
                    {programsList.map((p: any) => {
                      const isSelected = program === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            handleProgramChange(p.id);
                            setIsProgramPopoverOpen(false);
                          }}
                          className={cn(
                            "px-3 py-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer rounded transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-between",
                            isSelected && "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                          )}
                        >
                          <span>{p.programName}</span>
                          {isSelected && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                      );
                    })}
                    {hasMorePrograms && (
                      <div className="p-1 mt-1 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isFetchingPrograms) setProgramPage(prev => prev + 1);
                          }}
                          disabled={isFetchingPrograms}
                          className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium h-8"
                        >
                          {isFetchingPrograms ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-slate-600">
                    <p className="text-xs">No programs found</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Project Select – filtered by selected program */}
        <div className="mb-4">
          <label className="text-sm mb-1 block text-black dark:text-slate-300 font-medium">Project Name *</label>

          <Popover open={isProjectPopoverOpen} onOpenChange={setIsProjectPopoverOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 border border-gray-200 dark:border-slate-800 mt-1 flex items-center justify-between px-3 bg-gray-50 dark:bg-slate-800 text-black dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-normal disabled:opacity-50"
                disabled={!program || !!presetProjectId}
              >
                <span>
                  {program ? (currentProject?.name || currentProject?.projectName || "Select Project Name") : "Select a program first"}
                </span>
                <ChevronDown className="size-4 text-gray-500 dark:text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[450px] max-w-[90vw] p-1 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 z-50"
              align="start"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearchInput}
                    onChange={(e) => setProjectSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div
                className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 scrollbar-hide py-1"
                onWheel={(e) => e.stopPropagation()}
              >
                {isFetchingProjects && projectsList.length === 0 ? (
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-8 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded" />
                    <Skeleton className="h-8 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded" />
                  </div>
                ) : projectsList.length > 0 ? (
                  <>
                    {projectsList.map((p: any) => {
                      const isSelected = project === p.id;
                      const name = p.name || p.projectName;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setProject(p.id);
                            setIsProjectPopoverOpen(false);
                          }}
                          className={cn(
                            "px-3 py-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer rounded transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-between",
                            isSelected && "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                          )}
                        >
                          <span>{name}</span>
                          {isSelected && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                      );
                    })}
                    {hasMoreProjects && (
                      <div className="p-1 mt-1 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isFetchingProjects) setProjectPage(prev => prev + 1);
                          }}
                          disabled={isFetchingProjects}
                          className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium h-8"
                        >
                          {isFetchingProjects ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-slate-600">
                    <p className="text-xs">No projects found</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Submission Information */}
        <div className="mb-4">
          <label className="text-sm mb-1 block text-black dark:text-slate-300 font-medium">Submission Information</label>
          <input
            type="text"
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            placeholder="e.g. Monthly performance report for Q1"
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 text-black dark:text-slate-100 px-4 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Leaf Charts Info */}
        {project && leafChartsData?.data && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
              {allLeafCharts.length} chart(s) found for this project. Upload the
              Excel file downloaded from the project details page — each sheet
              corresponds to one chart and will update its values directly.
            </p>
          </div>
        )}

        {/* Dataset Date – matches client panel exactly */}
        <div className="mb-8">
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2 text-black dark:text-slate-300">
            Data Set Date
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-gray-200 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
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
            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-xl" align="start">
              <Calendar
                mode="single"
                selected={datasetDate}
                onSelect={(date) => date && setDatasetDate(date)}
                initialFocus
                className="bg-white dark:bg-slate-900 dark:text-slate-100"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Upload drop zone */}
        {program && project && !file && !isParsing && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <FaRoad size={32} className="text-gray-500 dark:text-slate-400" />
              </div>
            </div>
            <h3 className="text-center text-lg font-semibold mb-2 text-black dark:text-slate-100">
              No File Added Yet
            </h3>
            <p className="text-center text-sm text-gray-400 dark:text-slate-500 mb-6">
              Upload the Excel file you downloaded from the project details
              page. Each sheet corresponds to one chart and its values will be
              updated immediately.
            </p>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border border-dashed border-gray-500 dark:border-slate-700 rounded-lg p-10 text-center mb-4 bg-gray-50/30 dark:bg-slate-800/20 hover:border-blue-400 transition-colors"
            >
              <Upload size={32} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                Drag and drop your XLSX file here
              </p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mb-2">or</p>
              <label className="text-blue-500 dark:text-blue-400 cursor-pointer   font-medium">
                Browse your device →
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 text-center mb-6">
              Supported formats: .xlsx | Max file size: 10 MB
            </p>
            <div className="flex justify-center mb-4">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-black dark:text-slate-100 px-6 py-2 rounded-md text-sm font-medium transition-colors"
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
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-md p-8 text-center mb-6 flex flex-col items-center animate-pulse">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Analyzing file content...
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-500/80 mt-1">
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
                ? "border-border"
                : "bg-gray-900 dark:bg-slate-800 border-gray-700 dark:border-slate-700",
            )}
          >
            <button
              onClick={handleClearData}
              className="absolute top-2 right-2 p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/10 rounded transition-colors"
              title="Remove selected file"
            >
              <X size={16} />
            </button>

            {parseComplete ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400 mb-2" />
                <p className="text-base text-green-700 dark:text-green-400 font-semibold">
                  File Ready for Preview
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">{file.name}</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-green-400 mb-2">File Selected</p>
                <p className="text-xs text-gray-300 dark:text-slate-400">{file.name}</p>
              </>
            )}

            {parseComplete && parsedData?.elements?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-100 dark:border-green-500/20 w-full">
                <div className="flex justify-between items-center px-2">
                  <p className="text-sm font-medium">
                    {parsedData.elements.length} chart(s) detected
                  </p>
                  <PrimaryButton
                    title={isSubmitting ? "Preparing..." : "See Preview"}
                    type="Primary"
                    className="text-sm bg-green-600 hover:text-green-600 dark:hover:text-white border dark:border-green-600 border-green-600 hover:bg-transparent"
                    onClick={handleSeePreview}
                    disabled={isSubmitting}
                    leftIcon={
                      isSubmitting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : null
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="fixed top-1/2 left-1/2 z-60 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 focus:outline-none animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800 showCloseButton={false}">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Warning Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-red-100/50 dark:bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 stroke-[3px]" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Submission Status
              </h2>
              <p className="text-slate-500 dark:text-slate-300 text-sm mx-auto leading-relaxed max-w-sm">
                {errorMessage}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <Button
                variant="outline"
                onClick={() => setShowErrorModal(false)}
                className="flex-1 h-12 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border shadow-none border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[12px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowErrorModal(false);
                  navigate("/staff-employee-panel/project-review");
                }}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold uppercase tracking-wider text-[12px] rounded-lg active:scale-95 flex items-center justify-center gap-2"
              >
                Go to Project Review
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadProject;
