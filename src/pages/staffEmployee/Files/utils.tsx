import { FileImage, FileSpreadsheet, FileText, FileCode, FileVideo } from "lucide-react";

export const getFileExtension = (filename: string, fileType?: string) => {
  if (filename && filename.includes(".")) {
    const parts = filename.split(".");
    return parts[parts.length - 1].toLowerCase();
  }
  if (fileType && fileType.includes("/")) {
    const mainType = fileType.split(";")[0];
    const subType = mainType.split("/")[1];
    if (subType) {
      if (subType === "vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "xlsx";
      if (subType === "vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
      if (subType === "vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
      if (subType === "plain") return "txt";
      return subType.toLowerCase();
    }
  }
  if (!filename) return "unknown";
  const parts = filename.split(".");
  if (parts.length <= 1) return "unknown";
  return parts[parts.length - 1].toLowerCase();
};

export const getFileIcon = (filename: string, fileType?: string) => {
  const ext = getFileExtension(filename, fileType);
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) {
    return <FileImage className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />;
  }
  if (["pdf"].includes(ext)) {
    return <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
  }
  if (["mp4", "webm", "ogg", "mov", "mkv", "avi", "wmv", "flv", "3gp", "quicktime"].includes(ext)) {
    return <FileVideo className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
  }
  if (["json", "js", "ts", "tsx", "html", "css"].includes(ext)) {
    return <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  }
  return <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
};
