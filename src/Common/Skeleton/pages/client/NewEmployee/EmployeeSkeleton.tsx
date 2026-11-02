const EmployeeSkeleton = () => {
  return (
    <div className="border border-gray-200 dark:border-slate-800 w-full rounded-lg overflow-hidden bg-white dark:bg-slate-900 animate-pulse mb-10">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center py-6 px-6 gap-4 border-b border-border dark:border-slate-800">
        <div className="h-6 w-36 bg-gray-250 dark:bg-slate-800 rounded" />
        <div className="flex gap-2 flex-wrap items-center">
          {/* Search bar skeleton */}
          <div className="w-56 h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          {/* Filter skeletons */}
          <div className="w-28 h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          <div className="w-28 h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-md" />
          {/* Add button skeleton */}
          <div className="w-36 h-11 bg-gray-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>

      {/* Table Skeletons */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
          <thead className="bg-[#CAD2DB]/10 dark:bg-slate-800/10">
            <tr>
              <th className="px-6 py-4 text-left w-[50px]"><div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-6 py-4 text-left w-[350px]"><div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-4 py-4 text-left w-[300px]"><div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-4 py-4 text-left"><div className="w-16 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-4 py-4 text-left"><div className="w-16 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-4 py-4 text-left"><div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-4 py-4 text-left"><div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
              <th className="px-4 py-4 text-left w-24"><div className="w-16 h-4 bg-gray-200 dark:bg-slate-800 rounded" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="bg-white dark:bg-slate-900">
                <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-150 dark:bg-slate-800 rounded" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
                    <div className="h-4 w-28 bg-gray-200 dark:bg-slate-850 rounded" />
                  </div>
                </td>
                <td className="px-4 py-4"><div className="h-4 w-44 bg-gray-150 dark:bg-slate-800 rounded" /></td>
                <td className="px-4 py-4"><div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded-full" /></td>
                <td className="px-4 py-4"><div className="h-5 w-14 bg-gray-200 dark:bg-slate-800 rounded-full" /></td>
                <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-150 dark:bg-slate-800 rounded" /></td>
                <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-150 dark:bg-slate-800 rounded" /></td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="py-4 px-6 border-t border-border dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-gray-150 dark:bg-slate-800 rounded" />
          <div className="w-8 h-8 bg-gray-150 dark:bg-slate-800 rounded" />
          <div className="w-8 h-8 bg-gray-150 dark:bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
};
export default EmployeeSkeleton;
