interface IAssignedStaff {
  name: string;
  avatar: string;
}

export interface IUpcomingDeadlineProject {
  id: string;
  programName: string;
  projectName: string;
  dueDate: string;
  daysLeft: number;
  assignedStaff: IAssignedStaff[];
}