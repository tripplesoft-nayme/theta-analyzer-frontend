import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  return (
    <>
      <nav className="mb-4">
        <ul className="flex list-none">
          <li>
            <Link to="/">Home</Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames
              .slice(0, index + 1)
              .join("/")}`;
            return (
              <li key={name} className="flex items-center">
                <span style={{ margin: "0 8px" }}>
                  <ChevronRight className="w-4 h-4" />
                </span>
                <Link to={routeTo}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
export default Breadcrumbs;
