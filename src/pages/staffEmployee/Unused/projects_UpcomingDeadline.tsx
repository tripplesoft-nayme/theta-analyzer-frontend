import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import UpcomingDeadlineCard from "./UpcomingDeadlineCard";
import BoxContainer from "../../../Common/BoxContainer";
import { useState } from "react";
import "react-calendar/dist/Calendar.css"; // important!
import ViewCalender from "@/Common/ViewCalender";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const deadlineData = [
  {
    id: "1",
    programName: "Program Alpha",
    projectName: "Project A1",
    dueDate: "Jul 20, 2023",
    daysLeft: 8,
    assignedStaff: [
      {
        id: "1",
        name: "Sarah Johnson",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        id: "2",
        name: "Mike Chen",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        id: "3",
        name: "Lisa Rodriguez",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      {
        id: "4",
        name: "David Kim",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      },
    ],
  },
  {
    id: "2",
    programName: "Program Beta",
    projectName: "Project B1",
    dueDate: "Jul 22, 2023",
    daysLeft: 4,
    assignedStaff: [
      {
        id: "5",
        name: "Emma Smith",
        avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      },
      {
        id: "6",
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      },
      {
        id: "7",
        name: "Olivia Brown",
        avatar: "https://randomuser.me/api/portraits/women/7.jpg",
      },
      {
        id: "8",
        name: "Liam Johnson",
        avatar: "https://randomuser.me/api/portraits/men/8.jpg",
      },
    ],
  },
  {
    id: "3",
    programName: "Program Gamma",
    projectName: "Project C1",
    dueDate: "Jul 23, 2023",
    daysLeft: 2,
    assignedStaff: [
      {
        id: "9",
        name: "Sophia Lee",
        avatar: "https://randomuser.me/api/portraits/women/9.jpg",
      },
      {
        id: "10",
        name: "Noah Wilson",
        avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      },
      {
        id: "11",
        name: "Ava Martinez",
        avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      },
      {
        id: "12",
        name: "Ethan Davis",
        avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      },
    ],
  },
  {
    id: "4",
    programName: "Program Delta",
    projectName: "Project D1",
    dueDate: "Jul 25, 2023",
    daysLeft: 12,
    assignedStaff: [
      {
        id: "13",
        name: "Mia Thompson",
        avatar: "https://randomuser.me/api/portraits/women/13.jpg",
      },
      {
        id: "14",
        name: "James White",
        avatar: "https://randomuser.me/api/portraits/men/14.jpg",
      },
      {
        id: "15",
        name: "Charlotte Hall",
        avatar: "https://randomuser.me/api/portraits/women/15.jpg",
      },
      {
        id: "16",
        name: "Benjamin Allen",
        avatar: "https://randomuser.me/api/portraits/men/16.jpg",
      },
    ],
  },
  {
    id: "5",
    programName: "Program Epsilon",
    projectName: "Project E1",
    dueDate: "Jul 28, 2023",
    daysLeft: 6,
    assignedStaff: [
      {
        id: "17",
        name: "Amelia Scott",
        avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      },
      {
        id: "18",
        name: "Alexander King",
        avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      },
      {
        id: "19",
        name: "Harper Wright",
        avatar: "https://randomuser.me/api/portraits/women/19.jpg",
      },
      {
        id: "20",
        name: "Daniel Lopez",
        avatar: "https://randomuser.me/api/portraits/men/20.jpg",
      },
    ],
  },
  {
    id: "6",
    programName: "Program Zeta",
    projectName: "Project F1",
    dueDate: "Jul 30, 2023",
    daysLeft: 10,
    assignedStaff: [
      {
        id: "21",
        name: "Ella Carter",
        avatar: "https://randomuser.me/api/portraits/women/21.jpg",
      },
      {
        id: "22",
        name: "William Adams",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      {
        id: "23",
        name: "Zoe Nelson",
        avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      },
      {
        id: "24",
        name: "Henry Baker",
        avatar: "https://randomuser.me/api/portraits/men/24.jpg",
      },
    ],
  },
  {
    id: "7",
    programName: "Program Eta",
    projectName: "Project G1",
    dueDate: "Aug 1, 2023",
    daysLeft: 5,
    assignedStaff: [
      {
        id: "25",
        name: "Madison Foster",
        avatar: "https://randomuser.me/api/portraits/women/25.jpg",
      },
      {
        id: "26",
        name: "Jacob Gray",
        avatar: "https://randomuser.me/api/portraits/men/26.jpg",
      },
      {
        id: "27",
        name: "Hannah Reed",
        avatar: "https://randomuser.me/api/portraits/women/27.jpg",
      },
      {
        id: "28",
        name: "Logan Hughes",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg",
      },
    ],
  },
  {
    id: "8",
    programName: "Program Theta",
    projectName: "Project H1",
    dueDate: "Aug 3, 2023",
    daysLeft: 7,
    assignedStaff: [
      {
        id: "29",
        name: "Chloe Sanders",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
      },
      {
        id: "30",
        name: "David Young",
        avatar: "https://randomuser.me/api/portraits/men/30.jpg",
      },
      {
        id: "31",
        name: "Lily Bennett",
        avatar: "https://randomuser.me/api/portraits/women/31.jpg",
      },
      {
        id: "32",
        name: "Matthew Murphy",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    ],
  },
  {
    id: "9",
    programName: "Program Iota",
    projectName: "Project I1",
    dueDate: "Aug 5, 2023",
    daysLeft: 3,
    assignedStaff: [
      {
        id: "33",
        name: "Grace Parker",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      },
      {
        id: "34",
        name: "Ryan Collins",
        avatar: "https://randomuser.me/api/portraits/men/34.jpg",
      },
      {
        id: "35",
        name: "Victoria Cox",
        avatar: "https://randomuser.me/api/portraits/women/35.jpg",
      },
      {
        id: "36",
        name: "Lucas Rivera",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg",
      },
    ],
  },
  {
    id: "10",
    programName: "Program Kappa",
    projectName: "Project J1",
    dueDate: "Aug 6, 2023",
    daysLeft: 9,
    assignedStaff: [
      {
        id: "37",
        name: "Zara Hughes",
        avatar: "https://randomuser.me/api/portraits/women/37.jpg",
      },
      {
        id: "38",
        name: "Nathan Bryant",
        avatar: "https://randomuser.me/api/portraits/men/38.jpg",
      },
      {
        id: "39",
        name: "Audrey Price",
        avatar: "https://randomuser.me/api/portraits/women/39.jpg",
      },
      {
        id: "40",
        name: "Owen Powell",
        avatar: "https://randomuser.me/api/portraits/men/40.jpg",
      },
    ],
  },
  {
    id: "11",
    programName: "Program Lambda",
    projectName: "Project K1",
    dueDate: "Aug 8, 2023",
    daysLeft: 11,
    assignedStaff: [
      {
        id: "41",
        name: "Scarlett West",
        avatar: "https://randomuser.me/api/portraits/women/41.jpg",
      },
      {
        id: "42",
        name: "Eli Barnes",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      },
      {
        id: "43",
        name: "Nora Stone",
        avatar: "https://randomuser.me/api/portraits/women/43.jpg",
      },
      {
        id: "44",
        name: "Caleb Hunt",
        avatar: "https://randomuser.me/api/portraits/men/44.jpg",
      },
    ],
  },
  {
    id: "12",
    programName: "Program Mu",
    projectName: "Project L1",
    dueDate: "Aug 10, 2023",
    daysLeft: 4,
    assignedStaff: [
      {
        id: "45",
        name: "Isla Knight",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      },
      {
        id: "46",
        name: "Leo Fisher",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      },
      {
        id: "47",
        name: "Ella Boyd",
        avatar: "https://randomuser.me/api/portraits/women/47.jpg",
      },
      {
        id: "48",
        name: "Mason Reed",
        avatar: "https://randomuser.me/api/portraits/men/48.jpg",
      },
    ],
  },
  {
    id: "13",
    programName: "Program Nu",
    projectName: "Project M1",
    dueDate: "Aug 12, 2023",
    daysLeft: 6,
    assignedStaff: [
      {
        id: "49",
        name: "Layla Murray",
        avatar: "https://randomuser.me/api/portraits/women/49.jpg",
      },
      {
        id: "50",
        name: "Jack Fuller",
        avatar: "https://randomuser.me/api/portraits/men/50.jpg",
      },
      {
        id: "51",
        name: "Zoe Johnston",
        avatar: "https://randomuser.me/api/portraits/women/51.jpg",
      },
      {
        id: "52",
        name: "Henry Walsh",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      },
    ],
  },
];

const UpcomingDeadline = () => {
  const [value, onChange] = useState<Value>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <BoxContainer>
      <div className="flex items-center justify-between gap-2 pb-8 relative">
        {/* Header */}
        <div className="flex gap-1 items-center justify-center ">
          <Clock className="size-8 text-gray-600 w-6 h-6" />
          <h4 className="text-lg font-semibold">Upcoming Deadline</h4>
        </div>

        {/* View Calendar Button */}
        <ViewCalender
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onChange={onChange}
          value={value}
        />
      </div>

      {/* Deadline Cards */}
      <div className="w-full">
        {deadlineData?.slice(0, 3).map((project) => (
          <div key={project.id} className="pb-6">
            <UpcomingDeadlineCard deadlineData={project} />
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div>
        <Button
          variant="ghost"
          className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View all {deadlineData.length}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </BoxContainer>
  );
};

export default UpcomingDeadline;
