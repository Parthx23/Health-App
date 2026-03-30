'use client'

import { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { LivingGarden } from './living-garden'
import { VoiceButton } from './voice-button'
import { usePreferences, useTodayLog, useTargets } from '@/lib/store'
import { calculateGardenState } from '@/lib/scoring'

interface AppShellProps {
  children: ReactNode
  hideNav?: boolean
  showGardenBackground?: boolean
}

export function AppShell({ children, hideNav = false, showGardenBackground = true }: AppShellProps) {
  const preferences = usePreferences()
  const todayLog = useTodayLog()
  const targets = useTargets()
  
  const gardenState = calculateGardenState(todayLog, targets)

  // If onboarding not complete, don't show nav
  const showNav = !hideNav && preferences.onboardingComplete

  return (
    <div className="min-h-screen relative">
      {/* Background garden */}
      {showGardenBackground && preferences.onboardingComplete && (
        <LivingGarden
          gardenState={gardenState}
          theme={preferences.gardenTheme}
          isBackground
        />
      )}
      
      <main className={`relative z-10 ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showNav && <BottomNav />}

      {/* Floating voice mic FAB — top right */}
      {showNav && (
        <div className="fixed top-4 right-4 z-50 pointer-events-auto">
          <VoiceButton />
        </div>
      )}
    </div>
  )
}
