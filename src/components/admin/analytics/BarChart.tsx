import React from 'react';
import { BounceRateData } from './dataService';

interface BarChartProps {
  data: BounceRateData[];
  height?: number;
  width?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 200, width = 400 }) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const barWidth = (width - padding.left - padding.right) / data.length / 3;

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span className="text-gray-600">Engaged</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <span className="text-gray-600">Bounced</span>
        </div>
      </div>
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[0, 20, 40, 60, 80, 100].map((value, index) => (
            <g key={index}>
              <line
                x1={padding.left}
                y1={height - padding.bottom - (value / 100) * (height - padding.top - padding.bottom)}
                x2={width - padding.right}
                y2={height - padding.bottom - (value / 100) * (height - padding.top - padding.bottom)}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={height - padding.bottom - (value / 100) * (height - padding.top - padding.bottom) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontFamily="system-ui"
              >
                {value}%
              </text>
            </g>
          ))}
          
          {/* Bars */}
          {data.map((item, index) => {
            const x = padding.left + (index * (width - padding.left - padding.right)) / data.length;
            const engagedHeight = (item.engaged / 100) * (height - padding.top - padding.bottom);
            const bouncedHeight = (item.bounced / 100) * (height - padding.top - padding.bottom);
            
            return (
              <g key={index}>
                {/* Engaged bar */}
                <rect
                  x={x + 5}
                  y={height - padding.bottom - engagedHeight}
                  width={barWidth}
                  height={engagedHeight}
                  fill="#8B5CF6"
                  rx="2"
                />
                {/* Bounced bar */}
                <rect
                  x={x + barWidth + 10}
                  y={height - padding.bottom - bouncedHeight}
                  width={barWidth}
                  height={bouncedHeight}
                  fill="#D1D5DB"
                  rx="2"
                />
                {/* Month label */}
                <text
                  x={x + barWidth + 5}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="system-ui"
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default BarChart;