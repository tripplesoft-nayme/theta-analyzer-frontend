import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ExternalLink } from "lucide-react"

const topClientsData = [
  { name: "Acme", usage: 1750 },
  { name: "Global", usage: 1500 },
  { name: "Tech", usage: 1250 },
  { name: "Next", usage: 1200 },
  { name: "Delta", usage: 900 },
  { name: "SoftV", usage: 750 },
  { name: "Tiger", usage: 500 },
]

export function TopClientsChart() {
  return (
    <Card className="lg:col-span-1 border border-gray-200 p-2 h-[400px]"> {/* reduced outer padding */}
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3"> {/* reduced header padding */}
        <CardTitle className="text-base font-semibold text-gray-900">Top Clients by Usage</CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          View All <ExternalLink className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2"> {/* reduced content padding */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topClientsData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }} // tighter chart margin
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              domain={[0, 2000]}
              ticks={[0, 500, 1000, 1500, 2000]}
            />
            <Bar dataKey="usage" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
