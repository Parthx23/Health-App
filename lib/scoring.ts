import type {
  HabitKey,
  HabitTargets,
  DailyLog,
  WellnessScoreOutput,
  BurnoutForecast,
  StreakData,
  BenchmarkComparison,
  WeeklyTip,
  GardenState,
  AvatarMood,
} from './types'
import { HABIT_WEIGHTS, HABIT_KEYS, INDIA_BENCHMARKS, HABIT_TIPS, HABIT_CONFIGS } from './habits'

// Calculate wellness score for a single day
export function calculateWellnessScore(
  log: DailyLog,
  targets: HabitTargets
): WellnessScoreOutput {
  const completionRatios: Record<HabitKey, number> = {} as Record<HabitKey, number>
  const habitScores: Record<HabitKey, number> = {} as Record<HabitKey, number>

  let totalScore = 0
  let bestHabit: HabitKey | null = null
  let weakestHabit: HabitKey | null = null
  let bestRatio = -1
  let worstRatio = 2

  for (const key of HABIT_KEYS) {
    const actual = log[key] ?? 0
    const target = targets[key] ?? 1
    const ratio = Math.min(actual / target, 1)
    completionRatios[key] = ratio
    habitScores[key] = Math.round(ratio * 100)
    totalScore += ratio * HABIT_WEIGHTS[key]

    if (ratio > bestRatio) {
      bestRatio = ratio
      bestHabit = key
    }
    if (ratio < worstRatio) {
      worstRatio = ratio
      weakestHabit = key
    }
  }

  return {
    totalScore: Math.round(totalScore * 100),
    habitScores,
    bestHabit,
    weakestHabit,
    completionRatios,
  }
}

// Calculate average score over multiple days
export function calculateAverageScore(
  logs: DailyLog[],
  targets: HabitTargets
): number {
  if (logs.length === 0) return 0
  const scores = logs.map((log) => calculateWellnessScore(log, targets).totalScore)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// Generate burnout forecast based on recent trends
export function generateBurnoutForecast(
  recentLogs: DailyLog[],
  targets: HabitTargets
): BurnoutForecast {
  if (recentLogs.length < 3) {
    return {
      riskLevel: 'low',
      probability: 0,
      message: 'Keep logging to get personalized forecasts.',
      recommendation: 'Log your habits daily for better predictions.',
      affectedHabits: [],
    }
  }

  const last3Days = recentLogs.slice(-3)
  const affectedHabits: HabitKey[] = []
  let riskScore = 0

  // Check sleep and stress relief for burnout indicators
  const avgSleep = last3Days.reduce((sum, log) => sum + (log.sleep ?? 0), 0) / 3
  const avgStress = last3Days.reduce((sum, log) => sum + (log.stressRelief ?? 0), 0) / 3
  const avgHydration = last3Days.reduce((sum, log) => sum + (log.hydration ?? 0), 0) / 3
  const avgActivity = last3Days.reduce((sum, log) => sum + (log.activity ?? 0), 0) / 3

  if (avgSleep < targets.sleep * 0.7) {
    riskScore += 30
    affectedHabits.push('sleep')
  }
  if (avgStress < targets.stressRelief * 0.5) {
    riskScore += 25
    affectedHabits.push('stressRelief')
  }
  if (avgHydration < targets.hydration * 0.6) {
    riskScore += 15
    affectedHabits.push('hydration')
  }
  if (avgActivity < targets.activity * 0.5) {
    riskScore += 15
    affectedHabits.push('activity')
  }

  // Check for declining trends
  if (recentLogs.length >= 3) {
    const scores = recentLogs.map((log) => calculateWellnessScore(log, targets).totalScore)
    const declining = scores[scores.length - 1] < scores[0] - 10
    if (declining) riskScore += 15
  }

  const probability = Math.min(riskScore, 95)
  let riskLevel: 'low' | 'moderate' | 'high' = 'low'
  let message = ''
  let recommendation = ''

  if (probability >= 60) {
    riskLevel = 'high'
    message = `${probability}% chance of energy crash this week.`
    recommendation = affectedHabits.includes('sleep')
      ? 'Prioritize an extra hour of sleep tonight.'
      : 'Take 15 minutes for stress relief today.'
  } else if (probability >= 30) {
    riskLevel = 'moderate'
    message = 'Your energy might dip in the next few days.'
    recommendation = 'A short walk and early sleep could help you recover.'
  } else {
    riskLevel = 'low'
    message = 'Looking good! Keep up your healthy habits.'
    recommendation = 'Maintain your current routine for steady energy.'
  }

  return {
    riskLevel,
    probability,
    message,
    recommendation,
    affectedHabits,
  }
}

// Calculate streak data
export function calculateStreak(
  logsByDate: Record<string, DailyLog>,
  targets: HabitTargets,
  today: string
): StreakData {
  const dates: string[] = []
  const todayDate = new Date(today)

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayDate)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  const lastSevenDays = dates.map((date) => {
    const log = logsByDate[date] ?? {}
    const scoreOutput = calculateWellnessScore(log, targets)
    // Consider day completed if score >= 60
    const completed = scoreOutput.totalScore >= 60
    return { date, completed, score: scoreOutput.totalScore }
  })

  // Calculate current streak (consecutive completed days ending today or yesterday)
  let currentStreak = 0
  for (let i = lastSevenDays.length - 1; i >= 0; i--) {
    if (lastSevenDays[i].completed) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak in last 30 days
  const last30Dates: string[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(todayDate)
    date.setDate(date.getDate() - i)
    last30Dates.push(date.toISOString().split('T')[0])
  }

  let longestStreak = 0
  let tempStreak = 0
  for (const date of last30Dates) {
    const log = logsByDate[date] ?? {}
    const scoreOutput = calculateWellnessScore(log, targets)
    if (scoreOutput.totalScore >= 60) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return { currentStreak, longestStreak, lastSevenDays }
}

// Generate India benchmark comparison
export function generateBenchmarkComparison(
  log: DailyLog,
  habit: HabitKey
): BenchmarkComparison {
  const userValue = log[habit] ?? 0
  const benchmark = INDIA_BENCHMARKS[habit]
  const config = HABIT_CONFIGS[habit]
  
  let comparison: 'above' | 'below' | 'equal'
  let message: string

  const diff = userValue - benchmark.average

  if (Math.abs(diff) < 0.5) {
    comparison = 'equal'
    message = `Your ${config.label.toLowerCase()} matches the Indian average.`
  } else if (diff > 0) {
    comparison = 'above'
    message = `You ${habit === 'sleep' ? 'sleep' : 'have'} ${Math.abs(diff).toFixed(1)} ${config.unit} more than average Indian ${habit === 'sleep' ? 'adults' : 'young adults'}.`
  } else {
    comparison = 'below'
    message = `Your ${config.label.toLowerCase()} is ${Math.abs(diff).toFixed(1)} ${config.unit} below the Indian average.`
  }

  return {
    habit,
    userValue,
    benchmarkValue: benchmark.average,
    comparison,
    message,
  }
}

// Get weekly tip based on weakest habit
export function getWeeklyTip(weakestHabit: HabitKey | null): WeeklyTip {
  const habit = weakestHabit ?? 'sleep'
  return {
    habit,
    tip: HABIT_TIPS[habit],
  }
}

// Calculate garden state based on daily log
export function calculateGardenState(
  log: DailyLog,
  targets: HabitTargets
): GardenState {
  const hydrationRatio = Math.min((log.hydration ?? 0) / targets.hydration, 1)
  const sleepRatio = Math.min((log.sleep ?? 0) / targets.sleep, 1)
  const screenBreaksRatio = Math.min((log.screenBreaks ?? 0) / targets.screenBreaks, 1)
  const stressReliefRatio = Math.min((log.stressRelief ?? 0) / targets.stressRelief, 1)
  const activityRatio = Math.min((log.activity ?? 0) / targets.activity, 1)

  return {
    flowersBloom: Math.round(hydrationRatio * 100),
    skyClarity: Math.round(sleepRatio * 100),
    fogLevel: Math.round((1 - screenBreaksRatio) * 100),
    particleCount: Math.round(stressReliefRatio * 100),
    leafEnergy: Math.round(activityRatio * 100),
  }
}

// Determine avatar mood based on wellness score
export function getAvatarMood(score: number, gardenState: GardenState): AvatarMood {
  if (score >= 85) return 'energetic'
  if (score >= 70 && gardenState.skyClarity >= 80) return 'calm'
  if (score >= 60) return 'balanced'
  if (gardenState.fogLevel >= 60) return 'foggy'
  if (score < 40) return 'tired'
  return 'recovered'
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Get today's date string
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Get dates for current month
export function getCurrentMonthDates(): string[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const dates: string[] = []
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}
