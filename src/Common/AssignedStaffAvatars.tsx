import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface StaffMember {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    role: string;
  };
}

interface AssignedStaffAvatarsProps {
  manager?: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      profileImage: string | null;
      role: string;
    };
  };
  employees?: StaffMember[];
  viewers?: StaffMember[];
  maxVisible?: number;
}

export function AssignedStaffAvatars({
  manager,
  employees = [],
  viewers = [],
  maxVisible = 3,
}: AssignedStaffAvatarsProps) {
  // Combine all staff in order: Manager, Employees, Viewers
  const allStaff: Array<{
    id: string;
    name: string;
    profileImage: string | null;
    role: string;
  }> = [];

  // Add manager first
  if (manager?.user) {
    allStaff.push({
      id: manager.id,
      name: manager.user.name,
      profileImage: manager.user.profileImage,
      role: manager.user.role,
    });
  }

  // Add employees
  employees.forEach((emp) => {
    if (emp.user) {
      allStaff.push({
        id: emp.id,
        name: emp.user.name,
        profileImage: emp.user.profileImage,
        role: emp.user.role,
      });
    }
  });

  // Add viewers
  viewers.forEach((viewer) => {
    if (viewer.user) {
      allStaff.push({
        id: viewer.id,
        name: viewer.user.name,
        profileImage: viewer.user.profileImage,
        role: viewer.user.role,
      });
    }
  });

  const visibleStaff = allStaff.slice(0, maxVisible);
  const remainingCount = Math.max(0, allStaff.length - maxVisible);

  if (allStaff.length === 0) {
    return <span className="text-xs text-gray-500 dark:text-slate-400">No staff assigned</span>;
  }
  return (
    <div className="flex items-center -space-x-2">
      {visibleStaff.map((staff) => (
        <Tooltip key={staff.id}>
          <TooltipTrigger asChild>
            <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-900 ring-1 ring-gray-200 dark:ring-slate-800 cursor-pointer">
              <AvatarImage src={staff.profileImage || undefined} alt={staff.name} />
              <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                {staff?.name
                  ?.split(" ")
                  ?.map((n) => n[0])
                  ?.join("")
                  ?.toUpperCase()
                  ?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`${staff.name} (${staff.role})`}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 border-2 border-white dark:border-slate-900 ring-1 ring-gray-200 dark:ring-slate-800 flex items-center justify-center cursor-pointer">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                +{remainingCount}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`+${remainingCount} more staff members`}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
