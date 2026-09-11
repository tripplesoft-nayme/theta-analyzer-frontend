/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

// Generic Type for Tier - adapt fields as necessary matching your common Charts
export type TierChart = {
  id: string;
  name: string;
  // Specific charts might have more fields, but these are the base for navigation
  xAxisValues?: any[]; 
  legendValues?: any[];
  children?: TierChart[];
  [key: string]: any;
};

export const useChartTiers = (
  chartId: string, 
  widgetTitle: string, 
  xAxisValues: any[]
) => {
  const [childTiers, setChildTiers] = useState<TierChart[]>([]);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);

  const handleAddTier = (tierName: string) => {
    setChildTiers((prev) => [
      ...prev,
      {
        id: `${chartId}-tier-${Date.now()}`,
        name: tierName,
        xAxisValues: xAxisValues, // Inherit X-Axis usually?
        children: [],
      },
    ]);
    setShowAddTierModal(false);
  };

  const openTierModal = () => {
    if (childTiers.length > 0) {
      setShowChildrenModal(true);
    }
  };

  return {
    widgetTitle,
    childTiers,
    setChildTiers,
    showAddTierModal,
    setShowAddTierModal,
    showChildrenModal,
    setShowChildrenModal,
    handleAddTier,
    openTierModal,
  };
};
