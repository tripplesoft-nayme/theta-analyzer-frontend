import {
  BriefcaseBusiness,
  LayoutDashboard,
  Clipboard,
  FileBarChart,
  Headphones,
  Info,
  Layers,
  // Milestone,
  Phone,
  Users,
  UserStar,
  Settings,
  Grid2x2,
  Bell,
} from "lucide-react";
import { IoExtensionPuzzleOutline } from "react-icons/io5";
import { ISidebarItem } from "@/types";

interface SidebarGroup {
  label: string;
  items: ISidebarItem[];
}

export const getClientSidebarItems = (): SidebarGroup[] => {
  const showHighwayExpansion = true;
  // You can replace 'true' with actual logic to determine visibility

  return [
    {
      label: "Main Menu",
      items: [
        {
          header: "Welcome 👋",
          description: "This is dashboard overview of Theta Analyzer",
          icon: <LayoutDashboard className="size-6" />,
          name: "Overview",
          path: "/client-panel",
        },
        // {
        //   icon: <Backpack />,
        //   name: "Works",
        //   path: "/client-panel/works",
        // },
        {
          header: "Employee Management",
          description: "Manage your employees",
          icon: <Users />,
          name: "Employees",
          path: "/client-panel/employees",
        },
      ],
    },
    {
      label: "Favorites",
      items: [],
      // items: [
      //   {
      //     icon: <Megaphone />,
      //     name: "Marketing Strategy",
      //     path: "/client-panel/marketing-strategy",
      //   },
      //   {
      //     icon: <Building2 />,
      //     name: "Alfala Building",
      //     path: "/client-panel/alfala-building",
      //   },
      //   {
      //     icon: <Store />,
      //     name: "Timo's Super Shop",
      //     path: "/client-panel/timos-super-shop",
      //   },
      // ],
    },
    {
      label: "Programs & Projects",
      items: [
        {
          header: "Programs & Projects",
          description: "Manage your programs and projects",
          icon: <Layers className="size-6" />,
          name: "All Program",
          path: "/client-panel/all-program",
        },
        {
          header: "Program Builder",
          description: "Build your programs dashboard",
          icon: <IoExtensionPuzzleOutline className="size-6" />,
          name: "Program Builder",
          path: "/client-panel/program-builder",
        },
        {
          icon: <BriefcaseBusiness />,
          name: "Program Name",
          path: "/client-panel/program-name",
          hidden: showHighwayExpansion,
        },
        {
          header: "Project Builder",
          description: "Build your project dashboard",
          icon: <Grid2x2 />,
          name: "Project Builder",
          path: "/client-panel/project-builder",
        },
        {
          header: "Project Review",
          description: "Review your projects",
          icon: <FileBarChart className="size-6" />,
          name: "Project Review",
          path: "/client-panel/project-review",
        },
      ].filter((item) => !item.hidden),
    },
    {
      label: "Support",
      items: [
        {
          header: "Activity Log",
          description: "Track your sites activities",
          icon: <Clipboard />,
          name: "Activity Log",
          path: "/client-panel/activity-log",
        },
        {
          header: "Help Center",
          description: "Get support and find resources",
          icon: <Info />,
          name: "Help",
          path: "/client-panel/help",
          children: [
            {
              header: "Help",
              description: "Get help with our services",
              icon: <Headphones />,
              path: "support",
              name: "Support",
              // children: [
              //   {
              //     index: true,
              //     icon: <Ticket />,
              //     name: "Support Ticket",
              //   },
              //   {
              //     icon: <TicketPlus />,
              //     path: "create-tickets",
              //     name: "Create Ticket",
              //   },
              // ],
            },
            {
              header: "Feedback",
              description: "Share your feedback",
              icon: <UserStar />,
              path: "feedback",
              name: "Feedback",
            },
            // {
            //   header: "Product Tour",
            //   description: "Take a tour of our product",
            //   icon: <Milestone />,
            //   path: "product-tour",
            //   name: "Product Tour",
            // },
            {
              header: "Contact Us",
              description: "Get in touch with our support team",
              icon: <Phone />,
              path: "contact-us",
              name: "Contact US",
            },
          ],
        },
        {
          header: "Notifications",
          description: "View all your notifications",
          icon: <Bell className="size-6" />,
          name: "Notifications",
          path: "/client-panel/notifications",
        },
        {
          header: "Settings",
          description: "Manage your settings",
          icon: <Settings className="size-6" />,
          name: "Settings",
          path: "/client-panel/settings",
        },
        // {
        //   icon: <IoSettingsOutline className="size-6" />,
        //   name: "Create Project",
        //   path: "/client-panel/single-project-create",
        // },
      ],
    },
  ];
};
