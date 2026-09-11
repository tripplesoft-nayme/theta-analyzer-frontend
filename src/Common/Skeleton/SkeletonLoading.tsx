import { Skeleton } from "@/components/ui/skeleton";

const SkeletonLoading = ({
  count = 1,
  height = "h-40",
  direction = "horizontal",
}: {
  count?: number;
  height?: string;
  direction?: "horizontal" | "vertical";
}) => {
  return (
    <div
      className={
        direction === "horizontal"
          ? "w-full flex justify-between gap-3 my-3"
          : "w-full space-y-3 my-3"
      }
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className={
            direction === "horizontal"
              ? `${height} w-full bg-gray-200/50 dark:bg-slate-800 rounded-lg`
              : `${height} w-full bg-gray-200/50 dark:bg-slate-800 rounded-lg`
          }
        />
      ))}
    </div>
  );
};

export default SkeletonLoading;
