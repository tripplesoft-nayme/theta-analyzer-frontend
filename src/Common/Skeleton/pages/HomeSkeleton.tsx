import CommonWrapper from "@/Common/CommonWrapper";

const HomeSkeleton = () => {
  return (
    <CommonWrapper>
      <div className="h-screen animate-pulse">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="h-12 w-64 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-20 w-96 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </CommonWrapper>
  );
};

export default HomeSkeleton;
