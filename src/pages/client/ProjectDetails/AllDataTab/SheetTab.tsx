/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  useGetAllTheLeafChartQuery,
  useUploadChartDataMutation,
} from "@/store/Api/ChartApi/ChartApi";
import {
  useCreateEmployeeSubmissionMutation,
  useGetEmployeeSubmissionByIdQuery,
  useUpdateEmployeeSubmissionDataMutation,
} from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";
import { useUpdateSubmissionStatusMutation } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import {
  Search,
  Download,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  FileText,
  MessageSquare,
  Printer,
  Share2,
  Upload,
  Send,
  Radio,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FileUploadModal from "@/Common/FileUploadModal";

interface ChartNode {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  xAxis?: any;
  yAxis?: any;
  zAxis?: any;
  widgets?: any[];
  parentId?: string | null;
  grouptitle?: string;
  children?: ChartNode[];
}

// ── helpers ────────────────────────────────────────────────────────────────────

const getColLetter = (index: number): string => {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

const parseXAxis = (xAxis: any): any[][] => {
  let parsed = xAxis;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    const labels = parsed.labels || [];
    const otherKeys = Object.keys(parsed).filter((k) => k !== "labels");
    if (labels.length > 0) {
      const rows: any[][] = [["Label", ...otherKeys]];
      labels.forEach((label: string, idx: number) => {
        const row: any[] = [label];
        otherKeys.forEach((key) => row.push(parsed[key]?.[idx] ?? ""));
        rows.push(row);
      });
      return rows;
    }
  }
  return [];
};

/**
 * Converts numeric strings to actual numbers for interior data cells
 * before sending to the backend. Skips headers (row 0) and labels (col 0).
 */
const processRowsForSubmission = (rows: any[][]): any[][] => {
  return rows.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      // Row 0 is header, Column 0 is labels - keep as is
      if (rIdx === 0 || cIdx === 0) return cell;

      // Convert to number if it's a numeric string
      if (
        typeof cell === "string" &&
        cell.trim() !== "" &&
        !isNaN(Number(cell))
      ) {
        return Number(cell);
      }
      return cell;
    }),
  );
};

// ── component ──────────────────────────────────────────────────────────────────

const SheetTab: React.FC = () => {
  const { projectId, submissionId } = useParams<{
    projectId: string;
    submissionId: string;
  }>();
  const { pathname, state } = useLocation();
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch project details to check active status
  const { data: projectData } = useGetProjectByIdQuery(projectId as string, {
    skip: !projectId,
  });
  const projectStatus = projectData?.data?.project?.status;
  const isDraftStatus = String(projectStatus).toLowerCase() === "draft";

  // Always fetch the blueprint (project structure)
  const { data: leafChartsData, isLoading: blueprintLoading } =
    useGetAllTheLeafChartQuery(projectId as string, {
      skip: !projectId,
    });

  // Fetch submission data for review/preview
  const { data: submissionData, isLoading: submissionLoading } =
    useGetEmployeeSubmissionByIdQuery(submissionId as string, {
      skip: !submissionId,
    });

  // ── role detection and flags ────────────────────────────────────────────────
  const isEmployeeRole = pathname.includes("staff-employee-panel") || pathname.includes("staffEmployee");
  const isManagerOrClient = !isEmployeeRole;
  const submissionStatus = submissionData?.data?.status || state?.status;

  // Whether we are on a project-review or submission-preview page
  const isProjectReview = pathname.includes("project-review") || pathname.includes("submission-preview");

  // employee project-details → can edit to submit preview directly
  const isEmployeeProjectDetails =
    isEmployeeRole &&
    pathname.includes("project-details");

  // viewer panel → fully read-only
  const isViewerPanel = pathname.includes("viewer-panel");

  // Determine read-only mode based on user role and submission status:
  const isReadOnly = useMemo(() => {
    // 1. Viewer panel is always read-only
    if (isViewerPanel) return true;

    // 2. If we are on the project-review or submission-preview route:
    if (isProjectReview) {
      const statusUpper = String(submissionStatus).toUpperCase();

      if (isEmployeeRole) {
        // Employee can ONLY edit if status is PREVIEW or REJECTED
        return statusUpper !== "PREVIEW" && statusUpper !== "REJECTED";
      } else {
        // Manager/Client can ONLY edit if status is PENDING
        return statusUpper !== "PENDING";
      }
    }

    // 3. On standard project details:
    // Employee can edit to prepare submission; Manager/Client can edit if project is in draft status
    if (isEmployeeProjectDetails) {
      return false;
    }

    return isManagerOrClient && !isDraftStatus;
  }, [isViewerPanel, isProjectReview, submissionStatus, isEmployeeRole, isEmployeeProjectDetails, isManagerOrClient, isDraftStatus]);

  // We should treat it as a submission-preview / update flow if we are on the review page and are allowed to edit:
  const isSubmissionPreview = isProjectReview && !isReadOnly;

  // employee project-review tab → can submit for review (only if not preview and is employee)
  const isEmployeeReview =
    isEmployeeRole &&
    pathname.includes("project-review") &&
    !isSubmissionPreview;

  // const canEditForStatus = !isManagerOrClient || isDraftStatus;

  // localData[sheetId] = rows (2-D array)
  const [localData, setLocalData] = useState<Record<string, any[][]>>({});
  const [editedChartIds, setEditedChartIds] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const [isPublishSuccessOpen, setIsPublishSuccessOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [successMode, setSuccessMode] = useState<"submit" | "publish">(
    "submit",
  );

  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch public IP for employee submission (fallback: "::1")
  const [ipAddress, setIpAddress] = useState<string>("::1");
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) setIpAddress(data.ip);
      })
      .catch(() => { });
  }, []);

  const leafLoading =
    blueprintLoading || (isProjectReview && submissionLoading);

  const [uploadChartData, { isLoading: isPublishing }] =
    useUploadChartDataMutation();

  const [createEmployeeSubmission, { isLoading: isSubmitting }] =
    useCreateEmployeeSubmissionMutation();

  const [updateEmployeeSubmissionData, { isLoading: isUpdatingSubmissionData }] =
    useUpdateEmployeeSubmissionDataMutation();

  const [updateSubmissionStatus] = useUpdateSubmissionStatusMutation();

  // Flatten all charts from all groups and merge with submission data if exists
  const allCharts = useMemo<ChartNode[]>(() => {
    const charts: ChartNode[] = [];
    const baseGroups = leafChartsData?.data;
    const submittedElements = submissionData?.data?.elements || [];

    baseGroups?.forEach((group: any) => {
      const gTitle = group.grouptitle || group.groupTitle || "";

      const flatten = (items: any[]) => {
        items?.forEach((item: any) => {
          let xAxis = item.xAxis;
          let yAxis = item.yAxis;
          let zAxis = item.zAxis;

          if (isProjectReview) {
            const submitted = submittedElements.find(
              (e: any) => e.chartId === item.id,
            );
            if (submitted) {
              xAxis = submitted.xAxis;
              yAxis = submitted.yAxis;
              zAxis = submitted.zAxis;
            }
          }

          charts.push({
            ...item,
            grouptitle: gTitle,
            xAxis,
            yAxis,
            zAxis,
          });

          if (item.children && Array.isArray(item.children)) {
            flatten(item.children);
          }
        });
      };

      flatten(group.charts);
    });

    return charts;
  }, [leafChartsData, submissionData, isProjectReview]);

  const filteredCharts = useMemo(() => {
    if (!searchTerm) return allCharts;
    const lower = searchTerm.toLowerCase();
    return allCharts.filter(
      (c) =>
        (c.title || c.name || "").toLowerCase().includes(lower) ||
        (c.grouptitle || "").toLowerCase().includes(lower),
    );
  }, [allCharts, searchTerm]);

  // Sync localData when charts load (only for charts not already edited)
  useEffect(() => {
    setLocalData((prev) => {
      const next = { ...prev };
      allCharts.forEach((chart) => {
        if (!next[chart.id] || !editedChartIds[chart.id]) {
          next[chart.id] = parseXAxis(chart.xAxis);
        }
      });
      return next;
    });
  }, [allCharts, editedChartIds]);

  // Keep activeSheetIndex in bounds when filtered list changes
  useEffect(() => {
    if (
      activeSheetIndex >= filteredCharts.length &&
      filteredCharts.length > 0
    ) {
      setActiveSheetIndex(filteredCharts.length - 1);
    }
  }, [filteredCharts, activeSheetIndex]);

  // Scroll active tab into view whenever index changes
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.children[activeSheetIndex] as
      | HTMLElement
      | undefined;
    activeEl?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [activeSheetIndex]);

  // ── navigation ──────────────────────────────────────────────────────────────

  const goToPrevTab = useCallback(() => {
    setActiveSheetIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToNextTab = useCallback(() => {
    setActiveSheetIndex((i) => Math.min(filteredCharts.length - 1, i + 1));
  }, [filteredCharts.length]);

  // ── cell editing ────────────────────────────────────────────────────────────

  const handleCellChange = useCallback(
    (chartId: string, rowIndex: number, colIndex: number, value: string) => {
      setEditedChartIds((prev) => ({ ...prev, [chartId]: true }));
      setLocalData((prev) => {
        const rows = prev[chartId] ? prev[chartId].map((r) => [...r]) : [];
        // Expand rows if needed
        while (rows.length <= rowIndex) rows.push([]);
        // Expand cols if needed
        while (rows[rowIndex].length <= colIndex) rows[rowIndex].push("");
        rows[rowIndex][colIndex] = value;
        return { ...prev, [chartId]: rows };
      });
    },
    [],
  );

  // ── publish (value-change API) ─────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!allCharts.length) {
      toast.error("No chart data to update");
      return;
    }

    const charts = allCharts
      .filter((chart) => editedChartIds[chart.id])
      .map((chart) => {
        const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
        if (!rawRows.length) return null;

        const processedRows = processRowsForSubmission(rawRows);
        const serialised = JSON.stringify(processedRows);
        return {
          id: chart.id,
          xAxis: serialised,
          datasettime: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    if (!charts.length) {
      toast.error("No data changes detected. Please edit cells before publishing.");
      return;
    }

    try {
      await uploadChartData({ charts }).unwrap();
      setSuccessMode("publish");
      setIsPublishSuccessOpen(true);
      setEditedChartIds({}); // Reset the edited tracking after successful publish
      toast.dismiss();
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed. Please try again.");
    }
  }, [allCharts, localData, editedChartIds, uploadChartData]);

  // ── submit for review (employee panel) ───────────────────────────────────────

  const handleSubmitForReview = useCallback(async () => {
    if (!allCharts.length || !projectId) {
      toast.error("No chart data to submit");
      return;
    }

    const elements = allCharts
      .filter((chart) => editedChartIds[chart.id])
      .map((chart) => {
        const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
        if (!rawRows.length) return null;

        const processedRows = processRowsForSubmission(rawRows);
        const serialised = JSON.stringify(processedRows);
        return {
          chartId: chart.id,
          xAxis: serialised,
          yAxis: serialised,
          zAxis: serialised,
        };
      })
      .filter(Boolean) as {
        chartId: string;
        xAxis: string;
        yAxis: string;
        zAxis: string;
      }[];

    if (!elements.length) {
      toast.error("No data changes detected. Please edit cells before submitting.");
      return;
    }

    try {
      await createEmployeeSubmission({
        information: "Sheet submission from project review",
        submission: "Draft submission for manager review",
        projectId,
        ipAddress,
        elements,
      }).unwrap();
      setSuccessMode("submit");
      setIsPublishSuccessOpen(true);
      setEditedChartIds({});
      toast.dismiss();
    } catch (err: any) {
      toast.error(err?.data?.message || "Submission failed. Please try again.");
    }
  }, [allCharts, localData, projectId, ipAddress, createEmployeeSubmission, editedChartIds]);

  // ── handle preview publish (for employee submission-preview) ───────────────
  // const handlePreviewPublish = useCallback(async () => {
  //   if (!allCharts.length || !projectId) {
  //     toast.error("No chart data to publish");
  //     return;
  //   }

  //   const elements = allCharts
  //     .filter((chart) => editedChartIds[chart.id])
  //     .map((chart) => {
  //       const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
  //       if (!rawRows.length) return null;

  //       const processedRows = processRowsForSubmission(rawRows);
  //       const serialised = JSON.stringify(processedRows);
  //       return {
  //         chartId: chart.id,
  //         xAxis: serialised,
  //         yAxis: serialised,
  //         zAxis: serialised,
  //       };
  //     })
  //     .filter(Boolean) as {
  //       chartId: string;
  //       xAxis: string;
  //       yAxis: string;
  //       zAxis: string;
  //     }[];

  //   if (!elements.length) {
  //     toast.error("No data changes detected. Please edit cells before publishing.");
  //     return;
  //   }

  //   try {
  //     await createEmployeeSubmission({
  //       information: "Updated Preview Submission",
  //       submission: "Draft submission for manager review",
  //       projectId,
  //       ipAddress,
  //       elements,
  //     }).unwrap();
  //     setSuccessMode("publish");
  //     setIsPublishSuccessOpen(true);
  //     setEditedChartIds({}); // Reset the edited tracking after successful publish
  //     toast.dismiss();
  //   } catch (err: any) {
  //     toast.error(err?.data?.message || "Failed to update preview submission.");
  //   }
  // }, [allCharts, localData, editedChartIds, createEmployeeSubmission, projectId, ipAddress]);

  // ── handle update submission data (when status is PREVIEW) ──────────────────
  const handleUpdateSubmissionData = useCallback(async () => {
    if (!allCharts.length || !submissionId) {
      toast.error("No submission found to update.");
      return;
    }

    const elements = allCharts
      .filter((chart) => editedChartIds[chart.id])
      .map((chart) => {
        const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
        if (!rawRows.length) return null;

        const processedRows = processRowsForSubmission(rawRows);
        const serialised = JSON.stringify(processedRows);
        return {
          chartId: chart.id,
          xAxis: serialised,
          yAxis: "[]",
          zAxis: "[]",
          datasettime: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    if (!elements.length) {
      toast.error("No data changes detected. Please edit cells before updating.");
      return;
    }

    try {
      await updateEmployeeSubmissionData({
        submitionId: submissionId,
        data: {
          ipAddress,
          elements,
        },
      }).unwrap();

      setSuccessMode("publish");
      setIsPublishSuccessOpen(true);
      setEditedChartIds({}); // Reset tracking
      toast.success("Submission updated successfully!");
    } catch (err: any) {
      console.error("Update submission error:", err);
      toast.error(err?.data?.message || "Failed to update submission.");
    }
  }, [allCharts, editedChartIds, localData, submissionId, ipAddress, updateEmployeeSubmissionData]);

  // ── handle submit preview directly (without notes modal and with redirect) ──
  const handleSubmitPreviewDirectly = useCallback(async () => {
    if (!allCharts.length || !projectId) {
      toast.error("No chart data to submit");
      return;
    }

    const elements = allCharts
      .filter((chart) => editedChartIds[chart.id])
      .map((chart) => {
        const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
        if (!rawRows.length) return null;

        const processedRows = processRowsForSubmission(rawRows);
        const serialised = JSON.stringify(processedRows);
        return {
          chartId: chart.id,
          xAxis: serialised,
          yAxis: serialised,
          zAxis: serialised,
        };
      })
      .filter(Boolean) as {
        chartId: string;
        xAxis: string;
        yAxis: string;
        zAxis: string;
      }[];

    if (!elements.length) {
      toast.error("No data changes detected. Please edit cells before submitting.");
      return;
    }

    try {
      const res = await createEmployeeSubmission({
        information: "Preview submission",
        submission: "Draft submission for manager review",
        projectId,
        ipAddress,
        elements,
      }).unwrap();

      const submissionId = res?.data?.submission?.id || res?.id;
      if (submissionId) {
        toast.success("Draft created successfully!");
        setEditedChartIds({});
        navigate(`/staff-employee-panel/project-review/submission-preview/${submissionId}/${projectId}`);
      } else {
        toast.error("Failed to retrieve submission ID.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Submission failed. Please try again.");
    }
  }, [allCharts, localData, projectId, ipAddress, createEmployeeSubmission, editedChartIds, navigate]);

  const handleEmployeeSubmission = useCallback(async () => {
    if (!allCharts.length || !projectId) {
      toast.error("No chart data to submit");
      return;
    }

    const elements = allCharts
      .filter((chart) => editedChartIds[chart.id])
      .map((chart) => {
        const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
        if (!rawRows.length) return null;

        const processedRows = processRowsForSubmission(rawRows);
        const serialised = JSON.stringify(processedRows);
        return {
          chartId: chart.id,
          xAxis: serialised,
          yAxis: serialised,
          zAxis: serialised,
        };
      })
      .filter(Boolean) as {
        chartId: string;
        xAxis: string;
        yAxis: string;
        zAxis: string;
      }[];

    if (!elements.length) {
      toast.error("No data changes detected. Please edit cells before submitting.");
      return;
    }

    try {
      await createEmployeeSubmission({
        information: submissionNotes || "Sheet submission from project details",
        submission: "Draft submission for manager review",
        projectId,
        ipAddress,
        elements,
      }).unwrap();
      setIsNoteModalOpen(false);
      setSubmissionNotes("");
      setSuccessMode("submit");
      setIsPublishSuccessOpen(true);
      setEditedChartIds({});
      toast.dismiss();
    } catch (err: any) {
      toast.error(err?.data?.message || "Submission failed. Please try again.");
    }
  }, [allCharts, localData, projectId, ipAddress, createEmployeeSubmission, submissionNotes, editedChartIds]);

  // ── handle resubmit (when status is REJECTED) ──────────────────────────────
  const handleResubmit = useCallback(async () => {
    if (!allCharts.length || !submissionId) {
      toast.error("No submission found to resubmit.");
      return;
    }

    const elements = allCharts
      .filter((chart) => editedChartIds[chart.id])
      .map((chart) => {
        const rawRows = localData[chart.id] ?? parseXAxis(chart.xAxis);
        if (!rawRows.length) return null;

        const processedRows = processRowsForSubmission(rawRows);
        const serialised = JSON.stringify(processedRows);
        return {
          chartId: chart.id,
          xAxis: serialised,
          yAxis: "[]",
          zAxis: "[]",
          datasettime: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    try {
      // First update axis data (if there are edited elements)
      if (elements.length > 0) {
        await updateEmployeeSubmissionData({
          submitionId: submissionId,
          data: {
            ipAddress,
            elements,
          },
        }).unwrap();
      }

      // Next update status to RESUBMITTED
      await updateSubmissionStatus({
        id: submissionId,
        status: {
          status: "RESUBMITTED",
          information: "Resubmitted project review data",
        },
      }).unwrap();

      setSuccessMode("publish");
      setIsPublishSuccessOpen(true);
      setEditedChartIds({}); // Reset tracking
      toast.success("Submission resubmitted successfully!");
    } catch (err: any) {
      console.error("Resubmit error:", err);
      toast.error(err?.data?.message || "Failed to resubmit submission.");
    }
  }, [allCharts, editedChartIds, localData, submissionId, ipAddress, updateEmployeeSubmissionData, updateSubmissionStatus]);

  // Listen to the custom event dispatched from the header
  useEffect(() => {
    const handleTriggerResubmitEvent = () => {
      handleResubmit();
    };
    window.addEventListener("trigger-resubmit", handleTriggerResubmitEvent);
    return () => {
      window.removeEventListener("trigger-resubmit", handleTriggerResubmitEvent);
    };
  }, [handleResubmit]);

  // ── export ──────────────────────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    if (!allCharts.length) {
      toast.error("No data available to export");
      return;
    }

    const XLSX = await import("xlsx/dist/xlsx.mini.min.js");
    const wb = XLSX.utils.book_new();
    let hasData = false;

    allCharts.forEach((chart) => {
      const rows = localData[chart.id] ?? parseXAxis(chart.xAxis);
      if (rows.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const namePrefix = chart.title || chart.name || "Sheet";
        const sheetName = `${namePrefix}_${chart.id}`
          .substring(0, 31)
          .replace(/[:/?*[\]\\]/g, " ");
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        hasData = true;
      }
    });

    if (hasData) {
      const activeChart = filteredCharts[activeSheetIndex];
      const date = new Date().toISOString().split("T")[0];
      const fileName = `${activeChart?.title || "Project_Charts"}_${date}`;
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success("Excel exported successfully");
    } else {
      toast.error("No data available to export");
    }
  }, [allCharts, localData, filteredCharts, activeSheetIndex]);

  const handleCloseSuccess = useCallback(() => {
    setIsPublishSuccessOpen(false);
    // if (successMode === "publish") {
    //   if (pathname.includes("staff-employee-panel")) {
    //     navigate("/staff-employee-panel/project-review");
    //   } else if (pathname.includes("staff-manager-panel")) {
    //     navigate("/staff-manager-panel/project-review");
    //   } else if (pathname.includes("client-panel")) {
    //     navigate("/client-panel/project-review");
    //   }
    // }
  }, [successMode, pathname, navigate]);

  // ── loading skeleton ─────────────────────────────────────────────────────────

  if (leafLoading) {
    return (
      <div className="w-full flex flex-col gap-4 p-6 animate-pulse bg-white rounded-xl border border-border h-[80vh]">
        <div className="h-10 bg-gray-50 rounded w-full border border-border" />
        <div className="flex-1 space-y-2 overflow-hidden">
          {[...Array(15)].map((_, idx) => (
            <div
              key={idx}
              className="h-8 bg-gray-50/50 rounded w-full border border-gray-50"
            />
          ))}
        </div>
        <div className="h-8 bg-gray-100 rounded-b w-full" />
      </div>
    );
  }

  // ── active sheet data ────────────────────────────────────────────────────────

  const activeChart = filteredCharts[activeSheetIndex];
  const activeRows: any[][] = activeChart
    ? (localData[activeChart.id] ?? parseXAxis(activeChart.xAxis))
    : [];

  const maxCols =
    activeRows.length > 0 ? Math.max(...activeRows.map((r) => r.length)) : 10;
  const colHeaders = Array.from({ length: Math.max(maxCols, 15) }, (_, i) =>
    getColLetter(i),
  );
  const rowDisplayCount = Math.max(activeRows.length, 21);

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#f0f0f0] dark:bg-slate-900 rounded-xl shadow-lg border border-gray-300 dark:border-slate-800 overflow-hidden flex flex-col h-[80vh] transition-colors duration-300">
      {/* ── Top Toolbar ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Paperclip size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <FileText size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <MessageSquare size={18} />
            </Button>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Printer size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Share2 size={18} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              size={14}
            />
            <Input
              placeholder="Search anything here..."
              className="pl-9 pr-14 h-9 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 focus:ring-0 focus:border-blue-500 rounded-lg shadow-none text-gray-900 dark:text-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded text-[10px] text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-900 font-medium">
              <span className="text-xs">⌘</span> K
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(!isManagerOrClient || isDraftStatus) && !isEmployeeRole && (
              <Button
                variant="outline"
                className="h-9 gap-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload size={16} className="text-gray-400 dark:text-slate-500" />
                Import
              </Button>
            )}
            {!isEmployeeRole && (
              <Button
                variant="outline"
                className="h-9 gap-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800"
                onClick={handleExport}
              >
                <Download size={16} className="text-gray-500 dark:text-slate-400" />
                Export
              </Button>
            )}
            {/* ── Action button: role-aware ── */}
            {!isReadOnly && isEmployeeReview && (
              <Button
                className="h-9 gap-2 bg-[#7c3aed] hover:bg-violet-700 text-white px-4 shadow-sm transition-all disabled:opacity-60"
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
              >
                <Send size={15} />
                {isSubmitting ? "Submitting…" : "Submit for Review"}
              </Button>
            )}
            {isEmployeeReview && (
              <Button
                disabled={true}
                className="h-9 gap-2 bg-[#16a34a] text-white px-4 shadow-sm opacity-50 cursor-not-allowed"
              >
                <Send size={15} />
                Publish
              </Button>
            )}
            {!isReadOnly && !isEmployeeReview && (
              <Button
                className="h-9 gap-2 bg-[#16a34a] hover:bg-green-700 text-white px-4 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={
                  isSubmissionPreview
                    ? handleUpdateSubmissionData
                    : isEmployeeProjectDetails
                      ? handleSubmitPreviewDirectly
                      : handlePublish
                }
                disabled={isPublishing || isSubmitting || isUpdatingSubmissionData || (isManagerOrClient && !isProjectReview && !isDraftStatus)}
              >
                <Send size={15} />
                {isPublishing || isSubmitting || isUpdatingSubmissionData
                  ? "Processing…"
                  : isSubmissionPreview
                    ? "Update Submission"
                    : isEmployeeProjectDetails
                      ? "Submit for Preview"
                      : "Publish"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white dark:bg-slate-900 overflow-auto relative scrollbar-hide">
        <table className="w-full border-collapse table-fixed select-none">
          <thead>
            <tr>
              {/* Corner */}
              <th className="w-12 h-6 bg-[#E6E6E6] dark:bg-slate-900 border border-[#D4D4D4] dark:border-slate-800 p-0 sticky top-0 left-0 z-30" />
              {colHeaders.map((letter) => (
                <th
                  key={letter}
                  className="w-32 h-6 bg-[#E6E6E6] dark:bg-slate-900 border border-[#D4D4D4] dark:border-slate-800 text-[11px] font-normal text-[#444] dark:text-slate-400 sticky top-0 z-20"
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowDisplayCount }).map((_, rowIndex) => (
              <tr key={rowIndex} className="h-7">
                {/* Row number */}
                <td className="w-12 h-7 bg-[#E6E6E6] dark:bg-slate-900 border border-[#D4D4D4] dark:border-slate-800 text-[11px] font-normal text-[#444] dark:text-slate-400 text-center sticky left-0 z-20 select-none">
                  {rowIndex + 1}
                </td>
                {colHeaders.map((_, colIndex) => {
                  const cellValue = activeRows[rowIndex]?.[colIndex] ?? "";

                  // Header row (row 0) — always locked
                  const isHeaderRow = rowIndex === 0;
                  // First column (col 0) — always locked (label / category column)
                  const isFirstCol = colIndex === 0;
                  // A data row that actually exists in the API payload
                  const hasApiDataRow = rowIndex < activeRows.length;
                  // A column that actually exists within this specific row's data
                  const hasApiDataCol =
                    colIndex < (activeRows[rowIndex]?.length ?? 0);
                  // Only interior cells on real data rows/cols are editable
                  // Also block all editing when the panel is read-only
                  const isEditable =
                    !isReadOnly &&
                    (!isManagerOrClient || isProjectReview || isDraftStatus) &&
                    !isHeaderRow &&
                    !isFirstCol &&
                    hasApiDataRow &&
                    hasApiDataCol &&
                    !!activeChart;

                  return (
                    <td
                      key={colIndex}
                      className={`h-7 border border-[#d4d4d4] dark:border-slate-800 p-0 ${isHeaderRow && cellValue !== ""
                        ? "bg-gray-50 dark:bg-slate-900/50 border-b-2 border-b-gray-300 dark:border-b-slate-700"
                        : isFirstCol && !isHeaderRow && cellValue !== ""
                          ? "bg-gray-50/60 dark:bg-slate-900/30"
                          : ""
                        }`}
                    >
                      <input
                        type="text"
                        className={`w-full h-full px-2 text-[12px] bg-transparent outline-none tabular-nums ${isHeaderRow
                          ? "font-bold text-gray-900 dark:text-slate-100 cursor-default"
                          : isFirstCol
                            ? "font-medium text-gray-700 dark:text-slate-300 cursor-default"
                            : isEditable
                              ? "text-gray-700 dark:text-slate-300 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-1 focus:outline-blue-400 cursor-text"
                              : "text-gray-400 dark:text-slate-500 cursor-default"
                          }`}
                        value={String(cellValue)}
                        readOnly={!isEditable}
                        onChange={
                          isEditable
                            ? (e) =>
                              handleCellChange(
                                activeChart!.id,
                                rowIndex,
                                colIndex,
                                e.target.value,
                              )
                            : undefined
                        }
                        aria-label={`Cell ${getColLetter(colIndex)}${rowIndex + 1}`}
                        aria-readonly={!isEditable}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCharts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 pointer-events-none">
            <div className="text-center">
              <TableIcon size={48} className="mx-auto text-gray-200 dark:text-slate-800 mb-4" />
              <p className="text-gray-400 dark:text-slate-500 font-medium">No chart data found.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Tabs ──────────────────────────────────────────────────────── */}
      <div className="bg-[#E6E6E6] dark:bg-slate-900 border-t border-gray-300 dark:border-slate-800 px-2 flex items-center h-10 shrink-0 select-none overflow-hidden">
        {/* Prev / Next tab navigation */}
        <div className="flex items-center bg-[#DEDEDE] dark:bg-slate-800 border border-gray-400 dark:border-slate-700 rounded-sm px-1 mr-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-30"
            onClick={goToPrevTab}
            disabled={activeSheetIndex === 0}
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-30"
            onClick={goToNextTab}
            disabled={activeSheetIndex >= filteredCharts.length - 1}
          >
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* Tab list */}
        <div
          ref={tabsRef}
          className="flex-1 flex items-center overflow-x-auto scrollbar-hide gap-px scroll-smooth"
        >
          {filteredCharts.map((chart, idx) => {
            const isActive = activeSheetIndex === idx;
            return (
              <div
                key={chart.id}
                onClick={() => setActiveSheetIndex(idx)}
                className={`
                  h-8 min-w-[120px] max-w-[200px] px-4 flex items-center justify-center cursor-pointer transition-all
                  text-[11px] font-medium border-t-2 relative shrink-0
                  ${isActive
                    ? "bg-white dark:bg-slate-900 border-t-[#1D4ED8] dark:border-t-blue-500 text-blue-700 dark:text-blue-400 shadow-sm z-10"
                    : "bg-[#E6E6E6] dark:bg-slate-900 border-t-transparent text-gray-600 dark:text-slate-400 hover:bg-[#F2F2F2] dark:hover:bg-slate-800 border-r border-[#D4D4D4] dark:border-slate-800"
                  }
                `}
              >
                <span className="truncate">
                  {chart.title || chart.name || `Sheet${idx + 1}`}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white z-20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-4 px-4 text-[11px] text-gray-500 dark:text-slate-500 font-medium border-l border-gray-400 dark:border-slate-700 ml-4 h-full shrink-0">
          <span>Ready</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 dark:bg-emerald-600 rounded-full" />
            <span>Accessible</span>
          </div>
        </div>
      </div>

      {/* --- Publish/Submit Success Modal --- */}
      <Dialog
        open={isPublishSuccessOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseSuccess();
          } else {
            setIsPublishSuccessOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] p-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800">
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border ${successMode === "submit" ? "bg-purple-50 border-purple-100" : "bg-green-50 border-green-100"}`}
            >
              {successMode === "submit" ? (
                <Send className="w-8 h-8 text-purple-600" />
              ) : (
                <Radio className="w-8 h-8 text-green-600" />
              )}
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-green-600">
                {successMode === "submit"
                  ? "Submitted for Review!"
                  : "Project Submission Updated!"}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                {successMode === "submit"
                  ? "Your sheet data has been submitted for manager review."
                  : "The project submission data has been successfully updated and published."}
              </p>
            </div>

            <div className="w-full pt-4 space-y-2">
              {/* <Button
                className={`w-full text-white font-medium py-2 rounded-md transition-colors cursor-pointer ${successMode === "submit" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}
                onClick={() => {
                  setIsPublishSuccessOpen(false);
                  const basePath = pathname.includes("staff-manager-panel")
                    ? "/staff-manager-panel/projects"
                    : pathname.includes("client-panel")
                      ? "/client-panel"
                      : "/staff-employee-panel";

                  if (successMode === "publish") {
                    navigate(`${basePath}/project-details/${projectId}`);
                  } else {
                    navigate(`${basePath}/projects`);
                  }
                }}
              >
                {successMode === "publish"
                  ? "Go to Project Details"
                  : "Go to Projects"}
              </Button> */}
              <Button
                variant="default"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-md cursor-pointer"
                onClick={handleCloseSuccess}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Submit Review Note Modal --- */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Submit Review
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Finalize your sheet submission for review. Your data will be analyzed by the management team.
            </p>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Info Section */}
            <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-md border border-border dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Project:</span>
                <span className="text-gray-900 dark:text-slate-100 font-semibold">
                  Theta Analyzer
                </span>
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-200 flex justify-between">
                Admin/Manager Notes
                <span className="text-xs text-gray-400 dark:text-slate-500 font-normal italic">
                  Optional
                </span>
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Share your insights or specific context about this sheet data..."
                className="w-full min-h-[100px] p-3 text-sm border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md text-xs border border-blue-100 dark:border-blue-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>Verify all sheet data before completing submission.</p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md cursor-pointer border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 cursor-pointer"
              onClick={handleEmployeeSubmission}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Complete Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Import File Upload Modal ── */}
      <FileUploadModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        projectId={projectId as string}
        isCustomSubmitLoading={isUpdatingSubmissionData}
        customSubmitHandler={
          isSubmissionPreview
            ? async (chartsPayload) => {
              const elements = chartsPayload.map((chart: any) => {
                const processedRows = parseXAxis(chart.xAxis);
                const serialised = JSON.stringify(processedRows);
                return {
                  chartId: chart.id,
                  xAxis: serialised,
                  yAxis: "[]",
                  zAxis: "[]",
                  datasettime: new Date().toISOString(),
                };
              }).filter(Boolean);

              if (!elements.length) {
                toast.error("No data changes detected.");
                return;
              }

              await updateEmployeeSubmissionData({
                submitionId: submissionId,
                data: {
                  ipAddress,
                  elements,
                },
              }).unwrap();

              setSuccessMode("publish");
              setIsPublishSuccessOpen(true);
              setEditedChartIds({});
              setIsImportModalOpen(false);
            }
            : undefined
        }
      />
    </div>
  );
};

export default SheetTab;
