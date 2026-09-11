import React from 'react';
import { RenderingStatus } from './dataService';

interface DonutChartProps {
  data: RenderingStatus;
  size?: number;
  strokeWidth?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 200, strokeWidth = 30 }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.values.reduce((sum, val) => sum + val, 0);
  
  let cumulativePercentage = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size}>
          {data.values.map((value, index) => {
            const percentage = (value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={data.colors[index]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transformOrigin: `${center}px ${center}px` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold text-gray-900">
            {Math.floor(data.totalRendered / 1000)}K
          </div>
          <div className="text-xs text-gray-500">Total Rendered</div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;