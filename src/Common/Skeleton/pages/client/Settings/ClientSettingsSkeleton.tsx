import BoxContainer from "@/Common/BoxContainer";

const ClientSettingsSkeleton = () => {
  return (
    <div className="mx-auto animate-pulse p-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* User Profile Settings Skeleton */}
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

          {/* Branding Skeleton */}
          <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-[170px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-[170px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-250 dark:bg-slate-800 rounded" />
                  <div className="flex-1 h-10 bg-gray-250 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-250 dark:bg-slate-800 rounded" />
                  <div className="flex-1 h-10 bg-gray-250 dark:bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          </BoxContainer>
        </div>

        {/* Column 2 */}
        <div className="space-y-8">
          {/* Billing & Plan Skeleton */}
          <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-24 bg-gray-150 dark:bg-slate-850 rounded" />
              </div>
              <div className="h-9 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
                </div>
              </div>

              <div>
                <div className="h-5 w-28 bg-gray-200 dark:bg-slate-800 rounded mb-2" />
                <div className="w-full h-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800">
                <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          </BoxContainer>

          {/* Notification Settings Skeleton */}
          <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </BoxContainer>

          {/* API Connections Skeleton */}
          <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="h-6 w-36 bg-gray-200 dark:bg-slate-800 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl h-32 flex flex-col justify-between" />
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl h-32 flex flex-col justify-between" />
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl h-32 flex flex-col justify-between" />
            </div>
          </BoxContainer>
        </div>
      </div>
    </div>
  );
};

export default ClientSettingsSkeleton;
