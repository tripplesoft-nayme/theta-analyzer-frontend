import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      return "bg-[#FDF4F5] dark:bg-rose-500/10 text-[#DA4352] dark:text-rose-400 border-2 border-[#F8D3D5] dark:border-rose-500/20 p-2 rounded-full text-xs font-medium";
    if (daysLeft <= 4)
      return "bg-[#FFF9ED] dark:bg-amber-500/10 text-[#DB940C] dark:text-amber-400 border-2 border-[#FCE38C] dark:border-amber-500/20 p-2 rounded-full text-xs font-medium";
    return "bg-[#EBFFF2] dark:bg-emerald-500/10 text-[#169E7B] dark:text-emerald-400 border-2 border-[#ABEFD5] dark:border-emerald-500/20 p-2 rounded-full text-xs font-medium";
  }

  // 🔹 Format ISO deadline → same UI text
  const formattedDueDate = new Date(deadline).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div>
      <Card className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-none hover:shadow-sm transition-shadow">
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-slate-100">{programName}</h5>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                {projectName}
              </p>
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
              <p className="text-xs font-normal text-[#475569] dark:text-slate-400">Assigned to</p>

              <div className="flex items-end justify-between">
                <div className="flex justify-between -space-x-2">
                  {employees.length === 0 ? (
                    <div className="size-10 border border-gray-400 dark:border-slate-700 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xs text-gray-400 dark:text-slate-500">
                      None
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <Avatar
                        key={employee.id}
                        className="size-8 border-2 border-white dark:border-slate-900"
                      >
                        <AvatarImage
                          src={
                            employee.profileImage ||
                            "https://ui-avatars.com/api/?name=" + employee.name
                          }
                          alt={employee.name}
                        />
                        <AvatarFallback className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs font-normal text-[#475569] dark:text-slate-400">
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
