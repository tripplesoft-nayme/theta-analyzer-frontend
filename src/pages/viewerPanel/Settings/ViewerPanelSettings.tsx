import { useEffect, useState } from "react";
import UserProfileSettings from "../../client/Settings/Components/UserProfileSettings";
import PrimaryButton from "@/Common/PrimaryButton";
import { toast } from "sonner";
import {
  useGetNotificationPermissionsQuery,
  useUpdateNotificationViewerMutation,
} from "@/store/Api/SettingsApi/SettingsApi";

interface NotificationState {
  weeklySummary: boolean;
  projectAdd: boolean;
  projectRemove: boolean;
}

const notificationItems = [
  { id: "weeklySummary", label: "Weekly Summary" },
  { id: "projectAdd", label: "Project Add" },
  { id: "projectRemove", label: "Project Remove" },
] as const;

const ViewerPanelSettings = () => {
  const { data: permissionsData, isLoading } = useGetNotificationPermissionsQuery();
  const [updateNotificationViewer, { isLoading: isSaving }] = useUpdateNotificationViewerMutation();
  const [notifications, setNotifications] = useState<NotificationState>({
    weeklySummary: true,
    projectAdd: true,
    projectRemove: true,
  });

  // Populate from server on first load
  useEffect(() => {
    if (!permissionsData?.data) return;
    const d = permissionsData.data;
    setNotifications({
      weeklySummary: d.weeklySummary ?? true,
      projectAdd: d.projectAdd ?? true,
      projectRemove: d.projectRemove ?? true,
    });
  }, [permissionsData]);

  const handleNotificationChange = (id: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotificationViewer(notifications).unwrap();
      toast.success("Notification preferences saved successfully");
    } catch {
      toast.error("Failed to save notification settings");
    }
  };

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserProfileSettings />

        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                Notification Settings
              </h2>
              <PrimaryButton
                type="Primary"
                title={isSaving ? "Saving..." : "Save Changes"}
                onClick={handleSaveNotifications}
                disabled={isSaving || isLoading}
              />
            </div>
            
            <div className="space-y-4">
              {notificationItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {isLoading ? (
                    <div className="h-6 w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded animate-pulse" />
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        id={`viewer-notif-${item.id}`}
                        checked={notifications[item.id as keyof NotificationState]}
                        onChange={(e) => handleNotificationChange(item.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`viewer-notif-${item.id}`}
                        className="text-sm text-gray-700 dark:text-slate-300 cursor-pointer"
                      >
                        {item.label}
                      </label>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerPanelSettings;
