// @/config/adminSidebarItems.ts

import {
  Clock,
  Users,
  BarChart3,
  Activity,
  CreditCard,
  Plug,
  Shield,
  HelpCircle,
  Settings,
} from "lucide-react";
import { ISidebarItem } from "@/types";

interface SidebarGroup {
  label: string;
  items: ISidebarItem[];
}

export const getAdminSidebarItems = (): SidebarGroup[] => {
  return [
    {
      label: "Main Menu",
      items: [
        {
          icon: <Clock />,
          name: "Overview",
          path: "/admin",
        },
        {
          icon: <Users />,
          name: "Clients",
          path: "/admin/clients",
        },
        {
          icon: <BarChart3 />,
          name: "Analytics",
          path: "/admin/analytics",
        },
        {
          icon: <Activity />,
          name: "System Health",
          path: "/admin/systemHealth",
        },
        {
          icon: <CreditCard />,
          name: "Billing & Plans",
          path: "/admin/billings",
        },
      ],
    },
    {
      label: "Support",
      items: [
        {
          icon: <Plug />,
          name: "API & Integration",
          path: "/admin/apiIntegration",
        },
        {
          icon: <Shield />,
          name: "Security & Privacy",
          path: "/admin/security",
        },
        {
          icon: <HelpCircle />,
          name: "Help",
          path: "/admin/help",
        },
        {
          icon: <Settings />,
          name: "Global Settings",
          path: "/admin/globalSettings",
        },
      ],
    },
  ];
};
