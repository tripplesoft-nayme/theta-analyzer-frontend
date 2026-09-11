import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

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

interface IProps {
  deadlineData: IUpcomingDeadlineFromBackend;
}

const UpcomingDeadlineCard = ({ deadlineData }: IProps) => {
  const { programName, projectName, daysLeft, employees, deadline } =
    deadlineData;

  // 🔹 Badge color logic (UNCHANGED)
  function getDaysLeftBadgeColor(daysLeft: number) {
    if (daysLeft <= 2)
      return "bg-[#FDF4F5] dark:bg-red-950/30 text-[#DA4352] dark:text-red-400 border-2 border-[#F8D3D5] dark:border-red-900/50 p-2 rounded-full text-xs font-medium";
    if (daysLeft <= 4)
      return "bg-[#FFF9ED] dark:bg-amber-950/30 text-[#DB940C] dark:text-amber-400 border-2 border-[#FCE38C] dark:border-amber-900/50 p-2 rounded-full text-xs font-medium";
    return "bg-[#EBFFF2] dark:bg-emerald-950/30 text-[#169E7B] dark:text-emerald-400 border-2 border-[#ABEFD5] dark:border-emerald-900/50 p-2 rounded-full text-xs font-medium";
  }

  // 🔹 Format ISO deadline → same UI text
  const formattedDueDate = new Date(deadline).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );

  return (
    <div>
      <Card className="w-full shadow-none! border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg py-0!">
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
                  {employees.map((employee) => (
                    <Avatar
                      key={employee.id}
                      className="size-10 border-2 border-[#4881FF] dark:border-blue-600 -space-x-4"
                    >
                      <AvatarImage
                        src={
                          employee.profileImage ||
                          "https://randomuser.me/api/portraits/men/40.jpg"
                        }
                        alt={employee.name}
                      />
                      <AvatarFallback className="text-xs">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                <div className="text-right">
                  <p className="text-sm font-normal text-[#475569] dark:text-slate-400">
                    Due Date: {formattedDueDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingDeadlineCard;
