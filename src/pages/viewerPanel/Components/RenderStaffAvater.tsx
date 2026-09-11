import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface AssignedStaff {
  name: string;
  avatar: string;
  role?: string;
}

interface RenderStaffAvatarsProps {
  staff: AssignedStaff[];
}

const RenderStaffAvatars: React.FC<RenderStaffAvatarsProps> = ({ staff }) => {
  return (
    <div className="flex items-center -space-x-2 relative w-28">
      {staff.slice(0, 3).map((item, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Avatar className="w-8 h-8 border-2 border-gray-200 cursor-pointer">
              <AvatarImage src={item.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {item.name ? item.name.charAt(0).toUpperCase() : `U${index + 1}`}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.name}{item.role ? ` (${item.role})` : ""}</p>
          </TooltipContent>
        </Tooltip>
      ))}

      {staff.length > 3 && (
        <div className="w-8 h-8 absolute right-2.5 z-10 rounded-full bg-gray-100 text-blue-500 text-xs font-medium flex items-center justify-center border-2 border-blue-500">
          +{staff.length - 3}
        </div>
      )}
    </div>
  );
};

export default RenderStaffAvatars;
