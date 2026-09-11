import { Clock } from "lucide-react";
import { useState } from "react";
import "react-calendar/dist/Calendar.css"; // important!
import ViewCalender from "@/Common/ViewCalender";

import UpcomingDeadlineCard from "./UpcomingDeadlineCard";
import { useGetUpcomingDeadlinesQuery } from "@/store/Api/staffManagerApi/StaffManagerApi";
import SkeletonLoading from "@/Common/Skeleton/SkeletonLoading";

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

interface ISmUpcomingDeadlineProps {
  className?: string;
}

const SmUpcomingDeadline = ({ className = "h-full" }: ISmUpcomingDeadlineProps) => {
  const [value, setValue] = useState<Value>([null, null]); // Set initial value as [null, null]
  const [selectedDays, setSelectedDays] = useState<number | null>(null); // To store the selected number of days
  const [showCalendar, setShowCalendar] = useState(false);

  const formatYMD = (d?: Date) => {
    if (!d) return undefined;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startDate =
    Array.isArray(value) && value[0]
      ? formatYMD(value[0] as Date)
      : undefined;
  const endDate =
    Array.isArray(value) && value[1]
      ? formatYMD(value[1] as Date)
      : value instanceof Date
        ? formatYMD(value as Date)
        : undefined;

  // Fetch data for upcoming deadlines
  const { data, isLoading } = useGetUpcomingDeadlinesQuery(
    startDate || endDate ? { startDate, endDate } : undefined
  );

  // if (error) return <ErrorPage/>;

  const deadlineData = data?.data?.projects || [];

  // Function to calculate the number of days between selected range
  const handleDateChange = (newValue: Value) => {
    setValue(newValue);

    if (Array.isArray(newValue) && newValue[0] && newValue[1]) {
      const startDate = newValue[0] as Date;
      const endDate = newValue[1] as Date;

      // Calculate the difference in days between start and end date
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // Convert to days

      setSelectedDays(diffDays); // Update selectedDays
    } else {
      setSelectedDays(null);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-2 pb-6 relative">
        {/* Header */}
        <div className="flex gap-2 items-center">
          <Clock className="text-gray-500 dark:text-slate-400 w-5 h-5" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Upcoming Deadline
          </h4>
        </div>

        {/* View Calendar Button */}
        <ViewCalender
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onChange={handleDateChange}
          value={value}
        />
      </div>

      {/* Display Selected Range Days */}
      {selectedDays !== null && (
        <div className="text-sm text-gray-400 dark:text-slate-500 mb-4">
          Showing result for : {selectedDays} days
        </div>
      )}

      {/* Deadline Cards */}
      <div className="w-full">
        {isLoading ? (
          <SkeletonLoading />
        ) : (
          deadlineData?.map(
            (project: IUpcomingDeadlineFromBackend, i: number) => (
              <div key={i} className="pb-6">
                <UpcomingDeadlineCard deadlineData={project} />
              </div>
            ),
          )
        )}
      </div>

      {/* View All Button */}
      <div>
        {deadlineData.length === 0 && (
          <div className="py-6 text-center text-gray-400 dark:text-slate-500">
            Nothing is in upcoming.
          </div>
        )}
      </div>
      {/* <div>
        {deadlineData.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            Nothing is in upcoming.
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View all {deadlineData.length}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div> */}
    </div>
  );
};

export default SmUpcomingDeadline;
