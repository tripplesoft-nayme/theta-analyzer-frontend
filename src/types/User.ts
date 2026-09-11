export interface ManagerUser {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  role: "MANAGER";
  profileImage: string | null;
  language: "ENGLISH" | string;
  timezone: string | null;
  verification2FA: boolean;
  status: boolean;
  lastActive: boolean;
  createdAt: string;
  updatedAt: string;
  userStatus: "ACTIVE" | "INACTIVE" | string;
}

export interface Manager {
  id: string;
  userId: string;
  skills: string[];
  description: string;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
  user: ManagerUser;
}
