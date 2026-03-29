'use client'

import { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { usePreferences } from '@/lib/store'

interface AppShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  const preferences = usePreferences()

  // If onboarding not complete, don't show nav
  const showNav = !hideNav && preferences.onboardingComplete

  return (
    <div className="min-h-screen bg-background">
      <main className={`${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
