import { Card, CardContent } from "@/components/ui/card";

const ProjectCardSkeleton = () => {
  return (
    <Card className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-sm animate-pulse flex flex-col transition-colors">
      <CardContent className="flex flex-col justify-between p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 dark:border-slate-800 py-2 px-4 transition-colors">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 transition-colors" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
              <div className="h-3 w-44 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
            </div>
          </div>
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
        </div>

        {/* Assigned People */}
        <div className="py-2 px-4 flex justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 transition-colors" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
          </div>
        </div>

        {/* Priority */}
        <div className="px-4 py-2 space-y-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
        </div>

        {/* Progress */}
        <div className="py-2 px-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
            <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
        </div>

        {/* CTA */}
        <div className="py-2 px-4">
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 transition-colors rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCardSkeleton;
