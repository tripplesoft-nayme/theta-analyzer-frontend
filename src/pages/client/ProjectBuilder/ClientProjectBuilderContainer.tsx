import { Outlet, useOutletContext } from "react-router-dom";

const ClientProjectBuilderContainer = () => {
  const context = useOutletContext();
  return (
    <div className="pb-10">
      <Outlet context={context} />
    </div>
  );
};

export default ClientProjectBuilderContainer;
