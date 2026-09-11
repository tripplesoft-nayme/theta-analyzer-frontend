import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Pagination from "@/components/client/Pagination";
import SearchBar from "@/components/client/SearchBar";
import DateRange from "@/components/client/DateRange";
import ActivityLogTable from "@/pages/client/ActivityLog/Components/ActivityLogTable";

const activityLogData = [
  {
    id: "1",
    timestamp: "25-Jun-2025 19:35:09",
    user: {
      name: "Alexandria",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    description: { action: "assignee_added", details: "John Doe" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.101",
  },
  {
    id: "2",
    timestamp: "25-Jun-2025 19:40:12",
    user: {
      name: "Arlene",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    description: { action: "file_added", details: "file-001.jpg" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.102",
  },
  {
    id: "3",
    timestamp: "25-Jun-2025 19:45:22",
    user: {
      name: "Ann",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/footing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.103",
  },
  {
    id: "4",
    timestamp: "25-Jun-2025 19:50:30",
    user: {
      name: "Kyle",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    description: {
      action: "link_removed",
      details: "https://example.com/footing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.104",
  },
  {
    id: "5",
    timestamp: "25-Jun-2025 19:55:05",
    user: {
      name: "Kristin",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/footing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.105",
  },
  {
    id: "6",
    timestamp: "25-Jun-2025 20:00:15",
    user: {
      name: "Colleen",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "24/04/2025 to 10/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.106",
  },
  {
    id: "7",
    timestamp: "25-Jun-2025 20:05:45",
    user: {
      name: "Aubrey",
      avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "24/04/2025 to 10/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.107",
  },
  {
    id: "8",
    timestamp: "25-Jun-2025 20:10:55",
    user: {
      name: "Arthur",
      avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "24/04/2025 to 10/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.108",
  },
  {
    id: "9",
    timestamp: "25-Jun-2025 20:15:40",
    user: {
      name: "Soham",
      avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    },
    description: { action: "progress_changed", details: "7% to 9%" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.109",
  },
  {
    id: "10",
    timestamp: "25-Jun-2025 20:20:12",
    user: {
      name: "Philip",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    description: { action: "subtask_removed", details: "Excavation" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.110",
  },
  {
    id: "11",
    timestamp: "25-Jun-2025 20:25:12",
    user: {
      name: "Monica",
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    },
    description: { action: "assignee_added", details: "Liam Smith" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.111",
  },
  {
    id: "12",
    timestamp: "25-Jun-2025 20:30:45",
    user: {
      name: "Nathan",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    description: { action: "file_added", details: "plan-2025.pdf" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.112",
  },
  {
    id: "13",
    timestamp: "25-Jun-2025 20:35:05",
    user: {
      name: "Olivia",
      avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/blueprint",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.113",
  },
  {
    id: "14",
    timestamp: "25-Jun-2025 20:40:22",
    user: {
      name: "Peter",
      avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    },
    description: {
      action: "link_removed",
      details: "https://example.com/blueprint",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.114",
  },
  {
    id: "15",
    timestamp: "25-Jun-2025 20:45:10",
    user: {
      name: "Rachel",
      avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/blueprint",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.115",
  },
  {
    id: "16",
    timestamp: "25-Jun-2025 20:50:05",
    user: {
      name: "Quentin",
      avatar: "https://randomuser.me/api/portraits/men/16.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "15/05/2025 to 22/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.116",
  },
  {
    id: "17",
    timestamp: "25-Jun-2025 20:55:45",
    user: {
      name: "Sophia",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "15/05/2025 to 22/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.117",
  },
  {
    id: "18",
    timestamp: "25-Jun-2025 21:00:30",
    user: {
      name: "Thomas",
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "15/05/2025 to 22/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.118",
  },
  {
    id: "19",
    timestamp: "25-Jun-2025 21:05:15",
    user: {
      name: "Uma",
      avatar: "https://randomuser.me/api/portraits/women/19.jpg",
    },
    description: {
      action: "progress_changed",
      details: "12% to 18%",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.119",
  },
  {
    id: "20",
    timestamp: "25-Jun-2025 21:10:55",
    user: {
      name: "Victor",
      avatar: "https://randomuser.me/api/portraits/men/20.jpg",
    },
    description: { action: "subtask_removed", details: "Foundation" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.120",
  },
  {
    id: "21",
    timestamp: "25-Jun-2025 21:15:12",
    user: {
      name: "Wendy",
      avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    description: { action: "assignee_added", details: "Ethan Hunt" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.121",
  },
  {
    id: "22",
    timestamp: "25-Jun-2025 21:20:22",
    user: {
      name: "Xander",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    description: {
      action: "file_added",
      details: "drawing-2025.png",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.122",
  },
  {
    id: "23",
    timestamp: "25-Jun-2025 21:25:30",
    user: {
      name: "Yasmine",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/roofing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.123",
  },
  {
    id: "24",
    timestamp: "25-Jun-2025 21:30:45",
    user: {
      name: "Zachary",
      avatar: "https://randomuser.me/api/portraits/men/24.jpg",
    },
    description: {
      action: "link_removed",
      details: "https://example.com/roofing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.124",
  },
  {
    id: "25",
    timestamp: "25-Jun-2025 21:35:12",
    user: {
      name: "Abigail",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/roofing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.125",
  },
  {
    id: "26",
    timestamp: "25-Jun-2025 21:40:22",
    user: {
      name: "Brian",
      avatar: "https://randomuser.me/api/portraits/men/26.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "22/05/2025 to 29/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.126",
  },
  {
    id: "27",
    timestamp: "25-Jun-2025 21:45:10",
    user: {
      name: "Chloe",
      avatar: "https://randomuser.me/api/portraits/women/27.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "22/05/2025 to 29/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.127",
  },
  {
    id: "28",
    timestamp: "25-Jun-2025 21:50:55",
    user: {
      name: "Daniel",
      avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "22/05/2025 to 29/05/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.128",
  },
  {
    id: "29",
    timestamp: "25-Jun-2025 21:55:35",
    user: {
      name: "Emily",
      avatar: "https://randomuser.me/api/portraits/women/29.jpg",
    },
    description: {
      action: "progress_changed",
      details: "18% to 25%",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.129",
  },
  {
    id: "30",
    timestamp: "25-Jun-2025 22:00:12",
    user: {
      name: "Frank",
      avatar: "https://randomuser.me/api/portraits/men/30.jpg",
    },
    description: {
      action: "subtask_removed",
      details: "Concrete Pouring",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.130",
  },
  {
    id: "31",
    timestamp: "25-Jun-2025 22:05:12",
    user: {
      name: "Grace",
      avatar: "https://randomuser.me/api/portraits/women/31.jpg",
    },
    description: { action: "assignee_added", details: "Lucas Brown" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.131",
  },
  {
    id: "32",
    timestamp: "25-Jun-2025 22:10:22",
    user: {
      name: "Henry",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    description: {
      action: "file_added",
      details: "inspection-2025.pdf",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.132",
  },
  {
    id: "33",
    timestamp: "25-Jun-2025 22:15:30",
    user: {
      name: "Isabella",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/ceiling",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.133",
  },
  {
    id: "34",
    timestamp: "25-Jun-2025 22:20:45",
    user: {
      name: "Jack",
      avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    },
    description: {
      action: "link_removed",
      details: "https://example.com/ceiling",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.134",
  },
  {
    id: "35",
    timestamp: "25-Jun-2025 22:25:12",
    user: {
      name: "Karen",
      avatar: "https://randomuser.me/api/portraits/women/35.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/ceiling",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.135",
  },
  {
    id: "36",
    timestamp: "25-Jun-2025 22:30:22",
    user: {
      name: "Leo",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "29/05/2025 to 05/06/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.136",
  },
  {
    id: "37",
    timestamp: "25-Jun-2025 22:35:10",
    user: {
      name: "Mia",
      avatar: "https://randomuser.me/api/portraits/women/37.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "29/05/2025 to 05/06/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.137",
  },
  {
    id: "38",
    timestamp: "25-Jun-2025 22:40:55",
    user: {
      name: "Noah",
      avatar: "https://randomuser.me/api/portraits/men/38.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "29/05/2025 to 05/06/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.138",
  },
  {
    id: "39",
    timestamp: "25-Jun-2025 22:45:35",
    user: {
      name: "Olga",
      avatar: "https://randomuser.me/api/portraits/women/39.jpg",
    },
    description: {
      action: "progress_changed",
      details: "25% to 32%",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.139",
  },
  {
    id: "40",
    timestamp: "25-Jun-2025 22:50:12",
    user: {
      name: "Paul",
      avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    },
    description: {
      action: "subtask_removed",
      details: "Wall Framing",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.140",
  },
  {
    id: "41",
    timestamp: "25-Jun-2025 22:55:12",
    user: {
      name: "Quinn",
      avatar: "https://randomuser.me/api/portraits/women/41.jpg",
    },
    description: { action: "assignee_added", details: "Evan Lee" },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.141",
  },
  {
    id: "42",
    timestamp: "25-Jun-2025 23:00:22",
    user: {
      name: "Ryan",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    description: {
      action: "file_added",
      details: "report-2025.docx",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.142",
  },
  {
    id: "43",
    timestamp: "25-Jun-2025 23:05:30",
    user: {
      name: "Samantha",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/windows",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.143",
  },
  {
    id: "44",
    timestamp: "25-Jun-2025 23:10:45",
    user: {
      name: "Tyler",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    description: {
      action: "link_removed",
      details: "https://example.com/windows",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.144",
  },
  {
    id: "45",
    timestamp: "25-Jun-2025 23:15:12",
    user: {
      name: "Ursula",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    description: {
      action: "link_added",
      details: "https://example.com/windows",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.145",
  },
  {
    id: "46",
    timestamp: "25-Jun-2025 23:20:22",
    user: {
      name: "Victor",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "05/06/2025 to 12/06/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.146",
  },
  {
    id: "47",
    timestamp: "25-Jun-2025 23:25:10",
    user: {
      name: "Willa",
      avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "05/06/2025 to 12/06/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.147",
  },
  {
    id: "48",
    timestamp: "25-Jun-2025 23:30:55",
    user: {
      name: "Xavier",
      avatar: "https://randomuser.me/api/portraits/men/48.jpg",
    },
    description: {
      action: "due_date_changed",
      details: "05/06/2025 to 12/06/2025",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.148",
  },
  {
    id: "49",
    timestamp: "25-Jun-2025 23:35:35",
    user: {
      name: "Yara",
      avatar: "https://randomuser.me/api/portraits/women/49.jpg",
    },
    description: {
      action: "progress_changed",
      details: "32% to 40%",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.149",
  },
  {
    id: "50",
    timestamp: "25-Jun-2025 23:40:12",
    user: {
      name: "Zane",
      avatar: "https://randomuser.me/api/portraits/men/50.jpg",
    },
    description: {
      action: "subtask_removed",
      details: "Roof Installation",
    },
    projectName: "Carlyle Hall",
    ipAddress: "192.168.1.150",
  },
];

export interface ActivityItem {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description: string;
  timestamp: string;
  metadata?: string;
}
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
  description: {
    action: string;
    details?: string;
  };
  projectName: string;
  ipAddress: string;
}

// Flatten nested objects for table rendering
const flattenEntry = (entry: ActivityLogEntry) => {
  return {
    ...entry,
    user: {
      name: entry.user.name,
      avatar: entry.user.avatar,
    },
    description: `${entry.description.action}${
      entry.description.details ? `: ${entry.description.details}` : ""
    }`,
  };
};

export default function ViewerPanelActivityLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const flattenedData = activityLogData.map(flattenEntry);

  // Filter data
  const filteredData = flattenedData.filter((entry) =>
    Object.values(entry).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const tableHeaders = Object.keys(paginatedData[0] || {});

  // Export CSV
  const handleExport = () => {
    const headers = tableHeaders;
    const csvContent = [
      headers.join(","),
      ...filteredData.map((entry) =>
        headers.map((key) => `"${entry[key as keyof typeof entry]}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees-activity-log.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          All Employees Activity Log
        </h2>
        <div className="flex items-center gap-3">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <DateRange />
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2 bg-transparent border border-[#E2E8F0]"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="">
        <ActivityLogTable
          paginatedData={paginatedData}
          tableHeaders={tableHeaders}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filteredDataLength={filteredData.length}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
      />
    </div>
  );
}
