import HighwayMap from "@/Common/HighwayMap";
import ProgramOverviewStats from "./ProgramOverviewStats";
import ProgramManager from "@/Common/ProgramManage";
import { useParams } from "react-router-dom";
import {
  useGetProgramByIdQuery,
  useGetProjectsByProgramIdQuery,
  useGetProgramOverviewQuery,
} from "@/store/Api/ProgramApi/ProgramApi";
import AllProject from "./AllProject";

const ProgramOverview = () => {
  const { programId } = useParams();
  const { data: program } = useGetProgramByIdQuery(programId);
  const { data: programOverviewData } = useGetProgramOverviewQuery(programId, { skip: !programId });
  const { data: allProjects } = useGetProjectsByProgramIdQuery({
    programId: programId as string,
  });

  return (
    <div className="">
      <div>
        <ProgramOverviewStats overviewData={programOverviewData} />
        <div className="flex items-start gap-6 pb-6">
          <AllProject title="All Project" programId={programId as string} />
          <ProgramManager
            managerId={program?.data?.managerId}
            programId={programId as string}
            programOverviewData={programOverviewData}
          />
        </div>
        <div className="z-0!">
          <HighwayMap
            projects={allProjects?.data?.data}
            title={`Project locations of ${program?.data?.name || 'Program'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramOverview;
