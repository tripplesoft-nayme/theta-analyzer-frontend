export interface Submission {
  id: string;
  information: string;
  submission: string;
  status: "PENDING" | "APPROVED" | "RETURNED";
  createdAt: string;
  updatedAt: string;

  employee: {
    user: {
      name: string;
      email: string;
      phoneNumber: string;
    };
  };

  project: {
    name: string;
    status: string;
    priority: string;
    startDate: string;
    estimatedCompletedDate: string;
  };
}
