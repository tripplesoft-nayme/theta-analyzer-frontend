const ClientAllProgramSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse">
      {/* Header + Filters */}
      <div className="flex md:flex-row flex-col justify-between items-center gap-3 px-6 py-4 border-gray-200 dark:border-slate-800 border-b">
        {/* Title */}
        <div className="h-7 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="h-10 w-64 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-800" />
          {/* Dropdown 1 */}
          <div className="h-10 w-32 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-800" />
          {/* Dropdown 2 */}
          <div className="h-10 w-32 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-800" />
        </div>
      </div>
      {/* Body Rows block */}
      <div className="p-6 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-14 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};
export default ClientAllProgramSkeleton;
