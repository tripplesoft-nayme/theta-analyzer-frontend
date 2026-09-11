interface ISubmittedBy {
  name: string;
  avatar: string;
}

type TStatus = "approved" | "in_review" | "returned" | "draft";

export interface ISubmission {
  id: number;
  submission: string;
  submittedBy: ISubmittedBy;
  date: string;
  status: TStatus;
}
