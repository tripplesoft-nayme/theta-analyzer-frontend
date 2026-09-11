/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/client/logo.png";
import UserProfile from "@/Common/UserProfile";
import { useSystemBranding } from "@/hooks/useSystemBranding";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ChevronRight, Heart } from "lucide-react";
import { getStaffManagerSidebarItems } from "./staffManagerSidebarItem";
import { useGetFavoriteProjectsQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";

interface favorite {
  id: string;
  name: string;
  path: string;
  icon?: React.ReactElement;
}

const StaffManagerSidebar = () => {
  const { getLogo } = useSystemBranding();
  const { state, isMobile } = useSidebar();
  const { pathname } = useLocation();
  const groups = getStaffManagerSidebarItems();

  const { data, isLoading } = useGetFavoriteProjectsQuery();

  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => !!document.fullscreenElement
  );

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreenActive(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  const isExpanded = state === "expanded" || isMobile;

  const favorites: favorite[] = [];

  data?.data.forEach((item: any) => {
    favorites.push({
      id: item.project.id,
      name: item.project.name,
      path: `/staff-manager-panel/projects/project-details/${item.project.id}`,
      icon: <Heart />,
    });
  });

  groups[1].items = favorites || groups[1].items;

  // Active logic — active if route matches current path or any child route matches
  const isRouteActive = (item: any, parentPath = ""): boolean => {
    const fullPath = item.index
      ? parentPath
      : item.path?.startsWith("/")
        ? item.path
        : `${parentPath}/${item.path}`;

    const currentPath = pathname;

    // Exact match
    if (currentPath === fullPath) return true;

    // Nested match: current path starts with item path followed by a slash
    // We exclude the base root path to prevent it from matching every sub-route
    if (
      fullPath !== "/staff-manager-panel" &&
      fullPath !== "" &&
      currentPath.startsWith(fullPath + "/")
    ) {
      return true;
    }

    if (item.children) {
      return item.children.some((child: any) => isRouteActive(child, fullPath));
    }
    return false;
  };

  const NavItem = ({
    item,
    parentPath = "",
  }: {
    item: any;
    parentPath?: string;
  }) => {
    const { isMobile, setOpenMobile } = useSidebar();
    const isExpandedState = state === "expanded" || isMobile;
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      if (!isExpandedState) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isExpandedState) {
        timeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 150);
      }
    };

    const fullPath = item.index
      ? parentPath
      : item.path?.startsWith("/")
        ? item.path
        : `${parentPath}/${item.path}`;

    const active = isRouteActive(item, parentPath);

    if (item.children && item.children.length > 0) {
      return (
        <SidebarMenuItem key={fullPath} className="w-full">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="w-full"
          >
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <DropdownMenuTrigger
                asChild
                className="border-none p-3"
              >
                <button
                  className={`self-stretch rounded-[10px] inline-flex items-center transition-colors duration-200
                    ${isExpandedState
                      ? "px-4 py-3 justify-start w-full"
                      : "p-3 justify-center"
                    }
                    ${active
                      ? "bg-sidebar-active-gradient text-white hover:text-white"
                      : "text-gray-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <div
                    className={`flex items-center ${isExpandedState
                      ? "justify-between w-full"
                      : "justify-center"
                      }`}
                  >
                    <span
                      className={`flex items-center ${isExpandedState ? "gap-3" : ""}`}
                    >
                      <span className="size-6 shrink-0 flex items-center justify-center">{item.icon}</span>
                      {isExpandedState && (
                        <span className="text-base font-normal truncate">
                          {item.name}
                        </span>
                      )}
                    </span>

                    {isExpandedState && (
                      <ChevronRight
                        size={20}
                        className={`shrink-0 transition-transform ${isOpen ? "rotate-90 duration-200" : ""
                          }`}
                      />
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                side={!isExpandedState ? "right" : "bottom"}
                align={!isExpandedState ? "start" : "end"}
                sideOffset={!isExpandedState ? 4 : 4}
                className="bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-800 p-1 min-w-[200px]"
              >
                {item.children.map((child: any) => (
                  <DropdownMenuItem
                    key={`${fullPath}-${child.path}`}
                    asChild
                    className="p-0 w-full hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer"
                  >
                    <div className="w-full">
                      <NavItem item={child} parentPath={fullPath} />
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={fullPath} className="w-full">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={fullPath}
                className="w-full block"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <div
                  className={`self-stretch rounded-[10px] inline-flex items-center w-full transition-colors duration-200
                    ${isExpandedState
                      ? "px-4 py-3 justify-start"
                      : "p-3 justify-center"
                    }
                    ${active
                      ? "bg-sidebar-active-gradient text-white hover:text-white"
                      : "text-gray-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <div
                    className={`flex items-center ${isExpandedState ? "gap-3" : ""}`}
                  >
                    <span className="size-6 shrink-0 flex items-center justify-center">{item.icon}</span>
                    {isExpandedState && (
                      <span className="text-base font-normal w-full truncate">
                        {item.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </TooltipTrigger>
            {!isExpandedState && (
              <TooltipContent side="right" sideOffset={10} className="font-medium">
                {item.name}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
  };
  const renderFavoritesSkeleton = () =>
    Array.from({ length: 3 }).map((_, idx) => (
      <SidebarMenuItem key={`fav-skeleton-${idx}`}>
        <div
          className={`rounded-[10px] flex items-center animate-pulse
          ${isExpanded ? "px-4 py-5 gap-2" : "px-2 py-3 justify-center"}`}
        >
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
          {isExpanded && <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />}
        </div>
      </SidebarMenuItem>
    ));

  if (isFullscreenActive) return null;

  return (
    <Sidebar
      collapsible="icon"
      className="border border-slate-200 dark:border-slate-800 px-2 py-8 space-y-8 bg-white dark:bg-slate-900/80 overflow-y-auto [&_[data-sidebar=sidebar]]:bg-transparent"
    >
      <SidebarHeader className="bg-transparent">
        <div
          className={`flex ${!isExpanded ? "flex-col" : ""} items-center justify-between`}
        >
          {
            <Link to="/staff-manager-panel" className="flex items-center justify-center w-full">
              <img
                src={getLogo(Logo)}
                alt="Logo"
                className={`${isExpanded ? "w-44 h-12" : "w-10 h-10"} object-contain hover:scale-110 duration-300 dark:brightness-110`}
              />
            </Link>
          }
          <SidebarTrigger className={!isExpanded ? "mx-auto hover:bg-slate-100 dark:hover:bg-slate-800 mt-3 -mb-2!" : "ml-auto dark:hover:bg-slate-800"} />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent! grid items-start justify-center scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.map((group) => {
                if (group.items.length === 0) return null;
                return (
                  <SidebarMenuItem key={group.label} className={!isExpanded ? "mb-2" : ""}>
                    {isExpanded && (
                      <SidebarGroupLabel className="text-[#64748B] dark:text-slate-500 text-sm font-medium">
                        {group.label}
                      </SidebarGroupLabel>
                    )}

                    <SidebarMenu className="space-y-2">
                      {group.label === "Favorites" && isLoading
                        ? renderFavoritesSkeleton()
                        : group.items.map((item: any) => (
                          <NavItem key={item.path || item.id} item={item} />
                        ))}
                    </SidebarMenu>

                    {isExpanded && <hr className="w-56 border-slate-300 dark:border-slate-800 my-5" />}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-transparent">
        <UserProfile state={isExpanded ? "expanded" : "collapsed"} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default StaffManagerSidebar;
