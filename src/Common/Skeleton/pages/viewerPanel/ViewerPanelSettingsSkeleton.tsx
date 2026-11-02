import BoxContainer from "@/Common/BoxContainer";

const ViewerPanelSettingsSkeleton = () => {
  return (
    <div className="mx-auto animate-pulse p-1 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: User Profile Settings Skeleton */}
        <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded mb-1" />
              <div className="h-3 w-64 bg-gray-150 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg border border-blue-50/50 dark:border-blue-500/20">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-6 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-gray-200 dark:bg-slate-850 rounded ml-1" />
                <div className="w-full h-[42px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-20 bg-gray-200 dark:bg-slate-850 rounded ml-1" />
                <div className="w-full h-[42px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-gray-200 dark:bg-slate-850 rounded ml-1" />
                <div className="w-full h-[42px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-28 bg-gray-200 dark:bg-slate-850 rounded ml-1" />
                <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-24 bg-gray-200 dark:bg-slate-850 rounded ml-1" />
                <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-border dark:border-slate-800">
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-lg space-y-3">
                <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-5/6 bg-gray-150 dark:bg-slate-850 rounded" />
              </div>
            </div>
          </div>
        </BoxContainer>

        {/* Column 2: Notification & API Connections */}
        <div className="space-y-6">
          {/* Notification Settings Skeleton */}
          <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-44 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-52 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </BoxContainer>

          {/* API Connections Skeleton */}
          <div className="border border-border dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm">
            <div className="h-6 w-36 bg-gray-200 dark:bg-slate-800 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl h-32 flex flex-col justify-between" />
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl h-32 flex flex-col justify-between" />
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl h-32 flex flex-col justify-between" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerPanelSettingsSkeleton;
