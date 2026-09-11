
// import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import { socket, connectSocket, disconnectSocket } from "@/lib/socket";
// import { useGetNotificationsQuery } from "@/store/Api/NotificationApi/NotificationApi";

// // --- Types (copied/adapted from NotificationModalNew.tsx) ---
// export interface NotificationApiItem {
//     id: string;
//     senderId: string;
//     receiverIds: string[];
//     projectId: string | null;
//     context: string;
//     type: "NEW_EMPLOYEE_ASSIGNED";
//     isRead: boolean;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface NotificationAction {
//     label: string;
//     variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
//     onClick: () => void;
// }

// export interface NotificationItem {
//     id: string;
//     type: "project" | "team" | "system" | "file";
//     user: {
//         name: string;
//         avatar: string;
//         initials: string;
//     };
//     action: string;
//     target?: string;
//     timestamp: string;
//     team?: string;
//     actions?: NotificationAction[];
//     attachment?: {
//         name: string;
//         type: "pdf" | "doc" | "image";
//     };
//     status?: "new" | "read";
//     projectId?: string | null;
// }

// // --- Helper Functions ---
// const timeAgo = (date: string) => {
//     const diff = Date.now() - new Date(date).getTime();
//     const mins = Math.floor(diff / 60000);
//     if (mins < 60) return `${mins} mins ago`;
//     const hrs = Math.floor(mins / 60);
//     if (hrs < 24) return `${hrs} hrs ago`;
//     return `${Math.floor(hrs / 24)} days ago`;
// };

// const getInitials = (name: string) =>
//     name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .toUpperCase();

// const parseContext = (context: string) => {
//     const match = context.match(/"(.*?)"/);
//     return {
//         action: match ? context.replace(match[0], "").trim() : context,
//         target: match ? match[1] : undefined,
//     };
// };

// const mapApiToNotificationItem = (api: NotificationApiItem): NotificationItem => {
//     const { action, target } = parseContext(api.context);
//     const systemUser = "System";

//     return {
//         id: api.id,
//         type: api.projectId ? "project" : "system",
//         user: {
//             name: systemUser,
//             avatar: "",
//             initials: getInitials(systemUser),
//         },
//         action,
//         target,
//         timestamp: timeAgo(api.createdAt),
//         status: api.isRead ? "read" : "new",
//         actions: [
//             {
//                 label: "View",
//                 variant: "default",
//                 onClick: () => {
//                     console.log("View notification:", api.id);
//                 },
//             },
//         ],
//         projectId: api.projectId,
//     };
// };

// interface NotificationContextType {
//     notifications: NotificationItem[];
//     unreadCount: number;
//     isConnected: boolean;
// }

// const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// export const NotificationProvider = ({ children }: { children: ReactNode }) => {
//     const [realtimeNotifications, setRealtimeNotifications] = useState<NotificationItem[]>([]);
//     const { data } = useGetNotificationsQuery();
//     console.log("Notification Data", data?.data);
//     // Combine API data and Realtime data
//     const notifications = React.useMemo(() => {
//         // Use a Map to deduplicate by ID, preferring realtime (newer) or API
//         const combined = new Map<string, NotificationItem>();

//         // 1. Add API notifications
//         if (data?.data) {
//             data.data.forEach((apiItem: NotificationApiItem) => {
//                 combined.set(apiItem.id, mapApiToNotificationItem(apiItem));
//             });
//         }

//         // 2. Add/Override with Realtime notifications
//         realtimeNotifications.forEach((item) => {
//             combined.set(item.id, item);
//         });

//         // Convert back to array and sort by time (newest first) - simplistic approach
//         // For a robust sort, we might need to parse 'timestamp' or store raw createdAt.
//         // Here we assume API returns sorted and we prepend realtime.
//         // But since we are merging via Map, order is insertion order in the Map if we iterate.
//         // To be safe, let's just reverse the map values or rely on the fact that we want
//         // latest first.
//         // Actually, let's just trust the API order and prepend new ones if duplication isn't an issue.
//         // But deduplication is required.

//         // Better approach:
//         // API data is usually historical. Socket data is new.
//         // We can just PREPEND unique realtime items to the API list.
//         const apiList = data?.data ? data.data.map(mapApiToNotificationItem) : [];
//         const apiIds = new Set(apiList.map((n: NotificationItem) => n.id));

//         const uniqueRealtime = realtimeNotifications.filter(n => !apiIds.has(n.id));

//         return [...uniqueRealtime, ...apiList];

//     }, [data, realtimeNotifications]);

//     const unreadCount = notifications.filter((n) => n.status === "new").length;

//     const [isConnected, setIsConnected] = useState(false);

//     useEffect(() => {
//         const token = localStorage.getItem("accessToken");
//         if (token) {
//             connectSocket(token);
//         }

//         const handleNotification = (payload: NotificationApiItem) => {
//             console.log("Socket: Notification Received", payload);
//             const mapped = mapApiToNotificationItem(payload);
//             setRealtimeNotifications((prev) => {
//                 // Prevent duplicate addition in state
//                 if (prev.some(n => n.id === mapped.id)) return prev;
//                 return [mapped, ...prev];
//             });
//         };

//         const handleConnect = () => {
//             console.log("Socket connected:", socket.id);
//             setIsConnected(true);
//         };

//         const handleDisconnect = () => {
//             console.log("Socket disconnected");
//             setIsConnected(false);
//         };

//         const handleConnectError = (err: Error) => {
//             console.error("Socket connection error:", err);
//             setIsConnected(false);
//         };

//         socket.on("connect", handleConnect);
//         socket.on("disconnect", handleDisconnect);
//         socket.on("connect_error", handleConnectError);
//         socket.on("notification_received", handleNotification);
//         socket.on("notification", handleNotification); // Fallback for legacy event name

//         return () => {
//             socket.off("connect", handleConnect);
//             socket.off("disconnect", handleDisconnect);
//             socket.off("connect_error", handleConnectError);
//             socket.off("notification_received", handleNotification);
//             socket.off("notification", handleNotification);
//             disconnectSocket();
//         };
//     }, []); // Run once on mount

//     return (
//         <NotificationContext.Provider value={{ notifications, unreadCount, isConnected }}>
//             {children}
//         </NotificationContext.Provider>
//     );
// };

// export const useNotification = () => {
//     const context = useContext(NotificationContext);
//     if (!context) {
//         throw new Error("useNotification must be used within a NotificationProvider");
//     }
//     return context;
// };
