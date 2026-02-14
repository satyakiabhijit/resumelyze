"use client";

import { getScoreStroke } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: number;
}

export default function ScoreCircle({ score, size = 120 }: ScoreCircleProps) {
  const strokeColor = getScoreStroke(score);
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="3"
        />
        {/* Score arc */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${score}, 100`}
          className="score-circle"
          style={{
            filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
          }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-3xl font-bold"
          style={{ color: strokeColor }}
        >
          {score}
          <span className="text-lg">%</span>
        </span>
      </div>
    </div>
  );
}
