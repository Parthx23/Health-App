'use client'

import { useMemo } from 'react'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  usePreferences,
  useTargets,
  useTodayLog,
  updatePreferences,
} from '@/lib/store'
import {
  calculateWellnessScore,
  calculateGardenState,
  getAvatarMood,
} from '@/lib/scoring'
import type { AvatarConfig, GardenTheme, AvatarMood } from '@/lib/types'

const SKIN_TONES: { value: AvatarConfig['skinTone']; label: string; color: string }[] = [
  { value: 'light', label: 'Light', color: 'oklch(0.85 0.04 70)' },
  { value: 'medium', label: 'Medium', color: 'oklch(0.7 0.06 60)' },
  { value: 'tan', label: 'Tan', color: 'oklch(0.6 0.08 55)' },
  { value: 'dark', label: 'Dark', color: 'oklch(0.45 0.06 50)' },
]

const HAIR_STYLES: { value: AvatarConfig['hairStyle']; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'curly', label: 'Curly' },
  { value: 'bun', label: 'Bun' },
  { value: 'none', label: 'None' },
]

const OUTFIT_COLORS: { value: AvatarConfig['outfitColor']; label: string; color: string }[] = [
  { value: 'teal', label: 'Teal', color: 'oklch(0.6 0.15 175)' },
  { value: 'green', label: 'Green', color: 'oklch(0.6 0.15 145)' },
  { value: 'amber', label: 'Amber', color: 'oklch(0.75 0.15 70)' },
  { value: 'rose', label: 'Rose', color: 'oklch(0.65 0.15 350)' },
  { value: 'purple', label: 'Purple', color: 'oklch(0.55 0.15 280)' },
]

const GARDEN_THEMES: { value: GardenTheme; label: string; description: string }[] = [
  { value: 'sunrise', label: 'Sunrise', description: 'Warm morning glow' },
  { value: 'daylight', label: 'Daylight', description: 'Bright and clear' },
  { value: 'sunset', label: 'Sunset', description: 'Golden evening hues' },
  { value: 'moonlight', label: 'Moonlight', description: 'Calm night sky' },
]

const MOOD_DESCRIPTIONS: Record<AvatarMood, { title: string; description: string }> = {
  energetic: { title: 'Energetic', description: 'Full of energy and ready to take on the day!' },
  calm: { title: 'Calm', description: 'Peaceful and centered, well-rested.' },
  balanced: { title: 'Balanced', description: 'Maintaining a healthy equilibrium.' },
  recovered: { title: 'Recovered', description: 'Bouncing back from a challenging period.' },
  tired: { title: 'Tired', description: 'Could use some rest and recovery.' },
  foggy: { title: 'Foggy', description: 'A bit scattered, needs more screen breaks.' },
}

export default function AvatarPage() {
  const preferences = usePreferences()
  const targets = useTargets()
  const todayLog = useTodayLog()

  if (!preferences.onboardingComplete) {
    redirect('/onboarding')
  }

  const { avatarConfig, gardenTheme } = preferences

  // Calculate garden state and mood
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

  const moodInfo = MOOD_DESCRIPTIONS[avatarMood]

  const handleAvatarChange = (key: keyof AvatarConfig, value: string) => {
    updatePreferences({
      avatarConfig: {
        ...avatarConfig,
        [key]: value,
      },
    })
  }

  const handleGardenThemeChange = (value: GardenTheme) => {
    updatePreferences({ gardenTheme: value })
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="pt-4">
          <h1 className="text-2xl font-bold text-foreground drop-shadow-sm">Your Garden</h1>
          <p className="text-sm text-foreground/70">
            Watch your garden grow with your habits
          </p>
        </header>

        {/* Garden State Explanation */}
        <section className="space-y-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{moodInfo.title}</h3>
                <span className="text-sm text-muted-foreground">
                  Score: {scoreData.totalScore}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {moodInfo.description}
              </p>
              
              {/* Garden elements status */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Flowers</span>
                  <span className="font-medium">{gardenState.flowersBloom}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Sky Clarity</span>
                  <span className="font-medium">{gardenState.skyClarity}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Fog Level</span>
                  <span className="font-medium">{gardenState.fogLevel}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Leaf Energy</span>
                  <span className="font-medium">{gardenState.leafEnergy}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Garden Theme Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Garden Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={gardenTheme}
              onValueChange={(value) => handleGardenThemeChange(value as GardenTheme)}
              className="grid grid-cols-2 gap-3"
            >
              {GARDEN_THEMES.map((theme) => (
                <div key={theme.value}>
                  <RadioGroupItem
                    value={theme.value}
                    id={`garden-${theme.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`garden-${theme.value}`}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="font-medium">{theme.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {theme.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Avatar Customization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Avatar Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skin Tone */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Skin Tone</Label>
              <div className="flex gap-2">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => handleAvatarChange('skinTone', tone.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      avatarConfig.skinTone === tone.value
                        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    style={{ backgroundColor: tone.color }}
                    title={tone.label}
                    aria-label={tone.label}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Hair Style</Label>
              <RadioGroup
                value={avatarConfig.hairStyle}
                onValueChange={(value) => handleAvatarChange('hairStyle', value)}
                className="flex flex-wrap gap-2"
              >
                {HAIR_STYLES.map((style) => (
                  <div key={style.value}>
                    <RadioGroupItem
                      value={style.value}
                      id={`hair-${style.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`hair-${style.value}`}
                      className="px-3 py-1.5 rounded-full border border-muted text-sm cursor-pointer transition-colors hover:bg-muted peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary"
                    >
                      {style.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Outfit Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Outfit Color</Label>
              <div className="flex gap-2">
                {OUTFIT_COLORS.map((outfit) => (
                  <button
                    key={outfit.value}
                    onClick={() => handleAvatarChange('outfitColor', outfit.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      avatarConfig.outfitColor === outfit.value
                        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    style={{ backgroundColor: outfit.color }}
                    title={outfit.label}
                    aria-label={outfit.label}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Your Garden Responds */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How Your Garden Responds</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-chart-1 mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Hydration</strong> makes flowers bloom</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-chart-2 mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Sleep</strong> clears the sky</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-chart-5 mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Screen breaks</strong> reduce fog</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-chart-6 mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Stress relief</strong> brings butterflies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-chart-3 mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Activity</strong> energizes the leaves</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
