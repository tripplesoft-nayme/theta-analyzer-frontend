export interface User {
  email: string;
  phone: string;
  userEmail: string;
  userId: string;
  clientId: string;
  role: string;
  specialToken?: string;
  name?: string;
  accessToken?: string;
  refreshToken?: string;
  profileImage?: string;
  status?: string;
  id?: string;
  adminAccessToken?: string;
  adminRefreshToken?: string;
  employeeId?: string;
  adminClientId?: string;
}

export interface Role {
  VIEWER: "viewer-panel";
  EMPLOYEE: "employee";
  SUPPORTER: "supporter";
  MANAGER: "staff-manager-panel";
  ADMIN: "admin";
  CLIENT: "client-panel";
  SUPERADMIN: "superadmin";
}

export type UserType = {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  role: "CLIENT" | "EMPLOYEE" | "VIEWER" | "MANAGER";
  profileImage: string | null;
  language?: "ENGLISH" | "FRENCH" | "SPANISH";
  timezone?: string | null;
  verification2FA?: boolean;
  status: boolean;
  lastActive?: boolean | string;
  createdAt: string;
  updatedAt?: string;
  userStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  projects?: string[];
  skills?: string[];
};
