

const FilesPreviewSkeleton = () => {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-skeleton-bg animate-pulse border border-border">
      {/* Main Content Area Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-muted/20 rounded-lg" />
      </div>

      {/* Bottom Overlay Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-linear-to-t from-black/20 via-transparent to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 flex-1">
            {/* Title Skeleton */}
            <div className="h-6 w-32 sm:h-8 sm:w-48 bg-muted/30 rounded-md" />
            {/* Description Skeleton */}
            <div className="h-4 w-48 sm:w-64 bg-muted/20 rounded-md" />
            {/* Meta Info Skeleton */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-4 w-12 bg-muted/20 rounded-sm" />
              <div className="h-4 w-16 bg-muted/20 rounded-sm" />
            </div>
          </div>

          {/* Dots Skeleton */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 shrink-0">
            <div className="w-6 sm:w-10 h-1 sm:h-1.5 bg-muted/40 rounded-full" />
            <div className="w-1.5 sm:w-2 h-1 sm:h-1.5 bg-muted/20 rounded-full" />
            <div className="w-1.5 sm:w-2 h-1 sm:h-1.5 bg-muted/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesPreviewSkeleton;
