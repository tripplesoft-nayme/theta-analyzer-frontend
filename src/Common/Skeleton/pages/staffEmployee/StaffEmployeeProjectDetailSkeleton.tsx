const StaffEmployeeProjectDetailSkeleton = () => {
  return (
    <div className="mx-auto animate-pulse p-1 space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-3">
          <div className="h-6 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-64 bg-gray-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-40 bg-gray-150 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (col-span-2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Parent Program */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-3">
              <div className="h-5 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-full bg-gray-150 dark:bg-slate-800 rounded" />
              <div className="h-3 w-5/6 bg-gray-150 dark:bg-slate-800 rounded" />
            </div>
          </div>

          {/* Schedule & Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Schedule */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="h-4 w-20 bg-gray-150 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Budget & Status */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="h-4 w-20 bg-gray-150 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-gray-150 dark:bg-slate-800 rounded" />
              <div className="h-3.5 w-full bg-gray-150 dark:bg-slate-800 rounded" />
              <div className="h-3.5 w-4/5 bg-gray-150 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* Right Column (col-span-1) */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-250 dark:bg-slate-800 rounded" />
              <div className="h-4 w-8 bg-gray-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full" />
          </div>

          {/* Assigned Manager */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="h-4 w-36 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-gray-150 dark:bg-slate-850 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffEmployeeProjectDetailSkeleton;
