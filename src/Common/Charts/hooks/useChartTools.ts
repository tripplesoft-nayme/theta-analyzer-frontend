/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";

export const useChartTools = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Copy Data to Clipboard
  // We accept the specific data to copy as an arg to avoid stale closures if needed, 
  // or use the props passed if stable.
  const handleCopy = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("Data copied to clipboard");
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Failed to copy data");
    }
  };

  // Wrapper for download to handle state
  const handleDownloadWrapper = async (downloadFn: () => void | Promise<void>) => {
    setIsDownloading(true);
    try {
      await downloadFn();
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    setIsDownloading,
    handleCopy,
    handleDownloadWrapper,
  };
};
