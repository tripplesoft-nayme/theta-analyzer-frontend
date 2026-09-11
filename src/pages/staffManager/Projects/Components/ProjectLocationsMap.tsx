/* eslint-disable @typescript-eslint/no-explicit-any */
import HighwayMap from "@/Common/HighwayMap";

const ProjectLocationsMap = ({
  allFilteredProjects,
}: {
  allFilteredProjects: any;
}) => {
  // Normalize projects data from different API response structures
  const projects = Array.isArray(allFilteredProjects)
    ? allFilteredProjects
    : (allFilteredProjects?.data?.projects?.data || allFilteredProjects?.data || []);

  return (
    <HighwayMap
      projects={projects}
      title="All Project Locations"
      detailsLinkPrefix="/staff-manager-panel/projects/project-details"
      height="80vh"
      className="mb-10"
    />
  );
};

export default ProjectLocationsMap;

