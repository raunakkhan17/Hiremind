import React from 'react'
import { Inbox, LucideIcon } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) => {
  const ActionIcon = action?.icon

  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-soft">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {action && (
        <div className="mt-5">
          <Button
            size="sm"
            onClick={action.onClick}
            leftIcon={ActionIcon ? <ActionIcon className="h-4 w-4" /> : undefined}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
