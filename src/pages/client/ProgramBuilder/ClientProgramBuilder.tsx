import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { Suspense } from "react";
const ClientProjectBuilder = lazyWithRetry(() => import("../ProjectBuilder/ClientProjectBuilder"));

const ClientProgramBuilder = () => {
  return (
    <div className="flex-1 flex flex-col">
      <Suspense fallback={<div className="flex-1 w-full animate-pulse bg-skeleton-bg rounded-lg" />}>
        <ClientProjectBuilder />
      </Suspense>
    </div>
  );
};
export default ClientProgramBuilder;
