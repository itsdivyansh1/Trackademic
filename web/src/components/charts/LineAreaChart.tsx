"use client";

import * as React from "react";
import { motion } from "motion/react";

function buildPath(points: number[], width: number, height: number) {
  if (!points.length) return "";
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const stepX = width / (points.length - 1);
  const y = (v: number) => height - ((v - min) / range) * height;

  let d = `M 0 ${y(points[0])}`;
  for (let i = 1; i < points.length; i++) {
    const px = (i - 1) * stepX;
    const py = y(points[i - 1]);
    const x = i * stepX;
    const cy = y(points[i]);
    const cx = (px + x) / 2; // simple curve
    d += ` C ${cx} ${py}, ${cx} ${cy}, ${x} ${cy}`;
  }
  return d;
}

export type LineAreaChartProps = {
  data: number[];
  height?: number;
  className?: string;
  color?: string; // tailwind color class e.g. fill-emerald-200 stroke-emerald-500
};

export function LineAreaChart({ data, height = 140, className, color = "stroke-emerald-500" }: LineAreaChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(600);

  React.useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (ref.current) setWidth(ref.current.clientWidth);
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const path = React.useMemo(() => buildPath(data, width, height), [data, width, height]);

  return (
    <div ref={ref} className={className}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Area fill */}
        <motion.path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          className={`fill-emerald-500/10`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {/* Line */}
        <motion.path
          d={path}
          className={`${color} stroke-[2.5]`}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}