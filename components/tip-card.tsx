'use client'

import { Lightbulb } from 'lucide-react'
import type { WeeklyTip } from '@/lib/types'
import { HABIT_CONFIGS } from '@/lib/habits'

interface TipCardProps {
  tip: WeeklyTip
  className?: string
}

export function TipCard({ tip, className = '' }: TipCardProps) {
  const config = HABIT_CONFIGS[tip.habit]

  return (
    <div className={`p-4 rounded-2xl bg-accent/20 border border-accent/50 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Weekly tip for {config.label.toLowerCase()}
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {tip.tip}
          </p>
        </div>
      </div>
    </div>
  )
}
