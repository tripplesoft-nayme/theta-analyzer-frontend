const NotFoundSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="h-24 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded mb-8"></div>
        <div className="h-12 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  );
};

export default NotFoundSkeleton;
