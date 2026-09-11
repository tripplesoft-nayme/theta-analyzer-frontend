const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-slate-800 animate-pulse rounded-md transition-colors ${className}`} />
);

export const HeaderSkeleton = () => (
  <div className="flex items-center justify-between pb-6">
    <Skeleton className="h-8 w-56" />

    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-28" />
      <Skeleton className="h-12 w-28" />
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-12 w-32" />
    </div>
  </div>
);

export const ProjectGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>

        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />

        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const ProjectTableSkeleton = () => (
  <div className="w-full bg-white dark:bg-slate-900 overflow-hidden transition-colors">
    {/* Table Header Placeholder */}
    {/* <div className="bg-gray-50 h-14 flex items-center px-6 border-b border-gray-200 gap-4">
      <div className="w-[20%]"><Skeleton className="h-4 w-24" /></div>
      <div className="w-[15%]"><Skeleton className="h-4 w-20" /></div>
      <div className="w-[10%]"><Skeleton className="h-4 w-16" /></div>
      <div className="w-[10%]"><Skeleton className="h-4 w-16" /></div>
      <div className="w-[10%]"><Skeleton className="h-4 w-16" /></div>
      <div className="w-[20%]"><Skeleton className="h-4 w-24" /></div>
      <div className="w-[15%]"><Skeleton className="h-4 w-20 ml-auto" /></div>
    </div> */}

    {/* Table Rows Placeholder */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-slate-800 last:border-b-0 transition-colors"
      >
        <div className="w-[20%]">
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="w-[15%] flex -space-x-2">
          {[1, 2, 3].map((j) => (
            <Skeleton
              key={j}
              className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-950"
            />
          ))}
        </div>
        <div className="w-[10%]">
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="w-[10%]">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="w-[10%]">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="w-[20%] space-y-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-2 w-full rounded" />
        </div>
        <div className="w-[15%] flex gap-3 justify-end">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const ProgramManageSkeleton = () => (
  <div className="w-full max-w-sm mt-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors">
    {/* Manager Section */}
    <div className="mb-6">
      <Skeleton className="h-3 w-32 mb-4 rounded" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>
      </div>
    </div>

    {/* Duration Section */}
    <Skeleton className="h-3 w-32 mb-4 rounded" />
    <div className="mb-6 bg-gray-50/80 dark:bg-slate-800/50 p-5 rounded-lg space-y-5 transition-colors">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>

    {/* Tags Section */}
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-3 w-10 rounded" />
      <Skeleton className="h-3 w-16 rounded" />
    </div>
    <div className="flex flex-wrap gap-2 mb-8">
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-7 w-24 rounded-full" />
      <Skeleton className="h-7 w-16 rounded-full" />
    </div>

    {/* Alerts Section */}
    <div className="flex justify-between items-center mb-5">
      <Skeleton className="h-3 w-12 rounded" />
      <Skeleton className="h-3 w-14 rounded" />
    </div>
    <div className="space-y-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-[85%] rounded" />
            <Skeleton className="h-3.5 w-[60%] rounded" />
            <div className="flex justify-between items-center pt-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
