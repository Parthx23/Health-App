'use client'

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react'
import type { AppState, HabitTargets, DailyLog, Preferences, HabitKey, LogsByDate } from './types'
import { DEFAULT_TARGETS } from './habits'
import { getTodayString } from './scoring'

const STORAGE_KEY = 'arogya-garden-state'

// Default state
const defaultPreferences: Preferences = {
  theme: 'system',
  notificationsEnabled: false,
  demoMode: false,
  gardenTheme: 'sunrise',
  avatarConfig: {
    skinTone: 'medium',
    hairStyle: 'short',
    outfitColor: 'teal',
  },
  onboardingComplete: false,
}

const defaultState: AppState = {
  targets: DEFAULT_TARGETS,
  logsByDate: {},
  preferences: defaultPreferences,
}

// Store implementation
let state: AppState = defaultState
let listeners: Set<() => void> = new Set()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AppState
      // Clean up old month data
      const currentMonth = getTodayString().slice(0, 7)
      const cleanedLogs: LogsByDate = {}
      
      for (const [date, log] of Object.entries(parsed.logsByDate)) {
        if (date.startsWith(currentMonth)) {
          cleanedLogs[date] = log
        }
      }
      
      return {
        ...defaultState,
        ...parsed,
        logsByDate: cleanedLogs,
        preferences: { ...defaultPreferences, ...parsed.preferences },
      }
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
  
  return defaultState
}

function saveState(newState: AppState) {
  state = newState
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch (e) {
      console.error('Failed to save state:', e)
    }
  }
  emitChange()
}

// Initialize state on client
if (typeof window !== 'undefined') {
  state = loadState()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): AppState {
  return state
}

function getServerSnapshot(): AppState {
  return defaultState
}

// Store actions
export function setTargets(targets: HabitTargets) {
  saveState({ ...state, targets })
}

export function updateTarget(habit: HabitKey, value: number) {
  saveState({
    ...state,
    targets: { ...state.targets, [habit]: value },
  })
}

export function logHabit(date: string, habit: HabitKey, value: number) {
  const existingLog = state.logsByDate[date] ?? {}
  saveState({
    ...state,
    logsByDate: {
      ...state.logsByDate,
      [date]: { ...existingLog, [habit]: value },
    },
  })
}

export function incrementHabit(date: string, habit: HabitKey, amount: number = 1) {
  const existingLog = state.logsByDate[date] ?? {}
  const currentValue = existingLog[habit] ?? 0
  logHabit(date, habit, Math.max(0, currentValue + amount))
}

export function setDailyLog(date: string, log: DailyLog) {
  saveState({
    ...state,
    logsByDate: { ...state.logsByDate, [date]: log },
  })
}

export function updatePreferences(updates: Partial<Preferences>) {
  saveState({
    ...state,
    preferences: { ...state.preferences, ...updates },
  })
}

export function completeOnboarding() {
  updatePreferences({ onboardingComplete: true })
}

export function resetMonthData() {
  saveState({
    ...state,
    logsByDate: {},
  })
}

export function enableDemoMode() {
  const demoLogs = generateDemoData()
  saveState({
    ...state,
    logsByDate: demoLogs,
    preferences: { ...state.preferences, demoMode: true },
  })
}

export function disableDemoMode() {
  saveState({
    ...state,
    logsByDate: {},
    preferences: { ...state.preferences, demoMode: false },
  })
}

// Generate realistic demo data for last 14-30 days
function generateDemoData(): LogsByDate {
  const logs: LogsByDate = {}
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Create varied but realistic data
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const randomFactor = Math.random()
    
    // Simulate patterns: better on weekends, some bad days
    const baseMood = isWeekend ? 0.8 : 0.6
    const mood = randomFactor > 0.8 ? 0.4 : baseMood + randomFactor * 0.2
    
    logs[dateStr] = {
      hydration: Math.round(mood * 8 + Math.random() * 3),
      sleep: Math.round(mood * 7 + Math.random() * 2),
      activity: Math.round(mood * 30 + Math.random() * 20),
      meals: Math.round(mood * 2.5 + Math.random() * 1.5),
      screenBreaks: Math.round(mood * 5 + Math.random() * 3),
      stressRelief: Math.random() > 0.3 ? 1 : 0,
    }
  }
  
  return logs
}

// React hooks
export function useAppState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useTargets() {
  const appState = useAppState()
  return appState.targets
}

export function useLogsByDate() {
  const appState = useAppState()
  return appState.logsByDate
}

export function useTodayLog() {
  const appState = useAppState()
  const today = getTodayString()
  return appState.logsByDate[today] ?? {}
}

export function usePreferences() {
  const appState = useAppState()
  return appState.preferences
}

// Context for providing state in server components
export const AppStateContext = createContext<AppState>(defaultState)

export function useAppStateFromContext() {
  return useContext(AppStateContext)
}
