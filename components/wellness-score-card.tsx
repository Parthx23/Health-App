'use client'

import type { WellnessScoreOutput, HabitKey } from '@/lib/types'
import { HABIT_CONFIGS, HABIT_KEYS } from '@/lib/habits'

interface WellnessScoreCardProps {
  scoreData: WellnessScoreOutput
  className?: string
}

export function WellnessScoreCard({ scoreData, className = '' }: WellnessScoreCardProps) {
  const { totalScore, habitScores, bestHabit, weakestHabit } = scoreData

  // Determine score color and message
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-primary'
    if (score >= 40) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent!'
    if (score >= 60) return 'Good progress'
    if (score >= 40) return 'Keep going'
    return 'Room to grow'
  }

  return (
    <div className={`p-4 rounded-xl bg-card border border-border ${className}`}>
      {/* Main score */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Today&apos;s Wellness</p>
          <p className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
            {totalScore}
            <span className="text-lg font-normal text-muted-foreground">/100</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getScoreMessage(totalScore)}
          </p>
        </div>

        {/* Circular progress */}
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(totalScore / 100) * 97.4} 97.4`}
              className={getScoreColor(totalScore)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${getScoreColor(totalScore)}`}>
              {totalScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Habit breakdown bars */}
      <div className="space-y-2">
        {HABIT_KEYS.map((key) => {
          const config = HABIT_CONFIGS[key]
          const score = habitScores[key] ?? 0
          const isBest = key === bestHabit
          const isWeakest = key === weakestHabit

          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs w-20 truncate text-muted-foreground">
                {config.label}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
              <span className="text-xs w-8 text-right text-muted-foreground">
                {score}%
              </span>
              {isBest && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success">
                  Best
                </span>
              )}
              {isWeakest && score < 100 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                  Focus
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
