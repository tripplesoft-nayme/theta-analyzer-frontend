import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChevronDown } from "lucide-react"

const supportTicketsData = [
  { name: "Opened", value: 338, percentage: 65, color: "#8b5cf6" },
  { name: "In Progress", value: 109, percentage: 21, color: "#06b6d4" },
  { name: "Resolved", value: 73, percentage: 14, color: "#10b981" },
]

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981"]

export function SupportTicketsChart() {
  return (
    <Card className="lg:col-span-1 border border-gray-200 h-[400px] p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Support Tickets</CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          This Month <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={supportTicketsData}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {supportTicketsData.map((entry, index) => (
                    <Cell key={`cell-${entry}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500">Total Tickets</div>
              <div className="text-2xl font-bold text-gray-900">520</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {supportTicketsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-gray-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.value}</span>
                <span className="text-gray-500">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
