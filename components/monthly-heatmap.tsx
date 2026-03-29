'use client'

import { useMemo } from 'react'
import type { LogsByDate, HabitTargets, DailyLog } from '@/lib/types'
import { calculateWellnessScore, getCurrentMonthDates, formatDate } from '@/lib/scoring'

interface MonthlyHeatmapProps {
  logsByDate: LogsByDate
  targets: HabitTargets
  onDayClick?: (date: string, log: DailyLog) => void
  className?: string
}

export function MonthlyHeatmap({
  logsByDate,
  targets,
  onDayClick,
  className = '',
}: MonthlyHeatmapProps) {
  const monthDates = useMemo(() => getCurrentMonthDates(), [])
  const today = new Date().toISOString().split('T')[0]

  // Get current month info
  const currentMonth = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  // Calculate first day offset for proper calendar alignment
  const firstDate = new Date(monthDates[0])
  const firstDayOffset = firstDate.getDay()

  // Calculate scores for each day
  const dayScores = useMemo(() => {
    return monthDates.map((date) => {
      const log = logsByDate[date] ?? {}
      const hasData = Object.keys(log).length > 0
      const score = hasData ? calculateWellnessScore(log, targets).totalScore : null
      return { date, score, hasData, log }
    })
  }, [monthDates, logsByDate, targets])

  // Get color for score
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted'
    if (score >= 80) return 'bg-success'
    if (score >= 60) return 'bg-success/60'
    if (score >= 40) return 'bg-warning/60'
    if (score >= 20) return 'bg-warning/40'
    return 'bg-destructive/40'
  }

  // Calculate monthly average
  const monthlyAverage = useMemo(() => {
    const scoresWithData = dayScores.filter((d) => d.score !== null)
    if (scoresWithData.length === 0) return 0
    const sum = scoresWithData.reduce((acc, d) => acc + (d.score ?? 0), 0)
    return Math.round(sum / scoresWithData.length)
  }, [dayScores])

  const daysLogged = dayScores.filter((d) => d.hasData).length

  return (
    <div className={`p-4 rounded-2xl bg-card/70 backdrop-blur-md border border-border/50 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{currentMonth}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Avg: <span className="font-medium text-foreground">{monthlyAverage}</span></span>
          <span>Days: <span className="font-medium text-foreground">{daysLogged}</span></span>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="h-6 flex items-center justify-center text-[10px] text-muted-foreground font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {dayScores.map(({ date, score, hasData, log }) => {
          const dayNum = new Date(date).getDate()
          const isToday = date === today
          const isFuture = date > today

          return (
            <button
              key={date}
              onClick={() => hasData && onDayClick?.(date, log)}
              disabled={isFuture || !hasData}
              className={`
                aspect-square rounded-md flex items-center justify-center text-xs font-medium
                transition-all
                ${getScoreColor(isFuture ? null : score)}
                ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}
                ${hasData && !isFuture ? 'cursor-pointer hover:ring-1 hover:ring-foreground/20' : ''}
                ${score !== null && score >= 60 ? 'text-success-foreground' : 'text-foreground'}
              `}
              title={hasData ? `${formatDate(date)}: Score ${score}` : formatDate(date)}
              aria-label={`${formatDate(date)}${hasData ? `, score ${score}` : ''}`}
            >
              {dayNum}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1 mt-4">
        <span className="text-[10px] text-muted-foreground mr-1">Score:</span>
        <span className="w-4 h-4 rounded bg-muted" title="No data" />
        <span className="w-4 h-4 rounded bg-destructive/40" title="0-20" />
        <span className="w-4 h-4 rounded bg-warning/40" title="20-40" />
        <span className="w-4 h-4 rounded bg-warning/60" title="40-60" />
        <span className="w-4 h-4 rounded bg-success/60" title="60-80" />
        <span className="w-4 h-4 rounded bg-success" title="80-100" />
      </div>
    </div>
  )
}
