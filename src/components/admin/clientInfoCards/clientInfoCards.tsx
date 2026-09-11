import { Card, CardContent } from "@/components/ui/card"
import { Metrics } from "@/types/metrics"
import { AlertTriangle, HardDrive, TrendingUp, Users } from "lucide-react"

interface MetricsProps {
    metrics: Metrics
}
const ClientInfoCards:React.FC<MetricsProps> = ({metrics}) => {
    return (
        <div className="grid grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-200 h-44">
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Total User</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {metrics.totalUsers.current}/{metrics.totalUsers.total}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-700">{metrics.totalUsers.percentage}% of capacity used</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="border border-gray-200 h-44">
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Active Program</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.activePrograms.current}</p>
                        </div>
                    </div>
                    <div className="mt-8 bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                            {metrics.activePrograms.newThisMonth} new Program in this month
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-200 h-44">
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.criticalAlerts.current}</p>
                        </div>
                    </div>
                    <div className="mt-8 bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                            {metrics.criticalAlerts.newIn24Hours} new alerts in the last 24 hours
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-200 h-44">
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <HardDrive className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Storage Usage</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {metrics.storageUsage.current}/{metrics.storageUsage.total}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 bg-red-50 rounded-lg p-3">
                        <p className="text-sm text-red-700">{metrics.storageUsage.percentage}% of storage used</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ClientInfoCards