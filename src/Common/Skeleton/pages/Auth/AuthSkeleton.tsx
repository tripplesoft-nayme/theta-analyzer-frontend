const AuthSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900 animate-pulse">
      <div className="w-[40%]">
        <div className="w-32 h-10 bg-gray-200 dark:bg-slate-700 rounded mb-8"></div>
        <div className="w-full h-96 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="w-[40%] pl-10">
        <div className="h-12 w-64 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-4"></div>
        <div className="h-4 w-96 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-12"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-10 w-full bg-blue-200 dark:bg-blue-900 rounded mb-4 mt-8"></div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
