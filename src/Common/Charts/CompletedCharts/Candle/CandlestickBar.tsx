/* eslint-disable @typescript-eslint/no-explicit-any */
// Custom shape to render candlestick body and wick
interface CandlestickBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: any;
  yAxis?: any;
}

export const CandlestickBar = (props: CandlestickBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload, yAxis } = props;

  if (!payload) return null;

  const o = Number(payload.open ?? 0);
  const h = Number(payload.high ?? 0);
  const l = Number(payload.low ?? 0);
  const c = Number(payload.close ?? 0);
  const fillColor = payload.fillColor || "#169E7B";

  let yOpen = 0;
  let yClose = 0;
  let yHigh = 0;
  let yLow = 0;

  if (yAxis && typeof yAxis.scale === "function") {
    const scale = yAxis.scale;
    yOpen = scale(o);
    yClose = scale(c);
    yHigh = scale(h);
    yLow = scale(l);
  } else {
    // Fallback: Linear interpolation using the provided y and height of the openClose bar
    const v_high = Math.max(o, c);
    const v_low = Math.min(o, c);
    const diff = v_high - v_low;

    if (diff > 0) {
      yOpen = o === v_high ? y : y + height;
      yClose = c === v_high ? y : y + height;
      yHigh = y + (v_high - h) * (height / diff);
      yLow = y + (v_high - l) * (height / diff);
    } else {
      yOpen = y;
      yClose = y;
      yHigh = y;
      yLow = y;
    }
  }

  const centerX = x + width / 2;

  return (
    <g>
      {/* Wick / Shadow */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={yLow}
        stroke={fillColor}
        strokeWidth={1.5}
      />
      {/* Real Candle Body */}
      <rect
        x={x}
        y={Math.min(yOpen, yClose)}
        width={width}
        height={Math.max(Math.abs(yOpen - yClose), 1)}
        fill={fillColor}
        stroke={fillColor}
      />
    </g>
  );
};

export default CandlestickBar;
