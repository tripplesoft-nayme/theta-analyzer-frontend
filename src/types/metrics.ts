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
