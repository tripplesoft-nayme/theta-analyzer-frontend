/* eslint-disable @typescript-eslint/no-explicit-any */
import AllProgramProject from "@/pages/staffManager/Overview/Components/AllProgramProject";
import ProjectLocationsMap from "./Components/ProjectLocationsMap";
import ProjectStats from "./Components/ProjectStats";
import { useGetProgramAllProjectsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import { useSelector } from "react-redux";

const StaffManagerProjects = () => {
  const managerId = useSelector((state: any) => state.auth.user?.userId);

  const { data } = useGetProgramAllProjectsQuery({
    managerId,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-6">
        <ProjectStats />
      </div>
      <AllProgramProject
        showSearch={true}
        showViewAll={false}
        title="All Projects"
      />
      <ProjectLocationsMap
        allFilteredProjects={data?.data?.projects?.data || []}
      />
    </div>
  );
};

export default StaffManagerProjects;
