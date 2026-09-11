import { useState } from "react";
import { Search, Bell, Download, ChevronDown, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { NavLink, useLocation } from "react-router-dom";
import Breadcrumbs from "../Breadcumbs";

const AdminTopBar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  function downloadFile(filePath: string, fileName: string) {
    const a = document.createElement("a");
    a.href = filePath;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  const mockNotifications = [
    {
      id: 1,
      title: "New client registered",
      message: "Acme Corp has joined your platform",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "System maintenance",
      message: "Scheduled maintenance tonight at 2 AM",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment received",
      message: "$2,500 payment from TechStart Inc",
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 4,
      title: "Alert resolved",
      message: "Server performance issue has been fixed",
      time: "1 day ago",
      unread: false,
    },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 1 Week");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("[v0] Searching for:", searchQuery);
      alert(`Searching for: ${searchQuery}`);
    }
  };
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, unread: false }))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleExport = async () => {
    const Swal = (await import("sweetalert2")).default;
    Swal.fire({
      title: "Exported Successfully.",
      icon: "success",
      draggable: true,
      confirmButtonText: "Download Now",
    }).then((result) => {
      if (result.isConfirmed) {
        downloadFile("/download.pdf", "download.pdf");
      }
    });
  };
  const isSingleClientRoute = location.pathname.startsWith("/admin/clients");
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {user ? (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome, {user.name} 👋
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                This is dashboard overview of your Theta analyzers
              </p>
            </div>
          ) : (
            <p>No User Logged In.</p>
          )}

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search anything here..."
                className="pl-10 pr-16 w-80 bg-white border-gray-200 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="inline-flex items-center rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-500">
                  ⌘ K
                </kbd>
              </div>
            </form>

            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <Card className="absolute right-0 top-12 w-96 z-50 shadow-xl border border-gray-200 rounded-lg bg-white">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Mark all read
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                        </Button>
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex flex-col p-4 cursor-pointer transition-colors duration-200 rounded-lg mx-2 my-1 ${notification.unread
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                            }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-gray-800">
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <Badge
                                variant="secondary"
                                className="h-2 w-2 p-0 rounded-full bg-blue-500"
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">
                          No notifications
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Time Period Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <Button className="gap-2 bg-white border border-border text-gray-600 cursor-pointer">
                  {selectedPeriod}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-border bg-white cursor-pointer"
              >
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600"
                  onClick={() => setSelectedPeriod("Last 24 Hours")}
                >
                  Last 24 Hours
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600"
                  onClick={() => setSelectedPeriod("Last 1 Week")}
                >
                  Last 1 Week
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600"
                  onClick={() => setSelectedPeriod("Last 1 Month")}
                >
                  Last 1 Month
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600"
                  onClick={() => setSelectedPeriod("Last 3 Months")}
                >
                  Last 3 Months
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-600"
                  onClick={() => setSelectedPeriod("Last 1 Year")}
                >
                  Last 1 Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            {isSingleClientRoute ? (
              <NavLink to="/admin/addClient">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-[300ms]">
                  <Plus className="h-4 w-4 text-white" />
                  Add Client
                </Button>
              </NavLink>
            ) : (
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-gray-200 cursor-pointer transition-[300ms]"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Breadcrumbs />
        </div>
      </div>
    </>
  );
};

export default AdminTopBar;
