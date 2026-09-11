import { Flag } from "lucide-react";

interface IPriorityLabelProps {
  defaultPriority: "LOW" | "MEDIUM" | "HIGH";
}

export default function PriorityLabel({
  defaultPriority,
}: IPriorityLabelProps) {
  const getColor = (p: "LOW" | "MEDIUM" | "HIGH") => {
    switch (p) {
      case "HIGH":
        return "text-red-600 dark:text-red-400";
      case "MEDIUM":
        return "text-orange-500 dark:text-amber-500";
      case "LOW":
        return "text-green-600 dark:text-emerald-500";
      default:
        return "text-gray-600 dark:text-slate-400";
    }
  };

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${getColor(
        defaultPriority
      )}`}
    >
      <Flag
        size={14}
        className={getColor(defaultPriority)}
        fill="currentColor"
      />
      <span>{defaultPriority}</span>
    </div>
  );
}
