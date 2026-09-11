import {
  ChartPie,
  FileChartColumnIncreasing,
  Folder,
  Bell,
  // Headphones,
  // Info,
  // Milestone,
  // Phone,
  // UserStar,
  // Ticket,
  // TicketPlus,
  Files,
} from "lucide-react";
import { IoSettingsOutline } from "react-icons/io5";

interface SidebarItem {
  icon?: React.ReactElement;
  name?: string;
  path?: string;
  hidden?: boolean;
  children?: SidebarItem[];
  index?: boolean;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const getStaffEmployeeSidebarItems = (): SidebarGroup[] => {
  return [
    {
      label: "Main Menu",
      items: [
        {
          icon: <ChartPie />,
          name: "Overview",
          path: "/staff-employee-panel",
        },
        {
          icon: <Folder />,
          name: "Projects",
          path: "/staff-employee-panel/projects",
        },
        {
          icon: <FileChartColumnIncreasing />,
          name: "Project Review",
          path: "/staff-employee-panel/project-review",
        },
        {
          icon: <Files />,
          name: "Files",
          path: "/staff-employee-panel/files",
        },
      ],
    },
    {
      label: "Favorites",
      items: [
        {
          name: "No favorite projects",
        },
      ],
    },
    {
      label: "Support",
      items: [
        // {
        //   icon: <Info />,
        //   name: "Help",
        //   path: "/staff-employee-panel/help",
        //   children: [
        //     {
        //       icon: <Ticket  />,
        //       path: "support",
        //       name: "Support Ticket",
        //     },
        //     {
        //       icon: <TicketPlus />,
        //       path: "create-tickets",
        //       name: "Create Ticket",
        //     },
        //     {
        //       icon: <UserStar />,
        //       path: "feedback",
        //       name: "Feedback",
        //     },
        //     {
        //       icon: <Milestone />,
        //       path: "product-tour",
        //       name: "Product Tour",
        //     },
        //     {
        //       icon: <Phone />,
        //       path: "contact-us",
        //       name: "Contact US",
        //     },
        //   ],
        // },
        {
          icon: <Bell />,
          name: "Notifications",
          path: "/staff-employee-panel/notifications",
        },
        {
          icon: <IoSettingsOutline className="size-6" />,
          name: "Settings",
          path: "/staff-employee-panel/settings",
        },
      ],
    },
  ];
};
