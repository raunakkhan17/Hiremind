import React from 'react'

export interface CircularProgressProps {
  score: number | null | undefined
  size?: number
  strokeWidth?: number
  className?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 54,
  strokeWidth = 4.5,
  className = '',
}) => {
  if (score === null || score === undefined) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-full border border-dashed border-slate-700 bg-slate-900/60 text-slate-500 text-[10px] font-medium ${className}`}
        style={{ width: size, height: size }}
        title="Sign in with a profile to calculate match score"
      >
        <span>&mdash;</span>
      </div>
    )
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, score))
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference

  // Dynamic color selection based on match percentage
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-950/30' }
    if (s >= 60) return { stroke: '#6366f1', text: 'text-indigo-400', bg: 'bg-indigo-950/30' }
    return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-950/30' }
  }

  const { stroke, text, bg } = getColor(clampedScore)
  const isLarge = size >= 75

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${bg} ${className}`}
      style={{ width: size, height: size }}
      title={`${clampedScore}% Compatibility Match`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        style={{ width: size, height: size }}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Centered Percentage */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`${isLarge ? 'text-xl' : 'text-[11px]'} font-black tracking-tighter ${text}`}>
          {Math.round(clampedScore)}%
        </span>
        <span className={`${isLarge ? 'text-[10px]' : 'text-[7px]'} font-semibold uppercase tracking-wider text-slate-400 -mt-0.5`}>
          Match
        </span>
      </div>
    </div>
  )
}
