// import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const Layout: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = [
    "/admin",
    "/client",
    "/staff-manager",
    "/staff-employee",
    "/viewer-panel",
    "/dashboard",
    "/login",
    "/signup",
    "/forgot",
    "/emailcode",
    "/verification",
    "/reset",
  ].some((route) => location.pathname.startsWith(route));

  return (
    <div>
      {!isDashboardRoute && <Navbar />}
      <main>
        <Outlet />
      </main>
      {/* {!isDashboardRoute && <Footer />} */}
    </div>
  );
};

export default Layout;
