'use client'

import { useMemo } from 'react'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { LivingGarden } from '@/components/living-garden'
import { AvatarMoodCard } from '@/components/avatar-mood-card'
import { OrbitHabitInput } from '@/components/orbit-habit-input'
import { WellnessScoreCard } from '@/components/wellness-score-card'
import { ForecastWarningCard } from '@/components/forecast-warning-card'
import { BenchmarkInsightCard } from '@/components/benchmark-insight-card'
import { StreakCalendar } from '@/components/streak-calendar'
import {
  usePreferences,
  useTargets,
  useLogsByDate,
  useTodayLog,
  incrementHabit,
} from '@/lib/store'
import { HABIT_KEYS, HABIT_CONFIGS } from '@/lib/habits'
import {
  calculateWellnessScore,
  calculateGardenState,
  getAvatarMood,
  generateBurnoutForecast,
  generateBenchmarkComparison,
  calculateStreak,
  getGreeting,
  getTodayString,
} from '@/lib/scoring'
import type { HabitKey } from '@/lib/types'

export default function HomePage() {
  const preferences = usePreferences()
  const targets = useTargets()
  const logsByDate = useLogsByDate()
  const todayLog = useTodayLog()
  const today = getTodayString()

  // Redirect to onboarding if not complete
  if (!preferences.onboardingComplete) {
    redirect('/onboarding')
  }

  // Calculate all derived data
  const scoreData = useMemo(
    () => calculateWellnessScore(todayLog, targets),
    [todayLog, targets]
  )

  const gardenState = useMemo(
    () => calculateGardenState(todayLog, targets),
    [todayLog, targets]
  )

  const avatarMood = useMemo(
    () => getAvatarMood(scoreData.totalScore, gardenState),
    [scoreData.totalScore, gardenState]
  )

  const forecast = useMemo(() => {
    const recentDates = Object.keys(logsByDate)
      .sort()
      .slice(-7)
    const recentLogs = recentDates.map((date) => logsByDate[date] ?? {})
    return generateBurnoutForecast(recentLogs, targets)
  }, [logsByDate, targets])

  const streakData = useMemo(
    () => calculateStreak(logsByDate, targets, today),
    [logsByDate, targets, today]
  )

  // Get a random benchmark comparison for display
  const benchmarkComparison = useMemo(() => {
    const habitsWithData = HABIT_KEYS.filter((key) => todayLog[key] !== undefined)
    if (habitsWithData.length === 0) return null
    const randomHabit = habitsWithData[Math.floor(Math.random() * habitsWithData.length)]
    return generateBenchmarkComparison(todayLog, randomHabit)
  }, [todayLog])

  const greeting = getGreeting()

  const handleHabitChange = (habit: HabitKey, value: number) => {
    const currentValue = todayLog[habit] ?? 0
    const diff = value - currentValue
    incrementHabit(today, habit, diff)
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Living Garden Header */}
        <section aria-label="Living garden visualization">
          <LivingGarden
            gardenState={gardenState}
            theme={preferences.gardenTheme}
          />
        </section>

        {/* Greeting and Avatar */}
        <section className="space-y-3">
          <h1 className="text-xl font-semibold text-foreground">
            {greeting}! <span className="text-muted-foreground font-normal">How are you today?</span>
          </h1>
          <AvatarMoodCard
            config={preferences.avatarConfig}
            mood={avatarMood}
            score={scoreData.totalScore}
          />
        </section>

        {/* Orbit Habit Logging */}
        <section aria-label="Log your habits">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Tap or drag to log today&apos;s progress
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {HABIT_KEYS.map((habit) => (
              <OrbitHabitInput
                key={habit}
                habit={habit}
                currentValue={todayLog[habit] ?? 0}
                targetValue={targets[habit]}
                onValueChange={(value) => handleHabitChange(habit, value)}
              />
            ))}
          </div>
        </section>

        {/* Wellness Score */}
        <section aria-label="Today's wellness score">
          <WellnessScoreCard scoreData={scoreData} />
        </section>

        {/* Streak Calendar */}
        <section aria-label="Your streak">
          <StreakCalendar streakData={streakData} />
        </section>

        {/* Burnout Forecast */}
        {forecast.probability > 0 && (
          <section aria-label="Energy forecast">
            <ForecastWarningCard forecast={forecast} />
          </section>
        )}

        {/* Benchmark Insight */}
        {benchmarkComparison && (
          <section aria-label="India benchmark comparison">
            <BenchmarkInsightCard comparison={benchmarkComparison} />
          </section>
        )}
      </div>
    </AppShell>
  )
}
