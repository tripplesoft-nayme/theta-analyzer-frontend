import React from "react";

export interface CaptureProgress {
  status: "capturing" | "generating" | "success" | "error";
  current?: number;
  total?: number;
}

export interface CaptureOptions {
  elementId: string;
  isDark: boolean;
  projectName?: string;
  programName?: string;
  formattedDate: string;
  onProgress: (progress: CaptureProgress) => void;
}

export async function generateClientDashboardPdf({
  elementId,
  isDark,
  projectName,
  programName,
  formattedDate,
  onProgress,
}: CaptureOptions): Promise<Blob> {
  const html2canvas = (await import("html2canvas-pro")).default;
  const { pdf } = await import("@react-pdf/renderer");
  const ClientDashboardPdf = (await import("../ClientDashboardPdf")).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Capture area container element not found");
  }

  const widgets = (Array.from(element.querySelectorAll(`#${elementId} .grid > div`)) as HTMLElement[])
    .filter((w) => w.id !== "files-preview-widget" && w.id !== "media-widget");

  if (widgets.length === 0) {
    throw new Error("No charts found on the dashboard to export");
  }

  const items: { img: string; width: number; height: number }[] = [];

  for (let i = 0; i < widgets.length; i++) {
    const widget = widgets[i];
    onProgress({ status: "capturing", current: i + 1, total: widgets.length });

    // Ensure the widget has a unique ID so we can query it inside the cloned document
    const originalId = widget.id;
    const tempId = originalId || `temp_widget_capture_${i}`;
    if (!originalId) {
      widget.id = tempId;
    }

    const canvas = await html2canvas(widget, {
      scale: 2, // High resolution crisp scaling
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: isDark ? "#0f172a" : "#ffffff", // Match card colors
      windowWidth: document.documentElement.clientWidth, // Match active screen width to preserve full widescreen layouts
      windowHeight: document.documentElement.clientHeight, // Match active screen height
      onclone: (clonedDoc) => {
        const clonedWidget = clonedDoc.getElementById(tempId);
        if (clonedWidget) {
          // Hide interactive action link footers ("Click chart to view child tier") inside THIS cloned widget only
          const childFooters = clonedWidget.querySelectorAll(".mt-4.text-center.shrink-0");
          childFooters.forEach((el) => {
            (el as HTMLElement).style.setProperty("display", "none", "important");
          });

          // Remove outer borders inside THIS cloned widget only for a modern borderless flat-card look
          const borderedElements = clonedWidget.querySelectorAll(".border, .border-gray-200, .dark\\:border-slate-800");
          borderedElements.forEach((el) => {
            (el as HTMLElement).style.setProperty("border", "none", "important");
            (el as HTMLElement).style.setProperty("border-width", "0px", "important");
            (el as HTMLElement).style.setProperty("border-color", "transparent", "important");
            (el as HTMLElement).style.setProperty("box-shadow", "none", "important");
          });

          // Fix margin collapse and add luxurious internal chart padding (top, left, right) inside THIS cloned widget only
          const cardContents = clonedWidget.querySelectorAll(".flex-1.w-full.min-h-0");
          cardContents.forEach((el) => {
            (el as HTMLElement).style.setProperty("padding-top", "24px", "important");
            (el as HTMLElement).style.setProperty("padding-left", "24px", "important");
            (el as HTMLElement).style.setProperty("padding-right", "24px", "important");
          });

          // Specifically for the Project Information card: increase row vertical padding dynamically and remove horizontal padding
          if (tempId === "project-info-table") {
            const tableRows = clonedWidget.querySelectorAll(".flex.items-center.justify-between");
            const rowCount = tableRows.length;

            // Calculate dynamic vertical padding based on the number of rows to guarantee perfect single-page fit
            let verticalPadding = "18px";
            if (rowCount > 10) {
              verticalPadding = "8px";
            } else if (rowCount > 7) {
              verticalPadding = "12px";
            } else if (rowCount > 5) {
              verticalPadding = "16px";
            }

            tableRows.forEach((row) => {
              (row as HTMLElement).style.setProperty("padding-top", verticalPadding, "important");
              (row as HTMLElement).style.setProperty("padding-bottom", verticalPadding, "important");
              (row as HTMLElement).style.setProperty("padding-left", "18px", "important");
              (row as HTMLElement).style.setProperty("padding-right", "18px", "important");
            });
          }
        }
      }
    });

    // Restore original ID if we set a temporary one to keep the DOM completely clean
    if (!originalId) {
      widget.removeAttribute("id");
    }

    const imgData = canvas.toDataURL("image/png");
    // Convert screen pixels to PDF points (1 pixel = 0.75 points)
    const pdfWidth = widget.clientWidth * 0.75;
    const pdfHeight = widget.clientHeight * 0.75;

    items.push({
      img: imgData,
      width: pdfWidth,
      height: pdfHeight,
    });
  }

  onProgress({ status: "generating" });

  // Render client dashboard PDF document to a React-PDF blob in memory
  const docInstance = React.createElement(ClientDashboardPdf, {
    items,
    isDark,
    projectName,
    programName,
    formattedDate,
  });

  const blob = await pdf(docInstance as any).toBlob();
  return blob;
}
