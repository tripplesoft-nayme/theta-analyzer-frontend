import trendingIndustriesData from '../../../lib/trendingIndustries.json';
import chartUsagesData from '../../../lib/chartUsages.json';
import loginData from '../../../lib/loginData.json';
import bounceRateData from '../../../lib/bounceRateData.json';
import renderingStatusData from '../../../lib/renderingStatus.json';

export interface TrendingIndustry {
  id: number;
  icon: string;
  name: string;
  usage: number;
  monthlyComp: number;
  trend: string,
  status: string;
}

export interface ChartUsage {
  name: string;
  value: number;
  color: string;
}

export interface LoginSeries {
  name: string;
  data: number[];
  color: string;
}

export interface LoginData {
  months: string[];
  series: LoginSeries[];
}

export interface BounceRateData {
  month: string;
  engaged: number;
  bounced: number;
}

export interface RenderingStatus {
  labels: string[];
  values: number[];
  colors: string[];
  counts: number[];
  totalRendered: number;
}

export const dataService = {
  // Simulate API calls - in real app, these would be actual API calls
  getTrendingIndustries: async (): Promise<TrendingIndustry[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return trendingIndustriesData.trendingIndustries;
  },

  getChartUsages: async (): Promise<{ chartUsages: ChartUsage[]; totalUsage: number }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return chartUsagesData;
  },

  getLoginData: async (): Promise<LoginData> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return loginData.loginData;
  },

  getBounceRateData: async (): Promise<BounceRateData[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return bounceRateData.bounceRateData;
  },

  getRenderingStatus: async (): Promise<RenderingStatus> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return renderingStatusData.renderingStatus;
  },

  // Filter functions for future use
  filterTrendingIndustries: async (industry: string, sortBy: string): Promise<TrendingIndustry[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let data = [...trendingIndustriesData.trendingIndustries];
    
    if (industry !== 'Industry') {
      data = data.filter(item => item.name === industry);
    }
    
    if (sortBy === 'Usage') {
      data.sort((a, b) => b.usage - a.usage);
    } else if (sortBy === 'Monthly Comp.') {
      data.sort((a, b) => b.monthlyComp - a.monthlyComp);
    }
    
    return data;
  }
};