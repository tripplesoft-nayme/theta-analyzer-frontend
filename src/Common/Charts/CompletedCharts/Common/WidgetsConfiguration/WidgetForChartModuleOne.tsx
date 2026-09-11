import { useLocation } from "react-router-dom";
import ProgramBuilderConfigurationOne from "./ProgramBuilderConfigurationOne";
import ProjectBuilderConfigurationOne from "./ProjectBuilderConfigurationOne";
import { DebouncedInput, LegendValue } from "./WidgetCommon";

export { DebouncedInput };
export type { LegendValue };

const WidgetForChartModuleOne = (props: any) => {
  const { pathname } = useLocation();
  const isProgramBuilder = pathname.split("/")[2] === "program-builder";

  if (isProgramBuilder) {
    return <ProgramBuilderConfigurationOne {...props} />;
  }

  return <ProjectBuilderConfigurationOne {...props} />;
};

export default WidgetForChartModuleOne;
