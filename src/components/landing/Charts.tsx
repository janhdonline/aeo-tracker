"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  id: string;
  className?: string;
  strokeWidth?: number;
  children?: ReactNode;
}

export function CircularProgress({
  value,
  id,
  className = "h-24 w-24",
  strokeWidth = 8,
  children,
}: CircularProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const prefersReducedMotion = useReducedMotion();
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;
  const initialOffset = prefersReducedMotion ? offset : circumference;
  const animatedOffset = inView || prefersReducedMotion ? offset : circumference;

  return (
    <div
      ref={ref}
      className={`relative shrink-0 ${className}`}
      role="img"
      aria-label={`${value} out of 100`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: initialOffset }}
          animate={{ strokeDashoffset: animatedOffset }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.25,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  heightClassName?: string;
}

export function ProgressBar({
  value,
  className = "",
  barClassName = "bg-emerald-500",
  heightClassName = "h-2",
}: ProgressBarProps) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-gray-100 ${heightClassName} ${className}`}>
      <div
        className={`h-full rounded-full ${barClassName} transition-[width] duration-700`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

interface SparklineProps {
  values: number[];
  className?: string;
  color?: string;
  fillColor?: string;
}

export function Sparkline({
  values,
  className = "h-8 w-24",
  color = "#10B981",
  fillColor = "rgba(16,185,129,0.10)",
}: SparklineProps) {
  const width = 96;
  const height = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * width,
    y: height - 3 - ((value - min) / range) * (height - 6),
  }));

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path d={area} fill={fillColor} />
      <path d={line} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Series {
  label: string;
  color: string;
  values: number[];
}

interface DailyTrendsChartProps {
  series: Series[];
  labels?: string[];
  ariaLabel?: string;
}

function makeSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return "";

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export function DailyTrendsChart({
  series,
  labels,
  ariaLabel = "Daily trends showing AEO score, AI mention rate, and brand sentiment over the last seven days",
}: DailyTrendsChartProps) {
  const width = 640;
  const height = 226;
  const left = 38;
  const right = 624;
  const top = 18;
  const bottom = 182;
  const chartLabels = labels && labels.length > 0 ? labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const yTicks = [100, 75, 50, 25, 0];
  const prefersReducedMotion = useReducedMotion();

  const xFor = (index: number, length: number) =>
    left + (index / Math.max(length - 1, 1)) * (right - left);
  const yFor = (value: number) => bottom - (value / 100) * (bottom - top);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="daily-trends-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={left}
            x2={right}
            y1={yFor(tick)}
            y2={yFor(tick)}
            stroke="#F3F4F6"
            strokeDasharray="3 4"
          />
          <text
            x={left - 10}
            y={yFor(tick) + 3}
            textAnchor="end"
            fontSize="9.5"
            fill="#9CA3AF"
          >
            {tick}
          </text>
        </g>
      ))}

      {chartLabels.map((label, index) => (
        <text
          key={`${label}-${index}`}
          x={xFor(index, chartLabels.length)}
          y={height - 18}
          textAnchor="middle"
          fontSize="9.5"
          fill="#9CA3AF"
        >
          {label}
        </text>
      ))}

      {series.map((item, seriesIndex) => {
        const points = item.values.map((value, index) => ({
          x: xFor(index, item.values.length),
          y: yFor(value),
        }));
        const path = makeSmoothPath(points);
        const last = points[points.length - 1];

        return (
          <g key={item.label}>
            {seriesIndex === 0 && (
              <motion.path
                d={`${path} L ${last.x} ${bottom} L ${points[0].x} ${bottom} Z`}
                fill="url(#daily-trends-fill)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
              />
            )}
            <motion.path
              d={path}
              fill="none"
              stroke={item.color}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: prefersReducedMotion ? 1 : 0, opacity: 0.5 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                pathLength: { duration: prefersReducedMotion ? 0 : 1.1, ease: "easeOut", delay: seriesIndex * 0.08 },
                opacity: { duration: 0.3 },
              }}
            />
            <motion.circle
              cx={last.x}
              cy={last.y}
              r="3.25"
              fill="#FFFFFF"
              stroke={item.color}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.9 + seriesIndex * 0.08 }}
            />
          </g>
        );
      })}
    </svg>
  );
}
