"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react"

const trendingIndustries = [
  {
    id: 1,
    name: "Real Estate",
    icon: "🏠",
    totalUsage: 56,
    monthlyComparison: 8,
    trend: "up",
    lastUpdated: "25 June 2025",
    status: "Active",
  },
  {
    id: 2,
    name: "Finance",
    icon: "🏦",
    totalUsage: 56,
    monthlyComparison: -2,
    trend: "down",
    lastUpdated: "25 June 2025",
    status: "Reviewing",
  },
  {
    id: 3,
    name: "Renewable energy",
    icon: "🌱",
    totalUsage: 56,
    monthlyComparison: 6,
    trend: "up",
    lastUpdated: "25 June 2025",
    status: "Decreased",
  },
  {
    id: 4,
    name: "Travel Agency",
    icon: "✈️",
    totalUsage: 56,
    monthlyComparison: 8,
    trend: "up",
    lastUpdated: "25 June 2025",
    status: "Active",
  },
  {
    id: 5,
    name: "Beauty & wellness",
    icon: "💄",
    totalUsage: 56,
    monthlyComparison: 8,
    trend: "up",
    lastUpdated: "25 June 2025",
    status: "Active",
  },
]

export function TrendingIndustriesTable() {
  return (
    <Card className="lg:col-span-3 border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Trending Industries</CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          Sort By <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Industry Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Total Usage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Monthly Comparison</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {trendingIndustries.map((industry) => (
                <tr key={industry.id} className="border-b border-border hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{industry.icon}</span>
                      <span className="font-medium text-gray-900">{industry.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{industry.totalUsage}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {industry.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${industry.trend === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {industry.trend === "up" ? "+" : ""}
                        {industry.monthlyComparison}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{industry.lastUpdated}</td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        industry.status === "Active"
                          ? "default"
                          : industry.status === "Reviewing"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        industry.status === "Active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : industry.status === "Reviewing"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {industry.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
