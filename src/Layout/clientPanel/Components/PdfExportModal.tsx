import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Download, BarChart2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/Common/theme-provider";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfExportProgress {
  status: "idle" | "capturing" | "generating" | "success" | "error";
  current?: number;
  total?: number;
  pdfUrl: string | null;
  errorMsg?: string;
}

interface PdfExportModalProps {
  isOpen: boolean;
  progress: PdfExportProgress;
  onClose: (open: boolean) => void;
  onDownload: () => void;
  onView: () => void;
  onRetry: () => void;
}

// ─── Mini Doc Card ─────────────────────────────────────────────────────────────

interface MiniDocInnerProps {
  done?: boolean;
}

const MiniDocInner = ({ done }: MiniDocInnerProps) => {
  return (
    <div
      className={`rounded-sm border w-9 h-[46px] flex flex-col justify-between p-1 shadow-sm transition-colors ${done
        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30"
        : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-500/20"
        }`}
    >
      <div className="flex flex-col gap-[3px] pt-1">
        {[100, 70, 85].map((w, i) => (
          <div
            key={i}
            className={`h-[2px] rounded-full ${done
              ? "bg-emerald-300/60 dark:bg-emerald-500/30"
              : "bg-indigo-300/60 dark:bg-indigo-500/30"
              }`}
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      {done && (
        <div className="flex justify-center pb-0.5">
          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
            ✓
          </span>
        </div>
      )}
    </div>
  );
};

// Queued doc — plain wrapper with stack offset
const QueuedDoc = ({ index }: { index: number }) => (
  <div
    className="absolute"
    style={{ bottom: index * 4, left: index * 3, zIndex: index }}
  >
    <MiniDocInner done={false} />
  </div>
);

// Done doc — motion wrapper so newest card springs in from above
const DoneDoc = ({
  index,
  isNewest,
}: {
  index: number;
  isNewest: boolean;
}) => (
  <m.div
    className="absolute"
    style={{ bottom: index * 4, left: index * 3, zIndex: index, position: "absolute" }}
    initial={isNewest ? { y: -20, scale: 0.6, opacity: 0 } : false}
    animate={{ y: 0, scale: 1, opacity: 1 }}
    transition={
      isNewest
        ? { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } // spring overshoot
        : { duration: 0 }
    }
  >
    <MiniDocInner done />
  </m.div>
);

// ─── Arrow Connector ──────────────────────────────────────────────────────────

const ArrowConnector = ({ active }: { active: boolean }) => (
  <div className="flex items-center gap-0.5">
    {[0, 1, 2].map((i) => (
      <m.div
        key={i}
        className={`font-black leading-none select-none text-xl ${active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-300 dark:text-slate-700"
          }`}
        animate={active ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.3 }}
        transition={
          active
            ? { duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        ›
      </m.div>
    ))}
  </div>
);

// ─── Flying Document ──────────────────────────────────────────────────────────

interface FlyingDocProps {
  chartKey: number;
}

const FlyingDoc = ({ chartKey }: FlyingDocProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bgKeyframes = isDark
    ? [
      "rgba(30,27,75,0.95)",
      "rgba(30,27,75,0.95)",
      "rgba(30,27,75,0.95)",
      "rgba(6,78,59,0.95)",
      "rgba(6,78,59,0.95)",
      "rgba(6,78,59,0.95)",
    ]
    : [
      "rgba(238,242,255,0.95)",
      "rgba(238,242,255,0.95)",
      "rgba(238,242,255,0.95)",
      "rgba(209,250,229,0.95)",
      "rgba(209,250,229,0.95)",
      "rgba(209,250,229,0.95)",
    ];

  const borderKeyframes = isDark
    ? [
      "rgba(99,102,241,0.9)",
      "rgba(99,102,241,0.9)",
      "rgba(99,102,241,0.9)",
      "rgba(16,185,129,0.9)",
      "rgba(16,185,129,0.9)",
      "rgba(16,185,129,0.9)",
    ]
    : [
      "rgba(79,70,229,0.8)",
      "rgba(79,70,229,0.8)",
      "rgba(79,70,229,0.8)",
      "rgba(5,150,105,0.8)",
      "rgba(5,150,105,0.8)",
      "rgba(5,150,105,0.8)",
    ];

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={chartKey}
        className="absolute top-1/2 left-1/2 z-20 pointer-events-none rounded-sm border-2 shadow-lg flex flex-col p-1 gap-1 overflow-hidden"
        style={{
          width: 32,
          height: 42,
          marginLeft: -16,
          marginTop: -21,
          boxShadow: "0 0 14px rgba(99,102,241,0.4), 0 4px 12px rgba(0,0,0,0.3)",
        }}
        initial={{ x: -118, scaleX: 1, scaleY: 1, opacity: 0 }}
        animate={{
          x: [-118, -55, 0, 55, 113, 118],
          scaleX: [1.0, 0.95, 0.5, 0.95, 1.05, 0.8],
          scaleY: [1.0, 0.85, 0.35, 0.85, 1.05, 0.8],
          opacity: [0, 1, 1, 1, 1, 0],
          backgroundColor: bgKeyframes,
          borderColor: borderKeyframes,
        }}
        transition={{
          duration: 1.6,
          ease: "easeInOut",
          times: [0, 0.18, 0.5, 0.78, 0.91, 1.0],
          repeat: 0,
        }}
      >
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Chart info - active at start, fades out after center */}
          <m.div
            className="w-full h-full flex flex-col gap-1"
            animate={{
              opacity: [1, 1, 1, 0, 0, 0],
            }}
            transition={{
              duration: 1.6,
              ease: "easeInOut",
              times: [0, 0.18, 0.5, 0.78, 0.91, 1.0],
            }}
          >
            {/* Header row: chart number + icon */}
            <div className="w-full flex justify-between items-center h-2 overflow-hidden">
              <span className="text-[6px] font-extrabold leading-none text-indigo-600 dark:text-indigo-400">
                #{chartKey}
              </span>
              <BarChart2 className="w-[8px] h-[8px] text-indigo-600 dark:text-indigo-400" />
            </div>
            {/* Data lines */}
            <div className="flex flex-col gap-[3px] mt-1">
              {[100, 75, 55].map((w, i) => (
                <div
                  key={i}
                  className="h-[2px] rounded-full bg-indigo-300/50 dark:bg-indigo-500/40"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </m.div>

          {/* Processed state (Green CheckCircle) - invisible at start, emerges at yellow mark */}
          <m.div
            className="absolute inset-0 flex flex-col items-center justify-center p-1"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0, 0, 1, 1, 0],
            }}
            transition={{
              duration: 1.6,
              ease: "easeInOut",
              times: [0, 0.18, 0.5, 0.78, 0.91, 1.0],
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="text-[5px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              DONE
            </span>
          </m.div>
        </div>
      </m.div>
    </AnimatePresence>
  );
};

// ─── Pipeline Stage ───────────────────────────────────────────────────────────

interface PipelineStageProps {
  current: number;
  total: number;
  animKey: number;
}

const PipelineStage = ({ current, total, animKey }: PipelineStageProps) => {
  const done = Math.max(0, current - 1);
  const remaining = Math.max(0, total - current);
  const doneCount = Math.min(done, 4);
  const remainingCount = Math.min(remaining, 4);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Stage graphic - Instant Tailwind theme support */}
      <div className="w-full flex items-center justify-between rounded-lg px-4 py-5 relative overflow-hidden select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 min-h-[140px]">
        {/* LEFT — Chart queue Card */}
        <div className="flex flex-col items-center gap-2 z-10 px-3.5 py-3 rounded-lg border bg-white/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-850/60 shadow-sm min-w-[80px]">
          <div className="relative" style={{ width: 44, height: 54 }}>
            {remainingCount > 0
              ? Array.from({ length: remainingCount }).map((_, i) => (
                <QueuedDoc key={i} index={i} />
              ))
              : (
                <div className="w-9 h-11 rounded-sm border border-dashed border-slate-200 dark:border-slate-800" />
              )
            }
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Charts
          </span>
        </div>

        {/* CENTER — Arrows + Flying doc */}
        <div className="relative flex items-center justify-center z-10" style={{ width: 80 }}>
          <ArrowConnector active />
          <FlyingDoc chartKey={animKey} />
        </div>

        {/* RIGHT — PDF output Card */}
        <div className="flex flex-col items-center gap-2 z-10 px-3.5 py-3 rounded-lg border bg-white/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-850/60 shadow-sm min-w-[80px]">
          <div className="relative" style={{ width: 44, height: 54 }}>
            {doneCount > 0
              ? Array.from({ length: doneCount }).map((_, i) => (
                <DoneDoc
                  key={i}
                  index={i}
                  isNewest={i === doneCount - 1}
                />
              ))
              : (
                <div className="w-9 h-11 rounded-sm border border-dashed border-slate-200 dark:border-slate-800" />
              )
            }
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            PDF
          </span>
        </div>
      </div>

      {/* Counters — dynamic X of Y */}
      <div className="flex items-center justify-between text-[10px] px-1 text-slate-500 dark:text-slate-400 font-medium">
        <span>{remaining > 0 ? `${remaining} chart${remaining !== 1 ? "s" : ""} remaining` : "All charts captured"}</span>
        <span>{done} of {total} processed</span>
      </div>
    </div>
  );
};

// ─── Generating Indicator ─────────────────────────────────────────────────────

const GeneratingIndicator = ({ total }: { total: number }) => {
  return (
    <div className="w-full flex items-center justify-center rounded-lg px-4 py-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 min-h-[100px]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: 36, height: 46 }}>
            {Array.from({ length: Math.min(total, 4) }).map((_, i) => (
              <DoneDoc key={i} index={i} isNewest={false} />
            ))}
          </div>
          <m.div
            animate={{ x: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            className="text-indigo-600 dark:text-indigo-400 font-black text-xl"
          >
            ›
          </m.div>
          <div className="p-2 rounded-md border bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50">
            <FileText className="w-7 h-7 text-rose-500 dark:text-rose-400" />
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
          Compiling {total} charts into PDF
        </span>
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ percent, pulsing }: { percent: number; pulsing?: boolean }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
    {pulsing ? (
      <m.div
        className="h-full bg-indigo-500 rounded-full"
        animate={{ width: ["55%", "90%", "65%", "95%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    ) : (
      <m.div
        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    )}
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

const PdfExportModal = ({
  isOpen,
  progress,
  onClose,
  onDownload,
  onView,
  onRetry,
}: PdfExportModalProps) => {
  // Remount FlyingDoc on every chart change for a clean one-shot animation
  const [animKey, setAnimKey] = useState(1);
  const prevCurrentRef = useRef(progress.current);

  useEffect(() => {
    if (
      progress.status === "capturing" &&
      progress.current !== prevCurrentRef.current
    ) {
      prevCurrentRef.current = progress.current;
      setAnimKey((k) => k + 1);
    }
  }, [progress.current, progress.status]);

  const current = progress.current ?? 1;
  // Hold onto the last known total so it doesn't reset to 1 during "generating" phase
  const lastTotalRef = useRef(progress.total ?? 1);
  if (progress.total) lastTotalRef.current = progress.total;
  const total = lastTotalRef.current;
  const percent = Math.round((current / total) * 100);

  const isCapturing = progress.status === "capturing";
  const isGenerating = progress.status === "generating";
  const isSuccess = progress.status === "success";
  const isError = progress.status === "error";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={isSuccess || isError}
        className="max-w-sm w-[95vw] sm:w-full p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xl"
      >
        <LazyMotion features={domAnimation}>
          {/* Header */}
          <DialogHeader className="items-center flex flex-col gap-0.5 mb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {isCapturing && "Processing Charts"}
              {isGenerating && "Generating PDF"}
              {isSuccess && "Report Ready"}
              {isError && "Export Failed"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {isCapturing && `Processing chart ${current} of ${total}`}
              {isGenerating && `Assembling ${total} chart${total !== 1 ? "s" : ""} into PDF…`}
              {isSuccess && `${total} chart${total !== 1 ? "s" : ""} compiled into PDF successfully.`}
              {isError && "Something went wrong during export."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">

            {/* Capturing */}
            {isCapturing && (
              <>
                {/* Pass real current index for accurate stack counts; animKey triggers FlyingDoc remount */}
                <PipelineStage current={current} total={total} animKey={animKey} />
                <div className="flex flex-col gap-1.5">
                  <ProgressBar percent={percent} />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>Converting chart {current} of {total} to PDF</span>
                    <span>{percent}%</span>
                  </div>
                </div>
              </>
            )}

            {/* Generating */}
            {isGenerating && (
              <>
                <GeneratingIndicator total={total} />
                <div className="flex flex-col gap-1.5">
                  <ProgressBar percent={100} pulsing />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>Assembling final document</span>
                    <m.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                      ●●●
                    </m.span>
                  </div>
                </div>
              </>
            )}

            {/* Success */}
            {isSuccess && (
              <m.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-xl" />
                  <div className="relative p-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/60 dark:bg-green-950/15">
                    <FileText className="w-14 h-14 text-green-600 dark:text-green-500" />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={onDownload}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-500/15"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={onView}
                    className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 font-medium text-sm rounded-md border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View in Browser
                  </button>
                </div>
              </m.div>
            )}

            {/* Error */}
            {isError && (
              <m.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl" />
                  <div className="relative p-3 rounded-full border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/10">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </div>
                </div>
                {progress.errorMsg && (
                  <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 p-3 rounded-md w-full">
                    {progress.errorMsg}
                  </p>
                )}
                <div className="w-full flex gap-2">
                  <button
                    onClick={() => onClose(false)}
                    className="flex-1 py-2.5 px-3 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onRetry}
                    className="flex-1 py-2.5 px-3 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </m.div>
            )}

          </div>
        </LazyMotion>
      </DialogContent>
    </Dialog>
  );
};

export default PdfExportModal;
