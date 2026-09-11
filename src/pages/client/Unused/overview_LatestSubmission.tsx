import { useState, useEffect } from "react";
import { CardHeader } from "@/components/ui/card";
import SubmissionTable from "../SubmissionTable";
import BoxContainer from "../../../Common/BoxContainer";
import { ISubmission } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import { useGetAllSubmissionQuery } from "@/store/Api/ClientDashboardApi/ClientDashboardApi";

const submissionsData = [
  {
    id: 1,
    submission: "Q3 Marketing Performance Report",
    submittedBy: {
      name: "Kathryn Murphy",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b169b1b8?w=32&h=32&fit=crop&crop=face",
    },
    date: "Today, 9:41 AM",
    status: "approved",
  },
  {
    id: 2,
    submission: "Customer Feedback Analysis",
    submittedBy: {
      name: "Leslie Alexander",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    },
    date: "Yesterday, 2:30 PM",
    status: "in_review",
  },
  {
    id: 3,
    submission: "Customer Feedback Analysis",
    submittedBy: {
      name: "Annette Black",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 10, 11:20 AM",
    status: "returned",
  },
  {
    id: 4,
    submission: "Product Roadmap Draft",
    submittedBy: {
      name: "Arlene McCoy",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 12, 10:50 AM",
    status: "draft",
  },
  {
    id: 5,
    submission: "Sales Forecast Revision",
    submittedBy: {
      name: "Debian Junior",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 15, 3:45 PM",
    status: "approved",
  },
  {
    id: 6,
    submission: "UI/UX Design Guidelines",
    submittedBy: {
      name: "Sarah Williams",
      avatar:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 16, 1:15 PM",
    status: "in_review",
  },
  {
    id: 7,
    submission: "Budget Planning Q4",
    submittedBy: {
      name: "Michael Brown",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 17, 4:20 PM",
    status: "draft",
  },
  {
    id: 8,
    submission: "Employee Satisfaction Survey",
    submittedBy: {
      name: "Emma Davis",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 18, 10:30 AM",
    status: "returned",
  },
  {
    id: 9,
    submission: "Annual Financial Summary",
    submittedBy: {
      name: "Olivia Johnson",
      avatar:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 19, 9:10 AM",
    status: "approved",
  },
  {
    id: 10,
    submission: "Market Trends Analysis",
    submittedBy: {
      name: "Daniel Martinez",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 20, 11:50 AM",
    status: "in_review",
  },
  {
    id: 11,
    submission: "Partnership Proposal Draft",
    submittedBy: {
      name: "Sophia Lee",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b169b1b8?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 21, 2:00 PM",
    status: "draft",
  },
  {
    id: 12,
    submission: "Customer Retention Report",
    submittedBy: {
      name: "Ethan Clark",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 22, 3:25 PM",
    status: "returned",
  },
  {
    id: 13,
    submission: "Q4 Hiring Plan",
    submittedBy: {
      name: "Mia Thompson",
      avatar:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 23, 10:40 AM",
    status: "approved",
  },
  {
    id: 14,
    submission: "New Product Launch Brief",
    submittedBy: {
      name: "James Wilson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 24, 1:15 PM",
    status: "in_review",
  },
  {
    id: 15,
    submission: "IT Security Audit",
    submittedBy: {
      name: "Isabella Garcia",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 25, 9:55 AM",
    status: "draft",
  },
  {
    id: 16,
    submission: "Supplier Performance Review",
    submittedBy: {
      name: "Benjamin Harris",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 26, 12:40 PM",
    status: "returned",
  },
  {
    id: 17,
    submission: "Quarterly Training Plan",
    submittedBy: {
      name: "Charlotte White",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 27, 2:30 PM",
    status: "approved",
  },
  {
    id: 18,
    submission: "Sustainability Report Draft",
    submittedBy: {
      name: "Alexander King",
      avatar:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 28, 11:15 AM",
    status: "in_review",
  },
  {
    id: 19,
    submission: "Website Redesign Proposal",
    submittedBy: {
      name: "Amelia Scott",
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 29, 4:50 PM",
    status: "draft",
  },
  {
    id: 20,
    submission: "Department Budget Allocation",
    submittedBy: {
      name: "Henry Adams",
      avatar:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=32&h=32&fit=crop&crop=face",
    },
    date: "Jul 30, 10:20 AM",
    status: "returned",
  },
];

const LatestSubmission = () => {
  const { data } = useGetAllSubmissionQuery({});
  console.log(data);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setSubmissions(submissionsData as ISubmission[]);
  }, []);

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === "date") {
      if (sortOrder === "asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    }
    if (sortBy === "name") {
      if (sortOrder === "asc") {
        return a.submission.localeCompare(b.submission);
      } else {
        return b.submission.localeCompare(a.submission);
      }
    }
    if (sortBy === "status") {
      if (sortOrder === "asc") {
        return a.status.localeCompare(b.status);
      } else {
        return b.status.localeCompare(a.status);
      }
    }
    return 0;
  });

  return (
    <BoxContainer>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0">
        <h4 className="font-semibold text-2xl">Latest Submission</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent border border-[#CAD2DB] h-12"
            >
              <ArrowDownUp className="size-5" />
              Sort By
              <ChevronDown className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white border border-[#CAD2DB] p-1"
          >
            {/* Field Selection */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Field
            </div>
            <DropdownMenuItem
              className={`rounded-md cursor-pointer ${sortBy === "startDate" ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              onClick={() => setSortBy("startDate")}
            >
              Date
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`rounded-md cursor-pointer ${sortBy === "endDate" ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              onClick={() => setSortBy("endDate")}
            >
              Name
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`rounded-md cursor-pointer ${sortBy === "endDate" ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              onClick={() => setSortBy("endDate")}
            >
              Status
            </DropdownMenuItem>

            <div className="my-1 border-t border-border" />

            {/* Order Selection */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Order
            </div>
            <DropdownMenuItem
              className={`rounded-md cursor-pointer ${sortOrder === "asc" ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              onClick={() => setSortOrder("asc")}
            >
              Ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`rounded-md cursor-pointer ${sortOrder === "desc" ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              onClick={() => setSortOrder("desc")}
            >
              Descending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      {/* Pass the whole array instead of mapping */}
      <SubmissionTable submissions={sortedSubmissions} />
    </BoxContainer>
  );
};

export default LatestSubmission;
