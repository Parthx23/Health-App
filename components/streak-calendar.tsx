'use client'

import type { StreakData } from '@/lib/types'
import { formatDate } from '@/lib/scoring'
import { Flame } from 'lucide-react'

interface StreakCalendarProps {
  streakData: StreakData
  className?: string
}

export function StreakCalendar({ streakData, className = '' }: StreakCalendarProps) {
  const { currentStreak, longestStreak, lastSevenDays } = streakData

  return (
    <div className={`p-4 rounded-xl bg-card border border-border ${className}`}>
      {/* Streak summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-warning" />
          <div>
            <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-sm text-muted-foreground ml-1">day streak</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Best: {longestStreak} days</p>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {lastSevenDays.map((day, index) => {
          const date = new Date(day.date)
          const dayName = date.toLocaleDateString('en-IN', { weekday: 'narrow' })
          const isToday = index === lastSevenDays.length - 1

          return (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase">
                {dayName}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  day.completed
                    ? 'bg-success text-success-foreground'
                    : day.score > 0
                    ? 'bg-warning/30 text-warning'
                    : 'bg-muted text-muted-foreground'
                } ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                title={`${formatDate(day.date)}: Score ${day.score}`}
              >
                {day.score > 0 ? day.score : '-'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-success" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-warning/30" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-muted" /> No data
        </span>
      </div>
    </div>
  )
}
