'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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

  // All mutable drag state in a single ref — never stale inside callbacks
  const drag = useRef({
    active: false,
    lastAngle: 0,
    accumulated: 0,  // float accumulator — single source of truth
    lastEmitted: 0,  // last integer we sent to onValueChange
    maxValue: config.maxValue,
    target: targetValue,
  })

  // Keep ref values in sync with props without recreating callbacks
  useEffect(() => {
    drag.current.maxValue = config.maxValue
    drag.current.target = targetValue
  }, [config.maxValue, targetValue])

  // Stable onValueChange ref so callbacks never go stale
  const onChangeRef = useRef(onValueChange)
  useEffect(() => { onChangeRef.current = onValueChange }, [onValueChange])

  // ── Pointer handlers ──────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()

    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    // Seed accumulated with the CURRENT display value (read from DOM attr or currentValue prop)
    const seedValue = parseFloat(
      containerRef.current.getAttribute('data-value') ?? '0'
    )

    drag.current.active = true
    drag.current.lastAngle = Math.atan2(e.clientY - cy, e.clientX - cx)
    drag.current.accumulated = seedValue
    drag.current.lastEmitted = Math.round(seedValue)

    setIsDragging(true)
  }, []) // no deps — reads everything from refs

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
    let delta = angle - drag.current.lastAngle

    // Unwrap across the ±π boundary
    if (delta > Math.PI)  delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2

    // 1 full revolution = targetValue units (clamped ≥ 1 to avoid ÷0)
    const deltaValue = (delta / (Math.PI * 2)) * Math.max(drag.current.target, 1)

    drag.current.accumulated = Math.max(
      0,
      Math.min(drag.current.accumulated + deltaValue, drag.current.maxValue)
    )
    drag.current.lastAngle = angle

    const next = Math.round(drag.current.accumulated)
    if (next !== drag.current.lastEmitted) {
      drag.current.lastEmitted = next
      onChangeRef.current(next)
    }
  }, []) // no deps — all state from refs

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    drag.current.active = false
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  // ── Button helpers ────────────────────────────────────────────────────
  const handleIncrement = useCallback(() => {
    const cur = parseFloat(containerRef.current?.getAttribute('data-value') ?? '0')
    const next = Math.min(Math.round(cur) + 1, config.maxValue)
    onChangeRef.current(next)
  }, [config.maxValue])

  const handleDecrement = useCallback(() => {
    const cur = parseFloat(containerRef.current?.getAttribute('data-value') ?? '0')
    const next = Math.max(Math.round(cur) - 1, 0)
    onChangeRef.current(next)
  }, [])

  // ── SVG ring ─────────────────────────────────────────────────────────
  const circumference = 2 * Math.PI * 36
  const strokeDasharray = `${completion * circumference} ${circumference}`

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        ref={containerRef}
        data-value={currentValue}          /* live value readable by stable callbacks */
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
          const cur = currentValue
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            onChangeRef.current(Math.min(cur + 1, config.maxValue))
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            onChangeRef.current(Math.max(cur - 1, 0))
          }
        }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          {/* Background ring */}
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted"
          />
          {/* Progress ring */}
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={config.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className={isDragging ? 'transition-none' : 'transition-all duration-200'}
          />
        </svg>

        {/* Center content */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-colors ${
            isComplete ? 'text-primary' : 'text-foreground'
          }`}
        >
          <Icon className="w-5 h-5 mb-1" />
          <span className="text-lg font-bold leading-none">{currentValue}</span>
          <span className="text-[10px] text-muted-foreground">/{targetValue}</span>
        </div>

        {/* Completion badge */}
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

      {/* +/- buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          onClick={handleDecrement}
          disabled={currentValue <= 0}
          aria-label={`Decrease ${config.label}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
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
