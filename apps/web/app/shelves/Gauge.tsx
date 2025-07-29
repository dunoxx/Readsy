import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  size?: number; // px
  strokeWidth?: number;
  className?: string;
}

export function Gauge({ value, size = 48, strokeWidth = 4, className = '' }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  return (
    <svg width={size} height={size} className={className}>
      <defs>
        <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f9dde" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#gauge-gradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,2,.6,1)' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize={size * 0.28}
        fill="#4f9dde"
        className="font-semibold select-none"
        style={{ letterSpacing: '-0.5px' }}
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
} 