/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper function to format dates
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const calculateDuration = (start?: string, end?: string) => {
  if (!start || !end) return "N/A";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} Days` : "0 Days";
};

const formatCurrency = (value: string | number) => {
  const num = Number(value);
  if (isNaN(num)) return "N/A";
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
  return `$${num}`;
};

// Generic safe resolver for nested object properties
const resolvePath = (obj: any, path: string) => {
  return path
    .split(".")
    .reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
};

interface Field {
  id: string;
  label: string;
  key: string;
  value?: any;
  isManual?: boolean;
}

interface ProjectInformationProps {
  projectData: any;
  fields: Field[];
  isLoading?: boolean;
}

const ProjectInformation = ({
  projectData,
  fields,
  isLoading,
}: ProjectInformationProps) => {
  if (isLoading) {
    return (
      <div className="w-full flex-1 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-5 px-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-lg"
          >
            <div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Helper to resolve specific predefined keys or fallback to generic property access
  const getValueForKey = (key: string, data: any) => {
    // 1. Resolve raw value
    const rawVal = resolvePath(data, key);

    // 2. Format
    switch (key) {
      case "startDate":
      case "deadline":
      case "dateDate":
      case "projectCompleteDate":
      case "createdAt":
      case "updatedAt":
        return formatDate(rawVal);
      case "contractDuration": {
        const start = resolvePath(data, "startDate");
        const end =
          resolvePath(data, "deadline") ||
          resolvePath(data, "projectCompleteDate");
        return calculateDuration(start, end);
      }
      case "budget":
        return formatCurrency(rawVal || 0);
      case "progress":
      case "computedProgress":
        return `${rawVal || 0}% Completed`;
      case "workingDay":
        return valToString(rawVal);
      case "SelectDays":
        return valToString(rawVal);
      default: {
        // Handle Arrays
        if (Array.isArray(rawVal)) {
          return valToString(rawVal);
        }

        // Auto-detect ISO date strings
        if (
          typeof rawVal === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rawVal)
        ) {
          return formatDate(rawVal);
        }

        return rawVal !== undefined && rawVal !== null ? String(rawVal) : "N/A";
      }
    }
  };
  const valToString = (val: any) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return "None";
    if (Array.isArray(val)) {
      return val
        .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
        .join(", ");
    }
    return String(val);
  };

  return (
    <div className="w-full h-fit">
      <div className="space-y-0.5">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`flex items-center justify-between py-4 px-4 ${index % 2 === 0
              ? "bg-[#F4F7FE] dark:bg-slate-800 rounded-lg"
              : "bg-transparent rounded-lg dark:bg-slate-900"
              }`}
          >
            <span className="text-sm font-medium text-[#4B5563] dark:text-slate-300">
              {field.label}
            </span>
            <span className="text-sm font-semibold text-[#1B2559] dark:text-slate-100">
              {field.isManual
                ? field.key || "N/A"
                : getValueForKey(field.key, projectData)}
            </span>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-500 text-center py-6 italic">
            No fields configured.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInformation;
