import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import ClientDashboardHeader from "./ClientDashboardHeader";
import ClientSidebar from "./ClientSidebar";
import RightSidebar from "./RightSidebar";

export default function ClientDashboardLayout() {
  const [open, setOpen] = useState(
    () => window.innerWidth >= 1600,
  );
  const [activeWidgetInfo, setActiveWidgetInfo] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1600) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
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
      <ClientSidebar />

      <main className="flex-1 min-w-0 px-4 md:px-8">
        <div className="pb-6">
          <ClientDashboardHeader />
        </div>

        <div id="details-capture-area" className="w-full">
          <Outlet context={{ activeWidgetInfo, setActiveWidgetInfo }} />
        </div>
      </main>

      <RightSidebar
        activeWidgetInfo={activeWidgetInfo}
        setActiveWidgetInfo={setActiveWidgetInfo}
      />
    </SidebarProvider>
  );
}
