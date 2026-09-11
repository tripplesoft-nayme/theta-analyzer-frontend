import {
  ChartPie,
  FileChartColumnIncreasing,
  Folder,
  Grid2x2,
  // Headphones,
  // Info,
  // Milestone,
  // Phone,
  // UserStar,
  // Ticket,
  // TicketPlus,
  Megaphone,
  Building2,
  Store,
  Bell,
} from "lucide-react";
import { IoSettingsOutline } from "react-icons/io5";

interface SidebarItem {
  icon?: React.ReactElement;
  name?: string;
  path?: string;
  header?: string;
  description?: string;
  hidden?: boolean;
  children?: SidebarItem[];
  index?: boolean;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const getStaffManagerSidebarItems = (): SidebarGroup[] => {
  return [
    {
      label: "Main Menu",
      items: [
        {
          header: "Good Afternoon 👋",
          description: "This is dashboard overview of Theta Analyzer",
          icon: <ChartPie />,
          name: "Overview",
          path: "/staff-manager-panel",
        },
        {
          header: "Projects",
          description: "Manage and track your projects",
          icon: <Folder />,
          name: "Projects",
          path: "/staff-manager-panel/projects",
        },
        {
          header: "Programs",
          description: "Manage your programs and portfolios",
          icon: <Grid2x2 />,
          name: "All Program",
          path: "/staff-manager-panel/all-program",
        },
        {
          header: "Project Builder",
          description: "Build and configure project dashboards",
          icon: <Grid2x2 />,
          name: "Project Builder",
          path: "/staff-manager-panel/project-builder",
        },
        {
          header: "Project Review",
          description: "Review and approve project submissions",
          icon: <FileChartColumnIncreasing />,
          name: "Project Review",
          path: "/staff-manager-panel/project-review",
        },
      ],
    },
    {
      label: "Favorites",
      items: [
        {
          header: "Marketing Strategy",
          description: "Analyze and plan marketing campaigns",
          icon: <Megaphone />,
          name: "Marketing Strategy",
          path: "/staff-manager-panel/marketing-strategy",
        },
        {
          header: "Alfala Building",
          description: "Project management for Alfala Building",
          icon: <Building2 />,
          name: "Alfala Building",
          path: "/staff-manager-panel/alfala-building",
        },
        {
          header: "Timo's Super Shop",
          description: "Operational dashboard for Timo's Super Shop",
          icon: <Store />,
          name: "Timo's Super Shop",
          path: "/staff-manager-panel/timos-super-shop",
        },
      ],
    },
    {
      label: "Support",
      items: [
        {
          header: "Notifications",
          description: "View all your notifications",
          icon: <Bell />,
          name: "Notifications",
          path: "/staff-manager-panel/notifications",
        },
        {
          header: "Settings",
          description: "Configure your account and preferences",
          icon: <IoSettingsOutline className="size-6" />,
          name: "Settings",
          path: "/staff-manager-panel/settings",
        },
      ],
    },
  ];
};
