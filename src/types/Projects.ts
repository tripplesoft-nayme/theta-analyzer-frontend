export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface UpdateProjectPayload {
  id?: string;
  name: string;
  priority: Priority;
  description: string;
  deadline: string;
  startDate: string;
  projectCompleteDate: string;
  progress: number;
  currentRate: string;
  budget: string;
  latitude: number;
  longitude: number;
  chartList: string[];
  managerId: string;
  addEmployeeIds: string[];
  removeEmployeeIds: string[];
}
