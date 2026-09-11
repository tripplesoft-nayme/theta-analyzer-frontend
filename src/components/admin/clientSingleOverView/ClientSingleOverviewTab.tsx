import { Card, CardContent } from "@/components/ui/card"
import { PlanSummary } from "@/types/customer"
import { Database, FolderOpen, User, Zap } from "lucide-react"

interface PlanSummaryProps {
  planSummary: PlanSummary
}

const ClientSingleOverviewTab: React.FC<PlanSummaryProps> = ({ planSummary }) => {
  return (
    <Card className="w-1/3 border-none shadow-md">
      <CardContent className="">
        <h3 className="text-xl font-semibold mb-6">Plan Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-400" />
              <span className="text-gray-700">Users</span>
            </div>
            <span className="font-medium">
              {planSummary.users.current}/{planSummary.users.total}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-blue-400" />
              <span className="text-gray-700">Projects</span>
            </div>
            <span className="font-medium">
              {planSummary.projects.current}/{planSummary.projects.total}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-red-400" />
              <span className="text-gray-700">Storage</span>
            </div>
            <span className="font-medium">
              {planSummary.storage.current}/{planSummary.storage.total}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-700">API Calls</span>
            </div>
            <span className="font-medium">
              {planSummary.apiCalls.current}/{planSummary.apiCalls.total}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientSingleOverviewTab