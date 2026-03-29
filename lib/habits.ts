import type { HabitConfig, HabitKey, HabitTargets } from './types'

export const HABIT_CONFIGS: Record<HabitKey, HabitConfig> = {
  hydration: {
    key: 'hydration',
    label: 'Hydration',
    unit: 'glasses',
    icon: 'Droplets',
    color: 'hsl(var(--chart-1))',
    defaultTarget: 8,
    maxValue: 15,
  },
  sleep: {
    key: 'sleep',
    label: 'Sleep',
    unit: 'hours',
    icon: 'Moon',
    color: 'hsl(var(--chart-2))',
    defaultTarget: 8,
    maxValue: 12,
  },
  activity: {
    key: 'activity',
    label: 'Activity',
    unit: 'mins',
    icon: 'Activity',
    color: 'hsl(var(--chart-3))',
    defaultTarget: 30,
    maxValue: 120,
  },
  meals: {
    key: 'meals',
    label: 'Healthy Meals',
    unit: 'meals',
    icon: 'Apple',
    color: 'hsl(var(--chart-4))',
    defaultTarget: 3,
    maxValue: 5,
  },
  screenBreaks: {
    key: 'screenBreaks',
    label: 'Screen Breaks',
    unit: 'breaks',
    icon: 'Eye',
    color: 'hsl(var(--chart-5))',
    defaultTarget: 6,
    maxValue: 12,
  },
  stressRelief: {
    key: 'stressRelief',
    label: 'Stress Relief',
    unit: 'sessions',
    icon: 'Heart',
    color: 'hsl(var(--chart-6))',
    defaultTarget: 1,
    maxValue: 5,
  },
}

export const HABIT_KEYS: HabitKey[] = [
  'hydration',
  'sleep',
  'activity',
  'meals',
  'screenBreaks',
  'stressRelief',
]

export const DEFAULT_TARGETS: HabitTargets = {
  hydration: 8,
  sleep: 8,
  activity: 30,
  meals: 3,
  screenBreaks: 6,
  stressRelief: 1,
}

// Habit weights for wellness score calculation
export const HABIT_WEIGHTS: Record<HabitKey, number> = {
  hydration: 0.15,
  sleep: 0.25,
  activity: 0.2,
  meals: 0.15,
  screenBreaks: 0.1,
  stressRelief: 0.15,
}

// India-specific benchmarks (average values for Indian young adults)
export const INDIA_BENCHMARKS: Record<HabitKey, { average: number; label: string }> = {
  hydration: { average: 5, label: 'Indian adults drink ~5 glasses daily' },
  sleep: { average: 6.5, label: 'Indian adults sleep ~6.5 hours on average' },
  activity: { average: 20, label: 'Indian young adults average ~20 mins activity' },
  meals: { average: 2, label: 'Average balanced meals per day in India' },
  screenBreaks: { average: 3, label: 'Average screen breaks taken in India' },
  stressRelief: { average: 0.3, label: 'Most Indians skip daily stress relief' },
}

// Tips for each habit
export const HABIT_TIPS: Record<HabitKey, string> = {
  hydration: 'Keep a bottle near your desk and drink at routine moments like before meals.',
  sleep: 'Try a fixed sleep window and reduce screens 30 minutes before bed.',
  activity: 'Add a short 10-minute walk between study sessions or after lunch.',
  meals: 'Plan at least one balanced meal with dal, sabzi, and roti before your busiest hours.',
  screenBreaks: 'Use the 50-10 rule: study for 50 mins, then take a 10-min break.',
  stressRelief: 'Take 5 minutes for deep breathing, stretching, or quiet time daily.',
}
