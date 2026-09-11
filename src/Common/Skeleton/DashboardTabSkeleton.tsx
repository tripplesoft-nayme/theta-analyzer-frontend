import ChartSkeleton from "./ChartSkeleton";

const DashboardTabSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <ChartSkeleton />
      <div className="grid grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
};

export default DashboardTabSkeleton;
