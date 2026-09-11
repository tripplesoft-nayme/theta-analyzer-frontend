import { Clock } from "lucide-react";
import { useState, useMemo } from "react";
import "react-calendar/dist/Calendar.css";
import ViewCalender from "@/Common/ViewCalender";
import BoxContainer from "@/Common/BoxContainer";
import UpcomingDeadlineCard from "./UpcomingDeadlineCard";
import { useGetDeadlineQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface IUpcomingDeadlineFromBackend {
  programName: string;
  projectId: string;
  projectName: string;
  deadline: string;
  daysLeft: number;
  employees: {
    id: string;
    name: string;
    profileImage: string | null;
  }[];
}

const UpcomingDeadlineSkeleton = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="pb-6 animate-pulse">
      <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
        <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-56 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 3 }).map((__, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  ));
};

const getDateRangeParams = (dateInput: Value | null) => {
  if (dateInput && Array.isArray(dateInput)) {
    const start = dateInput[0] instanceof Date ? dateInput[0] : null;
    const end = dateInput[1] instanceof Date ? dateInput[1] : null;

    if (start && end) {
      const utcStart = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0));
      const utcEnd = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999));
      return {
        startDate: utcStart.toISOString(),
        endDate: utcEnd.toISOString(),
      };
    }
  }

  return {};
};

interface UpcomingDeadlineProps {
  title?: string;
}

const UpcomingDeadline = ({ title = "Upcoming Deadline" }: UpcomingDeadlineProps) => {
  const [value, onChange] = useState<Value | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const dateRange = useMemo(() => getDateRangeParams(value), [value]);
  const { data, isLoading } = useGetDeadlineQuery(dateRange);
  const deadlineData: IUpcomingDeadlineFromBackend[] =
    data?.data?.projects ?? [];

  return (
    <BoxContainer className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-8 relative">
        <div className="flex gap-1 items-center">
          <Clock className="w-6 h-6 text-gray-600 dark:text-slate-400" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-slate-100">{title}</h2>
        </div>
        <ViewCalender
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onChange={onChange}
          value={value}
        />
      </div>

      {/* Content */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <UpcomingDeadlineSkeleton />
        ) : deadlineData?.length > 0 ? (
          <div className="space-y-4">
            {

              deadlineData?.map((project) => (
                <div key={project.projectId} className="">
                  <UpcomingDeadlineCard deadlineData={project} />
                </div>
              ))
            }
          </div>
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-500 dark:text-slate-400">
            No Data Found
          </div>
        )}
      </div>

      {/* Footer */}
      {/* {deadlineData.length > 0 && (
        <Button
          variant="ghost"
          className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View all {deadlineData.length}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )} */}
    </BoxContainer>
  );
};

export default UpcomingDeadline;
