/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useRef, useEffect } from "react";
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

import { ChevronRight, Star } from "lucide-react";
import { getClientSidebarItems } from "./clientSidebarItems";
import { useGetFavoriteProjectsQuery } from "@/store/Api/FavoriteProjectApi/FavoriteProjectApi";

const ClientSidebar = () => {
  const { getLogo } = useSystemBranding();
  const location = useLocation();
  const { state, isMobile } = useSidebar();
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

  const { data, isLoading } = useGetFavoriteProjectsQuery({});
  const isExpanded = state === "expanded" || isMobile;

  /**
   * 01. Build favorite items
   */
  const favoriteItems = useMemo(() => {
    const projects = data?.data || [];
    return projects.map((item: any) => ({
      icon: <Star className="size-6" />,
      name: item.project.name,
      path: `/client-panel/project-details/${item.project.id}`,
    }));
  }, [data]);

  /**
   * 02. Inject favorites immutably
   */
  const groups = useMemo(() => {
    return getClientSidebarItems()
      .map((group) => {
        if (group.label !== "Favorites") return group;
        return {
          ...group,
          items: favoriteItems,
        };
      })
      .filter((group) => {
        if (group.label === "Favorites") {
          return isLoading || favoriteItems.length > 0;
        }
        return true;
      });
  }, [favoriteItems, isLoading]);

  /**
   * Active route logic
   */
  const isRouteActive = (item: any, parentPath = ""): boolean => {
    const fullPath = item.index
      ? parentPath
      : item.path?.startsWith("/")
        ? item.path
        : `${parentPath}/${item.path}`;

    const currentPath = location.pathname;

    // Special case for Overview Project Details
    if (
      fullPath === "/client-panel" &&
      currentPath.includes("/overview/project-details")
    ) {
      return true;
    }

    // Exact match
    if (currentPath === fullPath) return true;

    // Nested match
    if (
      fullPath !== "/client-panel" &&
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
                      : "text-gray-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
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
                    className="p-0 w-full hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-900 cursor-pointer"
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
                      : "text-gray-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
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
      className="border-r border-slate-200 dark:border-slate-800 px-2 py-8 space-y-8 bg-white dark:bg-slate-900 overflow-y-auto"
    >
      <SidebarHeader className="bg-white dark:bg-slate-900">
        <div
          className={`flex ${!isExpanded ? "flex-col" : ""} items-center justify-between`}
        >
          {
            <Link to="/">
              <img
                src={getLogo(Logo)}
                alt="Logo"
                className={`${isExpanded ? "w-44 h-12" : "w-10 h-10"} object-contain hover:scale-110 duration-300`}
              />
            </Link>
          }

          <SidebarTrigger className={!isExpanded ? "mx-auto hover:bg-slate-100 dark:hover:bg-slate-900 mt-3 -mb-2!" : "ml-auto dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"} />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white! dark:bg-slate-900! grid items-start justify-center scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.map((group) => (
                <SidebarMenuItem key={group.label} className={!isExpanded ? "mb-2" : ""}>
                  {isExpanded && (
                    <SidebarGroupLabel className="text-[#64748B] dark:text-slate-300 text-sm font-medium">
                      {group.label}
                    </SidebarGroupLabel>
                  )}

                  <SidebarMenu className="space-y-2">
                    {group.label === "Favorites" && isLoading
                      ? renderFavoritesSkeleton()
                      : group.items.map((item: any) => (
                        <NavItem key={item.path} item={item} />
                      ))}
                  </SidebarMenu>

                  {isExpanded && <hr className="w-56 text-slate-300 dark:text-slate-800 my-5" />}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white dark:bg-slate-900">
        <UserProfile state={isExpanded ? "expanded" : "collapsed"} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default ClientSidebar;
