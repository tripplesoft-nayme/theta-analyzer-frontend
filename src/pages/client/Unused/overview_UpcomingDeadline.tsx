import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import UpcomingDeadlineCard from "./UpcomingDeadlineCard";
import BoxContainer from "../../../Common/BoxContainer";
import { useState } from "react";
import "react-calendar/dist/Calendar.css";
import ViewCalender from "@/Common/ViewCalender";
import { useGetUpcomingDeadlinesQuery } from "@/store/Api/DeadlineApi/DeadlineApi";

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
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-56 bg-gray-200 rounded" />
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 3 }).map((__, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  ));
};

const UpcomingDeadline = () => {
  const [value, onChange] = useState<Value>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const { data, isLoading } = useGetUpcomingDeadlinesQuery({});
  const deadlineData: IUpcomingDeadlineFromBackend[] =
    data?.data?.projects ?? [];

  return (
    <BoxContainer>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-8 relative">
        <div className="flex gap-1 items-center">
          <Clock className="w-6 h-6 text-gray-600" />
          <h4 className="text-lg font-semibold">Upcoming Deadline</h4>
        </div>

        {deadlineData.length > 0 && (
          <ViewCalender
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            onChange={onChange}
            value={value}
          />
        )}
      </div>

      {/* Content */}
      <div className="w-full">
        {isLoading ? (
          <UpcomingDeadlineSkeleton />
        ) : deadlineData.length > 0 ? (
          deadlineData.map((project) => (
            <div key={project.projectId} className="pb-6">
              <UpcomingDeadlineCard deadlineData={project} />
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-500">
            No Data Found
          </div>
        )}
      </div>

      {/* Footer */}
      {deadlineData.length > 0 && (
        <Button
          variant="ghost"
          className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View all {deadlineData.length}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </BoxContainer>
  );
};

export default UpcomingDeadline;
