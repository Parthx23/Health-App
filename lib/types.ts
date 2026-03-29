// Core habit keys
export type HabitKey = 'hydration' | 'sleep' | 'activity' | 'meals' | 'screenBreaks' | 'stressRelief'

// Habit configuration
export interface HabitConfig {
  key: HabitKey
  label: string
  unit: string
  icon: string
  color: string
  defaultTarget: number
  maxValue: number
}

// Habit targets set by user
export type HabitTargets = Record<HabitKey, number>

// Daily log for all habits
export type DailyLog = Partial<Record<HabitKey, number>>

// Logs indexed by date string (YYYY-MM-DD)
export type LogsByDate = Record<string, DailyLog>

// Avatar customization options
export interface AvatarConfig {
  skinTone: 'light' | 'medium' | 'tan' | 'dark'
  hairStyle: 'short' | 'long' | 'curly' | 'bun' | 'none'
  outfitColor: 'teal' | 'green' | 'amber' | 'rose' | 'purple'
}

// Garden theme options
export type GardenTheme = 'sunrise' | 'daylight' | 'sunset' | 'moonlight'

// Avatar mood states based on wellness
export type AvatarMood = 'energetic' | 'calm' | 'tired' | 'foggy' | 'recovered' | 'balanced'

// User preferences
export interface Preferences {
  theme: 'light' | 'dark' | 'system'
  notificationsEnabled: boolean
  demoMode: boolean
  gardenTheme: GardenTheme
  avatarConfig: AvatarConfig
  onboardingComplete: boolean
}

// Wellness score output
export interface WellnessScoreOutput {
  totalScore: number
  habitScores: Record<HabitKey, number>
  bestHabit: HabitKey | null
  weakestHabit: HabitKey | null
  completionRatios: Record<HabitKey, number>
}

// Burnout forecast output
export interface BurnoutForecast {
  riskLevel: 'low' | 'moderate' | 'high'
  probability: number
  message: string
  recommendation: string
  affectedHabits: HabitKey[]
}

// Streak data
export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastSevenDays: { date: string; completed: boolean; score: number }[]
}

// India benchmark comparison
export interface BenchmarkComparison {
  habit: HabitKey
  userValue: number
  benchmarkValue: number
  comparison: 'above' | 'below' | 'equal'
  message: string
}

// Weekly tip
export interface WeeklyTip {
  habit: HabitKey
  tip: string
}

// Full app state
export interface AppState {
  targets: HabitTargets
  logsByDate: LogsByDate
  preferences: Preferences
}

// Garden element state
export interface GardenState {
  flowersBloom: number // 0-100
  skyClarity: number // 0-100
  fogLevel: number // 0-100
  particleCount: number // 0-100
  leafEnergy: number // 0-100
}
