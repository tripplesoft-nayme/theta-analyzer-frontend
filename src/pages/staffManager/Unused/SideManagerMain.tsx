import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

/*   TYPES   */

interface SidebarProps {
  sidebar: {
    programManager: {
      name: string;
      email: string;
      image: string | null;
    };
    duration: {
      start: string;
      end: string;
      daysRemaining: string; // e.g. "291 days"
    };
    tags: Tag[];
    alerts: {
      issueCount: number;
      list: Alert[];
    };
  };
}

interface Tag {
  id?: string;
  name: string;
  color?: string;
}

interface Alert {
  id?: string;
  title: string;
  description: string;
  time: string;
  by: string;
  color: string;
}

/*   HELPERS   */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/*   COMPONENT   */

const SideManagerMain: React.FC<SidebarProps> = ({ sidebar }) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const [tags, setTags] = useState<Tag[]>(sidebar.tags || []);

  const remainingDaysNumber = useMemo(() => {
    return parseInt(sidebar?.duration?.daysRemaining);
  }, [sidebar?.duration?.daysRemaining]);

  const progress = useMemo(() => {
    const totalDays =
      (new Date(sidebar?.duration?.end).getTime() -
        new Date(sidebar?.duration?.start).getTime()) /
      (1000 * 60 * 60 * 24);

    return Math.min(
      100,
      Math.round(((totalDays - remainingDaysNumber) / totalDays) * 100),
    );
  }, [sidebar.duration, remainingDaysNumber]);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    setTags((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newTagName,
        color: "bg-gray-100 text-gray-700",
      },
    ]);

    setNewTagName("");
    setShowTagInput(false);
  };

  return (
    <div className="min-h-screen w-[360px] p-4 mt-5">
      <div className="bg-white rounded-2xl border border-black/10 p-5 text-black">
        {/* Program Manager */}
        <div className="mb-6">
          <p className="text-sm text-black/60 mb-3">Program Manager</p>
          <div className="flex items-center gap-3">
            <img
              src={
                sidebar.programManager.image ??
                "https://ui-avatars.com/api/?name=User"
              }
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">
                {sidebar.programManager.name}
              </p>
              <p className="text-xs text-black/50">
                {sidebar.programManager.email}
              </p>
            </div>
          </div>
        </div>

        {/* Program Duration */}
        <div className="mb-6">
          <p className="text-sm text-black/60 mb-3">Program Duration</p>

          <div className="border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-medium">
                  {formatDate(sidebar.duration.start)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p className="text-sm font-medium">
                  {formatDate(sidebar.duration.end)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs text-gray-500">Time Remaining</p>
                <p className="text-sm font-semibold">
                  {sidebar?.duration?.daysRemaining}
                </p>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-black/60">Tags</p>
            <button
              onClick={() => setShowTagInput(true)}
              className="flex items-center gap-1 text-sm text-blue-400"
            >
              <Plus size={14} /> Add more
            </button>
          </div>

          {showTagInput && (
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm"
              >
                Add
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {tags.length === 0 && (
              <p className="text-xs text-black/40">No tags available</p>
            )}

            {tags.map((tag) => (
              <span
                key={tag.id}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  tag.color ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-black/60">Alerts</p>
            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs">
              {sidebar.alerts.issueCount} Issues
            </span>
          </div>

          {sidebar.alerts.list.length === 0 ? (
            <p className="text-xs text-black/40">No alerts</p>
          ) : (
            <div className="space-y-4">
              {sidebar.alerts.list.map((alert) => (
                <div key={alert.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${alert.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-black/50">{alert.description}</p>
                    <div className="flex justify-between text-xs text-black/40 mt-1">
                      <span>{alert.time}</span>
                      <span>By {alert.by}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideManagerMain;
