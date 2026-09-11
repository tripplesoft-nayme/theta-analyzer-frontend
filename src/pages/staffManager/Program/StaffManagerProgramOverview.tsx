/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useGetProjectsByProgramIdQuery, useGetProgramByIdQuery } from "@/store/Api/ProgramApi/ProgramApi";
import { useGetManagerProgramOverviewQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import StaffManagerAllProject from "./StaffManagerAllProject";
import ProjectLocationsMap from "@/pages/staffManager/Projects/Components/ProjectLocationsMap";
import DashboardPanelStatsCard from "@/Common/DashboardPanelStatsCard";
import SideManager from "./Components/SideManager";

const StaffManagerProgramOverview = () => {
  const { programId } = useParams();
  const { data: program } = useGetProgramByIdQuery(programId as string, { skip: !programId });
  const { data: overviewRes } = useGetManagerProgramOverviewQuery(programId as string, { skip: !programId });
  const { data } = useGetProjectsByProgramIdQuery({
    programId,
  });

  const overviewData = overviewRes?.data || {};
  const projects = data?.data?.data || [];

  const stats = [
    {
      title: "Total Project",
      value: overviewData?.totalProject?.total ?? 0,
      growth: "",
      growth_type: "up" as const,
      description: `${overviewData?.overdue?.total ?? 0} Overdue`,
      icon: "FolderIcon",
      icon_bg_color: "#059669",
    },
    {
      title: "Assigned Staff",
      value: overviewData?.assignedStaff?.total ?? 0,
      growth: "",
      growth_type: "up" as const,
      description: "Total assigned employees",
      icon: "Users",
      icon_bg_color: "#4881FF",
    },
    {
      title: "Program Completion",
      value: `${overviewData?.programCompletion?.percentage ?? 0}%`,
      growth: "",
      growth_type: "up" as const,
      description: `${overviewData?.programCompletion?.total ?? 0} Completed`,
      icon: "Chart",
      icon_bg_color: "#059669",
    },
    {
      title: "Overdue",
      value: overviewData?.overdue?.total ?? 0,
      growth: "",
      growth_type: "down" as const,
      description: "Projects past deadline",
      icon: "SubmissionOverdue",
      icon_bg_color: "#DC2626",
    },
  ];
  return (
    <div className="">
      <h1 className="text-2xl font-semibold my-6 text-gray-900 dark:text-slate-100">
        {program?.data?.name || program?.data?.programName}
      </h1>
      <div>
        <div className="grid grid-cols- sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
          {stats.map((item, index) => (
            <DashboardPanelStatsCard key={index} item={item} />
          ))}
        </div>
        <div className="flex items-baseline gap-6">
          <StaffManagerAllProject
            title="All Project"
            programId={programId as string}
          />
          {/* <ProgramManager managerId={managerId || program?.data?.managerId} /> */}
          <SideManager programId={programId!} />
        </div>
        <div className="z-0!">
          <ProjectLocationsMap allFilteredProjects={projects} />
        </div>
      </div>
    </div>
  );
};

export default StaffManagerProgramOverview;
