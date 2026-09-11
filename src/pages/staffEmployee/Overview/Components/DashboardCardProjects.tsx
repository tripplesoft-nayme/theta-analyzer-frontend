import DashboardCardProjectsSkeleton from "@/Common/Skeleton/components/staffEmployee/Overview/DashboardCardProjectsSkeleton";
import StaffManagerProjectCard, {
  StaffEmployeeProject,
} from "@/pages/staffManager/Components/StaffManagerProjectCard";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEmployeeId } from "@/hooks/useEmployeeId";

// this is dynamic router component
const DashboardCardProjects = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const employeeId = useEmployeeId();
  const { data, isLoading, error } = useGetAllProjectsQuery({
    employeeId,
    status: status ? status : "ALL",
  });

  if (isLoading) {
    return <DashboardCardProjectsSkeleton />;
  }
  if (error) {
    return (
      <>
        <h4 className="mb-3 text-gray-900 dark:text-slate-100 text-center text-xl font-semibold">
          Something went wrong
        </h4>
        <Link to="/staff-employee-panel" className="btn btn-primary">
          Go back
        </Link>
      </>
    );
  }

  const projects = data?.data?.projects?.data || [];
  if (projects.length === 0) {
    return (
      <>
        <h4 className="mb-3 text-gray-900 dark:text-slate-100 text-xl font-semibold">
          All Program & Project
        </h4>
        <div className="p-10 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
          <p className="text-center text-gray-500 dark:text-slate-500">No projects found</p>
        </div>
        <Link
          to="/staff-employee-panel"
          className="border p-3 rounded-lg border-gray-300 dark:border-slate-800 mt-5 inline-block text-gray-900 dark:text-slate-100"
        >
          Go Back
        </Link>
      </>
    );
  }
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h4 className="mb-3 text-gray-900 dark:text-slate-100 text-xl font-semibold">
          All Program & Project
        </h4>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary border border-gray-300 dark:border-slate-800 rounded-lg px-4 py-2 hover:dark:bg-slate-800 transition-colors"
        >
          <ChevronLeft />
          Go back
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2  xl:grid-cols-3 gap-5">
        {projects?.map((projectData: StaffEmployeeProject) => {
          return (
            <div key={projectData.id}>
              <StaffManagerProjectCard project={projectData} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DashboardCardProjects;
