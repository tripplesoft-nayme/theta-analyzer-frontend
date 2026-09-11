import { useState, useCallback, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export const useFullscreen = () => {
  const { setOpen: setSidebarOpen } = useSidebar();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setSidebarOpen(false);
      }).catch((err) => {
        console.error("Error enabling fullscreen mode:", err);
        // Fallback: simulate fullscreen layout within viewport
        setIsFullscreen(true);
        setSidebarOpen(false);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setSidebarOpen(true);
      }).catch((err) => {
        console.error("Error exiting fullscreen mode:", err);
        setIsFullscreen(false);
        setSidebarOpen(true);
      });
    }
  }, [setSidebarOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setSidebarOpen(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setSidebarOpen]);

  return { isFullscreen, toggleFullscreen };
};
