import {
  createContext,
  useState,
  ReactNode,
  useContext,
  ReactElement,
} from "react";
import { MapPin } from "lucide-react";

interface HeaderContextType {
  heading: string;
  setHeading: (value: string) => void;
  breadcrumb: ReactElement; // ← JSX element type
  setBreadcrumb: (value: ReactElement) => void;
  showButton: boolean;
  setShowButton: (value: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(
  undefined
);

export const HeaderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [heading, setHeading] = useState("Sofia Martin 👋");

  const [breadcrumb, setBreadcrumb] = useState<ReactElement>(
    <div className="flex items-center text-gray-500 dark:text-slate-400">
      <MapPin className="w-4 h-4 mr-1" /> 25 Union Square W, New York,
      NY 10003, USA
    </div>
  );

  const [showButton, setShowButton] = useState(true);

  return (
    <HeaderContext.Provider
      value={{
        heading,
        setHeading,
        breadcrumb,
        setBreadcrumb,
        showButton,
        setShowButton,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeaderContext = () => {
  const context = useContext(HeaderContext);
  if (!context)
    throw new Error(
      "useHeaderContext must be used within HeaderProvider"
    );
  return context;
};
