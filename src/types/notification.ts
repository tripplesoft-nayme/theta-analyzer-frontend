export enum NotificationType {
  NEW_EMPLOYEE_ASSIGNED = "NEW_EMPLOYEE_ASSIGNED",
  NEW_MANAGER_ASSIGNED = "NEW_MANAGER_ASSIGNED",
  SUBMISSION_UPDATED_STATUS = "SUBMISSION_UPDATED_STATUS",
  PROJECT_SUBMITTED = "PROJECT_SUBMITTED",
  PROJECT_STATUS_UPDATE = "PROJECT_STATUS_UPDATE",
  PROJECT_CREATED = "PROJECT_CREATED",
  REMINDER = "REMINDER",
  SHEET_UPDATE_REQUEST = "SHEET_UPDATE_REQUEST",
  FILE_CREATED = "FILE_CREATED",
  ACTIVITY_CREATED = "ACTIVITY_CREATED",
}

export interface NotificationAction {
  label: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick: () => void;
}

export interface NotificationItem {
  id: string;
  type: NotificationType | "project" | "team" | "system" | "file" | "access" | string;
  user: {
    name: string;
    avatar: string;
    initials: string;
    online?: boolean;
  };
  action: string;
  target?: string;
  timestamp: string;
  team?: string;
  actions?: NotificationAction[];
  attachment?: {
    name: string;
    type: "pdf" | "pptx" | "doc" | "image";
  };
  comment?: {
    mention: string;
    text: string;
    hasReply?: boolean;
  };
  status?: "new" | "read";
  priority?: "high" | "medium" | "low";
}
