import React, { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, User } from 'lucide-react';
import { dataService, TrendingIndustry, ChartUsage, LoginData, BounceRateData, RenderingStatus } from '@/components/admin/analytics/dataService';
import AreaChart from '../../components/admin/analytics/AreaChart';
import DonutChart from '../../components/admin/analytics/DonutChart';
import BarChart from '../../components/admin/analytics/BarChart';

const AnalyticsDashboard: React.FC = () => {
  const [showLivesOnly, setShowLivesOnly] = useState(true);

  const [trendingData, setTrendingData] = useState<TrendingIndustry[]>([]);
  const [chartUsageData, setChartUsageData] = useState<{ chartUsages: ChartUsage[]; totalUsage: number }>({ chartUsages: [], totalUsage: 0 });
  const [loginData, setLoginData] = useState<LoginData>({ months: [], series: [] });
  const [bounceRateData, setBounceRateData] = useState<BounceRateData[]>([]);
  const [renderingStatus, setRenderingStatus] = useState<RenderingStatus>({ labels: [], values: [], colors: [], counts: [], totalRendered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          trendingIndustries,
          chartUsages,
          loginDataRes,
          bounceRateDataRes,
          renderingStatusRes
        ] = await Promise.all([
          dataService.getTrendingIndustries(),
          dataService.getChartUsages(),
          dataService.getLoginData(),
          dataService.getBounceRateData(),
          dataService.getRenderingStatus()
        ]);

        setTrendingData(trendingIndustries);
        setChartUsageData(chartUsages);
        setLoginData(loginDataRes);
        setBounceRateData(bounceRateDataRes);
        setRenderingStatus(renderingStatusRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'Deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Section - Trending Industries */}
        <div className="col-span-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Trending Industries</h2>
                <div className="relative">
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                    <span>Sort By</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="text-left pb-3">Employee Name</th>
                    <th className="text-left pb-3">Usage</th>
                    <th className="text-left pb-3">Monthly Comp.</th>
                    <th className="text-left pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="space-y-3">
                  {trendingData.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-900">{item.usage}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1">
                          {item.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.trend === 'up' ? '+' : ''}{item.monthlyComp}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section - Chart Usages */}
        <div className="col-span-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Chart Usages</h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                    <span>Industry</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                    <span>This Month</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Total usage {Math.floor(chartUsageData.totalUsage / 1000)}k</span>
                  <label className="flex items-center space-x-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={showLivesOnly}
                      onChange={(e) => setShowLivesOnly(e.target.checked)}
                      className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span>Usage Data</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                {chartUsageData.chartUsages.map((chart, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-24">{chart.name}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${chart.value}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{chart.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logins Over Time Chart */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Logins Over Time</h2>
                <button className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  <User className="w-4 h-4" />
                  <span>Select Multiple Company</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <AreaChart data={loginData} />
            </div>
          </div>
        </div>

        {/* Right Column - Rendering Status */}
        <div className="col-span-4 space-y-6">
          {/* Rendering Status */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Rendering Status</h2>
                <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  <span>Sort By</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="flex items-center space-x-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span>Show Live Only</span>
                </label>
              </div>
              <div className="flex justify-center mb-4">
                <DonutChart data={renderingStatus} />
              </div>
              <div className="space-y-2">
                {renderingStatus.labels.map((label, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: renderingStatus.colors[index] }}></div>
                      <span className="text-gray-600">{label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{Math.floor(renderingStatus.counts[index] / 1000)}k</div>
                      <div className="text-xs text-gray-500">{renderingStatus.values[index]}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Bounce Rate */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Bounce Rate</h2>
            </div>
            <div className="p-6">
              <BarChart data={bounceRateData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;