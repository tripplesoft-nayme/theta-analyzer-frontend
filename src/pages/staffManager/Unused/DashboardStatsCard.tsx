import {
  CircleCheckBig,
  ClockAlert,
  Files,
  FileWarning,
  Folders,
  Radio,
  TrendingUp,
} from "lucide-react";
import { JSX, useState } from "react";
import { FaChartPie, FaUsers } from "react-icons/fa";
import { IClientPanelStats } from "@/types";
import { Link } from "react-router-dom";

interface IProps {
  item: IClientPanelStats;
}

function splitAndCapitalize(camelCaseString: string) {
  // Insert a space before each capital letter that follows a lowercase letter
  const spacedString = camelCaseString.replace(
    /([a-z])([A-Z])/g,
    "$1 $2"
  );

  // Capitalize the first letter of the entire string and return
  return spacedString.charAt(0).toUpperCase() + spacedString.slice(1);
}

const DashboardStatsCard = ({ item }: IProps) => {
  const {
    title,
    value,
    growth,
    growth_type,
    link_text,
    icon,
    icon_bg_color,
  } = item;
  const [iconType] = useState(icon);

  const IconCollection: Record<string, JSX.Element> = {
    FolderIcon: <Folders />,
    LiveProject: <Radio />,
    PendingReview: <FileWarning />,
    SubmissionOverdue: <ClockAlert />,
    ProjectInDraft: <Files />,
    Check: <CircleCheckBig />,
    Users: <FaUsers />,
    Chart: <FaChartPie />,
  };

  const IconElement = Object.keys(IconCollection).includes(
    iconType as string
  )
    ? IconCollection[iconType as string]
    : null;

  return (
    <div>
      <div
        className={`${growth_type === "up"
            ? "bg-[#EBFFF2] text-green-600"
            : "bg-[#FDF4F5] text-red-600"
          }  bg-[#EBFFF2] rounded-lg flex flex-col justify-between border border-[#CAD2DB] transform transition-transform duration-300 hover:scale-102`}
      >
        <div className="bg-white shadow-xs shadow-gray-100 rounded-lg p-5 ">
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 border border-[#CAD2DB] rounded-xl text-[28px] text-white"
              style={{ backgroundColor: icon_bg_color }}
            >
              {IconElement}
            </div>

            <h3 className="text-gray-700 font-semibold text-lg">
              {splitAndCapitalize(title)}
            </h3>
          </div>

          {/* Value and growth */}
          <div className="flex items-center justify-between ">
            <span className="text-4xl font-medium text-gray-900">
              {value}
            </span>

            {growth && (
              <span
                className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${growth_type === "up"
                    ? "bg-green-100 text-[#169E7B]"
                    : "bg-red-100 text-red-600"
                  }`}
              >
                {growth}
                <TrendingUp className=" size-4" />
              </span>
            )}
          </div>
        </div>
        {/* Description & Link */}
        <div className="flex items-center justify-between text-sm text-gray-700 px-6 py-4">
          <Link
            to={`state-card/${title}`}
            className="text-blue-500  "
          >
            {link_text} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
export default DashboardStatsCard;
