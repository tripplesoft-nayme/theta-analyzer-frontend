import {
  createContext,
  useState,
  ReactNode,
  useContext,
  ReactElement,
  useEffect
} from "react";
import { MapPin } from "lucide-react";

interface HeaderContextType {
  heading: string;
  setHeading: (value: string) => void;
  breadcrumb: ReactElement;
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
    <></>
  );

  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const text = data.display_name.split(", ")

          if (text) {
            setBreadcrumb(
              <div className="flex items-center text-gray-500 dark:text-slate-400">
                <MapPin className="w-4! h-4! mr-1" />
                {text.slice(0, 3).join(", ")}
              </div>
            );
          }
        } catch {
          setBreadcrumb(
            <div className="flex items-center text-gray-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 mr-1" />
              hiksfjweo
            </div>
          );

        }
      },
      () => {
        // permission denied → keep default address
      }
    );
  }, []);

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
