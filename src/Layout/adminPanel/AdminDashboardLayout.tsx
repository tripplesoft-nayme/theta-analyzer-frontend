import SidebarNavigation from "./AdminNav";
import AdminTopBar from "./AdminTopBar";
import { Outlet } from "react-router-dom";
import { useSystemBranding } from "@/hooks/useSystemBranding";

export default function AdminDashboardLayout() {
  const { getLogo } = useSystemBranding();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 font-bold text-xl">
          <img className="mt-6 max-w-[180px] max-h-16 object-contain" src={getLogo("Logo.png")} alt="" />
        </div>
        <SidebarNavigation />
      </aside>
      <main className="flex-1 p-6">
        <AdminTopBar />
        <Outlet />
      </main>
    </div>
  );
}
