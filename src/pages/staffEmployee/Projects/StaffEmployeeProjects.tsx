/* eslint-disable @typescript-eslint/no-explicit-any */
import AllProgramProject from "@/pages/staffEmployee/Overview/Components/AllProgramProject";

const StaffEmployeeProjects = () => {
  return <AllProgramProject showSearch={true} showViewAll={false} limit={10} title="All Projects" />;
};

export default StaffEmployeeProjects;
