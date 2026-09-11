import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import type { FormData } from "@/types/form-types"
import { CustomCheckBox } from "@/components/ui/CustomCheckBox"

const columnData = [
  { name: "Mon", onTime: 60, absent: 20, late: 20 },
  { name: "Tue", onTime: 80, absent: 10, late: 10 },
  { name: "Wed", onTime: 70, absent: 15, late: 15 },
  { name: "Thu", onTime: 90, absent: 5, late: 5 },
  { name: "Fri", onTime: 85, absent: 8, late: 7 },
  { name: "Sat", onTime: 75, absent: 12, late: 13 },
  { name: "Sun", onTime: 65, absent: 18, late: 17 },
]

const pieData = [
  { name: "First timer", value: 65, color: "#3B82F6" },
  { name: "Social traffic", value: 21, color: "#10B981" },
  { name: "Organic traffic", value: 14, color: "#F59E0B" },
]

const radarData = [
  { subject: "Quality", thisMonth: 120, previousMonth: 110 },
  { subject: "Speed", thisMonth: 98, previousMonth: 130 },
  { subject: "Efficiency", thisMonth: 86, previousMonth: 130 },
  { subject: "Innovation", thisMonth: 99, previousMonth: 100 },
  { subject: "Teamwork", thisMonth: 85, previousMonth: 90 },
  { subject: "Communication", thisMonth: 65, previousMonth: 85 },
]

export function StepFour() {
  const { watch, setValue } = useFormContext<FormData>()
  const formData = watch()

  return (
    <div className="space-y-8">
      {/* Library Assignment */}
      <div>
        <h3 className="text-xl font-medium text-blue-600 mb-4">Library Assignment</h3>
        <div className="flex items-center space-x-2 mb-4">
          <CustomCheckBox
            checked={formData.enableCustomCharts || false}
            onChange={(checked) => setValue("enableCustomCharts", checked)}
          />
          <Label htmlFor="enableCustomCharts">Enable Custom chart library</Label>
        </div>
        <p className="text-sm text-gray-600">
          Enable this to accept and validate extended chart types for this client's dashboards.
        </p>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Select additional chart</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Column ×</Badge>
            <Badge variant="secondary">Bar ×</Badge>
            <Badge variant="secondary">Radar ×</Badge>
            <Badge variant="secondary">Doughnut Pie ×</Badge>
            <Badge variant="secondary">Heatmap ×</Badge>
            <Badge variant="outline">Add more +</Badge>
          </div>
        </div>
      </div>

      {/* Chart Render Testing */}
      <div>
        <h3 className="text-lg font-medium text-blue-600 mb-4">Chart render testing</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Column Chart */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Column Chart</h4>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Working ✓
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>On time</span>
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                <span>Absent</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full ml-2"></span>
                <span>Late</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Total 576 employees</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={columnData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Bar dataKey="onTime" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="absent" stackId="a" fill="#10B981" />
                    <Bar dataKey="late" stackId="a" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Bar Chart</h4>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Working ✓
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>On time</span>
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                <span>Absent</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full ml-2"></span>
                <span>Late</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Total 576 employees</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={columnData} layout="horizontal">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Bar dataKey="onTime" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Radar Chart</h4>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Working ✓
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>This Month</span>
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                <span>Previous Month</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Average Team Performance</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 150]} tick={false} />
                    <Radar name="This Month" dataKey="thisMonth" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Radar
                      name="Previous Month"
                      dataKey="previousMonth"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Doughnut Pie Charts */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Doughnut Pie Charts</h4>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Working ✓
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>First timer</span>
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                <span>Social traffic</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full ml-2"></span>
                <span>Organic traffic</span>
              </div>
              <div className="h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">520K</span>
                  <span className="text-xs text-gray-500">Total Visitor</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heatmap Chart */}
          <Card className="col-span-2 border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Heatmap chart</h4>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Working ✓
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Total in Stock</p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="h-4 flex items-center">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 84 }, (_, i) => {
                    const intensity = Math.floor(Math.random() * 4) + 1
                    return (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm"
                        style={{
                          backgroundColor:
                            intensity === 1
                              ? "#E5E7EB"
                              : intensity === 2
                                ? "#A7F3D0"
                                : intensity === 3
                                  ? "#34D399"
                                  : "#10B981",
                        }}
                        title={`Activity level: ${intensity}`}
                      />
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Notification */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <CustomCheckBox
            checked={formData.notifyDevQATeam || false}
            onChange={(checked) => setValue("notifyDevQATeam", checked)}
          />
          <Label htmlFor="notifyDevQATeam">Notify Dev / QA Team</Label>
        </div>

        {formData.notifyDevQATeam && (
          <div>
            <Label htmlFor="selectedTeamMember">Select Team Member</Label>
            <Select
              value={formData.selectedTeamMember || ""}
              onValueChange={(value) => setValue("selectedTeamMember", value)}
            >
              <SelectTrigger className="mt-1 max-w-xs">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
