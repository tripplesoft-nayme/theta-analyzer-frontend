import AdminDashboard from "@/pages/Admin/Overview/AdminDashboard";
import Help from "@/pages/Admin/Help";
import Clients from "@/pages/Admin/Clients";
import Analytics from "@/pages/Admin/Analytics";
import SystemHealth from "@/pages/Admin/SystemHealth";
import BillingsPlans from "@/pages/Admin/BillingsPlans";
import APIIntegrations from "@/pages/Admin/APIIntegrations";
import SecurityPrivacy from "@/pages/Admin/SecurityPrivacy";
import GlobalSettings from "@/pages/Admin/GlobalSettings";
import { SingleClient } from "@/pages/Admin/SingleClient";
import AddClientForm from "@/pages/Admin/AddClientForm/AddClientForm";
import ManageBillings from "@/pages/Admin/ManageBillings";
import PlatformAnalyticsOverview from "@/pages/Admin/Analytics";

export function getAdminRoutes() {
  return [
    {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: "clients",
      element: <Clients />,
    },
    {
      path: "clients/:id",
      element: <SingleClient />,
    },
    {
      path: "analytics",
      element: <Analytics />,
    },
    {
      path: "systemHealth",
      element: <SystemHealth />,
    },
    {
      path: "billings",
      element: <BillingsPlans />,
    },
    {
      path: "apiIntegration",
      element: <APIIntegrations />,
    },
    {
      path: "security",
      element: <SecurityPrivacy />,
    },
    {
      path: "help",
      element: <Help />,
    },
    {
      path: "globalSettings",
      element: <GlobalSettings />,
    },
    {
      path: "addClient",
      element: <AddClientForm />,
    },
    { path: "manage-billings", element: <ManageBillings /> },
    {
      path: "Platform-Analytics-Overview",
      element: <PlatformAnalyticsOverview />,
    },
  ];
}
