export const demoTasks = {
  data: [
    { id: 1, text: "Project Start", start_date: "2025-03-01", duration: 20, progress: 0.4, open: true },

    { id: 2, text: "Mobilization", start_date: "2025-03-01", duration: 7, parent: 1, progress: 0.3 },
    { id: 3, text: "Survey", start_date: "2025-03-03", duration: 5, parent: 1, progress: 0.6 },
    { id: 4, text: "Excavation", start_date: "2025-03-08", duration: 8, parent: 1, progress: 0.2 },

    { id: 5, text: "Foundation", start_date: "2025-03-16", duration: 10, progress: 0.1 },
  ],
  links: [
    { id: 1, source: 2, target: 3, type: "0" },
    { id: 2, source: 3, target: 4, type: "0" },
    { id: 3, source: 4, target: 5, type: "0" },
  ],
};
