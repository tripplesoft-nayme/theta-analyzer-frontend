import { NavLink } from "react-router-dom";
import { getAdminSidebarItems } from "./AdminSidebarItem";
import { useSystemBranding } from "@/hooks/useSystemBranding";

import UserProfile from "@/Common/UserProfile";

const SidebarNavigation = () => {
  const { getLogo } = useSystemBranding();
  const sidebarGroups = getAdminSidebarItems();

  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    const base =
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors";
    const active = "bg-blue-500 text-white";
    const inactive = "text-gray-700 hover:bg-gray-50";

    return `${base} ${isActive ? active : inactive}`;
  };

  return (
    <div className="w-64 h-screen bg-white flex flex-col fixed top-0">
      {/* Logo */}
      <div className="p-4 mt-5">
        <img className="max-w-[180px] max-h-16 object-contain" src={getLogo("/sitelogo.png")} alt="Site Logo" />

        {sidebarGroups.map((group, index) => (
          <div key={group.label} className="mt-10">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              {group.label}
            </h3>

            <div className="space-y-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  className={getLinkClassName}
                  end={item.path === "/admin"}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex items-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>

            {/* Divider */}
            {index !== sidebarGroups.length - 1 && (
              <div className="my-6 border-t border-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Footer / Profile */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <UserProfile />
      </div>
    </div>
  );
};

export default SidebarNavigation;
