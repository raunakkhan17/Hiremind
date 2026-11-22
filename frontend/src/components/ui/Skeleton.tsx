import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-800/80 ${variantStyles[variant]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton variant="text" className="w-1/3 h-5" />
      <Skeleton variant="rectangular" className="w-16 h-6 rounded-full" />
    </div>
    <div className="flex gap-4">
      <Skeleton variant="text" className="w-1/4 h-3.5" />
      <Skeleton variant="text" className="w-1/4 h-3.5" />
    </div>
    <Skeleton variant="text" className="w-full h-10" />
    <div className="flex gap-2 pt-2">
      <Skeleton variant="rectangular" className="w-16 h-5 rounded" />
      <Skeleton variant="rectangular" className="w-20 h-5 rounded" />
      <Skeleton variant="rectangular" className="w-16 h-5 rounded" />
    </div>
  </div>
)
