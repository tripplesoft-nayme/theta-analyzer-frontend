const ChartSkeleton = () => {
  return (
    <div className="w-full h-full bg-card border border-border rounded-xl p-8 animate-pulse flex flex-col shadow-sm transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-3">
          <div className="h-7 w-56 bg-skeleton-bg rounded-lg transition-colors"></div>
          <div className="h-4 w-36 bg-skeleton-bg rounded-md transition-colors"></div>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-skeleton-bg transition-colors"></div>
              <div className="h-3 w-14 bg-skeleton-bg rounded transition-colors"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-end gap-6 pb-4 px-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-skeleton-bg rounded-t-lg transition-colors"
            style={{
              height: `${30 + (Math.sin(i * 0.8) * 20 + 20)}%`,
              opacity: 1 - (i * 0.05)
            }}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-center border-t border-border pt-6 transition-colors">
        <div className="h-4 w-48 bg-skeleton-bg rounded-full transition-colors"></div>
      </div>
    </div>
  );
};

export default ChartSkeleton;