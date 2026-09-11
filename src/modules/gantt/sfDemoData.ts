export const ganttData = [
  {
    TaskID: 1,
    TaskName: "Project Initiation",
    StartDate: new Date("2025-03-01"),
    Duration: 10,
    Progress: 40,
    subtasks: [
      {
        TaskID: 2,
        TaskName: "Identify Site",
        StartDate: new Date("2025-03-01"),
        Duration: 4,
        Progress: 60,
      },
      {
        TaskID: 3,
        TaskName: "Soil Test",
        StartDate: new Date("2025-03-05"),
        Duration: 3,
        Progress: 30,
      },
    ],
  },
  {
    TaskID: 4,
    TaskName: "Foundation",
    StartDate: new Date("2025-03-10"),
    Duration: 8,
    Progress: 10,
  },
];
