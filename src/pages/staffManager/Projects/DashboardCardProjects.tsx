/* eslint-disable @typescript-eslint/no-explicit-any */
import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";
import StaffManagerProjectCard, {
  StaffEmployeeProject,
} from "@/pages/staffManager/Components/StaffManagerProjectCard";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { ChevronLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

// this is dynamic router component
const DashboardCardProjects = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const managerId = useSelector((state: any) => state.auth.user?.userId);
  const { data, isLoading, error } = useGetAllProjectsQuery({
    managerId,
    status: status ? status : "ALL",
  });

  if (isLoading) {
    return (
      <>
        <h4 className="mb-3 text-gray-900 text-xl font-semibold">
          All Program & Project
        </h4>
        <SkeletonLoading count={3} height="h-66" />
      </>
    );
  }
  if (error) {
    return (
      <>
        <h4 className="mb-3 text-gray-900 text-center text-xl font-semibold">
          Something went wrong
        </h4>
        <Link to="/staff-manager-panel" className="btn btn-primary">
          Go back
        </Link>
      </>
    );
  }

  const projects = data?.data?.projects?.data || [];
  if (projects.length === 0) {
    return (
      <>
        <h4 className="mb-3 text-gray-900 text-xl font-semibold">
          All Program & Project
        </h4>
        <div className="p-10 bg-gray-50 rounded-lg">
          <p className="text-center text-gray-500">No projects found</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-5  flex items-center gap-2 text-primary hover:cursor-pointer border border-gray-300 rounded-lg px-4 py-2"
        >
          <ChevronLeft />
          Go back
        </button>
      </>
    );
  }
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h4 className="mb-3 text-gray-900 text-xl font-semibold">
          All Program & Project
        </h4>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:cursor-pointer border border-gray-300 rounded-lg px-4 py-2"
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
