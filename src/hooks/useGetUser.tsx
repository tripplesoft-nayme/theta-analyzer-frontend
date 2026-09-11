import { useGetProfileQuery } from "@/store/Api/UserApi/UserApi";
import { User } from "@/types/Auth/Auth";

const Role = {
  VIEWER: "viewer-panel",
  EMPLOYEE: "staff-employee-panel",
  SUPPORTER: "supporter",
  MANAGER: "staff-manager-panel",
  ADMIN: "admin",
  CLIENT: "client-panel",
  SUPERADMIN: "superadmin",
};

export const useGetUser = () => {
  const { data, isLoading, isError } = useGetProfileQuery({});
  const user = data?.data as User | undefined;
  const currentRoute =
    user?.role && Role[user.role as keyof typeof Role]
      ? user.role === "SUPERADMIN"
        ? "/admin"
        : `/${Role[user.role as keyof typeof Role]}`
      : "/login";
  return {
    loading: isLoading,
    error: isError,
    name: user?.name || "",
    role: user?.role || "",
    profileImage: user?.profileImage || "",
    email: user?.email || "",
    id: user?.id || "",
    status: user?.status || "",
    currentRoute,
  };
};
