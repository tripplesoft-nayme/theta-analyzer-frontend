import { SidebarProvider } from "@/components/ui/sidebar";
import StaffEmployeeDashboardHeader from "./StaffEmployeeDashboardHeader";
import { Outlet } from "react-router-dom";
import StaffEmployeeSidebar from "./StaffEmployeeSidebar";
import { HeaderProvider } from "./StaffEmployeeHeaderContext";
import { useState, useEffect } from "react";

const StaffEmployeeDashboardLayout = () => {

  const [open, setOpen] = useState(
    () => window.innerWidth >= 1600,
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1600) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <HeaderProvider>
      {/* <NotificationProvider> */}
      <SidebarProvider
        open={open}
        onOpenChange={setOpen}
        defaultOpen={true}
        style={
          {
            "--sidebar-width": "296px",
            "--sidebar-width-icon": "90px",
          } as React.CSSProperties
        }
      >
        <StaffEmployeeSidebar />
        <main className="flex-1 min-w-0 px-4 md:px-8">
          <div className="pb-6">
            <StaffEmployeeDashboardHeader />
          </div>
          <Outlet />
        </main>
      </SidebarProvider>
      {/* </NotificationProvider> */}
    </HeaderProvider>
  );
};

export default StaffEmployeeDashboardLayout;
