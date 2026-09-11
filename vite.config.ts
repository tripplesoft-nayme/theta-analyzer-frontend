import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import vitePluginImp from "vite-plugin-imp";

export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    vitePluginImp({
      libList: [],
    }),
    mode === "analyze" &&
    visualizer({
      open: true,
      filename: "./dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: true,
    // port: 8080,
    port: 5174,
    strictPort: true,
    origin: "http://0.0.0.0:8080",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    conditions: ["production"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  optimizeDeps: {
    include: ["@canvasjs/react-charts", "react-apexcharts", "apexcharts"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Framework Core
            if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
              return "vendor-react-core";
            }

            // State & Routing
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux") || id.includes("redux") || id.includes("redux-persist")) {
              return "vendor-state";
            }
            if (id.includes("react-router") || id.includes("@remix-run") || id.includes("@react-router")) {
              return "vendor-router";
            }

            // Heavy Analytical Modules
            if (id.includes("apexcharts")) return "vendor-apex";
            if (id.includes("recharts") || id.includes("react-smooth") || id.includes("d3")) return "vendor-recharts";
            // Async/On-Demand Modules (Renamed to indicate they are non-blocking)
            if (id.includes("xlsx")) return "xlsx-async-mini";


            // Heavy PDF export libs: bypass manual chunking to allow Vite's native dynamic code-splitting (resolves "Cannot access py before initialization" error)
            if (
              id.includes("@react-pdf") ||
              id.includes("pdfkit") ||
              id.includes("fontkit") ||
              id.includes("yoga-layout") ||
              id.includes("pako") ||
              id.includes("brotli") ||
              id.includes("hyphen") ||
              id.includes("linebreak") ||
              id.includes("bidi-js") ||
              id.includes("restructure") ||
              id.includes("unicode")
            ) {
              return;
            }

            if (id.includes("html2canvas")) {
              return "vendor-html2canvas-async";
            }
            if (id.includes("react-calendar")) {
              return "vendor-calendar-async";
            }
            if (id.includes("react-day-picker")) {
              return "vendor-day-picker-async";
            }
            if (id.includes("sweetalert2")) {
              return "vendor-sweetalert2-async";
            }

            // Icons (Surgical Splitting)
            if (id.includes("lucide-react")) return "vendor-icons-lucide";
            if (id.includes("react-icons/fa")) return "vendor-icons-fa";
            if (id.includes("react-icons")) return "vendor-icons-others";

            // UI & Utilities
            if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) return "vendor-framer-motion";
            if (id.includes("@radix-ui")) return "vendor-radix-ui";
            if (id.includes("@floating-ui")) return "vendor-floating-ui";
            if (id.includes("sonner") || id.includes("tailwind-merge") || id.includes("clsx")) return "vendor-ui-utils";
            if (id.includes("date-fns") || id.includes("moment") || id.includes("dayjs")) return "vendor-date-utils";
            if (id.includes("react-hook-form")) return "vendor-forms";

            // External/Transitive Utils
            if (id.includes("socket.io") || id.includes("engine.io")) return "vendor-socket";
            if (id.includes("axios") || id.includes("lodash") || id.includes("immer") || id.includes("zod")) return "vendor-utils-misc";

            // Fallback for other large vendors
            if (id.includes("@progress/kendo")) return "vendor-kendo";
            if (id.includes("handsontable")) return "vendor-handsontable";
            if (id.includes("leaflet")) return "vendor-maps";

            return "vendor-others";
          }
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
}));
