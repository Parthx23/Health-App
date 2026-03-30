'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { useTodayLog, useTargets } from '@/lib/store'
import { HABIT_CONFIGS } from '@/lib/habits'
import { toast } from '@/components/ui/use-toast'

/* ── Mirror the VoiceSystem constants from voice.js ── */
const MESSAGES: Record<string, string> = {
  hydration:    'Your water intake is low. Please drink some water.',
  sleep:        'Your sleep target is low today. Try to rest early tonight.',
  activity:     'Your physical activity is below target. A short walk would help.',
  meals:        'You are behind on healthy meals today. Try to eat something balanced.',
  screenBreaks: 'You have missed your screen breaks. Please rest your eyes for a while.',
  stressRelief: 'You have not done stress relief today. Take five minutes to relax.',
}
const THRESHOLD = 0.6

function getReminder(
  log: Record<string, number>,
  targets: Record<string, number>
): { habit: string; message: string } | null {
  const ranked = Object.keys(MESSAGES)
    .map((habit) => {
      const t = targets[habit] ?? 0
      const ratio = t > 0 ? Math.min((log[habit] ?? 0) / t, 1) : 1
      return { habit, ratio }
    })
    .sort((a, b) => a.ratio - b.ratio)

  const worst = ranked[0]
  if (!worst || worst.ratio >= THRESHOLD) return null
  return { habit: worst.habit, message: MESSAGES[worst.habit] }
}

export function VoiceButton() {
  const todayLog = useTodayLog()
  const targets  = useTargets()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  /* Sync state if speech ends externally (e.g. page loses focus) */
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && !window.speechSynthesis.speaking) {
        setIsSpeaking(false)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const speak = useCallback((message: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang   = 'en-IN'
    utterance.rate   = 1
    utterance.pitch  = 1
    utterance.volume = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend   = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const handlePress = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({ title: 'Not supported', description: 'Voice reminders are not supported in this browser.' })
      return
    }

    /* Toggle off if already speaking */
    if (isSpeaking) {
      stop()
      return
    }

    const reminder = getReminder(todayLog as Record<string, number>, targets as Record<string, number>)

    if (reminder) {
      const label = HABIT_CONFIGS[reminder.habit as keyof typeof HABIT_CONFIGS]?.label ?? reminder.habit
      toast({ title: `🎙️ Reminder: ${label}`, description: reminder.message })
      speak(reminder.message)
    } else {
      const msg = 'Great job! All your habits are on track today. Keep it up!'
      toast({ title: '🎉 All habits on track!', description: 'Keep up the great work.' })
      speak(msg)
    }
  }, [isSpeaking, stop, speak, todayLog, targets])

  return (
    <>
      <style>{`
        @keyframes voicePulse {
          0%   { box-shadow: 0 0 0 0   rgba(var(--voice-accent), 0.5); }
          60%  { box-shadow: 0 0 0 10px transparent; }
          100% { box-shadow: 0 0 0 0   transparent; }
        }
        @keyframes voiceRipple {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .voice-btn-speaking {
          animation: voicePulse 1s ease-in-out infinite;
        }
        .voice-btn-speaking::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: hsl(var(--primary) / 0.15);
          animation: voiceRipple 1.2s ease-out infinite;
        }
      `}</style>

      <button
        id="voice-btn"
        onClick={handlePress}
        title={isSpeaking ? 'Tap to stop' : 'Tap for voice reminder'}
        aria-label={isSpeaking ? 'Stop voice reminder' : 'Voice reminder'}
        className={[
          'relative flex items-center justify-center',
          'w-14 h-14 rounded-full',
          'shadow-lg transition-all duration-200 active:scale-90',
          isSpeaking
            ? 'bg-primary text-primary-foreground border-2 border-primary voice-btn-speaking'
            : 'bg-card/80 backdrop-blur border border-border/60 text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary',
        ].join(' ')}
      >
        {isSpeaking
          ? <MicOff className="w-6 h-6" />
          : <Mic     className="w-6 h-6" />
        }
      </button>
    </>
  )
}
