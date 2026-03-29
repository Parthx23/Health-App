'use client'

import { useState, useMemo } from 'react'
import { redirect } from 'next/navigation'
import { X, Droplets, Moon, Activity, Apple, Eye, Heart } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { MonthlyHeatmap } from '@/components/monthly-heatmap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { usePreferences, useTargets, useLogsByDate } from '@/lib/store'
import { HABIT_KEYS, HABIT_CONFIGS } from '@/lib/habits'
import {
  calculateWellnessScore,
  formatDate,
  getCurrentMonthDates,
} from '@/lib/scoring'
import type { DailyLog, HabitKey } from '@/lib/types'

const ICONS: Record<HabitKey, React.ElementType> = {
  hydration: Droplets,
  sleep: Moon,
  activity: Activity,
  meals: Apple,
  screenBreaks: Eye,
  stressRelief: Heart,
}

export default function MonthlyPage() {
  const preferences = usePreferences()
  const targets = useTargets()
  const logsByDate = useLogsByDate()
  const [selectedDay, setSelectedDay] = useState<{
    date: string
    log: DailyLog
  } | null>(null)

  if (!preferences.onboardingComplete) {
    redirect('/onboarding')
  }

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const monthDates = getCurrentMonthDates()
    const today = new Date().toISOString().split('T')[0]
    
    let totalScore = 0
    let daysLogged = 0
    let perfectDays = 0
    const habitTotals: Record<HabitKey, { sum: number; count: number }> = {} as any

    HABIT_KEYS.forEach((key) => {
      habitTotals[key] = { sum: 0, count: 0 }
    })

    monthDates.forEach((date) => {
      if (date > today) return
      
      const log = logsByDate[date]
      if (!log || Object.keys(log).length === 0) return

      daysLogged++
      const scoreData = calculateWellnessScore(log, targets)
      totalScore += scoreData.totalScore

      if (scoreData.totalScore >= 80) {
        perfectDays++
      }

      HABIT_KEYS.forEach((key) => {
        if (log[key] !== undefined) {
          habitTotals[key].sum += log[key]!
          habitTotals[key].count++
        }
      })
    })

    const habitAverages = HABIT_KEYS.map((key) => ({
      key,
      average: habitTotals[key].count > 0
        ? Math.round((habitTotals[key].sum / habitTotals[key].count) * 10) / 10
        : 0,
      target: targets[key],
    }))

    return {
      averageScore: daysLogged > 0 ? Math.round(totalScore / daysLogged) : 0,
      daysLogged,
      perfectDays,
      habitAverages,
    }
  }, [logsByDate, targets])

  const handleDayClick = (date: string, log: DailyLog) => {
    setSelectedDay({ date, log })
  }

  // Calculate score for selected day
  const selectedDayScore = useMemo(() => {
    if (!selectedDay) return null
    return calculateWellnessScore(selectedDay.log, targets)
  }, [selectedDay, targets])

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold text-foreground">Monthly View</h1>
          <p className="text-sm text-muted-foreground">
            Your wellness history for this month
          </p>
        </header>

        {/* Monthly Heatmap */}
        <MonthlyHeatmap
          logsByDate={logsByDate}
          targets={targets}
          onDayClick={handleDayClick}
        />

        {/* Monthly Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {monthlyStats.averageScore}
              </p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {monthlyStats.daysLogged}
              </p>
              <p className="text-xs text-muted-foreground">Days Logged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-success">
                {monthlyStats.perfectDays}
              </p>
              <p className="text-xs text-muted-foreground">Great Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Habit Averages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Habit Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monthlyStats.habitAverages.map(({ key, average, target }) => {
              const config = HABIT_CONFIGS[key]
              const Icon = ICONS[key]
              const completion = Math.min(average / target, 1)

              return (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {average} / {target} {config.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${completion * 100}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Day Detail Drawer */}
        <Drawer
          open={selectedDay !== null}
          onOpenChange={(open) => !open && setSelectedDay(null)}
        >
          <DrawerContent>
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle>
                {selectedDay ? formatDate(selectedDay.date) : ''}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>
            
            {selectedDay && selectedDayScore && (
              <div className="px-4 pb-8 space-y-4">
                {/* Day Score */}
                <div className="flex items-center justify-center py-4">
                  <div className="relative">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(selectedDayScore.totalScore / 100) * 283} 283`}
                        className="text-primary -rotate-90 origin-center"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">
                        {selectedDayScore.totalScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Habit Details */}
                <div className="space-y-2">
                  {HABIT_KEYS.map((key) => {
                    const config = HABIT_CONFIGS[key]
                    const Icon = ICONS[key]
                    const value = selectedDay.log[key] ?? 0
                    const target = targets[key]
                    const completion = Math.min(value / target, 1)

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {config.label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {value} / {target}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(completion * 100)}%
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </AppShell>
  )
}
