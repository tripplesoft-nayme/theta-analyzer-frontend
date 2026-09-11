import { X } from "lucide-react";
import { SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

interface RightSidebarProps {
  activeWidgetInfo: any;
  setActiveWidgetInfo: (info: any) => void;
}

export default function RightSidebar({ activeWidgetInfo, setActiveWidgetInfo }: RightSidebarProps) {
  // `visible` tracks whether the sidebar is mounted in the DOM (delayed removal for outro)
  const [visible, setVisible] = useState(false);
  // `isOpen` drives the CSS transform — true = fully slid in
  const [isOpen, setIsOpen] = useState(false);
  // Snapshot of the last non-null info so content doesn't vanish mid-outro
  const [displayInfo, setDisplayInfo] = useState<any>(null);

  useEffect(() => {
    if (activeWidgetInfo) {
      // Update snapshot immediately so content is ready before animating in
      setDisplayInfo(activeWidgetInfo);
      setVisible(true);
      // Tick delay lets the browser paint the initial off-screen state before transitioning
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsOpen(true));
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      // Start outro animation
      setIsOpen(false);
      // Remove from DOM after the transition completes (300 ms matches duration-300)
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeWidgetInfo]);

  if (!visible) return null;

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={isOpen ? "expanded" : "collapsed"}
      data-side="right"
      data-slot="sidebar"
    >
      {/* 1. Gap Div — width animates with the sidebar */}
      <div
        data-slot="sidebar-gap"
        className="relative bg-transparent shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: isOpen ? "296px" : "0px" }}
      />

      {/* 2. Fixed Sidebar Container — slides in/out from the right */}
      <div
        data-slot="sidebar-container"
        className="fixed inset-y-0 right-0 z-40 hidden h-svh w-[296px] md:flex border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col px-6 py-8 space-y-6"
        >
          {/* Header */}
          <SidebarHeader className="bg-white dark:bg-slate-900 px-0 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-start justify-between shrink-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 pr-2 leading-tight">
              {displayInfo?.name}
            </h3>
            <button
              onClick={() => setActiveWidgetInfo(null)}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg outline-none shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </SidebarHeader>

          {/* Content */}
          <SidebarContent className="bg-white dark:bg-slate-900 px-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 pr-1">
            <div className="space-y-6 pt-2">
              {/* Description */}
              {displayInfo?.chartInfo?.description && (
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                  {displayInfo.chartInfo.description}
                </p>
              )}

              {/* Details List */}
              <div className="space-y-6">
                {/* Type */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Type
                  </span>
                  <span className="text-sm text-gray-800 dark:text-slate-200">
                    {displayInfo?.chartInfo?.primaryDataType || "N/A"}
                  </span>
                </div>

                {/* Best For */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Best For
                  </span>
                  <span className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                    {displayInfo?.chartInfo?.bestUsedFor || "N/A"}
                  </span>
                </div>

                {/* Use Cases */}
                {displayInfo?.chartInfo?.useCases?.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                      Use Cases
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-sm text-gray-800 dark:text-slate-200">
                      {displayInfo.chartInfo.useCases.map((uc: string, i: number) => (
                        <li key={i} className="leading-relaxed">
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accepts */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Accepts
                  </span>
                  <span className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                    {displayInfo?.chartInfo?.dataAccepted?.join(", ") || "N/A"}
                  </span>
                </div>

                {/* Processes */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Processes
                  </span>
                  <span className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                    {displayInfo?.chartInfo?.processes || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </SidebarContent>
        </div>
      </div>
    </div>
  );
}
