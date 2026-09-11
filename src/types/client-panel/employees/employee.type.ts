export interface IEmployee {
  name: string;
  avatar?: string;
  email: string;
  phoneNumber: string;
  password?: string; // optional, only used when creating
  skills: string[];
  description: string;
  joinedDate: string; // ISO date string
  projects: string[]; // array of project IDs
  sendWelcomeEmail: boolean;
  notifyProjectManager: boolean;
  role: "Viewer" | "Staff" | "Manager";
  level: "Active" | "In Active";
  id?: string; // optional unique identifier for existing employees
  lastActive?: string;
}

interface IUser {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  role: "Viewer" | "Staff" | "Manager";
  profileImage: string | null;
  language: string;
  timezone: string | null;
  verification2FA: boolean;
  status: boolean;
  lastActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  userStatus: "ACTIVE" | "INACTIVE";
}
export type IEmployeeProfile = {
  id: string;
  userId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  description: string;
  joinedDate: string; // YYYY-MM-DD
  skills: string[];
  projects?: string[]; // array of project IDs
  user: IUser;
};

export interface IAddEmployeePayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  description: string;
  joinedDate: string;
  sendWelcomeEmail: boolean;
  notifyProjectManager: boolean;
  skills: string[];
  projects: string[];
  role: "EMPLOYEE" | "MANAGER" | "VIEWER";
  notifyManager: boolean;
  welcomeEmail: boolean;
}

export interface IEditEmployeePayload {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  joinedDate: string;
  description: string;
  skills: string[];
  projects: string[];
  profileImage: string | null;
  userStatus: string;
}
