import { useMemo, useState } from "react";
import { TaskItem, Dep } from "../types/index";

interface LinkPanelProps {
  tasks: TaskItem[];
  deps: Dep[];
  selectedDepId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (from: number, to: number) => void;
  onStyleChange: (patch: Partial<Dep>) => void;
}
export function LinkPanel({
  tasks,
  deps,
  selectedDepId,
  onSelect,
  onRemove,
  onAdd,
}: LinkPanelProps) {
  const nonGroup = useMemo(() => tasks.filter((t) => !t.group), [tasks]);
  const [fromId, setFromId] = useState<number>(nonGroup[0]?.id ?? 0);
  const [toId, setToId] = useState<number>(nonGroup[1]?.id ?? 0);
  return (
    <div className="border-t border-[color:var(--gc-border-s)] p-3.5 bg-[color:var(--gc-bg-p)]">
      <p className="text-[13px] font-medium text-[color:var(--gc-text-p)] mb-2.5">
        Dependency links
      </p>
      <div className="flex flex-col gap-1 max-h-36 overflow-y-auto mb-2">
        {deps.length === 0 && (
          <span className="text-[12px] text-[color:var(--gc-text-t)] py-1">
            No dependencies yet.
          </span>
        )}
        {deps.map((dep) => {
          const fromT = tasks.find((t) => t.id === dep.from),
            toT = tasks.find((t) => t.id === dep.to),
            sel = dep.id === selectedDepId;
          const swatch = "#378ADD";
          return (
            <div
              key={dep.id}
              onClick={() => onSelect(dep.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[12px] cursor-pointer transition-colors ${sel ? "border-[color:var(--gc-border-info)] bg-[color:var(--gc-bg-info)]" : "border-[color:var(--gc-border-t)] hover:bg-[color:var(--gc-bg-s)]"}`}
            >
              <svg
                width="22"
                height="10"
                viewBox="0 0 22 10"
                className="flex-shrink-0"
              >
                <line
                  x1="0"
                  y1="5"
                  x2="16"
                  y2="5"
                  stroke={swatch}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={
                    dep.style === "dashed"
                      ? "4,2.5"
                      : dep.style === "dotted"
                        ? "1.5,2"
                        : "none"
                  }
                />
                <path d="M13,2 L18,5 L13,8" fill={swatch} stroke="none" />
              </svg>
              <span className="text-[color:var(--gc-text-s)] text-[11px]">
                {fromT?.name ?? "?"}
              </span>
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                className="flex-shrink-0 text-[color:var(--gc-text-t)]"
              >
                <path
                  d="M0,4 L8,4 M5,1 L9,4 L5,7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              <span className="text-[color:var(--gc-text-p)] text-[11px]">
                {toT?.name ?? "?"}
                {dep.lag ? ` +${dep.lag}d` : ""}
              </span>
              <span
                className="ml-auto text-[11px] text-red-600 px-1 cursor-pointer  "
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(dep.id);
                }}
              >
                remove
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 items-center mb-1">
        <select
          value={fromId}
          onChange={(e) => setFromId(Number(e.target.value))}
          className="flex-1 h-8 px-2 border border-[color:var(--gc-border-s)] rounded-lg text-[12px] bg-[color:var(--gc-bg-p)] text-[color:var(--gc-text-p)] cursor-pointer"
        >
          {nonGroup.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span className="text-[12px] text-[color:var(--gc-text-s)]">→</span>
        <select
          value={toId}
          onChange={(e) => setToId(Number(e.target.value))}
          className="flex-1 h-8 px-2 border border-[color:var(--gc-border-s)] rounded-lg text-[12px] bg-[color:var(--gc-bg-p)] text-[color:var(--gc-text-p)] cursor-pointer"
        >
          {nonGroup.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => onAdd(fromId, toId)}
          className="text-[12px] px-3 py-1.5 border-none rounded-lg bg-[#185fa5] text-white cursor-pointer font-medium hover:bg-[#0c447c] transition-colors"
        >
          + Add link
        </button>
      </div>
    </div>
  );
}
