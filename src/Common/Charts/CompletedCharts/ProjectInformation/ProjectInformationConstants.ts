export interface Field {
  id: string;
  label: string;
  key: string;
  value?: any;
  isManual?: boolean;
}

export const ALLOWED_PROJECT_KEYS = [
  "name",
  "shareWith",
  "dateDate",
  "progress",
  "uploadCycle",
  "computedProgress",
  "status",
  "priority",
  "projectCompleteDate",
  "description",
  "currentRate",
  "startDate",
  "SelectDays",
  "UploadData",
  "selectDate",
  "location",
  "deadline",
  "budget",
  "workingDay",
  "createdAt",
  "updatedAt",
  "program.programName",
  "program.priority",
  "program.progress",
  "manager.user.name",
  "manager.user.email",
  "contractDuration",
];
