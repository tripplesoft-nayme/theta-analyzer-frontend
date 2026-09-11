import { useEffect } from "react";
import { useGetSystemConfigQuery } from "@/store/Api/SettingsApi/SettingsApi";

export function useSystemBranding() {
  const { data: configResponse } = useGetSystemConfigQuery();
  const config = configResponse?.data;

  // Set favicon dynamically
  useEffect(() => {
    if (config?.faviconUrl) {
      // Find or create favicon link element
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "shortcut icon";
        document.head.appendChild(link);
      }
      link.href = config.faviconUrl;
    }
  }, [config?.faviconUrl]);

  // Set dynamic brand colors in CSS variables if present
  useEffect(() => {
    if (config?.primaryColor) {
      document.documentElement.style.setProperty("--brand-primary", config.primaryColor);
      // Also set tailwind/other variables if appropriate
      document.documentElement.style.setProperty("--primary", config.primaryColor);
    }
    if (config?.secondaryColor) {
      document.documentElement.style.setProperty("--brand-secondary", config.secondaryColor);
    }
  }, [config?.primaryColor, config?.secondaryColor]);

  const getLogo = (fallbackLogo: string) => {
    return config?.logoUrl || fallbackLogo;
  };

  const getFavicon = (fallbackFavicon: string) => {
    return config?.faviconUrl || fallbackFavicon;
  };

  return {
    config,
    getLogo,
    getFavicon,
    logoUrl: config?.logoUrl || null,
    faviconUrl: config?.faviconUrl || null,
  };
}
