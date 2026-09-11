/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper function to format dates
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// interface ProjectInfo {
//   label: string;
//   value: string | number;
// }
// export const formatDate = (dateString?: string | null) => {
//   if (!dateString) return "N/A";
//   const date = new Date(dateString);
//   return new Intl.DateTimeFormat("en-GB", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(date);
// };

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
const ProjectInformation = ({ projectData }: { projectData?: any }) => {
  const projectDataInfo = [
    { label: "Start Date", value: formatDate(projectData?.startDate) },
    {
      label: "Contract Duration",
      value: calculateDuration(projectData?.startDate, projectData?.deadline),
    },
    {
      label: "Completion Date",
      value: formatDate(projectData?.deadline),
    },
    {
      label: "Contract Value",
      value: formatCurrency(projectData?.budget),
    },
    {
      label: "Progress",
      value: `${projectData?.progress || 0}% Completed`,
    },
    { label: "Duration Difference", value: "0 days Delay/Early" },
    { label: "Workload", value: "0 Task Overdue" },
  ];

  return (
    <div className="w-full h-full">
      <div className="bg-white h-full rounded-lg shadow-sm border border-gray-200 w-full  p-6">
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Project Information
        </h2>

        {/* Information List */}
        <div className="space-y-4">
          {projectDataInfo.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectInformation;
