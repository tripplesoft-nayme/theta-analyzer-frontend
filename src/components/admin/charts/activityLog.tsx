import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, ExternalLink } from "lucide-react"

const activityLog = [
  {
    id: 1,
    type: "success",
    title: "New client created",
    description: "TechSolution Ltd. added as Business Plan client",
    time: "2 minutes ago",
    ip: "By Admin",
  },
  {
    id: 2,
    type: "error",
    title: "Failed login attempt",
    description: "Multiple failed login attempts for Global Industries",
    time: "43 minutes ago",
    ip: "IP 185.32.44.12",
  },
  {
    id: 3,
    type: "info",
    title: "Dashboard published",
    description: 'Acme Corporation published "Sales Overview" dashboard',
    time: "10 minutes ago",
    ip: "By Admin",
  },
  {
    id: 4,
    type: "info",
    title: "Storage upgraded",
    description: "TechStart Inc. upgraded storage from 12GB to 25GB",
    time: "10 minutes ago",
    ip: "By Admin",
  },
  {
    id: 5,
    type: "success",
    title: "New client created",
    description: "TechSolution Ltd. added as Business Plan client",
    time: "2 minutes ago",
    ip: "By Admin",
  },
  {
    id: 6,
    type: "error",
    title: "Failed login attempt",
    description: "Multiple failed login attempts for Global Industries",
    time: "43 minutes ago",
    ip: "IP 185.32.44.12",
  },
  {
    id: 7,
    type: "info",
    title: "Dashboard published",
    description: 'Acme Corporation published "Sales Overview" dashboard',
    time: "10 minutes ago",
    ip: "By Admin",
  },
  {
    id: 8,
    type: "info",
    title: "Storage upgraded",
    description: "TechStart Inc. upgraded storage from 12GB to 25GB",
    time: "10 minutes ago",
    ip: "By Admin",
  },
]

export function ActivityLog() {
  return (
    <Card className="lg:col-span-1 border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Activity Log</CardTitle>
        <Button variant="ghost" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="absolute left-1 top-2 bottom-2 w-px bg-gray-200"></div>

          {activityLog.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 relative">
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 relative z-10 ${
                  activity.type === "success"
                    ? "bg-green-500"
                    : activity.type === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
              />
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{activity.title}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{activity.time}</span>
                  <span>{activity.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
          View full audit trail <ExternalLink className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
