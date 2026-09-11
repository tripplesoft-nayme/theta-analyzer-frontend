import { Edit, Eye, Flag, Trash2 } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import RenderStaffAvatars from "./RenderStaffAvater";

export interface StaffMember {
  name: string;
  avatar: string;
}

export interface ProgramCardProps {
  id: string;
  programName: string;
  projectName: string;
  status: string;
  staffMembers: StaffMember[];
  startDate: string;
  endDate: string;
  priority: "High" | "Medium" | "Low";
  progress: number;
}

export type StatusType =
  | "Live"
  | "Returned"
  | "Overdue"
  | "Draft"
  | "In Review"
  | "Submitted";

interface AllProgramProjectGridViewProps {
  allProgramProjectData: ProgramCardProps[];
}

const AllProgramProjectTableView: React.FC<AllProgramProjectGridViewProps> = ({
  allProgramProjectData: paginatedData,
}) => {
  const priorityColors = {
    High: "text-red-600",
    Medium: "text-orange-600",
    Low: "text-blue-600",
    Default: "text-gray-600",
  };

  const renderPriority = (priority: ProgramCardProps["priority"]) => (
    <div className="flex items-center gap-1">
      <Flag className={`w-4 h-4 ${priorityColors[priority]}`} />
      <span className={`text-sm font-medium ${priorityColors[priority]}`}>
        {priority}
      </span>
    </div>
  );

  return (
    <Card className="shadow-none border-none w-full">
      <CardContent className="p-0 border border-[#E2E8F0] rounded-lg w-full min-h-[420px]">
        <Table className="">
          <TableHeader>
            <TableRow className="bg-[#F7F9FA] border-[#E2E8F0] border-b">
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Program
              </TableHead>
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Project
              </TableHead>
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Assign Staff
              </TableHead>
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Priority
              </TableHead>
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Started On
              </TableHead>
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Deadline
              </TableHead>
              <TableHead className="px-6 py-3.5 font-medium text-[#1D2028] text-base">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/30 even:bg-[#F7F9FA] odd:bg-white border-[#E2E8F0] border-b transition-colors"
              >
                <TableCell className="px-6 py-3.5 font-medium text-base">
                  {item.programName}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-base">
                  {item.projectName}
                </TableCell>
                <TableCell className="px-6 py-3.5">
                  <RenderStaffAvatars staff={item.staffMembers} />
                </TableCell>
                <TableCell className="px-6 py-3.5">
                  {renderPriority(item.priority)}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-muted-foreground text-base">
                  {item.startDate}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-muted-foreground text-base">
                  {item.endDate}
                </TableCell>
                <TableCell className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 text-[#1C73E0]" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4 text-[#169E7B]" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-[#B00020]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AllProgramProjectTableView;
