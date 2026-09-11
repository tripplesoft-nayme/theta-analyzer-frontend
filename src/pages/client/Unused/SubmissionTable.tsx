import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, FileText } from "lucide-react";

export interface Submission {
  id: number;
  submission: string;
  submittedBy: {
    name: string;
    avatar: string;
  };
  date: string;
  status: "approved" | "in_review" | "returned" | "draft";
}

type SubmissionTableProps = {
  submissions: Submission[];
};

export default function SubmissionTable({ submissions }: SubmissionTableProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleView = (id: number) => {
    console.log("View submission:", id);
  };

  const handleEdit = (id: number) => {
    console.log("Edit submission:", id);
  };

  const statusClasses: Record<string, string> = {
    approved: "text-[#0B5A4A] bg-[#EBFFF2] border border-[#ABEFD5]",
    in_review: "text-[#665CFF] bg-[#F2F2FF] border border-[#C7C2FF]",
    returned: "text-[#B00020] bg-[#FFEAEA] border border-[#FFB3B3]",
    draft: "text-[#6B7280] bg-[#F3F4F6] border border-[#D1D5DB]",
  };

  const statusLabels = {
    approved: "Approved",
    in_review: "In Review",
    returned: "Returned",
    draft: "Draft",
  };

  return (
    <Card className="w-full shadow-none border-none">
      <CardContent className="p-0 border border-[#E2E8F0] rounded-lg w-full">
        {/* Scroll wrapper around full table */}
        <ScrollArea className="h-[400px] w-full">
          <Table className="">
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] bg-[#F7F9FA]">
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Submission
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Submitted By
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Date
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Status
                </TableHead>
                <TableHead className="text-base font-medium text-[#1D2028] px-6 py-3.5">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((submission) => (
                <TableRow
                  key={submission.id}
                  className="border-b border-[#E2E8F0] hover:bg-muted/30 transition-colors odd:bg-white even:bg-[#F7F9FA]"
                >
                  <TableCell className="text-base font-medium px-6 py-3.5">
                    {submission?.submission}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center space-x-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={submission.submittedBy.avatar}
                          alt={submission.submittedBy.name}
                        />
                        <AvatarFallback className="text-base font-normal">
                          {getInitials(submission.submittedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-normal">
                        {submission.submittedBy.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-base text-muted-foreground">
                    {submission.date}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <Badge
                      variant="outline"
                      className={`py-1.5 px-3 min-w-20 ${
                        statusClasses[submission.status]
                      }`}
                    >
                      {statusLabels[submission.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(submission.id)}
                        className="size-6 p-0 hover:bg-muted hover:scale-105 hover:cursor-pointer"
                        title="View submission"
                      >
                        <Eye className="size-6 text-[#1C73E0] " />
                        <span className="sr-only">View submission</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(submission.id)}
                        className="size-6 p-0 hover:bg-muted hover:scale-105 hover:cursor-pointer"
                        title="Edit submission"
                      >
                        <FileText className="size-6 text-[#169E7B]" />
                        <span className="sr-only">Edit submission</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
