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
      return "bg-[#FDF4F5] text-[#DA4352] border-2 border-[#F8D3D5] p-2 rounded-full text-xs font-medium";
    if (daysLeft <= 4)
      return "bg-[#FFF9ED] text-[#DB940C] border-2 border-[#FCE38C] p-2 rounded-full text-xs font-medium";
    return "bg-[#EBFFF2] text-[#169E7B] border-2 border-[#ABEFD5] p-2 rounded-full text-xs font-medium";
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
      <Card className="w-full border border-[#E2E8F0] rounded-lg p-4">
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-medium text-[#1D2028]">
                {programName}
              </h5>
              <p className="text-sm text-[#475569]">{projectName}</p>
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
              <p className="text-sm font-normal text-[#475569]">
                Assigned to
              </p>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {employees.map((employee) => (
                    <Avatar
                      key={employee.id}
                      className="size-10 border-2 border-[#4881FF] -space-x-4"
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
                  <p className="text-sm font-normal text-[#475569]">
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
