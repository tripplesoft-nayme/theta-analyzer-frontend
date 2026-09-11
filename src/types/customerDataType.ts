export interface ICustomer {
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
  user: {
    name: string;
    client: {
      company: string;
      primaryContact: string;
      email: string;
      phone: string;
      location: string;
      plan: {
        current: string;
        billingCycle: string;
        nextRenewal: string;
        status: string;
      };
    };
    metrics: {
      totalUsers: { current: number; total: number; percentage: number };
      activePrograms: { current: number; newThisMonth: number };
      criticalAlerts: { current: number; newIn24Hours: number };
      storageUsage: { current: string; total: string; percentage: number };
    };
    planSummary: {
      users: { current: number; total: number };
      projects: { current: number; total: number };
      storage: { current: string; total: string };
      apiCalls: { current: string; total: string };
    };
    programs: {
      programName: string;
      projectName: string;
      usageCount: number;
      lastUpdated: string;
    }[];
    alertsList: {
      alertType: string;
      priority: string;
      timeStamp: string;
      status: string;
    }[];
    invoices: {
      invoiceId: string;
      date: string;
      amount: string;
      status: string;
    }[];
    activityLog: {
      timestamp: string;
      action: string;
      performedBy: string;
      details: string;
    }[];
  };
}