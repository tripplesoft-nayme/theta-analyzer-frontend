import React, { useRef, useState, useEffect } from 'react';
import { LoginData } from './dataService';

interface AreaChartProps {
  data: LoginData;
  height?: number;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, height = 350 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(800); // Initial fallback width

  // Responsive: observe container width
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width) {
          setWidth(entry.contentRect.width);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const maxValue = Math.max(...data.series.flatMap(s => s.data));
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };

  const xScale = (index: number) =>
    (index / (data.months.length - 1)) * (width - padding.left - padding.right) + padding.left;

  const yScale = (value: number) =>
    height - padding.bottom - (value / maxValue) * (height - padding.top - padding.bottom);

  const createPath = (points: number[]) => {
    let path = `M ${xScale(0)} ${yScale(points[0])}`;
    for (let i = 1; i < points.length; i++) {
      const x = xScale(i);
      const y = yScale(points[i]);
      const prevX = xScale(i - 1);
      const prevY = yScale(points[i - 1]);
      const cpX1 = prevX + (x - prevX) / 3;
      const cpX2 = x - (x - prevX) / 3;
      path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
    }
    return path;
  };

  const createAreaPath = (points: number[]) => {
    const linePath = createPath(points);
    const bottomY = yScale(0);
    return `${linePath} L ${xScale(points.length - 1)} ${bottomY} L ${xScale(0)} ${bottomY} Z`;
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Legend */}
      <div className="flex items-center space-x-4 mb-4 text-xs">
        {data.series.map((series, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: series.color }}
            ></div>
            <span className="text-gray-600">{series.name}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 250, 500, 750, 1000, 1250, 1500, 1750].map((value, index) => (
            <g key={index}>
              <line
                x1={padding.left}
                y1={yScale(value)}
                x2={width - padding.right}
                y2={yScale(value)}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 15}
                y={yScale(value) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
                fontFamily="system-ui"
              >
                {value}
              </text>
            </g>
          ))}

          {/* Area Fills */}
          {data.series.map((series, index) => (
            <path
              key={`area-${index}`}
              d={createAreaPath(series.data)}
              fill={series.color}
              fillOpacity="0.15"
            />
          ))}

          {/* Lines */}
          {data.series.map((series, index) => (
            <path
              key={`line-${index}`}
              d={createPath(series.data)}
              fill="none"
              stroke={series.color}
              strokeWidth="2.5"
            />
          ))}

          {/* X-axis Labels */}
          {data.months.map((month, index) => (
            <text
              key={index}
              x={xScale(index)}
              y={height - 20}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
              fontFamily="system-ui"
            >
              {month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default AreaChart;
