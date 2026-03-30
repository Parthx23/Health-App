'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets,
  Moon,
  Activity,
  Apple,
  Eye,
  Heart,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { LivingGarden } from '@/components/living-garden'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import {
  useTargets,
  usePreferences,
  updateTarget,
  updatePreferences,
  completeOnboarding,
  enableDemoMode,
} from '@/lib/store'
import { HABIT_KEYS, HABIT_CONFIGS, DEFAULT_TARGETS } from '@/lib/habits'
import type { HabitKey, AvatarConfig, GardenTheme, GardenState } from '@/lib/types'

const HABIT_ICONS: Record<HabitKey, React.ElementType> = {
  hydration: Droplets,
  sleep: Moon,
  activity: Activity,
  meals: Apple,
  screenBreaks: Eye,
  stressRelief: Heart,
}

const SKIN_TONES: { value: AvatarConfig['skinTone']; label: string; color: string }[] = [
  { value: 'light', label: 'Light', color: 'oklch(0.85 0.04 70)' },
  { value: 'medium', label: 'Medium', color: 'oklch(0.7 0.06 60)' },
  { value: 'tan', label: 'Tan', color: 'oklch(0.6 0.08 55)' },
  { value: 'dark', label: 'Dark', color: 'oklch(0.45 0.06 50)' },
]

const OUTFIT_COLORS: { value: AvatarConfig['outfitColor']; label: string; color: string }[] = [
  { value: 'teal', label: 'Teal', color: 'oklch(0.6 0.15 175)' },
  { value: 'green', label: 'Green', color: 'oklch(0.6 0.15 145)' },
  { value: 'amber', label: 'Amber', color: 'oklch(0.75 0.15 70)' },
  { value: 'rose', label: 'Rose', color: 'oklch(0.65 0.15 350)' },
  { value: 'purple', label: 'Purple', color: 'oklch(0.55 0.15 280)' },
]

const GARDEN_THEMES: { value: GardenTheme; label: string }[] = [
  { value: 'sunrise', label: 'Sunrise' },
  { value: 'daylight', label: 'Daylight' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'moonlight', label: 'Moonlight' },
]

const STEPS = ['welcome', 'targets', 'avatar', 'garden', 'ready'] as const
type Step = (typeof STEPS)[number]

export default function OnboardingPage() {
  const router = useRouter()
  const targets = useTargets()
  const preferences = usePreferences()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [loadDemoData, setLoadDemoData] = useState(true)

  const currentStepIndex = STEPS.indexOf(currentStep)

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1])
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1])
    }
  }

  const handleComplete = () => {
    if (loadDemoData) {
      enableDemoMode()
    }
    completeOnboarding()
    router.push('/')
  }

  const handleTargetChange = (habit: HabitKey, value: number[]) => {
    updateTarget(habit, value[0])
  }

  const handleAvatarChange = (key: keyof AvatarConfig, value: string) => {
    updatePreferences({
      avatarConfig: {
        ...preferences.avatarConfig,
        [key]: value,
      },
    })
  }

  const handleGardenThemeChange = (value: GardenTheme) => {
    updatePreferences({ gardenTheme: value })
  }

  // Demo garden state for preview
  const demoGardenState: GardenState = {
    flowersBloom: 70,
    skyClarity: 80,
    fogLevel: 10,
    particleCount: 50,
    leafEnergy: 60,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="p-4">
        <div className="flex gap-1.5 max-w-md mx-auto">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pb-4 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                <div className="space-y-2">
                  <Sparkles className="w-12 h-12 mx-auto text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome to WellNest
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Your personal wellness companion
                  </p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground max-w-xs mx-auto">
                  <p>Track your daily habits with just a tap</p>
                  <p>Watch your garden grow as you improve</p>
                  <p>Get personalized insights for Indian lifestyles</p>
                </div>
                <LivingGarden
                  gardenState={demoGardenState}
                  theme="sunrise"
                  className="h-40"
                />
              </div>
            )}

            {/* Targets Step */}
            {currentStep === 'targets' && (
              <div className="flex-1 space-y-6">
                <div className="text-center space-y-2 pt-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Set Your Daily Goals
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize targets that work for you
                  </p>
                </div>

                <div className="space-y-5 flex-1">
                  {HABIT_KEYS.map((habit) => {
                    const config = HABIT_CONFIGS[habit]
                    const Icon = HABIT_ICONS[habit]
                    const value = targets[habit]

                    return (
                      <div key={habit} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              className="h-4 w-4"
                              style={{ color: config.color }}
                            />
                            <Label className="text-sm">{config.label}</Label>
                          </div>
                          <span className="text-sm font-medium">
                            {value} {config.unit}
                          </span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(v) => handleTargetChange(habit, v)}
                          min={1}
                          max={config.maxValue}
                          step={1}
                        />
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  You can change these anytime in settings
                </p>
              </div>
            )}

            {/* Avatar Step */}
            {currentStep === 'avatar' && (
              <div className="flex-1 space-y-6">
                <div className="text-center space-y-2 pt-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Create Your Avatar
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Personalize how you appear in your garden
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Skin Tone */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Skin Tone</Label>
                      <div className="flex justify-center gap-3">
                        {SKIN_TONES.map((tone) => (
                          <button
                            key={tone.value}
                            onClick={() =>
                              handleAvatarChange('skinTone', tone.value)
                            }
                            className={`w-12 h-12 rounded-full border-2 transition-all ${
                              preferences.avatarConfig.skinTone === tone.value
                                ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                                : 'border-transparent hover:border-muted-foreground/30'
                            }`}
                            style={{ backgroundColor: tone.color }}
                            title={tone.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Outfit Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Outfit Color</Label>
                      <div className="flex justify-center gap-3">
                        {OUTFIT_COLORS.map((outfit) => (
                          <button
                            key={outfit.value}
                            onClick={() =>
                              handleAvatarChange('outfitColor', outfit.value)
                            }
                            className={`w-12 h-12 rounded-full border-2 transition-all ${
                              preferences.avatarConfig.outfitColor ===
                              outfit.value
                                ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                                : 'border-transparent hover:border-muted-foreground/30'
                            }`}
                            style={{ backgroundColor: outfit.color }}
                            title={outfit.label}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Garden Step */}
            {currentStep === 'garden' && (
              <div className="flex-1 space-y-6">
                <div className="text-center space-y-2 pt-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Choose Your Garden
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Pick the atmosphere that inspires you
                  </p>
                </div>

                <LivingGarden
                  gardenState={demoGardenState}
                  theme={preferences.gardenTheme}
                  className="h-48"
                />

                <RadioGroup
                  value={preferences.gardenTheme}
                  onValueChange={(value) =>
                    handleGardenThemeChange(value as GardenTheme)
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  {GARDEN_THEMES.map((theme) => (
                    <div key={theme.value}>
                      <RadioGroupItem
                        value={theme.value}
                        id={`onboard-garden-${theme.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`onboard-garden-${theme.value}`}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                      >
                        <span className="font-medium">{theme.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Ready Step */}
            {currentStep === 'ready' && (
              <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    You&apos;re All Set!
                  </h2>
                  <p className="text-muted-foreground">
                    Your wellness journey begins now
                  </p>
                </div>

                <LivingGarden
                  gardenState={demoGardenState}
                  theme={preferences.gardenTheme}
                  className="h-40"
                />

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm font-medium">Load demo data?</p>
                        <p className="text-xs text-muted-foreground">
                          See the app with 30 days of sample data
                        </p>
                      </div>
                      <RadioGroup
                        value={loadDemoData ? 'yes' : 'no'}
                        onValueChange={(v) => setLoadDemoData(v === 'yes')}
                        className="flex gap-2"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="yes" id="demo-yes" />
                          <Label htmlFor="demo-yes" className="text-sm">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="no" id="demo-no" />
                          <Label htmlFor="demo-no" className="text-sm">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Log your first habit on the home screen</p>
                  <p>Watch your garden bloom as you grow</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6">
          {currentStepIndex > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}

          {currentStep === 'ready' ? (
            <Button onClick={handleComplete} className="flex-1">
              Start Your Journey
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {currentStep === 'welcome' ? 'Get Started' : 'Continue'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
