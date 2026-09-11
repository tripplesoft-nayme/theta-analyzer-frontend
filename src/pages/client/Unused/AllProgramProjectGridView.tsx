import React from "react";
import ClientPanelProgramCard from "./ClientPanelProgramCard";

export interface StaffMember {
  name: string;
  avatar: string;
}

export interface ProgramCardProps {
  id: string;
  programName: string;
  projectName: string;
  status: string;
  staffMembers: StaffMember[];
  startDate: string;
  endDate: string;
  priority: "High" | "Medium" | "Low";
  progress: number;
}

interface AllProgramProjectGridViewProps {
  allProgramProjectData: ProgramCardProps[];
}

const AllProgramProjectGridView: React.FC<AllProgramProjectGridViewProps> = ({
  allProgramProjectData,
}) => {
  return (
    <div className="grid grid-cols-4 gap-5">
      {allProgramProjectData?.slice(0, 4).map((projectData) => {
        return (
          <div className="" key={projectData.programName}>
            {/* Render a single program card */}
            <ClientPanelProgramCard
              projectData={{
                ...projectData,
                priority: projectData.priority as "High" | "Medium" | "Low",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AllProgramProjectGridView;
