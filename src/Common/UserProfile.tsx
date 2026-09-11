import { useState } from "react";
import { ChevronDown, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useGetUser } from "@/hooks/useGetUser";
import { useAppDispatch } from "@/hooks/useRedux";
import { toast } from "sonner";
import { logOut } from "@/store/Slices/AuthSlice/authSlice";
import baseApi from "@/store/Api/BaseApi/BaseApi";
import adminApi from "@/store/Api/BaseApi/AdminApi";

interface UserProfileButtonProps {
  state?: "expanded" | "collapsed";
}

export default function UserProfile({ state }: UserProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { name, role, profileImage } = useGetUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    try {
      dispatch(logOut());
      dispatch(baseApi.util.resetApiState());
      dispatch(adminApi.util.resetApiState());
      toast.success("Logout successful");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const isCollapsed = state === "collapsed";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-auto mt-5 transition-all duration-300 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/60 hover:bg-gray-50 dark:hover:bg-slate-800/80 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${isCollapsed ? "p-2 w-fit mx-auto" : "p-3 w-full"
            }`}
        >
          <div
            className={`flex items-center w-full gap-2 ${isCollapsed ? "justify-center" : "justify-between"
              }`}
          >
            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${isOpen
                  ? "ring-blue-500 dark:ring-blue-400"
                  : "ring-gray-200 dark:ring-slate-700"
                  }`}
              >
                <img
                  src={
                    profileImage ||
                    "https://api.dicebear.com/9.x/initials/svg?seed=" +
                    (name || "User")
                  }
                  alt={name}
                  className="w-full h-full object-cover bg-gray-100 dark:bg-slate-800"
                />
              </div>

              {/* User Info */}
              {!isCollapsed && (
                <div className="flex flex-col items-start text-left max-w-[150px] overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-medium text-gray-900 dark:text-slate-100 truncate">
                      {name}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 capitalize truncate w-full">
                    {role}
                  </span>
                </div>
              )}
            </div>

            {/* Logout Icon */}
            {!isCollapsed && (
              <div
                role="button"
                tabIndex={0}
                className="ml-1 pl-3 border-l border-gray-300 dark:border-slate-600 cursor-pointer hover:opacity-70 active:opacity-50 transition-opacity flex items-center shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLogout();
                }}
              >
                <Power size={20} className="text-red-500 dark:text-red-400" />
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 mt-2 p-1.5 border border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 space-y-0.5 rounded-xl focus:outline-none focus-visible:outline-none ring-0"
      >
        {/* Profile Header Item */}
        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-lg focus:outline-none focus-visible:outline-none focus:bg-gray-50 dark:focus:bg-slate-800"
        >
          <Link to="profile" className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-200 dark:ring-slate-700">
              <img
                src={
                  profileImage ||
                  "https://api.dicebear.com/9.x/initials/svg?seed=" +
                  (name || "User")
                }
                alt={name}
                className="w-full h-full object-cover bg-gray-100 dark:bg-slate-800"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                {name}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 capitalize truncate">
                {role}
              </span>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700/60 h-px my-1" />

        <DropdownMenuItem
          onClick={() => {
            navigate(
              `/${role.toLowerCase() === "employee"
                ? "staff-employee-panel"
                : role.toLowerCase() === "manager"
                  ? "staff-manager-panel"
                  : role.toLowerCase() === "viewer"
                    ? "viewer-panel"
                    : "client-panel"
              }/settings`,
            );
          }}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-slate-200 focus:bg-gray-50 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-slate-100 focus:outline-none transition-colors"
        >
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-slate-200 focus:bg-gray-50 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-slate-100 focus:outline-none transition-colors"
        >
          <Link to="profile">Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700/60 h-px my-1" />

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-400 focus:outline-none transition-colors"
        >
          <Power className="w-4 h-4 mr-2 shrink-0" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
