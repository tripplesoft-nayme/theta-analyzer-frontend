export interface Ticket {
  id: string;
  ticketId?: string;
  subject: string;
  user: string;
  status: "open" | "closed" | "pending";
  issueType?: string;
}

export interface Message {
  id: string;
  ticketId: string;
  text?: string;
  fileUrl?: string;
  sender: "CLIENT" | "SUPPORT";
  timestamp: string;
  senderName?: string;
}
