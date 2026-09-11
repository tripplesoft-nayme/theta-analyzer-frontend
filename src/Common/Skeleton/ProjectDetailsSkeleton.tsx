import DashboardTabSkeleton from "./DashboardTabSkeleton";

const ProjectDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-transparent transition-colors duration-300 animate-pulse">
      <div className="p-6">
        <DashboardTabSkeleton />
      </div>
    </div>
  );
};

export default ProjectDetailsSkeleton;
