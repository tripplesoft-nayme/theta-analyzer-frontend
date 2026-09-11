import React, { useState, useEffect } from "react";
import {
  List,
  LayoutGrid,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import GanttTab from "../../components/AllDataTab/GanttTab";
import SheetTab from "../../components/AllDataTab/SheetTab";
import FileTab from "../../components/AllDataTab/FileTab";
import RaidLogTab from "../../components/AllDataTab/RaidLogTab";
import DashboardTab from "../../components/AllDataTab/DashboardTab";

const ViewerPanelCarlyleHall: React.FC = () => {
  // Check localStorage for last active tab, default to 'gantt'
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("activeCarlyleTab") || "gantt";
  });

  const tabs = [
    { id: "gantt", name: "Gantt", icon: List },
    { id: "sheet", name: "Sheet", icon: LayoutGrid },
    { id: "dashboard", name: "Dashboard", icon: Clock },
    { id: "files", name: "Files", icon: FileText },
    { id: "raidlog", name: "Raid Log", icon: AlertTriangle },
  ];

  // Save selected tab in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeCarlyleTab", activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs Navigation */}
      <div className="border-gray-200 bg-white px-6 mb-6">
        <div className="flex items-center justify-center gap-1">
          <div className="flex border border-gray-200 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors rounded-lg cursor-pointer ${
                    activeTab === tab.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "sheet" && <SheetTab />}
        {activeTab === "gantt" && <GanttTab />}
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "files" && <FileTab />}
        {activeTab === "raidlog" && <RaidLogTab />}
      </div>
    </div>
  );
};

export default ViewerPanelCarlyleHall;
