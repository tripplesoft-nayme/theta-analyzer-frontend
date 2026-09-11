export type Status =
  | "in-progress"
  | "complete"
  | "at-risk"
  | "overdue"
  | "not-started";

export type CurveType = "curve" | "elbow" | "straight";
export type ArrowType = "arrow" | "dot" | "none";
export type LineStyle = "dashed" | "solid" | "dotted";
export type DepSide = "left" | "right";

export interface TaskItem {
  id: number;
  group?: boolean;
  collapsed?: boolean;
  parentId?: number;
  name: string;
  assigned?: string;
  start?: Date;
  end?: Date;
  status?: Status;
  priority?: "Low" | "Medium" | "High";
  progress?: number;
  planned_start?: Date;
  planned_finish?: Date;
  actual_start?: Date;
  actual_finish?: Date;
  baseline_start?: Date;
  baseline_finish?: Date;
  planned_hours?: number;
  actual_hours?: number;
  remaining_hours?: number;
  planned_cost?: number;
  actual_cost?: number;
  resource_cost_planned?: number;
  resource_cost_actual?: number;
  tags?: string[];
  type?: string;
  wbs?: string;
  color?: string;
  milestone?: boolean;
  milestone_date?: Date;
  actual_duration?: number;
}

export interface Dep {
  id: string;
  from: number;
  to: number;
  fromSide: DepSide;
  toSide: DepSide;
  autoColor: boolean;
  style: LineStyle;
  color: string;
  width: number;
  curve: CurveType;
  arrow: ArrowType;
  lag: number;
}

export interface ColDef {
  id: string;
  label: string;
  width: number;
  align: "left" | "center" | "right";
  defaultVisible?: boolean;
  flex?: boolean;
  custom?: boolean;
}

export interface LinkDragPreview {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface LinkDragState {
  fromId: number;
  fromSide: DepSide;
  fromX: number;
  fromY: number;
  curX: number;
  curY: number;
}

export interface BarDragState {
  id: number;
  mode: "move" | "resize-l" | "resize-r" | "move-milestone"; // Added mode
  startX: number;
  startScrollLeft: number;
  lastDD: number;
  origStart: Date;
  origEnd: Date;
  origMilestoneDate?: Date; // New field
}
