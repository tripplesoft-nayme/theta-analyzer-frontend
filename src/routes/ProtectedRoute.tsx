import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";

type role = "VIEWER" | "EMPLOYEE" | "SUPPORTER" | "MANAGER" | "CLIENT";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const user = useAppSelector((state) => state?.auth?.user);
  const location = useLocation();
  if (!user || !user?.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role as role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
