const StaffEmployeeFilesSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="h-12 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-32 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-32 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  );
};

export default StaffEmployeeFilesSkeleton;
