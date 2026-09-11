import { Outlet } from "react-router-dom";

const ViewerPanelOverview = () => {
  return (
    <div>
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};
export default ViewerPanelOverview;
