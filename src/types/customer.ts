export interface Plan {
  current: string;
  billingCycle: string;
  nextRenewal: string;
  status: "Active" | "Pending" | "Paid" | "Unpaid";
}

export interface Metrics {
  totalUsers: {
    current: number;
    total: number;
    percentage: number;
  };
  activePrograms: {
    current: number;
    newThisMonth: number;
  };
  criticalAlerts: {
    current: number;
    newIn24Hours: number;
  };
  storageUsage: {
    current: string;
    total: string;
    percentage: number;
  };
}

export interface PlanSummary {
  users: { current: number; total: number };
  projects: { current: number; total: number };
  storage: { current: string; total: string };
  apiCalls: { current: string; total: string };
}

export interface Program {
  programName: string;
  projectName: string;
  usageCount: number;
  lastUpdated: string;
}

export interface Alert {
  alertType: string;
  priority: "Critical" | "High" | "Medium" | "Low" | "Default";
  timeStamp: string;
  status: "Resolved" | "In Progress" | "New";
}

export interface Invoice {
  invoiceId: string;
  date: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Pending";
}

export interface ActivityLog {
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

export interface ClientInfo {
  company: string;
  primaryContact: string;
  email: string;
  phone: string;
  location: string;
  plan: Plan;
}

export interface User {
  name: string;
  client: ClientInfo;
  metrics: Metrics;
  planSummary: PlanSummary;
  programs: Program[];
  alertsList: Alert[];
  invoices: Invoice[];
  activityLog: ActivityLog[];
}

export interface ClientData {
  id: number;
  companyName: string;
  plan: string;
  status: string;
  users: string;
  lastActive: string;
  dashboardUpdates: number;
  alerts: number;
  alertType: string;
  storageUsage: number;
  storageTotal: number;
  user: User;
}
