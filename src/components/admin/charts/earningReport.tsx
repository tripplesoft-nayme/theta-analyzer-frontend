"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChevronDown, ShoppingCart, CreditCard, DollarSign } from "lucide-react"
import { useState } from "react"

const ordersData = [
  { month: "Jan", value: 18, percentage: "18%" },
  { month: "Feb", value: 23, percentage: "23%" },
  { month: "Mar", value: 25, percentage: "25%" },
  { month: "Apr", value: 32, percentage: "32%" },
  { month: "May", value: 38, percentage: "38%" },
  { month: "Jun", value: 42, percentage: "42%" },
  { month: "Jul", value: 50, percentage: "50%" },
  { month: "Aug", value: 70, percentage: "70%" },
  { month: "Sep", value: 48, percentage: "48%" },
  { month: "Oct", value: 45, percentage: "45%" },
  { month: "Nov", value: 47, percentage: "47%" },
  { month: "Dec", value: 60, percentage: "60%" },
]

const salesData = [
  { month: "Jan", value: 25, percentage: "25%" },
  { month: "Feb", value: 30, percentage: "30%" },
  { month: "Mar", value: 35, percentage: "35%" },
  { month: "Apr", value: 40, percentage: "40%" },
  { month: "May", value: 45, percentage: "45%" },
  { month: "Jun", value: 50, percentage: "50%" },
  { month: "Jul", value: 55, percentage: "55%" },
  { month: "Aug", value: 65, percentage: "65%" },
  { month: "Sep", value: 52, percentage: "52%" },
  { month: "Oct", value: 48, percentage: "48%" },
  { month: "Nov", value: 53, percentage: "53%" },
  { month: "Dec", value: 68, percentage: "68%" },
]

const incomeData = [
  { month: "Jan", value: 15, percentage: "15%" },
  { month: "Feb", value: 20, percentage: "20%" },
  { month: "Mar", value: 22, percentage: "22%" },
  { month: "Apr", value: 28, percentage: "28%" },
  { month: "May", value: 33, percentage: "33%" },
  { month: "Jun", value: 38, percentage: "38%" },
  { month: "Jul", value: 45, percentage: "45%" },
  { month: "Aug", value: 62, percentage: "62%" },
  { month: "Sep", value: 42, percentage: "42%" },
  { month: "Oct", value: 40, percentage: "40%" },
  { month: "Nov", value: 43, percentage: "43%" },
  { month: "Dec", value: 55, percentage: "55%" },
]

export function EarningReportsChart() {
  const [activeTab, setActiveTab] = useState<"orders" | "sales" | "income">("orders")

  const getCurrentData = () => {
    switch (activeTab) {
      case "orders":
        return ordersData
      case "sales":
        return salesData
      case "income":
        return incomeData
      default:
        return ordersData
    }
  }

  return (
    <Card className="lg:col-span-2 border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">Earning Reports</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Yearly Earnings Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            Sort By <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              activeTab === "orders"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ShoppingCart className={`h-4 w-4 ${activeTab === "orders" ? "text-blue-600" : "text-gray-600"}`} />
            <span className="text-sm font-medium">Orders</span>
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              activeTab === "sales"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CreditCard className={`h-4 w-4 ${activeTab === "sales" ? "text-blue-600" : "text-gray-600"}`} />
            <span className="text-sm font-medium">Sales</span>
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              activeTab === "income"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <DollarSign className={`h-4 w-4 ${activeTab === "income" ? "text-blue-600" : "text-gray-600"}`} />
            <span className="text-sm font-medium">Income</span>
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
