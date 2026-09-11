import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import routes from "./routes/Routes.tsx";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "./components/ui/sonner.tsx";
import { ThemeProvider } from "./Common/theme-provider.tsx";
import { ChunkErrorBoundary } from "./Common/ChunkErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChunkErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={routes} />
            <Toaster position="bottom-right" richColors theme="light" />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ChunkErrorBoundary>
  </StrictMode>,
);
