const SelectSkeleton = () => {
  return (
    <div className="px-4 pt-4 animate-pulse">
      {/* Label skeleton */}
      <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-2 transition-colors" />

      {/* Select box skeleton */}
      <div className="relative">
        <div className="w-full h-10 bg-gray-200 dark:bg-slate-800 rounded-md transition-colors" />

        {/* Dropdown icon placeholder */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-slate-700 rounded transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default SelectSkeleton;
