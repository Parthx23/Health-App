'use client'

import { useMemo } from 'react'
import { redirect } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { AppShell } from '@/components/app-shell'
import { StreakCalendar } from '@/components/streak-calendar'
import { ForecastWarningCard } from '@/components/forecast-warning-card'
import { BenchmarkInsightCard } from '@/components/benchmark-insight-card'
import { TipCard } from '@/components/tip-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePreferences, useTargets, useLogsByDate } from '@/lib/store'
import { HABIT_KEYS, HABIT_CONFIGS } from '@/lib/habits'
import {
  calculateWellnessScore,
  generateBurnoutForecast,
  generateBenchmarkComparison,
  calculateStreak,
  getWeeklyTip,
  getTodayString,
} from '@/lib/scoring'

export default function InsightsPage() {
  const preferences = usePreferences()
  const targets = useTargets()
  const logsByDate = useLogsByDate()
  const today = getTodayString()

  if (!preferences.onboardingComplete) {
    redirect('/onboarding')
  }

  // Get last 7 days of data for the trend chart
  const weeklyTrendData = useMemo(() => {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }

    return dates.map((date) => {
      const log = logsByDate[date] ?? {}
      const hasData = Object.keys(log).length > 0
      const scoreData = calculateWellnessScore(log, targets)
      const dayName = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })

      return {
        date,
        day: dayName,
        score: hasData ? scoreData.totalScore : null,
      }
    })
  }, [logsByDate, targets])

  // Calculate streak data
  const streakData = useMemo(
    () => calculateStreak(logsByDate, targets, today),
    [logsByDate, targets, today]
  )

  // Calculate forecast
  const forecast = useMemo(() => {
    const recentDates = Object.keys(logsByDate).sort().slice(-7)
    const recentLogs = recentDates.map((date) => logsByDate[date] ?? {})
    return generateBurnoutForecast(recentLogs, targets)
  }, [logsByDate, targets])

  // Find best and weakest habits over the week
  const habitPerformance = useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {}
    HABIT_KEYS.forEach((key) => {
      totals[key] = { sum: 0, count: 0 }
    })

    const dates = Object.keys(logsByDate).sort().slice(-7)
    dates.forEach((date) => {
      const log = logsByDate[date] ?? {}
      HABIT_KEYS.forEach((key) => {
        if (log[key] !== undefined) {
          const completion = Math.min(log[key]! / targets[key], 1)
          totals[key].sum += completion
          totals[key].count++
        }
      })
    })

    const averages = HABIT_KEYS.map((key) => ({
      key,
      average: totals[key].count > 0 ? totals[key].sum / totals[key].count : 0,
    }))

    averages.sort((a, b) => b.average - a.average)
    const best = averages[0]
    const weakest = averages[averages.length - 1]

    return { best, weakest }
  }, [logsByDate, targets])

  // Get weekly tip based on weakest habit
  const weeklyTip = useMemo(
    () => getWeeklyTip(habitPerformance.weakest?.key ?? null),
    [habitPerformance.weakest?.key]
  )

  // Get benchmark comparisons for top habits
  const benchmarkComparisons = useMemo(() => {
    const todayLog = logsByDate[today] ?? {}
    return HABIT_KEYS.filter((key) => todayLog[key] !== undefined)
      .slice(0, 3)
      .map((key) => generateBenchmarkComparison(todayLog, key))
  }, [logsByDate, today])

  // Calculate weekly average
  const weeklyAverage = useMemo(() => {
    const scores = weeklyTrendData
      .filter((d) => d.score !== null)
      .map((d) => d.score as number)
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [weeklyTrendData])

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">
            Your wellness trends and patterns
          </p>
        </header>

        {/* Weekly Score Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weekly Score Trend</CardTitle>
              <span className="text-sm text-muted-foreground">
                Avg: <span className="font-semibold text-foreground">{weeklyAverage}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Streak Calendar */}
        <StreakCalendar streakData={streakData} />

        {/* Energy Forecast */}
        <section aria-label="Energy forecast">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Energy Forecast
          </h2>
          <ForecastWarningCard forecast={forecast} />
        </section>

        {/* Best and Weakest Habits */}
        <section className="grid grid-cols-2 gap-3">
          <Card className="bg-success/10 border-success/30">
            <CardContent className="pt-4">
              <p className="text-xs text-success mb-1">Strongest This Week</p>
              <p className="font-semibold text-foreground">
                {HABIT_CONFIGS[habitPerformance.best?.key ?? 'sleep'].label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((habitPerformance.best?.average ?? 0) * 100)}% completion
              </p>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="pt-4">
              <p className="text-xs text-warning mb-1">Needs Attention</p>
              <p className="font-semibold text-foreground">
                {HABIT_CONFIGS[habitPerformance.weakest?.key ?? 'sleep'].label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((habitPerformance.weakest?.average ?? 0) * 100)}% completion
              </p>
            </CardContent>
          </Card>
        </section>

        {/* India Benchmark Comparisons */}
        {benchmarkComparisons.length > 0 && (
          <section aria-label="India benchmarks">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              India Benchmarks
            </h2>
            <div className="space-y-2">
              {benchmarkComparisons.map((comparison) => (
                <BenchmarkInsightCard key={comparison.habit} comparison={comparison} />
              ))}
            </div>
          </section>
        )}

        {/* Weekly Tip */}
        <section aria-label="Weekly tip">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Weekly Tip
          </h2>
          <TipCard tip={weeklyTip} />
        </section>
      </div>
    </AppShell>
  )
}
