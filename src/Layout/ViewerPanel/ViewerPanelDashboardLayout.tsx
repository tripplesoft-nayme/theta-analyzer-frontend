import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ViewerPanelSidebar from "./ViewerPanelSidebar";
import ViewerPanelHeader from "./ViewerPanelDashboardHeader";
import { Outlet } from "react-router-dom";
import { HeaderProvider } from "./ViewerPanelDashboardHeaderContext";

const ViewerPanelDashboardLayout = () => {
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
        <ViewerPanelSidebar />
        <main className="flex-1 min-w-0 px-4 md:px-8">
          <div className="pb-6">
            <ViewerPanelHeader />
          </div>
          <Outlet />
        </main>
      </SidebarProvider>
    </HeaderProvider>
  );
};

export default ViewerPanelDashboardLayout;