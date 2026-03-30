'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  BellOff,
  Droplets,
  Activity,
  Apple,
  Eye,
  Heart,
  Trash2,
  Play,
  Pause,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  usePreferences,
  useTargets,
  updateTarget,
  updatePreferences,
  resetMonthData,
  enableDemoMode,
  disableDemoMode,
} from '@/lib/store'
import { HABIT_KEYS, HABIT_CONFIGS } from '@/lib/habits'
import type { HabitKey } from '@/lib/types'

const HABIT_ICONS: Record<HabitKey, React.ElementType> = {
  hydration: Droplets,
  sleep: Moon,
  activity: Activity,
  meals: Apple,
  screenBreaks: Eye,
  stressRelief: Heart,
}

export default function SettingsPage() {
  const preferences = usePreferences()
  const targets = useTargets()
  const { theme, setTheme } = useTheme()
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  if (!preferences.onboardingComplete) {
    redirect('/onboarding')
  }

  // Check notification permission on mount
  useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  })

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        if (permission === 'granted') {
          updatePreferences({ notificationsEnabled: true })
        }
      }
    } else {
      updatePreferences({ notificationsEnabled: false })
    }
  }

  const handleTargetChange = (habit: HabitKey, value: number[]) => {
    updateTarget(habit, value[0])
  }

  const handleDemoModeToggle = (enabled: boolean) => {
    if (enabled) {
      enableDemoMode()
    } else {
      disableDemoMode()
    }
  }

  const handleResetData = () => {
    resetMonthData()
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="pt-4">
          <h1 className="text-2xl font-bold text-foreground drop-shadow-sm">Settings</h1>
          <p className="text-sm text-foreground/70">
            Customize your wellness journey
          </p>
        </header>

        {/* Theme Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Get gentle reminders for your habits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.notificationsEnabled ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationPermission === 'denied'
                      ? 'Blocked in browser settings'
                      : 'Hydration, screen breaks, and more'}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
                disabled={notificationPermission === 'denied'}
                aria-label="Toggle notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Habit Targets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daily Targets</CardTitle>
            <CardDescription>Set your personal wellness goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {HABIT_KEYS.map((habit) => {
              const config = HABIT_CONFIGS[habit]
              const Icon = HABIT_ICONS[habit]
              const value = targets[habit]

              return (
                <div key={habit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                      <Label className="text-sm font-medium">{config.label}</Label>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {value} {config.unit}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(v) => handleTargetChange(habit, v)}
                    min={1}
                    max={config.maxValue}
                    step={1}
                    className="w-full"
                    aria-label={`${config.label} target`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>{config.maxValue}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Demo Mode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Demo Mode</CardTitle>
            <CardDescription>
              Load sample data to explore the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.demoMode ? (
                  <Pause className="h-5 w-5 text-warning" />
                ) : (
                  <Play className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Demo Data</p>
                  <p className="text-xs text-muted-foreground">
                    {preferences.demoMode
                      ? 'Using simulated 30-day history'
                      : 'Using your real data'}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.demoMode}
                onCheckedChange={handleDemoModeToggle}
                aria-label="Toggle demo mode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Management</CardTitle>
            <CardDescription>Manage your local wellness data</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Month Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your logged habits for this month.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">WellNest</h3>
              <p className="text-sm text-muted-foreground">
                Your personal wellness companion
              </p>
              <p className="text-xs text-muted-foreground">
                Built with care for Indian students and young adults
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
