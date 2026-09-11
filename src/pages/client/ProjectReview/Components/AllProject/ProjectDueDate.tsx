/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import ViewCalender from "@/Common/ViewCalender";
import BoxContainer from "@/Common/BoxContainer";
import { useGetDeadlineQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";
import { useGetStaffEmployeeUpcomingDeadlinesQuery } from "@/store/Api/StaffEmployeeApi/StaffEmployeeApi";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

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

const ProjectDueDate = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<Value>(null);

  const formatYMD = (d?: Date) => {
    if (!d) return undefined;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startDate =
    Array.isArray(dateRange) && dateRange[0]
      ? formatYMD(dateRange[0] as Date)
      : undefined;
  const endDate =
    Array.isArray(dateRange) && dateRange[1]
      ? formatYMD(dateRange[1] as Date)
      : dateRange instanceof Date
        ? formatYMD(dateRange as Date)
        : undefined;

  const location = useLocation();
  const isEmployee = location.pathname.includes("/staff-employee-panel");

  const { data: clientDeadlineData, isLoading: isClientLoading } = useGetDeadlineQuery({ startDate, endDate }, { skip: isEmployee });
  const { data: employeeDeadlineData, isLoading: isEmployeeLoading } = useGetStaffEmployeeUpcomingDeadlinesQuery({ startDate, endDate }, { skip: !isEmployee });

  const isLoading = isEmployee ? isEmployeeLoading : isClientLoading;
  const data = isEmployee ? employeeDeadlineData : clientDeadlineData;
  const projects = data?.data?.projects;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  function getDaysLeftBadgeColor(daysLeft: number) {
    if (daysLeft <= 2)
      return "bg-[#FDF4F5] dark:bg-red-950/30 text-[#DA4352] dark:text-red-400 border-2 border-[#F8D3D5] dark:border-red-900/50 p-2 rounded-full text-xs font-medium";
    if (daysLeft <= 4)
      return "bg-[#FFF9ED] dark:bg-amber-950/30 text-[#DB940C] dark:text-amber-400 border-2 border-[#FCE38C] dark:border-amber-900/50 p-2 rounded-full text-xs font-medium";
    return "bg-[#EBFFF2] dark:bg-emerald-950/30 text-[#169E7B] dark:text-emerald-400 border-2 border-[#ABEFD5] dark:border-emerald-900/50 p-2 rounded-full text-xs font-medium";
  }

  return (
    <BoxContainer className="h-fit flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-8 relative">
        <div className="flex gap-1 items-center">
          <Clock className="w-6 h-6 text-gray-600 dark:text-slate-400" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-slate-100">Project Due Date</h2>
        </div>
        <ViewCalender
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onChange={setDateRange}
          value={dateRange}
        />
      </div>

      {/* Content */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <UpcomingDeadlineSkeleton />
        ) : projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project: any, idx: number) => {
              const {
                programName,
                projectName,
                deadline,
                daysLeft,
                employees,
              } = project;

              return (
                <Card key={idx} className="w-full shadow-none! border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg py-0!">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-[#1D2028] dark:text-slate-100">
                          {programName}
                        </h5>
                        <p className="text-sm text-[#475569] dark:text-slate-400">{projectName}</p>
                      </div>

                      <Badge
                        className={getDaysLeftBadgeColor(daysLeft)}
                        variant="secondary"
                      >
                        {daysLeft} Days left
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-2 w-full">
                        <p className="text-sm font-normal text-[#475569] dark:text-slate-400">
                          Assigned to
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {(employees || []).map((employee: any, empIdx: number) => (
                              <Avatar
                                key={employee.id || empIdx}
                                className="size-10 border-2 border-[#4881FF] dark:border-blue-600 -space-x-4"
                              >
                                <AvatarImage
                                  src={
                                    employee.avatar ||
                                    employee.profileImage ||
                                    `https://i.pravatar.cc/150?img=${20 + empIdx}`
                                  }
                                  alt={employee.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {(employee.name || "U")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-normal text-[#475569] dark:text-slate-400">
                              Due Date: {formatDate(deadline)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-500 dark:text-slate-400">
            No upcoming deadlines found
          </div>
        )}
      </div>
    </BoxContainer>
  );
};

export default ProjectDueDate;

