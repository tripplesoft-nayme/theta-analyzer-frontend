// import { ProjectTableSkeleton } from "./Skeleton";
import ProjectBuilderPlaceholderChartSkeleton from "./ProjectBuilderPlaceholderChartSkeleton";

const ReviewDetailsSkeleton = () => {
  return (
    <div className="container mx-auto space-y-6 animate-pulse">
      <div className="mb-6 space-y-6">
        <div className="w-full">
          <ProjectBuilderPlaceholderChartSkeleton />
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsSkeleton;
