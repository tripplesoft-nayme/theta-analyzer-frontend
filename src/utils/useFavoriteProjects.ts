// import { useGetUser } from "@/hooks/useGetUser";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";

const useFavoriteProjects = () => {
  // const { id } = useGetUser();
  const { data } = useGetAllProjectsQuery(
    {}
    // { viewerId: id },
    // { skip: id === undefined }
  );
  const projects = data?.data?.projects?.data || [];
  return projects?.slice(0, 3);
};

export default useFavoriteProjects;
