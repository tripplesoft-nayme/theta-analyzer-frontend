import { useGetUser } from "@/hooks/useGetUser";
import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/Common/ThemeToggle";
import { useSystemBranding } from "@/hooks/useSystemBranding";

const Navbar: React.FC = () => {
  const { getLogo } = useSystemBranding();
  const { currentRoute, id } = useGetUser();
  console.log(currentRoute);
  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 fixed w-full z-50">
      <div className=" mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/">
              <img className="max-w-[150px] max-h-12 object-contain" src={getLogo("Nav-logo.png")} alt="Logo" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Dashboard / Login */}
            <div className="hidden md:flex space-x-4">
              {id ? (
                <Link
                  to={currentRoute}
                  className="text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white duration-300 px-3 py-2 rounded-md text-sm font-medium px-6 py-3.5"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white duration-300 px-3 py-2 rounded-md text-sm font-medium px-6 py-3.5"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
