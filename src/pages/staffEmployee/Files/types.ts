export interface FileItem {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  size: number;
  description?: string;
  createdAt: string;
  uploadAt?: string;
  isRecent?: boolean;
  isSubmitted?: boolean;
  groupId?: string;
  groupTitle?: string;
  projectId?: string;
  status?: "approved" | "pending" | "rejected" | "resubmitted";
  notes?: string;
  rejectedNote?: string | null;
  duration?: number | null;
}

export interface GroupedFileItem {
  groupInfo: {
    id: string;
    groupTitle: string;
    order?: number;
    width?: number;
    height?: number;
  };
  files: FileItem[];
}
