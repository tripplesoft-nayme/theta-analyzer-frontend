/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper function to format dates
export const formatDate = (dateString?: string | null) => {
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

// Generic safe resolver for nested object properties
const resolvePath = (obj: any, path: string) => {
  return path
    .split(".")
    .reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
};

const formatCurrency = (value: string | number) => {
  const num = Number(value);
  if (isNaN(num)) return "N/A";
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
  return `$${num}`;
};

interface ProjectInfoProps {
  projectData?: any;
  isLoading?: boolean;
  tableConfig?: any;
}

const ClientProjectInfo = ({
  projectData,
  isLoading,
  tableConfig,
}: ProjectInfoProps) => {
  if (isLoading) return <ClientProjectInfo.Skeleton />;

  const existingConfig = (() => {
    if (!tableConfig?.data) return null;
    const resValue = tableConfig.data;
    if (
      resValue &&
      typeof resValue === "object" &&
      "data" in resValue &&
      Array.isArray(resValue.data)
    ) {
      return resValue.data;
    }
    return resValue;
  })();

  const fields = Array.isArray(existingConfig)
    ? existingConfig
    : existingConfig?.columns || [];

  const finalProjectData = (() => {
    let dataObj: any = {};
    if (projectData) {
      let current = projectData;
      if (
        current &&
        typeof current === "object" &&
        !current.name &&
        current.data
      ) {
        current = current.data;
      }
      if (current && current.data && Array.isArray(current.data)) {
        dataObj = { ...(current.data[0] || {}) };
      } else if (Array.isArray(current)) {
        dataObj = { ...(current[0] || {}) };
      } else {
        dataObj = { ...(current?.project || current || {}) };
      }
    }

    if (Array.isArray(existingConfig)) {
      existingConfig.forEach((field: any) => {
        if (field.key && field.value !== undefined && field.value !== null) {
          dataObj[field.key] = field.value;
        }
      });
    }

    return dataObj;
  })();

  const getValueForKey = (key: string, data: any) => {
    const rawVal = resolvePath(data, key);

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
      default: {
        if (Array.isArray(rawVal)) {
          return rawVal.join(", ") || "None";
        }
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

  const infoItems =
    fields.length > 0
      ? fields.map((f: any) => ({
        label: f.label,
        value:
          f.value !== undefined && f.value !== null
            ? getValueForKey(f.key, { [f.key]: f.value }) // Use getValueForKey for formatting if needed, but pass the direct value
            : getValueForKey(f.key, finalProjectData),
      }))
      : [
        { label: "Project Name", value: finalProjectData?.name },
        {
          label: "Start Date",
          value: formatDate(finalProjectData?.startDate),
        },
        {
          label: "Contract Duration",
          value: calculateDuration(
            finalProjectData?.startDate,
            finalProjectData?.deadline
          ),
        },
        {
          label: "Completion Date",
          value: formatDate(finalProjectData?.deadline),
        },
        {
          label: "Contract Value",
          value: formatCurrency(finalProjectData?.budget),
        },
        {
          label: "Progress",
          value: `${finalProjectData?.progress || 0}% Completed`,
        },
        { label: "Duration Difference", value: "0 days Delay/Early" },
        { label: "Workload", value: "0 Task Overdue" },
      ];

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">Project Information</h2>
      <div className="space-y-0.5">
        {infoItems.map((item: any, index: number) => (
          <div
            key={index}
            className={`flex items-center justify-between py-4 px-4 ${index % 2 === 0 ? "bg-[#F4F7FE] dark:bg-slate-800/50" : "bg-transparent"
              } rounded-lg`}
          >
            <span className="text-base font-medium text-[#4B5563] dark:text-slate-400">
              {item.label}
            </span>
            <span className="text-base font-semibold text-[#1B2559] dark:text-slate-100">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

ClientProjectInfo.Skeleton = () => {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border dark:border-slate-800 p-8 animate-pulse flex flex-col">
      <div className="h-8 w-48 bg-gray-100 dark:bg-slate-800 rounded-lg mb-8"></div>
      <div className="flex-1 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-5 px-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-lg"
          >
            <div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientProjectInfo;
