import { useState } from "react";
import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface NotificationAction {
  label: string;
  variant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
  onClick: () => void;
}

export interface NotificationItem {
  id: string;
  type: "project" | "team" | "system" | "file";
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  team?: string;
  actions?: NotificationAction[];
  attachment?: {
    name: string;
    type: "pdf" | "doc" | "image";
  };
  status?: "new" | "read";
  priority?: "high" | "medium" | "low";
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  className?: string;
}

// 🧩 Default notifications
const defaultNotifications: NotificationItem[] = [
  {
    id: "1",
    type: "project",
    user: {
      name: "Jhon Doe",
      avatar: "avatar-1.png",
      initials: "JD",
    },
    action: "uploaded data in",
    target: "Carlyle Hall Project",
    timestamp: "12 mins ago",
    team: "Sales Team",
    actions: [
      { label: "Reply", variant: "outline", onClick: () => { } },
      {
        label: "Review Project",
        variant: "default",
        onClick: () => { },
      },
    ],
    status: "new",
  },
  {
    id: "2",
    type: "team",
    user: {
      name: "Leslie Alexander",
      avatar: "avatar-2.png",
      initials: "LA",
    },
    action: "added new tag to",
    target: "Carlyle Hall Project",
    timestamp: "10 mins ago",
    team: "Marketing Team",
    actions: [
      {
        label: "Minimal Delivery",
        variant: "outline",
        onClick: () => { },
      },
      {
        label: "Delivery Due",
        variant: "destructive",
        onClick: () => { },
      },
    ],
    status: "read",
  },
  {
    id: "3",
    type: "project",
    user: {
      name: "Leslie Alexander",
      avatar: "avatar-3.png",
      initials: "LA",
    },
    action: "requested access to",
    target: "Carlyle Hall Project",
    timestamp: "5 mins ago",
    team: "Sales Team",
    actions: [
      { label: "Decline", variant: "outline", onClick: () => { } },
      { label: "Accept", variant: "default", onClick: () => { } },
    ],
    status: "new",
  },
  {
    id: "4",
    type: "file",
    user: {
      name: "Jhon Doe",
      avatar: "avatar-1.png",
      initials: "JD",
    },
    action: "uploaded a new file in",
    target: "Carlyle Hall Project",
    timestamp: "2 mins ago",
    team: "Sales Team",
    attachment: {
      name: "Archa_builder_requirement file.pdf",
      type: "pdf",
    },
    status: "new",
  },
  {
    id: "5",
    type: "team",
    user: {
      name: "Leslie Alexander",
      avatar: "avatar-2.png",
      initials: "LA",
    },
    action: "added a new call to",
    target: "Carlyle Hall Project",
    timestamp: "8 mins ago",
    team: "Support Team",
    status: "read",
  },
];

const tabs = [
  { id: "all", label: "All" },
  { id: "inbox", label: "Inbox" },
  { id: "project", label: "Project" },
  { id: "team", label: "Team" },
];

export default function NotificationModal({
  isOpen,
  onClose,
  notifications = defaultNotifications,
  className,
}: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState("all");

  // 🔹 Filtering logic
  const filteredNotifications = notifications.filter((n) => {
    switch (activeTab) {
      case "inbox":
        return n.status === "new";
      case "project":
        return n.type === "project";
      case "team":
        return n.type === "team";
      default:
        return true; // "all"
    }
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "doc":
        return "📝";
      case "image":
        return "🖼️";
      default:
        return "📎";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}></div>
      <div
        className={cn(
          "absolute right-14 top-15 h-[85vh] w-96 bg-white rounded-lg z-50 flex flex-col shadow-xl",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold text-lg">Notifications</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-sm font-medium transition-colors pb-1 cursor-pointer",
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                  notification.status === "new" && "bg-blue-50",
                )}
              >
                <div className="flex space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      src={notification.user.avatar || "/placeholder.svg"}
                      alt={notification.user.name}
                    />
                    <AvatarFallback className="text-xs font-medium">
                      {notification.user.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {notification.user.name}
                      </span>{" "}
                      {notification.action}{" "}
                      {notification.target && (
                        <span className="text-blue-600 font-medium">
                          {notification.target}
                        </span>
                      )}
                    </p>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {notification.timestamp}
                      </span>
                      {notification.team && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {notification.team}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Attachment */}
                    {notification.attachment && (
                      <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded-md">
                        <span className="text-sm">
                          {getFileIcon(notification.attachment.type)}
                        </span>
                        <span className="text-xs text-gray-600 truncate ">
                          {notification.attachment.name}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    {notification.actions &&
                      notification.actions.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant || "outline"}
                              size="sm"
                              onClick={action.onClick}
                              className="h-7 px-3 text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              No notifications found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 bg-white border border-gray-200 p-4 cursor-pointer"
          >
            Archive All
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Mark All as Read
          </Button>
        </div>
      </div>
    </>
  );
}
