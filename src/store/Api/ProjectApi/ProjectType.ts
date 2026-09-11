import { ProjectStatus, ProjectPriority } from "@/pages/client/Overview/Components/AllProgramProjects/ProjectCard";

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  role: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface EmployeeInfo {
  id: string;
  userId: string;
  skills?: string[];
  description?: string | null;
  joinedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  user: ProjectUser;
}

export interface ProjectEmployee {
  id: string;
  projectId: string;
  employeeId: string;
  assignedAt: string;
  employee: EmployeeInfo;
}

export interface ProjectViewer {
  id: string;
  projectId: string;
  viewerId: string;
  assignedAt: string;
  viewer: EmployeeInfo;
}

export interface Project {
  id: string;
  programId: string;
  programName?: string;
  program?: {
    programName?: string;
    id?: string;
    programDescription?: string | null;
    priority?: string;
    progress?: number;
  };
  name: string;
  description: string;
  dateDate: string;
  status: ProjectStatus;
  priority: ProjectPriority;

  startDate: string;
  deadline: string;

  progress: number;
dataDate?: string;
  managerId: string;
  viewerId: string;

  chartList: unknown[];

  estimatedCompletedDate: string;
  projectCompleteDate: string | null;
  projectEmployees?: ProjectEmployee[];
  projectViewers?: ProjectViewer[];
  currentRate: string;
  budget: string;
  manager?: {
    id: string;
    userId: string;
    user: ProjectUser;
  };
  latitude: number | null;
  longitude: number | null;

  createdAt: string;
  updatedAt: string;
}