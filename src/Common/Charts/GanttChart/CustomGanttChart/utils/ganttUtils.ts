import { TaskItem, Dep } from "../types/index";

const DAY_MS = 86_400_000;

export function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function off(days: number): Date {
  const d = getToday();
  d.setDate(d.getDate() + days);
  return d;
}

export function dDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function dFromStart(startDate: Date, d: Date): number {
  return dDiff(startDate, d);
}

export function fmtDate(d: Date | undefined): string {
  if (!d) return "—";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

export function getTaskSummary(t: TaskItem, all: TaskItem[]) {
  if (!t.group)
    return {
      start: t.start,
      end: t.end,
      dur: t.start && t.end ? dDiff(t.start, t.end) + 1 : null,
    };
  const children = all.filter((ct) => ct.parentId === t.id);
  if (children.length === 0)
    return { start: undefined, end: undefined, dur: null };
  let minS: Date | null = null;
  let maxE: Date | null = null;
  children.forEach((c) => {
    if (c.start && (!minS || c.start < minS)) minS = c.start;
    if (c.end && (!maxE || c.end > maxE)) maxE = c.end;
  });
  if (!minS || !maxE) return { start: undefined, end: undefined, dur: null };
  return { start: minS, end: maxE, dur: dDiff(minS, maxE) + 1 };
}

export function buildDepPath(
  dep: Dep,
  tasks: TaskItem[],
  startDate: Date,
  dayPx: number,
  ROW_H: number
): { d: string } | null {
  const fromT = tasks.find((x) => x.id === dep.from);
  const toT = tasks.find((x) => x.id === dep.to);
  if (
    !fromT ||
    !toT ||
    fromT.group ||
    toT.group ||
    !fromT.start ||
    !fromT.end ||
    !toT.start ||
    !toT.end
  )
    return null;

  const fSide = dep.fromSide ?? "right";
  const tSide = dep.toSide ?? "left";

  const fromX =
    fSide === "right"
      ? dFromStart(startDate, fromT.end) * dayPx
      : dFromStart(startDate, fromT.start) * dayPx;
  const lagMs = dep.lag * DAY_MS;
  const toX =
    tSide === "left"
      ? dFromStart(startDate, new Date(toT.start.getTime() + lagMs)) * dayPx
      : dFromStart(startDate, new Date(toT.end.getTime() + lagMs)) * dayPx;

  let fromRow = -1,
    toRow = -1;
  let idx = 0;
  for (const t of tasks) {
    if (t.id === dep.from) fromRow = idx;
    if (t.id === dep.to) toRow = idx;
    idx++;
  }
  if (fromRow < 0 || toRow < 0) return null;

  const fromY = fromRow * ROW_H + ROW_H / 2;
  const toY = toRow * ROW_H + ROW_H / 2;
  const GAP = Math.max(dayPx * 0.55, 10);

  if (dep.curve === "straight")
    return { d: `M${fromX},${fromY} L${toX},${toY}` };

  const exitX = fSide === "right" ? fromX + GAP : fromX - GAP;
  const entryX = tSide === "left" ? toX - GAP : toX + GAP;
  const midY = (fromY + toY) / 2;

  let pts: [number, number][];
  if (fSide === "right" && tSide === "left") {
    if (toX > fromX + GAP * 2) {
      const midX = (fromX + toX) / 2;
      pts = [
        [fromX, fromY],
        [midX, fromY],
        [midX, toY],
        [toX, toY],
      ];
    } else {
      pts = [
        [fromX, fromY],
        [exitX, fromY],
        [exitX, midY],
        [entryX, midY],
        [entryX, toY],
        [toX, toY],
      ];
    }
  } else if (fSide === "left" && tSide === "left") {
    const laneX = Math.min(exitX, entryX);
    pts = [
      [fromX, fromY],
      [laneX, fromY],
      [laneX, toY],
      [toX, toY],
    ];
  } else if (fSide === "right" && tSide === "right") {
    const laneX = Math.max(exitX, entryX);
    pts = [
      [fromX, fromY],
      [laneX, fromY],
      [laneX, toY],
      [toX, toY],
    ];
  } else {
    pts = [
      [fromX, fromY],
      [exitX, fromY],
      [exitX, midY],
      [entryX, midY],
      [entryX, toY],
      [toX, toY],
    ];
  }

  if (dep.curve === "curve") {
    const r = Math.min(6, GAP * 0.8);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1];
      const [cx, cy] = pts[i];
      const [nx, ny] = pts[i + 1];
      const dx1 = Math.sign(cx - px),
        dy1 = Math.sign(cy - py);
      const dx2 = Math.sign(nx - cx),
        dy2 = Math.sign(ny - cy);
      const bx = cx - dx1 * r,
        by = cy - dy1 * r;
      const ax = cx + dx2 * r,
        ay = cy + dy2 * r;
      d += ` L${bx},${by} Q${cx},${cy} ${ax},${ay}`;
    }
    d += ` L${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`;
    return { d };
  }
  return {
    d: pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" "),
  };
}
