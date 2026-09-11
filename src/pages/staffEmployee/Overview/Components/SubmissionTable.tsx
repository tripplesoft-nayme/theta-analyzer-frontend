import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import ViewSubmissionModal from "./ViewSubmissionModal";
import EditSubmissionModal from "./EditSubmissionModal";

// Type definitions
export interface Employee {
  id: string;
  name: string;
  avatar?: string;
}

export interface SubmissionData {
  id: string;
  information: string;
  submission: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  employeeId: string;
  projectId: string;
  sheetId: string;
  submiteCells: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission extends SubmissionData {
  employee?: Employee;
  projectName?: string;
  sheetName?: string;
}

type SubmissionTableProps = {
  submissions: Submission[];
  employees?: Record<string, Employee>;
};

// Status configuration
const STATUS_CONFIG = {
  APPROVED: {
    label: "Approved",
    classes: "text-[#0B5A4A] bg-[#EBFFF2] border border-[#ABEFD5]",
  },
  PENDING: {
    label: "In Review",
    classes: "text-[#665CFF] bg-[#F2F2FF] border border-[#C7C2FF]",
  },
  REJECTED: {
    label: "Returned",
    classes: "text-[#B00020] bg-[#FFEAEA] border border-[#FFB3B3]",
  },
  DRAFT: {
    label: "Draft",
    classes: "text-[#6B7280] bg-[#F3F4F6] border border-[#D1D5DB]",
  },
} as const;

export default function SubmissionTable({
  submissions,
  employees = {},
}: SubmissionTableProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const getInitials = (name: string): string =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getEmployeeInfo = (employeeId: string): Employee => {
    if (employees[employeeId]) {
      return employees[employeeId];
    }

    return {
      id: employeeId,
      name: "Unknown Employee",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeId}`,
    };
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString.split("T")[0];
    }
  };

  return (
    <Card className="w-full shadow-none border-none">
      <CardContent className="p-0 border border-[#E2E8F0] rounded-lg w-full">
        <ScrollArea className="h-[400px] w-full">
          <Table className="overflow-x">
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] bg-[#F7F9FA]">
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Submission
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Employee
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Date
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Status
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => {
                  const employee =
                    submission.employee ||
                    getEmployeeInfo(submission.employeeId);

                  return (
                    <TableRow
                      key={submission.id}
                      className="border-b border-[#E2E8F0] hover:bg-muted/30 transition-colors odd:bg-white even:bg-[#F7F9FA]"
                    >
                      <TableCell className="text-base font-medium px-6 py-3.5">
                        {submission.submission}
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={employee.avatar}
                              alt={employee.name}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">
                            {employee.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-base text-muted-foreground">
                        {formatDate(submission.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={`py-1.5 px-3 min-w-20 ${
                            STATUS_CONFIG[submission.status].classes
                          }`}
                        >
                          {STATUS_CONFIG[submission.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0 hover:bg-muted hover:scale-105 transition-transform"
                            title="View submission"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setViewOpen(true);
                            }}
                          >
                            <Eye className="size-4 text-[#1C73E0]" />
                            <span className="sr-only">
                              View submission
                            </span>
                          </Button>
                          <EditSubmissionModal data={submission} />
                        </div>
                      </TableCell>
                      <ViewSubmissionModal
                        open={viewOpen}
                        onClose={() => setViewOpen(false)}
                        data={selectedSubmission}
                      />
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
