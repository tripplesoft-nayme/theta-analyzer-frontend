/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useCallback } from "react";
import { X, Settings, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { connectSocket } from "@/lib/socket";
import { useAppSelector } from "@/hooks/useRedux";
import { useGetUser } from "@/hooks/useGetUser";
import {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
  useReadAllNotificationMutation,
  useGetNotificationPermissionsQuery,
  useUpdateNotificationPermissionsClientMutation,
  useUpdateNotificationPermissionsEmployeeMutation,
  useUpdateNotificationPermissionsManagerMutation,
  useUpdateNotificationPermissionsViewerMutation,
  NotificationPermissions,
} from "@/store/Api/NotificationApi/NotificationApi";
import { useGetUserByIdQuery } from "@/store/Api/UserApi/UserApi";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { NotificationItem } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import baseApi from "@/store/Api/BaseApi/BaseApi";
import { useAppDispatch } from "@/hooks/useRedux";
import { Link, useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  className?: string;
}

// ─── Role-based permission fields ─────────────────────────────────────────────

const CLIENT_PERMISSIONS: { key: keyof NotificationPermissions; label: string; description: string }[] = [
  { key: "onProjectApproval", label: "Project Approval", description: "Alerts when a project status changes to Approved / Live." },
  { key: "onProjectRejection", label: "Project Rejection", description: "Alerts when a project status is Rejected." },
  { key: "fileImportByEmployees", label: "File Import by Employees", description: "Alerts when an employee uploads a file or logs activity." },
  { key: "weeklySummary", label: "Weekly Summary", description: "Project data upload cycle reminders." },
  { key: "overdueProject", label: "Overdue Project", description: "Alerts when a project deadline passes." },
  { key: "storageLimit", label: "Storage Limit", description: "Alerts when storage thresholds are reached." },
  { key: "billPayment", label: "Bill Payment", description: "Billing, invoice, and payment cycle updates." },
];

const EMPLOYEE_PERMISSIONS: { key: keyof NotificationPermissions; label: string; description: string }[] = [
  { key: "returnProject", label: "Return Project", description: "Alerts when a deliverable is returned for revisions." },
  { key: "assignNewProject", label: "Assign New Project", description: "Alerts when assigned to a new project or task." },
  { key: "projectPublish", label: "Project Publish", description: "Alerts when an assigned project is published to LIVE." },
  { key: "onProjectApproval", label: "Project Approval", description: "Alerts when a submission changes to Approved." },
  { key: "onProjectRejection", label: "Project Rejection", description: "Alerts when a submission is Rejected." },
  { key: "weeklySummary", label: "Weekly Summary", description: "Scheduled project data upload cycle reminders." },
  { key: "storageLimit", label: "Storage Limit", description: "Alerts when storage thresholds are reached." },
  { key: "billPayment", label: "Bill Payment", description: "Billing, invoice, and payment cycle updates." },
  { key: "overdueProject", label: "Overdue Project", description: "Alerts when a project deadline passes." },
];

const MANAGER_PERMISSIONS: { key: keyof NotificationPermissions; label: string; description: string }[] = [
  { key: "fileImportByEmployees", label: "File Import by Employees", description: "Alerts when supervised employees upload files or log activities." },
  { key: "weeklySummary", label: "Weekly Summary", description: "Scheduled project data upload cycle reminders." },
  { key: "createNewProject", label: "Create New Project", description: "Alerts when a new project is created and assigned." },
  { key: "submittedProject", label: "Submitted Project", description: "Alerts when an employee submits deliverables for review." },
  { key: "onProjectApproval", label: "Project Approval", description: "Alerts when project status changes to Approved / Live." },
  { key: "onProjectRejection", label: "Project Rejection", description: "Alerts when project status is Rejected." },
  { key: "storageLimit", label: "Storage Limit", description: "Alerts when storage thresholds are reached." },
  { key: "billPayment", label: "Bill Payment", description: "Billing, invoice, and payment cycle updates." },
  { key: "overdueProject", label: "Overdue Project", description: "Alerts when a project deadline passes." },
];

const VIEWER_PERMISSIONS: { key: keyof NotificationPermissions; label: string; description: string }[] = [
  { key: "weeklySummary", label: "Weekly Summary", description: "Scheduled project data upload cycle reminders." },
  { key: "projectAdd", label: "Project Add", description: "Alerts when you are assigned to a project." },
  { key: "projectRemove", label: "Project Remove", description: "Alerts when you are removed from a project." },
];

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600" : "bg-gray-200 dark:bg-slate-700",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ─── File icon helper ─────────────────────────────────────────────────────────

const getFileIcon = (type: string) => {
  const color = type === "pdf" ? "#EF4444" : type === "pptx" ? "#F97316" : "#64748B";
  return (
    <div className="w-8 h-8 flex items-center justify-center shrink-0">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H13V8H7V10ZM5 22C4.45 22 3.979 21.804 3.587 21.412C3.195 21.02 2.99934 20.5493 3 20V4C3 3.45 3.196 2.979 3.588 2.587C3.98 2.195 4.45067 1.99934 5 2H14L21 9V20C21 20.55 20.804 21.021 20.412 21.413C20.02 21.805 19.5493 22.0007 19 22H5ZM13 9V4H5V20H19V11H13V9Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const tabs = [
  { id: "all", label: "All" },
  { id: "project", label: "Project" },
];

// ─── Default fallback notifications ───────────────────────────────────────────

const defaultNotifications: NotificationItem[] = [];

// ─── Row Component with User Lookup ───────────────────────────────────────────

interface NotificationItemRowProps {
  notification: any;
  getTimeAgo: (date: string) => string;
  getFileIcon: (type: string) => React.ReactNode;
  onClick: (id: string, isRead: boolean) => void;
  onClose?: () => void;
}

function NotificationItemRow({
  notification,
  getTimeAgo,
  getFileIcon,
  onClick,
  onClose,
}: NotificationItemRowProps) {
  const { data: userByIdData } = useGetUserByIdQuery(notification.senderId, {
    skip: !notification.senderId,
  });
  const userById = userByIdData?.data;

  const { role } = useGetUser();
  const navigate = useNavigate();

  const isRead =
    notification.isRead !== undefined
      ? notification.isRead
      : notification.status === "read";

  const displayName =
    userById?.name ||
    notification?.sender?.name ||
    notification?.user?.name ||
    "System";

  const displayAvatar =
    userById?.profileImage ||
    userById?.avatar ||
    notification?.sender?.avatar ||
    notification?.user?.avatar ||
    "";

  const displayInitials = (
    userById?.name ||
    notification?.sender?.name ||
    notification?.user?.name ||
    "S"
  )
    .substring(0, 2)
    .toUpperCase();

  const contextText = (notification.context || notification.action || "").toLowerCase();
  const isUploadReminder =
    notification.type?.toLowerCase() === "reminder" &&
    contextText.includes("upload required");

  const projectId = notification.projectId || notification.project?.id || notification.metadata?.projectId || notification.data?.projectId;

  const { data: projectDetails } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });

  const programId =
    notification.programId ||
    notification.program?.id ||
    notification.metadata?.programId ||
    notification.data?.programId ||
    projectDetails?.data?.project?.programId ||
    projectDetails?.data?.project?.program?.id ||
    projectDetails?.data?.programId ||
    projectDetails?.data?.program?.id;

  const dynamicActions = [];
  if (isUploadReminder && projectId) {
    dynamicActions.push({
      label: "Upload Project Data",
      variant: "default",
      onClick: () => {
        let path = "";
        const roleUpper = role?.toUpperCase();
        if (roleUpper === "CLIENT") {
          path = `/client-panel/project-builder/file-upload/${projectId}`;
        } else if (roleUpper === "MANAGER") {
          path = `/staff-manager-panel/projects/upload-submission?projectId=${projectId}${programId ? `&programId=${programId}` : ""}`;
        } else if (roleUpper === "EMPLOYEE") {
          path = `/staff-employee-panel/upload-submission?projectId=${projectId}${programId ? `&programId=${programId}` : ""}`;
        }
        if (path) {
          navigate(path);
          onClose?.();
        }
      }
    });
  }

  const allActions = [
    ...(notification?.actions || []),
    ...dynamicActions
  ];

  return (
    <div
      className={cn(
        "p-4 border-b border-border dark:border-slate-800 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50",
        !isRead ? "bg-blue-50/40 dark:bg-blue-900/10" : "bg-white dark:bg-slate-900",
      )}
      onClick={() => onClick(notification.id, isRead)}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative shrink-0 h-10 w-10">
          <Avatar className="h-10 w-10 border border-border dark:border-slate-800">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="text-xs font-medium bg-gray-100 dark:bg-slate-800 dark:text-slate-400">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
          {/* Unread dot */}
          {!isRead && (
            <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-300">
            <span className="font-bold text-gray-900 dark:text-slate-100">
              {displayName}
            </span>{" "}
            <span className="text-gray-500 dark:text-slate-400">
              {notification?.context || notification?.action}
            </span>{" "}
            {notification?.target && (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {notification?.target}
              </span>
            )}
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {notification.createdAt
                ? getTimeAgo(notification.createdAt)
                : notification.timestamp}
            </span>
            {notification.type && (
              <>
                <span className="text-xs text-gray-300 dark:text-slate-600">•</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">
                  {notification.type.replace(/_/g, " ").toLowerCase()}
                </span>
              </>
            )}
          </div>

          {/* Comment box */}
          {notification?.comment && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-border dark:border-slate-700/60">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  {notification?.comment?.mention}
                </span>{" "}
                {notification?.comment?.text}
              </p>
              {notification?.comment?.hasReply && (
                <div className="mt-2 relative">
                  <input
                    type="text"
                    placeholder="Reply…"
                    className="w-full h-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 pr-9 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200 dark:placeholder:text-slate-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 12l18-9-9 18-2-7z" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Attachment */}
          {notification?.attachment && (
            <div className="mt-2 flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden h-11">
              {getFileIcon(notification?.attachment?.type)}
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400 truncate flex-1 pr-3">
                {notification?.attachment?.name}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {allActions.length > 0 && (
            <div className={cn("flex items-center gap-2 mt-3", notification?.type === "project" && "justify-end")}>
              {allActions.map((action: any, index: number) => (
                <Button
                  key={index}
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); action.onClick?.(); }}
                  className={cn(
                    "h-8 px-4 text-xs font-semibold rounded-lg transition-all border-0",
                    action.variant === "default"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : action.variant === "destructive"
                        ? "bg-red-100 dark:bg-rose-500/20 text-red-600 dark:text-rose-400 hover:bg-red-200 dark:hover:bg-rose-500/30"
                        : action.variant === "secondary"
                          ? "bg-indigo-100 dark:bg-blue-500/20 text-indigo-600 dark:text-blue-400 hover:bg-indigo-200 dark:hover:bg-blue-500/30"
                          : "bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800",
                  )}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationModal({
  isOpen,
  onClose,
  notifications = defaultNotifications,
  className,
}: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [localPerms, setLocalPerms] = useState<Partial<NotificationPermissions>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const token = useAppSelector((state) => state.auth.user?.accessToken);
  const dispatch = useAppDispatch();
  const { role, currentRoute } = useGetUser();
  const normalizedRole = role?.toUpperCase();

  // ── Data queries ──────────────────────────────────────────────────────────
  const { data: notificationData, refetch: refetchNotifications } = useGetNotificationsQuery(undefined, {
    skip: !isOpen,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const { data: permissionsData, isLoading: permissionsLoading } = useGetNotificationPermissionsQuery(undefined, {
    skip: !isOpen || !showSettings,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [updateNotification] = useUpdateNotificationMutation();
  const [readAllNotification] = useReadAllNotificationMutation();
  const [updateClient] = useUpdateNotificationPermissionsClientMutation();
  const [updateEmployee] = useUpdateNotificationPermissionsEmployeeMutation();
  const [updateManager] = useUpdateNotificationPermissionsManagerMutation();
  const [updateViewer] = useUpdateNotificationPermissionsViewerMutation();

  // ── Sync permissions to local state when loaded ───────────────────────────
  useEffect(() => {
    if (permissionsData?.data) {
      setLocalPerms(permissionsData.data);
    }
  }, [permissionsData]);

  // ── Mark all read when panel opens ────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      readAllNotification(undefined);
    }
  }, [isOpen, readAllNotification]);

  // ── Reset to notifications view when modal closes ─────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setShowSettings(false);
      setActiveTab("all");
    }
  }, [isOpen]);

  // ── Socket — listen for real-time notifications ───────────────────────────
  useEffect(() => {
    if (!token) return;

    const socketInstance = connectSocket(token as string);

    const handleNotification = (_data: any) => {
      // Invalidate the notifications cache so RTK Query re-fetches
      dispatch(baseApi.util.invalidateTags(["Notification"]));
      refetchNotifications();
    };

    // The guide specifies the event name is 'notification_received'
    socketInstance.on("notification_received", handleNotification);
    // Also keep legacy fallback
    socketInstance.on("notification", handleNotification);

    return () => {
      socketInstance.off("notification_received", handleNotification);
      socketInstance.off("notification", handleNotification);
    };
  }, [token, dispatch, refetchNotifications]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const currentNotifications = useMemo(
    () => notificationData?.data || notifications || [],
    [notificationData, notifications],
  );

  const filteredNotifications = useMemo(() => {
    return (currentNotifications as any[]).filter((n) => {
      const type = n.type?.toLowerCase() || "";
      switch (activeTab) {
        case "project":
          return type.includes("project") || type.includes("activity");
        default:
          return true;
      }
    });
  }, [currentNotifications, activeTab]);

  const unreadCount = useMemo(
    () => currentNotifications.filter((n: any) => n.isRead === false || n.status === "new").length,
    [currentNotifications],
  );

  // ── Permission fields based on role ──────────────────────────────────────
  const permissionFields = useMemo(() => {
    if (normalizedRole === "EMPLOYEE") return EMPLOYEE_PERMISSIONS;
    if (normalizedRole === "MANAGER") return MANAGER_PERMISSIONS;
    if (normalizedRole === "VIEWER") return VIEWER_PERMISSIONS;
    return CLIENT_PERMISSIONS; // CLIENT + fallback
  }, [normalizedRole]);

  // ── Toggle a permission and PATCH immediately ─────────────────────────────
  const handlePermissionToggle = useCallback(
    async (key: keyof NotificationPermissions, value: boolean) => {
      const updated = { ...localPerms, [key]: value };
      setLocalPerms(updated);
      setSavingKey(key as string);

      try {
        const payload = { [key]: value };
        if (normalizedRole === "EMPLOYEE") {
          await updateEmployee(payload).unwrap();
        } else if (normalizedRole === "MANAGER") {
          await updateManager(payload).unwrap();
        } else if (normalizedRole === "VIEWER") {
          await updateViewer(payload).unwrap();
        } else {
          await updateClient(payload).unwrap();
        }
        toast.success("Preference saved");
      } catch {
        // Revert on error
        setLocalPerms((prev) => ({ ...prev, [key]: !value }));
        toast.error("Failed to save preference");
      } finally {
        setSavingKey(null);
      }
    },
    [localPerms, normalizedRole, updateClient, updateEmployee, updateManager, updateViewer],
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return "just now";
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await updateNotification(id).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 h-[85vh] max-h-[540px] w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-xl z-50 flex flex-col shadow-2xl border border-border dark:border-slate-800",
          className,
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {showSettings && (
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors mr-1"
              >
                <ArrowLeft className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>
            )}
            <h4 className="font-semibold text-base text-gray-900 dark:text-slate-100">
              {showSettings ? "Notification Settings" : "Notifications"}
            </h4>
            {!showSettings && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 cursor-pointer text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Tabs row (only in notification view) ───────────────────────── */}
        {!showSettings && (
          <div className="flex items-center justify-between px-4 border-b border-border dark:border-slate-800 shrink-0">
            <div className="flex space-x-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "text-xs font-semibold transition-colors py-2.5 cursor-pointer",
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Notification Settings"
            >
              <Settings className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
            </button>
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">

          {/* ── Settings panel ──────────────────────────────────────────── */}
          {showSettings ? (
            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 px-1 pb-2">
                {normalizedRole} preferences
              </p>

              {permissionsLoading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-32 bg-gray-100 dark:bg-slate-800 rounded-md animate-pulse" />
                      <div className="h-3 w-48 bg-gray-100 dark:bg-slate-800 rounded-md animate-pulse" />
                    </div>
                    <div className="h-5 w-9 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse ml-4" />
                  </div>
                ))
              ) : (
                permissionFields.map((item) => {
                  const isOn = localPerms[item.key] !== false; // default true
                  const isSaving = savingKey === item.key;
                  return (
                    <div
                      key={item.key as string}
                      className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 leading-tight">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                      <Toggle
                        checked={isOn}
                        onChange={(v) => handlePermissionToggle(item.key, v)}
                        disabled={isSaving}
                      />
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ── Notification list ──────────────────────────────────────── */
            <>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification: any) => (
                  <NotificationItemRow
                    key={notification.id}
                    notification={notification}
                    getTimeAgo={getTimeAgo}
                    getFileIcon={getFileIcon}
                    onClick={handleNotificationClick}
                    onClose={onClose}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-slate-500">No notifications yet</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── View all footer (notification list only) ────────────────── */}
        {!showSettings && (
          <div className="shrink-0 border-t border-border dark:border-slate-800 px-4 py-2.5">
            <Link
              to={`${currentRoute}/notifications`}
              onClick={onClose}
              className="flex items-center justify-center w-full py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
