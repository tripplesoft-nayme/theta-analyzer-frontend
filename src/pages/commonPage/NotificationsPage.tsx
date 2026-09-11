/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Bell, CheckCheck, Search, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
  useReadAllNotificationMutation,
} from "@/store/Api/NotificationApi/NotificationApi";
import { useGetUserByIdQuery } from "@/store/Api/UserApi/UserApi";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTimeAgo = (dateString: string) => {
  try {
    if (!dateString) return "just now";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "just now";
  }
};

/** Strip "NOTIFICATION_" or similar prefix and humanise the type label */
const formatType = (type: string) =>
  type
    .replace(/^NOTIFICATION[_\s]*/i, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

/** Colour chip per type */
const typeChip = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes("APPROV")) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
  if (t.includes("REJECT")) return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  if (t.includes("REMIND") || t.includes("WEEKLY") || t.includes("OVERDUE"))
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
  if (t.includes("ASSIGN") || t.includes("PROJECT") || t.includes("SUBMIT"))
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
  if (t.includes("FILE") || t.includes("IMPORT"))
    return "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400";
  return "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400";
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800 ${className ?? ""}`} />
);

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4">
          <Sk className="h-10 w-10 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2 pt-1">
            <Sk className="h-3.5 w-2/3" />
            <Sk className="h-3 w-1/3" />
          </div>
          <Sk className="h-3 w-14 shrink-0 mt-2" />
        </div>
      ))}
    </div>
  );
}

// ─── Single sender-aware row ──────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
}: {
  notification: any;
  onRead: (id: string, isRead: boolean) => void;
}) {
  // Only fetch by ID when there is a real senderId
  const { data: senderData } = useGetUserByIdQuery(notification.senderId, {
    skip: !notification.senderId,
  });
  const sender = senderData?.data;

  const isRead =
    notification.isRead !== undefined ? notification.isRead : notification.status === "read";

  const displayName = sender?.name || notification?.sender?.name || notification?.user?.name || "System";
  const displayAvatar =
    sender?.profileImage ||
    sender?.avatar ||
    notification?.sender?.avatar ||
    notification?.user?.avatar ||
    "";
  const displayInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <div
      onClick={() => onRead(notification.id, isRead)}
      className={cn(
        "flex gap-4 px-5 py-4 cursor-pointer transition-colors group",
        !isRead
          ? "bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          : "hover:bg-gray-50/80 dark:hover:bg-slate-800/40",
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <Avatar className="h-10 w-10 border border-border dark:border-slate-700">
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-violet-600 text-white">
            {displayInitials}
          </AvatarFallback>
        </Avatar>
        {!isRead && (
          <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">
            <span className={cn("font-semibold", !isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-slate-200")}>
              {displayName}
            </span>
            {notification?.context && (
              <span className="text-gray-500 dark:text-slate-400">
                {" "}{notification.context.trim()}
              </span>
            )}
          </p>
          {/* Timestamp — desktop right */}
          <span className="hidden sm:block shrink-0 text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 whitespace-nowrap">
            {notification.createdAt ? getTimeAgo(notification.createdAt) : ""}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Mobile timestamp */}
          <span className="sm:hidden flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            {notification.createdAt ? getTimeAgo(notification.createdAt) : ""}
          </span>

          {notification.type && (
            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", typeChip(notification.type))}>
              {formatType(notification.type)}
            </span>
          )}

          {!isRead && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
              New
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "project", label: "Project" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const { data: notificationData, isLoading } = useGetNotificationsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [updateNotification] = useUpdateNotificationMutation();
  const [readAllNotification, { isLoading: markingAll }] = useReadAllNotificationMutation();

  const allNotifications: any[] = useMemo(() => {
    const raw = notificationData?.data || [];
    return [...raw].sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [notificationData]);

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => n.isRead === false || n.status === "new").length,
    [allNotifications],
  );

  const filtered = useMemo(() => {
    let list = allNotifications;

    // Tab filter
    switch (activeTab) {
      case "unread":
        list = list.filter((n) => n.isRead === false || n.status === "new");
        break;
      case "project":
        list = list.filter((n) => {
          const t = (n.type || "").toUpperCase();
          return t.includes("PROJECT") || t.includes("ACTIVITY") || t.includes("APPROV") || t.includes("REJECT") || t.includes("SUBMIT");
        });
        break;
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          (n.context || "").toLowerCase().includes(q) ||
          (n.type || "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [allNotifications, activeTab, search]);

  const handleRead = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await updateNotification(id).unwrap();
      } catch {
        // silent
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await readAllNotification(undefined).unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* ── Main card ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-2xl overflow-hidden">

        {/* ── Toolbar: tabs + search + mark all read ────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-0 border-b border-border dark:border-slate-800">
          {/* Tabs */}
          <div className="flex space-x-6 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-sm font-semibold transition-all pb-3.5 pt-1 border-b-2 cursor-pointer",
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-200",
                )}
              >
                {tab.label}
                {tab.id === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-blue-600 text-white text-sm font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto pb-3 sm:pb-4">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notifications…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-8 pr-3 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
              />
            </div>
            {unreadCount > 0 && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="h-9 px-4 text-xs font-semibold border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 shrink-0 gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mark all read</span>
              </Button>
            )}
          </div>
        </div>


        {/* ── List ─────────────────────────────────────────────────────── */}
        {isLoading ? (
          <SkeletonRows />
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
            {filtered.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={handleRead}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                {search ? "No results found" : "All caught up!"}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">
                {search ? `No notifications match "${search}"` : "You have no notifications in this category."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
