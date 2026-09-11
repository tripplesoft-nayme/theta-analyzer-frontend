
import { TaskItem, Dep, LinkDragPreview } from "../types/index";
import { buildDepPath } from "../utils/ganttUtils";

interface DepSvgProps {
  tasks: TaskItem[];
  deps: Dep[];
  startDate: Date;
  dayPx: number;
  totalDays: number;
  selectedDepId: string | null;
  onSelect: (id: string) => void;
  onRemoveDep: (id: string) => void;
  linkPreview?: LinkDragPreview | null;
  ROW_H: number;
}
export function DepSvg({
  tasks,
  deps,
  startDate,
  dayPx,
  totalDays,
  selectedDepId,
  onSelect,
  onRemoveDep,
  linkPreview,
  ROW_H
}: DepSvgProps) {
  const totalW = totalDays * dayPx;
  const totalH = tasks.length * ROW_H;
  const getColor = (dep: Dep): string => {
    if (!dep.autoColor) return dep.color || "#378ADD";
    return "#378ADD";
  };
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 5,
        width: totalW,
        height: totalH,
      }}
    >
      <defs>
        <marker
          id="arr-preview"
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#185fa5" />
        </marker>
        {deps.map((dep) => {
          const col = getColor(dep);
          return dep.arrow === "arrow" ? (
            <marker
              key={dep.id}
              id={`arr-${dep.id}`}
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={col} />
            </marker>
          ) : dep.arrow === "dot" ? (
            <marker
              key={dep.id}
              id={`arr-${dep.id}`}
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <circle cx="3" cy="3" r="2.5" fill={col} />
            </marker>
          ) : null;
        })}
      </defs>
      <g style={{ pointerEvents: "all" }}>
        {deps.map((dep) => {
          const pd = buildDepPath(dep, tasks, startDate, dayPx, ROW_H);
          if (!pd) return null;
          const col = getColor(dep),
            w = dep.width || 1.5,
            sel = dep.id === selectedDepId;
          const dashArr =
            dep.style === "dashed"
              ? `${w * 4},${w * 2.5}`
              : dep.style === "dotted"
                ? `${w},${w * 2}`
                : "none";
          return (
            <g key={dep.id}>
              <path
                d={pd.d}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(dep.id)}
                onDoubleClick={() => onRemoveDep(dep.id)}
              />
              {sel && (
                <path
                  d={pd.d}
                  fill="none"
                  stroke={col}
                  strokeWidth={w + 6}
                  opacity={0.15}
                  pointerEvents="none"
                />
              )}
              <path
                d={pd.d}
                fill="none"
                stroke={col}
                strokeWidth={sel ? w + 1 : w}
                strokeDasharray={dashArr}
                opacity={sel ? 1 : 0.9}
                markerEnd={
                  dep.arrow !== "none" ? `url(#arr-${dep.id})` : undefined
                }
                pointerEvents="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </g>
      {linkPreview && (
        <line
          x1={linkPreview.fromX}
          y1={linkPreview.fromY}
          x2={linkPreview.toX}
          y2={linkPreview.toY}
          stroke="#185fa5"
          strokeWidth="1.5"
          strokeDasharray="6,3"
          opacity="0.8"
          markerEnd="url(#arr-preview)"
          pointerEvents="none"
        />
      )}
    </svg>
  );
}
