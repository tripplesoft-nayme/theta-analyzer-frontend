import { useState, useCallback, useRef } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

// Common Imports
import { BaseChartProps } from "../Common/chartTypes";
import BaseChartContainer from "../Common/BaseChartContainer";

/* ---------- TYPES ---------- */

export type TreeDataNode = {
  id: string;
  name: string;
  value1: number; // Target Value (Bold)
  value2: number; // Progress Value (Bar)
  value1Label?: string; // e.g. "Target"
  value2Label?: string; // e.g. "Achieved"
  color?: string; // Custom color for the node's progress bar
  highlight?: boolean; // For highlighting "best" path
  children?: TreeDataNode[];
};

type Props = BaseChartProps & {
  data?: TreeDataNode; // Start with a root node
};

/* ---------- DUMMY DATA GENERATOR ---------- */
// Helper to generate sample tree if no data provided
const generateSampleTree = (): TreeDataNode => ({
  id: "root",
  name: "Total Sales",
  value1: 1000000,
  value2: 700000,
  children: [
    {
      id: "region-na",
      name: "North America",
      value1: 600000,
      value2: 400000,
      children: [
        { id: "usa", name: "USA", value1: 450000, value2: 300000 },
        { id: "canada", name: "Canada", value1: 150000, value2: 100000 },
      ],
    },
    {
      id: "region-eu",
      name: "Europe",
      value1: 300000,
      value2: 150000,
      children: [
        { id: "uk", name: "UK", value1: 120000, value2: 60000 },
        { id: "germany", name: "Germany", value1: 100000, value2: 50000 },
        { id: "france", name: "France", value1: 80000, value2: 40000 },
      ],
    },
    { id: "region-asia", name: "Asia", value1: 100000, value2: 50000 },
  ],
});

const formatSmartValue = (val: number) => {
  if (val === 0) return "0";
  // Only use compact notation if it's round (multiple of 1000)
  if (val >= 1000 && val % 1000 === 0) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(val);
  }
  // Otherwise show exact localized value (e.g., 999,996)
  return val.toLocaleString();
};

/* ---------- NODE COMPONENTS ---------- */

const TreeNode = ({
  node,
  depth = 0,
  // maxValue,
  v1Label = "Target",
  v2Label = "Achieved",
}: {
  node: TreeDataNode;
  depth: number;
  maxValue: number;
  v1Label?: string;
  v2Label?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Percentage bar width relative to the node's own Target (value1)
  const barPercentage =
    (node.value1 || 0) > 0
      ? Math.min(((node.value2 || 0) / (node.value1 || 1)) * 100, 100)
      : 0;

  // Sibling context: relative to parent's value1
  // const parentRelativePercentage =
  //   (maxValue || 0) > 0
  //     ? Math.min(((node.value1 || 0) / (maxValue || 1)) * 100, 100)
  //     : 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2 relative group">
        {/* Connector Line (Vertical) */}
        {depth > 0 && (
          <div
            className="absolute -left-4 top-1/2 w-4 h-px bg-gray-300 dark:bg-slate-700"
            style={{ transform: "translateY(-50%)" }}
          />
        )}

        {/* Node Card */}
        <div
          className={`
                relative flex items-center justify-between min-w-[200px] p-3 
                bg-white dark:bg-slate-900 border rounded shadow-sm hover:shadow-md transition-shadow
                ${node.highlight ? "border-blue-500 ring-1 ring-blue-100 dark:ring-blue-900/30" : "border-gray-200 dark:border-slate-800"}
            `}
        >
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider truncate mb-1">
              {node.name}
            </p>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 dark:text-slate-500 font-bold uppercase leading-none mb-0.5">
                  {v1Label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900 dark:text-slate-100 leading-none">
                    {formatSmartValue(node.value1 || 0)}
                  </span>
                  <span className="text-[9px] text-blue-500 dark:text-blue-400 font-bold">
                    (
                    {((node.value1 || 0) > 0
                      ? ((node.value2 || 0) / (node.value1 || 1)) * 100
                      : 0
                    ).toFixed(0)}
                    %)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Bar Area */}
            <div className="flex items-center gap-2 mt-1.5 min-w-0">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      node.color || (node.highlight ? "#3b82f6" : "#9ca3af"),
                  }}
                />
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[8px] text-gray-400 dark:text-slate-500 font-bold uppercase leading-none mb-0.5">
                  {v2Label}
                </span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 whitespace-nowrap leading-none">
                  {formatSmartValue(node.value2 || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Header Icon - Only if children exist */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="ml-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
        </div>

        {/* Expand Trigger (Right side connector) */}
        {hasChildren && isExpanded && <div className="w-8 h-px bg-gray-300 dark:bg-slate-700" />}
      </div>

      {/* Children Container */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col ml-8 pl-4 border-l border-gray-300 dark:border-slate-700 space-y-2 relative"
          >
            {node.children!.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                maxValue={node.value1}
                v1Label={v1Label}
                v2Label={v2Label}
              /> // pass parent value1 as max for relative %
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------- MAIN COMPONENT ---------- */

export default function DecompositionTreeChart(props: Props) {
  const { data } = props;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ---------- ZOOM & PAN HANDLERS ---------- */
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (containerRef.current) {
      containerRef.current.removeEventListener("wheel", handleWheelEvent);
    }
    containerRef.current = node;
    if (node) {
      node.addEventListener("wheel", handleWheelEvent, { passive: false });
    }
  }, []);

  const handleWheelEvent = useCallback((e: WheelEvent) => {
    // Prevent dashboard or modal from scrolling
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setScale((prev) => {
      const next = prev * delta;
      return Math.min(Math.max(next, 0.4), 3);
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Very important to stop both bubble-up and default native drag behavior
      e.stopPropagation();
      e.preventDefault();

      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position.x, position.y],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart.x, dragStart.y],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => setScale((prev) => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev * 0.8, 0.4));

  const handleResetZoom = () => {
    if (containerRef.current && contentRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const content = contentRef.current.getBoundingClientRect();

      // Get unscaled dimensions
      const unscaledWidth = content.width / scale;
      const unscaledHeight = content.height / scale;

      const scaleX = (container.width - 60) / unscaledWidth;
      const scaleY = (container.height - 60) / unscaledHeight;

      const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.2);

      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const sampleGenerator = () => generateSampleTree();

  const getTierLegends = (tier: any) => {
    return (tier?.widgets || []).map((w: any) => ({
      label: w.legendName || w.label,
      field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
      color: w.color,
    }));
  };

  const parseTierData = (
    xAxis: any | string,
    _legendValues: any[],
    _widgetTitle: string,
  ) => {
    const data = typeof xAxis === "string" ? JSON.parse(xAxis) : xAxis;
    return {
      labels: [], // Trees don't use standard labels
      data: data,
    };
  };

  return (
    <BaseChartContainer
      {...props}
      xAxis={data || props.xAxis}
      category="DECOMPOSITION_TREE"
      showLegend={false}
      disableAddTier={true}
      excelType="barChart" // Generic for now
      generatorFunc={sampleGenerator}
      getTierLegends={getTierLegends}
      parseTierData={parseTierData}
      renderChildChart={(tier, childProps) => (
        <DecompositionTreeChart
          {...childProps}
          key={tier.id}
          data={
            typeof tier.xAxis === "string" ? JSON.parse(tier.xAxis) : tier.xAxis
          }
        />
      )}
    >
      {() => {
        // Use provided data, otherwise fallback to a generic sample
        const treeData = data || generateSampleTree();

        return (
          <LazyMotion features={domAnimation}>
            <div
              className="relative w-full h-full bg-gray-50 dark:bg-slate-900 border border-border dark:border-slate-800 rounded overflow-hidden"
              onClick={(e) => e.stopPropagation()} // BLOCK MAPPING MODAL FROM OPENING
            >
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-200 dark:border-slate-800 p-2 text-gray-600 dark:text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetZoom();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Reset Zoom"
                >
                  <Maximize2 size={18} />
                </button>
              </div>

              {/* Zoomable/Pannable Container */}
              <div
                ref={setContainerRef}
                className={`w-full h-full select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ touchAction: "none" }}
                draggable="false"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDragStart={(e) => e.preventDefault()}
              >
                <div
                  className={`p-6 w-fit ${!isDragging ? "transition-transform duration-100" : ""}`}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: "0 0",
                  }}
                  ref={contentRef}
                >
                  <TreeNode
                    node={treeData}
                    depth={0}
                    maxValue={treeData.value1 || 1}
                    v1Label={treeData.value1Label}
                    v2Label={treeData.value2Label}
                  />
                </div>
              </div>
            </div>
          </LazyMotion>
        );
      }}
    </BaseChartContainer>
  );
}
