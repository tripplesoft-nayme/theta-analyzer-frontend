/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useGetChartByIdQuery } from "@/store/Api/ChartApi/ChartApi";

const useChartData = ({
  newData,
  chartId,
}: {
  newData?: any[];
  isCreationMode?: boolean;
  chartId?: string;
  xAxisValues?: string[];
  legendValues?: { label: string; color: string }[];
  numOfLegendDataSet?: number;
  startingRange?: number;
  endingRange?: number;
}) => {
  const { data: apiData, isLoading } = useGetChartByIdQuery(chartId, { skip: !chartId || !!newData });

  const childTiers = useMemo(() => {
    // Priority: 1. Pre-fetched snapshot data (newData)
    if (newData && newData.length > 0) return newData;

    // Priority: 2. API fetched data (from chartId)
    if (apiData?.data) {
        // Handle case where children are directly under 'data' or in 'data.children'
        return apiData.data.children || apiData.data || [];
    }

    return [];
  }, [newData, apiData]);

  return {
    childTiers,
    isLoading,
  };
};

export default useChartData;
