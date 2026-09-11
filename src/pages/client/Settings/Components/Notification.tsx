import PrimaryButton from "@/Common/PrimaryButton";
import {
  useGetNotificationPermissionsQuery,
  useUpdateNotificationClientMutation,
} from "@/store/Api/SettingsApi/SettingsApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CheckboxGroupProps {
  title: string;
  className?: string;
}

type NotificationState = {
  onProjectApproval: boolean;
  onProjectRejection: boolean;
  fileImportByEmployees: boolean;
  weeklySummary: boolean;
  storageLimit: boolean;
  billPayment: boolean;
  overdueProject: boolean;
};

const DEFAULT_STATE: NotificationState = {
  onProjectApproval: true,
  onProjectRejection: true,
  fileImportByEmployees: true,
  weeklySummary: true,
  storageLimit: true,
  billPayment: true,
  overdueProject: true,
};

const notificationItems = [
  { id: "onProjectApproval", label: "On project Approval" },
  { id: "onProjectRejection", label: "On project Rejection" },
  { id: "fileImportByEmployees", label: "File import by employees" },
  { id: "weeklySummary", label: "Weekly Summary" },
  { id: "overdueProject", label: "Overdue Project" },
  { id: "storageLimit", label: "Storage Limit" },
  { id: "billPayment", label: "Bill Payment" },
] as const;

const Notification = ({ title, className = "" }: CheckboxGroupProps) => {
  const { data: permissionsData, isLoading } = useGetNotificationPermissionsQuery();
  const [updateNotificationClient, { isLoading: isSaving }] = useUpdateNotificationClientMutation();
  const [notifications, setNotifications] = useState<NotificationState>(DEFAULT_STATE);

  // Populate from server on first load
  useEffect(() => {
    if (!permissionsData?.data) return;
    const d = permissionsData.data;
    setNotifications({
      onProjectApproval: d.onProjectApproval ?? true,
      onProjectRejection: d.onProjectRejection ?? true,
      fileImportByEmployees: d.fileImportByEmployees ?? true,
      weeklySummary: d.weeklySummary ?? true,
      storageLimit: d.storageLimit ?? true,
      billPayment: d.billPayment ?? true,
      overdueProject: d.overdueProject ?? true,
    });
  }, [permissionsData]);

  const handleNotificationChange = (id: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async () => {
    try {
      await updateNotificationClient(notifications).unwrap();
      toast.success("Notification preferences saved successfully");
    } catch {
      toast.error("Failed to update notification settings");
    }
  };

  return (
    <div className={`border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
        <PrimaryButton
          onClick={handleSubmit}
          type="Primary"
          title={isSaving ? "Saving..." : "Save Changes"}
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
                  id={`client-notif-${item.id}`}
                  checked={notifications[item.id as keyof NotificationState]}
                  onChange={(e) => handleNotificationChange(item.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 dark:bg-slate-800 border-gray-300 dark:border-slate-700 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`client-notif-${item.id}`}
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
  );
};

export default Notification;
