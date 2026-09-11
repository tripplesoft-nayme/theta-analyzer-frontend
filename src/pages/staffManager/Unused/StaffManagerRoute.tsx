import StaffManagerOverview from "@/pages/staffManager/StaffManagerOverview";
import StaffManagerProjects from "@/pages/staffManager/StaffManagerProjects";
import StaffManagerMarketingStrategy from "@/pages/staffManager/StaffManagerMarketingStrategy";
import StaffManagerTimosSuperShop from "@/pages/staffManager/StaffManagerTimosSuperShop";
import StaffManagerProgramName from "@/pages/staffManager/StaffManagerProgramName";
// import StaffManagerProjectBuilder from "@/pages/staffManager/StaffManagerProjectBuilder";
import StaffManagerHighwayExpansion from "@/pages/staffManager/StaffManagerHighwayExpansion";
import StaffManagerProjectReview from "@/pages/staffManager/StaffManagerProjectReview";
import StaffManagerHelp from "@/pages/staffManager/StaffManagerHelp";
import StaffManagerSupport from "@/pages/staffManager/StaffManagerSupport";
import StaffManagerSupportTickets from "@/pages/staffManager/StaffManagerSupportTickets";
import StaffManagerFeedback from "@/pages/staffManager/StaffManagerFeedBack";
import StaffManagerProductTour from "@/pages/staffManager/StaffManagerProductTour";
import StaffManagerSettings from "@/pages/staffManager/StaffManagerSettings";
import StaffManagerWorkInProgress from "@/pages/staffManager/StaffManagerWorkInProgress";
import StaffManagerUserActivityLog from "@/pages/staffManager/StaffManagerUsersActivityLog";
import StaffManagerCarlyleHall from "@/pages/staffManager/StaffManagerCarlyleHall";
import StaffManagerEmployees from "@/pages/staffManager/StaffManagerEmployees";
import StaffManagerAlfalaBuilders from "@/pages/staffManager/StaffManagerAlfalaBuilders";
import StaffManagerAllProgram from "@/pages/staffManager/StaffManagerAllProgram";
import StaffManagerActivityLog from "@/pages/staffManager/StaffManagerActivityLog";
import StaffManagerCreateTicket from "@/pages/staffManager/StaffManagerCreateTicket";
import StaffManagerContactUs from "@/pages/staffManager/StaffManagerContactUs";
// import CommingSoonPage from "@/Common/CommingSoonPage";
import StaffManagerStateCardDetails from "@/pages/staffManager/StaffManagerStateCardDetails";
import StaffManagerUploadSubmission from "@/pages/staffManager/StaffManagerUploadSubmission";
import AllProjectsReview from "@/pages/staffManager/AllProjectsReview";

export function getStaffManagerRoutes() {
  return [
    { index: true, element: <StaffManagerOverview /> },
    { path: "projects", element: <StaffManagerProjects /> },
    {
      path: "projects/upload-submission",
      element: <StaffManagerUploadSubmission />,
    },
    { path: "carlyle-hall", element: <StaffManagerCarlyleHall /> },
    { path: "employees", element: <StaffManagerEmployees /> },
    {
      path: "marketing-strategy",
      element: <StaffManagerMarketingStrategy />,
    },
    { path: "alfala-building", element: <StaffManagerAlfalaBuilders /> },
    {
      path: "timos-super-shop",
      element: <StaffManagerTimosSuperShop />,
    },
    { path: "all-program", element: <StaffManagerAllProgram /> },
    { path: "program-name", element: <StaffManagerProgramName /> },
    // {
    //   path: "project-builder",
    //   element: <StaffManagerProjectBuilder />,
    // },
    {
      path: "highway-expansion",
      element: <StaffManagerHighwayExpansion />,
    },
    {
      path: "project-review",
      element: <StaffManagerProjectReview />,
      children: [
        { path: "all-projects", element: <AllProjectsReview /> },
        { path: "carlyle-hall", element: <StaffManagerCarlyleHall /> },
      ],
    },
    { path: "activity-log", element: <StaffManagerActivityLog /> },
    {
      path: "help",
      element: <StaffManagerHelp />,
      children: [
        {
          path: "support",
          element: <StaffManagerSupport />,
          children: [
            { index: true, element: <StaffManagerSupportTickets /> },
            { path: "create-tickets", element: <StaffManagerCreateTicket /> },
          ],
        },
        { path: "feedback", element: <StaffManagerFeedback /> },
        {
          path: "product-tour",
          element: <StaffManagerProductTour />,
        },
        { path: "contact-us", element: <StaffManagerContactUs /> },
      ],
    },
    { path: "settings", element: <StaffManagerSettings /> },
    {
      path: "work-in-progress",
      element: <StaffManagerWorkInProgress />,
    },
    {
      path: "user-activity-log",
      element: <StaffManagerUserActivityLog />,
    },
    {
      path: "state-card/:cardTitle",
      element: <StaffManagerStateCardDetails />,
    },
  ];
}
