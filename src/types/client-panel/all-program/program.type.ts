export type ProgramPriority = "LOW" | "MEDIUM" | "HIGH";
export interface IProgram {
  id: string;
  userId: string;
  programName: string;
  datetime: string; // ISO date string
  programDescription: string;
  priority: ProgramPriority;
  deadline: string; // ISO date string
  progress: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  viewerIds?: string[];
  managerId?: string;
  programViewers?: any[];
}
