import {
  Building2,
  ChartPie,
  Folder,
  // Headphones,
  // Info,
  Megaphone,
  // Milestone,
  // Phone,
  Store,
  Bell,
  // UserStar,
  // Ticket,
  // TicketPlus,
} from "lucide-react";
import { IoSettingsOutline } from "react-icons/io5";

interface SidebarItem {
  icon?: React.ReactElement;
  name?: string;
  path?: string;
  hidden?: boolean;
  children?: SidebarItem[];
  index?: boolean;
  header?: string;
  description?: string;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const getViewerPanelSidebarItems = (): SidebarGroup[] => {
  return [
    {
      label: "Main Menu",
      items: [
        {
          icon: <ChartPie />,
          name: "Overview",
          path: "/viewer-panel",
          header: "Welcome, 👋",
          description: "Dashboard overview of Theta Analyzer",
        },
        {
          icon: <Folder />,
          name: "All Program",
          path: "/viewer-panel/all-program",
          header: "All Program",
          description: "Manage and view all your programs",
        },
      ],
    },
    {
      label: "Favorites",
      items: [
        {
          icon: <Megaphone />,
          name: "Marketing Strategy",
          path: "/viewer-panel/marketing-strategy",
        },
        {
          icon: <Building2 />,
          name: "Alfala Building",
          path: "/viewer-panel/alfala-building",
        },
        {
          icon: <Store />,
          name: "Timo's Super Shop",
          path: "/viewer-panel/timos-super-shop",
        },
      ],
    },
    {
      label: "Support",
      items: [
        // {
        //   icon: <Info />,
        //   name: "Help",
        //   path: "/viewer-panel/help",
        //   children: [
        //     {
        //       icon: <Headphones />,
        //       path: "support",
        //       name: "Support",
        //       children: [
        //         {
        //           index: true,
        //           icon: <Ticket />,
        //           name: "Support Ticket",
        //         },
        //         {
        //           icon: <TicketPlus />,
        //           path: "create-tickets",
        //           name: "Create Ticket",
        //         },
        //       ],
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
          path: "/viewer-panel/notifications",
        },
        {
          icon: <IoSettingsOutline className="size-6" />,
          name: "Settings",
          path: "/viewer-panel/settings",
        },
      ],
    },
  ];
};
