import { ChevronRight, Filter, Logs } from "lucide-react";

interface Activity {
  id: number;
  reviewer: string;
  approved: number;
  inReview: number;
  returned: number;
  timestamp: string;
  status: "online" | "offline";
}

const ReviewerActivity = () => {
  const activities: Activity[] = [
    {
      id: 1,
      reviewer: "Sarah Johnson",
      approved: 20,
      inReview: 2,
      returned: 5,
      timestamp: "10 minutes ago",
      status: "online",
    },
    {
      id: 2,
      reviewer: "Sarah Johnson",
      approved: 1,
      inReview: 2,
      returned: 9,
      timestamp: "43 minutes ago",
      status: "offline",
    },
    {
      id: 3,
      reviewer: "Sarah Johnson",
      approved: 20,
      inReview: 2,
      returned: 5,
      timestamp: "10 minutes ago",
      status: "online",
    },
    {
      id: 4,
      reviewer: "Sarah Johnson",
      approved: 20,
      inReview: 2,
      returned: 5,
      timestamp: "10 minutes ago",
      status: "online",
    },
  ];

  return (
    <div>
      {/* Reviewer Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Logs size={20} className="text-gray-800 dark:text-slate-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Reviewer Activity
            </h3>
          </div>
          <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
            <Filter size={18} className="text-gray-800 dark:text-slate-300" />
          </button>
        </div>

        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="relative">
                <img
                  src={`https://i.pravatar.cc/150?img=${activity.id}`}
                  alt={activity.reviewer}
                  className="w-9 h-9 rounded-full"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${activity.status === "online" ? "bg-green-500" : "bg-red-500"
                    }`}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-slate-200 mb-1">
                  {activity.reviewer}
                </div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="px-3 py-0.5 bg-green-50 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 rounded font-medium">
                    {activity.approved} Approved
                  </span>
                  <span className="px-2 py-0.5 bg-orange-50 dark:bg-amber-500/10 text-orange-700 dark:text-amber-400 rounded font-medium">
                    {activity.inReview} In Review
                  </span>
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-rose-500/10 text-red-700 dark:text-rose-400 rounded font-medium">
                    {activity.returned} Returned
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-4 flex items-center justify-center gap-1">
          View All Activity <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReviewerActivity;
