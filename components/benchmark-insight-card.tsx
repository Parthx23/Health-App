'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { BenchmarkComparison } from '@/lib/types'
import { HABIT_CONFIGS } from '@/lib/habits'

interface BenchmarkInsightCardProps {
  comparison: BenchmarkComparison
  className?: string
}

export function BenchmarkInsightCard({ comparison, className = '' }: BenchmarkInsightCardProps) {
  const { habit, comparison: comp, message } = comparison
  const config = HABIT_CONFIGS[habit]

  const icons = {
    above: TrendingUp,
    below: TrendingDown,
    equal: Minus,
  }

  const colors = {
    above: 'text-success bg-success/10',
    below: 'text-warning bg-warning/10',
    equal: 'text-muted-foreground bg-muted',
  }

  const Icon = icons[comp]

  return (
    <div className={`p-3 rounded-2xl bg-card/70 backdrop-blur-md border border-border/50 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${colors[comp]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{config.label}</p>
          <p className="text-sm text-foreground leading-snug">{message}</p>
        </div>
      </div>
    </div>
  )
}
