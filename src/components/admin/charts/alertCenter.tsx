import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ExternalLink } from "lucide-react"

export function AlertCenter() {
  return (
    <Card className="lg:col-span-1 border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">Alert Center</CardTitle>
        </div>
        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
          3 Critical
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">API rate limit</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">TechStart Inc. exceeded API rate limits 3 times today.</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">4 hours ago</span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent border-none text-gray-700">
                  Notify
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
          View all 25 alerts <ExternalLink className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
