import { ActivityLog } from "@/components/admin/charts/activityLog"
import { AlertCenter } from "@/components/admin/charts/alertCenter"
import { EarningReportsChart } from "@/components/admin/charts/earningReport"
import { SupportTicketsChart } from "@/components/admin/charts/supportTicket"
import { TopClientsChart } from "@/components/admin/charts/topClients"
import { TrendingIndustriesTable } from "@/components/admin/charts/trendingIndustries"
import { CustomerInsights } from "@/components/admin/customerInsight/customerInsight"
import { MetricsCards } from "@/components/admin/metricsCards/metricsCards"

const AdminDashboard = () => {
  return (
    <>
      <MetricsCards />
      <CustomerInsights />
      <div className="grid grid-cols-12 gap-6 mx-auto mt-10">
        <div className="col-span-5">
          <TopClientsChart />
        </div>
        <div className="col-span-4">
          <SupportTicketsChart />
        </div>
        <div className="col-span-3">
          <AlertCenter />
        </div>
        <div className="col-span-9 -mt-32">
          <EarningReportsChart />
        </div>
        <div className="col-span-3">
          <ActivityLog />
        </div>
        <div className="col-span-9 -mt-112">
          <TrendingIndustriesTable />
        </div>
        
      
        
      </div>
    </>
  )
}

export default AdminDashboard