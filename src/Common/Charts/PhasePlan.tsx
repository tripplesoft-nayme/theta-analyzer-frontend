import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

interface Phase {
  id: number;
  name: string;
  startQuarter: number;
  startYear: number;
  duration: number;
  completion: number;
  color: string;
  lightColor: string;
}

const PhasePlan = () => {
  const [phases, _setPhases] = useState<Phase[]>([
    {
      id: 1,
      name: "Planning",
      startQuarter: 1,
      startYear: 2024,
      duration: 4,
      completion: 60,
      color: "#5B8DEE",
      lightColor: "#C5D7F5",
    },
    {
      id: 2,
      name: "Plinth Beam",
      startQuarter: 2,
      startYear: 2024,
      duration: 2,
      completion: 60,
      color: "#FF8C42",
      lightColor: "#FFD4B8",
    },
    {
      id: 3,
      name: "1st Floor Slab",
      startQuarter: 3,
      startYear: 2024,
      duration: 4,
      completion: 60,
      color: "#D946A6",
      lightColor: "#F5C7E6",
    },
    {
      id: 4,
      name: "2nd Floor Slab",
      startQuarter: 4,
      startYear: 2024,
      duration: 4,
      completion: 60,
      color: "#2D9B9B",
      lightColor: "#B8E0E0",
    },
    {
      id: 5,
      name: "3rd Floor Slab",
      startQuarter: 2,
      startYear: 2025,
      duration: 4,
      completion: 60,
      color: "#F5A623",
      lightColor: "#FFE8B8",
    },
    {
      id: 6,
      name: "Terrace Floor Slab",
      startQuarter: 3,
      startYear: 2024,
      duration: 6,
      completion: 60,
      color: "#E74C3C",
      lightColor: "#F5C6C0",
    },
  ]);

  const years = [2024, 2025, 2026];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const totalQuarters = years.length * 4;

  const getQuarterIndex = (year: number, quarter: number): number => {
    return (year - 2024) * 4 + (quarter - 1);
  };

  const calculateBarStyle = (phase: Phase) => {
    const startIndex = getQuarterIndex(
      phase.startYear,
      phase.startQuarter
    );
    const leftPercent = (startIndex / totalQuarters) * 100;
    const widthPercent = (phase.duration / totalQuarters) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  return (
    <div className="w-full bg-white p-8 border border-gray-200 rounded-lg">
      <div className="">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Phase Plan
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600">
              Total Phase {phases.length}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={18} className="text-gray-600" />
              <span className="text-sm text-gray-700">Filter By</span>
              <ChevronDown size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Year and Quarter Headers */}
          <div className="bg-gray-50">
            {/* Year Headers */}
            <div className="flex border-b border-gray-200">
              {years.map((year, idx) => (
                <div
                  key={year}
                  className={`flex-1 px-4 py-3 text-left font-medium text-gray-700 ${idx < years.length - 1
                      ? "border-r border-gray-200"
                      : ""
                    }`}
                >
                  {year}
                </div>
              ))}
            </div>

            {/* Quarter Headers */}
            <div className="flex border-b border-gray-200">
              {years.map((year, yearIdx) => (
                <div
                  key={year}
                  className={`flex-1 flex ${yearIdx < years.length - 1
                      ? "border-r border-gray-200"
                      : ""
                    }`}
                >
                  {quarters.map((quarter, qIdx) => (
                    <div
                      key={`${year}-${quarter}`}
                      className={`flex-1 px-2 py-2 text-center text-sm text-gray-600 ${qIdx < quarters.length - 1
                          ? "border-r border-gray-200"
                          : ""
                        }`}
                    >
                      {quarter}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Phase Bars Container */}
          <div
            className="relative bg-white"
            style={{ minHeight: "400px" }}
          >
            <div className="absolute inset-0 flex">
              {/* Quarter Grid Lines */}
              {Array.from({ length: totalQuarters }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 border-r border-border last:border-r-0"
                ></div>
              ))}
            </div>

            {/* Phase Bars */}
            <div className="relative py-6 px-4">
              {phases.map((phase, _index) => {
                const barStyle = calculateBarStyle(phase);
                return (
                  <div
                    key={phase.id}
                    className="relative mb-6 last:mb-0"
                  >
                    <div className="relative h-10">
                      {/* Phase Bar Background */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-7 rounded-full overflow-hidden"
                        style={barStyle}
                      >
                        {/* Light background */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: phase.lightColor,
                          }}
                        ></div>

                        {/* Completion overlay */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${phase.completion}%`,
                            backgroundColor: phase.color,
                          }}
                        ></div>
                      </div>

                      {/* Phase Label */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 flex items-center text-sm text-gray-700 font-medium whitespace-nowrap"
                        style={{
                          left: `calc(${barStyle.left} + ${barStyle.width} + 16px)`,
                        }}
                      >
                        {phase.name} {phase.completion}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhasePlan;
