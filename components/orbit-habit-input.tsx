'use client'

import { useState, useRef, useCallback } from 'react'
import { Droplets, Moon, Activity, Apple, Eye, Heart, Minus, Plus } from 'lucide-react'
import type { HabitKey } from '@/lib/types'
import { HABIT_CONFIGS } from '@/lib/habits'
import { Button } from '@/components/ui/button'

interface OrbitHabitInputProps {
  habit: HabitKey
  currentValue: number
  targetValue: number
  onValueChange: (value: number) => void
  className?: string
}

const ICONS: Record<HabitKey, React.ElementType> = {
  hydration: Droplets,
  sleep: Moon,
  activity: Activity,
  meals: Apple,
  screenBreaks: Eye,
  stressRelief: Heart,
}

export function OrbitHabitInput({
  habit,
  currentValue,
  targetValue,
  onValueChange,
  className = '',
}: OrbitHabitInputProps) {
  const config = HABIT_CONFIGS[habit]
  const Icon = ICONS[habit]
  const completion = Math.min(currentValue / targetValue, 1)
  const isComplete = completion >= 1

  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleIncrement = useCallback(() => {
    if (currentValue < config.maxValue) {
      onValueChange(currentValue + 1)
    }
  }, [currentValue, config.maxValue, onValueChange])

  const handleDecrement = useCallback(() => {
    if (currentValue > 0) {
      onValueChange(currentValue - 1)
    }
  }, [currentValue, onValueChange])

  // Handle drag/touch interactions for orbit-style input
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate angle from center
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
    // Convert to 0-1 range (starting from top, going clockwise)
    const normalizedAngle = ((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)
    
    // Map to value range
    const newValue = Math.round(normalizedAngle * config.maxValue)
    if (newValue !== currentValue && newValue >= 0 && newValue <= config.maxValue) {
      onValueChange(newValue)
    }
  }, [isDragging, config.maxValue, currentValue, onValueChange])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Calculate stroke dasharray for progress ring
  const circumference = 2 * Math.PI * 36
  const strokeDasharray = `${completion * circumference} ${circumference}`

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        ref={containerRef}
        className={`relative w-24 h-24 cursor-pointer touch-none select-none transition-transform ${
          isDragging ? 'scale-105' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-label={`${config.label}: ${currentValue} of ${targetValue} ${config.unit}`}
        aria-valuenow={currentValue}
        aria-valuemin={0}
        aria-valuemax={config.maxValue}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            handleIncrement()
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            handleDecrement()
          }
        }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          {/* Background ring */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted"
          />
          {/* Progress ring */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={config.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-200"
          />
        </svg>

        {/* Center content */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-colors ${
            isComplete ? 'text-primary' : 'text-foreground'
          }`}
        >
          <Icon className="w-5 h-5 mb-1" />
          <span className="text-lg font-bold leading-none">
            {currentValue}
          </span>
          <span className="text-[10px] text-muted-foreground">
            /{targetValue}
          </span>
        </div>

        {/* Completion indicator */}
        {isComplete && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Label */}
      <span className="text-xs font-medium text-muted-foreground text-center">
        {config.label}
      </span>

      {/* Quick increment/decrement buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDecrement}
          disabled={currentValue <= 0}
          aria-label={`Decrease ${config.label}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleIncrement}
          disabled={currentValue >= config.maxValue}
          aria-label={`Increase ${config.label}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
