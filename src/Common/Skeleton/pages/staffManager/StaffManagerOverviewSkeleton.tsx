// ─────────────────────────────────────────────────────────────────────────────
// StaffManagerOverviewSkeleton
// Composes separate layout-matching skeleton components.
// ─────────────────────────────────────────────────────────────────────────────

import StatsSectionSkeleton from "./StatsSectionSkeleton";
import AllProgramProjectSkeleton from "./AllProgramProjectSkeleton";
import OverDueChartCardSkeleton from "./OverDueChartCardSkeleton";
import ProjectStatusCardSkeleton from "./ProjectStatusCardSkeleton";
import LatestSubmissionSkeleton from "./LatestSubmissionSkeleton";
import SmUpcomingDeadlineSkeleton from "./SmUpcomingDeadlineSkeleton";
import ActivityLogCardSkeleton from "./ActivityLogCardSkeleton";

const StaffManagerOverviewSkeleton = () => {
  return (
    <div className="mb-6">
      {/* Stats cards */}
      <StatsSectionSkeleton />

      {/* All Program & Projects */}
      <div className="py-6">
        <AllProgramProjectSkeleton />
      </div>

      {/* Charts + Right Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Left: col-span-2 */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* Overdue chart | Project Status side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <OverDueChartCardSkeleton />
            <ProjectStatusCardSkeleton />
          </div>

          {/* Latest Submission table */}
          <LatestSubmissionSkeleton />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <SmUpcomingDeadlineSkeleton />
          <ActivityLogCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default StaffManagerOverviewSkeleton;
