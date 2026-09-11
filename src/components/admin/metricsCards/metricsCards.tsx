"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, UserMinus, Star, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const metricsData = [
  {
    id: 1,
    title: "Total Sales",
    value: "$2150k",
    change: "+5%",
    changeType: "positive",
    subtitle: "$80k+ Sales growth",
    icon: "DollarSign",
    color: "emerald",
  },
  {
    id: 2,
    title: "Monthly Recurring Revenue",
    value: "850",
    change: "+2%",
    changeType: "positive",
    subtitle: "150 New user joined",
    icon: "TrendingUp",
    color: "blue",
  },
  {
    id: 3,
    title: "Client Retention Rate",
    value: "92.2%",
    change: "+11%",
    changeType: "positive",
    subtitle: "5 new clients joined",
    icon: "Users",
    color: "blue",
  },
  {
    id: 4,
    title: "Client Churn Rate",
    value: "7.8%",
    change: null,
    changeType: null,
    subtitle: "50 Clients left",
    icon: "UserMinus",
    color: "red",
  },
  {
    id: 5,
    title: "Net Promoter Score",
    value: "75",
    change: "+5%",
    changeType: "positive",
    subtitle: "25 score growth",
    icon: "Star",
    color: "emerald",
  },
]

const iconMap = {
  DollarSign,
  TrendingUp,
  Users,
  UserMinus,
  Star,
}

const colorMap = {
  emerald: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  red: "bg-red-100 text-red-600",
}

export function MetricsCards() {
  const handleViewReport = (metricTitle: string) => {
    console.log("Viewing report for:", metricTitle)
    toast(`Viewing ${metricTitle} report`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10">
      {metricsData.map((metric) => {
        const IconComponent = iconMap[metric.icon as keyof typeof iconMap]
        const isNetPromoter = metric.title === "Net Promoter Score"

        return (
          <Card
            key={metric.id}
            className={cn(
              "relative overflow-hidden border-0 shadow-sm",
              isNetPromoter ? "md:col-span-2 lg:col-span-2 xl:col-span-1" : "",
            )}
          >
            <CardContent className="px-6 py-1">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2 rounded-lg", colorMap[metric.color as keyof typeof colorMap])}>
                  <IconComponent className="h-5 w-5" />
                </div>
                {metric.change && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      metric.changeType === "positive" ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    {metric.change}
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{metric.subtitle}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 p-1 h-auto font-medium cursor-pointer"
                  onClick={() => handleViewReport(metric.title)}
                >
                  View report →
                </Button>
              </div>

              <div
                className={cn(
                  "absolute bottom-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10",
                  metric.color === "emerald" && "bg-emerald-500",
                  metric.color === "blue" && "bg-blue-500",
                  metric.color === "red" && "bg-red-500",
                )}
              ></div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
