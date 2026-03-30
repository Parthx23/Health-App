'use client'

import type { AvatarConfig, AvatarMood } from '@/lib/types'

interface AvatarMoodCardProps {
  config: AvatarConfig
  mood: AvatarMood
  score: number
  className?: string
}

const SKIN_TONES = {
  light: 'oklch(0.85 0.04 70)',
  medium: 'oklch(0.7 0.06 60)',
  tan: 'oklch(0.6 0.08 55)',
  dark: 'oklch(0.45 0.06 50)',
}

const OUTFIT_COLORS = {
  teal: 'oklch(0.6 0.15 175)',
  green: 'oklch(0.6 0.15 145)',
  amber: 'oklch(0.75 0.15 70)',
  rose: 'oklch(0.65 0.15 350)',
  purple: 'oklch(0.55 0.15 280)',
}

const MOOD_EXPRESSIONS = {
  energetic: { eyeY: 44, mouthCurve: 8, blush: true },
  calm: { eyeY: 45, mouthCurve: 4, blush: false },
  balanced: { eyeY: 45, mouthCurve: 5, blush: false },
  recovered: { eyeY: 45, mouthCurve: 6, blush: true },
  tired: { eyeY: 47, mouthCurve: -2, blush: false },
  foggy: { eyeY: 46, mouthCurve: 0, blush: false },
}

const MOOD_MESSAGES = {
  energetic: "Feeling amazing today!",
  calm: "Peaceful and centered",
  balanced: "Doing well overall",
  recovered: "Bouncing back nicely",
  tired: "Could use some rest",
  foggy: "A bit scattered today",
}

export function AvatarMoodCard({ config, mood, score, className = '' }: AvatarMoodCardProps) {
  const skinColor = SKIN_TONES[config.skinTone]
  const outfitColor = OUTFIT_COLORS[config.outfitColor]
  const expression = MOOD_EXPRESSIONS[mood]
  const message = MOOD_MESSAGES[mood]

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-card/20 border border-border/50 shadow-sm ${className}`}>
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Body / Outfit */}
          <ellipse
            cx="50"
            cy="85"
            rx="25"
            ry="15"
            fill={outfitColor}
          />
          
          {/* Neck */}
          <rect x="44" y="60" width="12" height="12" fill={skinColor} />
          
          {/* Head */}
          <ellipse cx="50" cy="45" rx="22" ry="25" fill={skinColor} />
          
          {/* Hair */}
          {config.hairStyle === 'short' && (
            <path
              d="M 28 42 Q 30 20 50 18 Q 70 20 72 42 Q 68 35 50 33 Q 32 35 28 42"
              fill="oklch(0.25 0.03 50)"
            />
          )}
          {config.hairStyle === 'long' && (
            <path
              d="M 25 45 Q 25 15 50 15 Q 75 15 75 45 L 75 70 Q 70 75 65 70 L 65 50 Q 60 45 50 45 Q 40 45 35 50 L 35 70 Q 30 75 25 70 Z"
              fill="oklch(0.2 0.03 50)"
            />
          )}
          {config.hairStyle === 'curly' && (
            <>
              <circle cx="32" cy="30" r="8" fill="oklch(0.25 0.03 50)" />
              <circle cx="45" cy="22" r="9" fill="oklch(0.25 0.03 50)" />
              <circle cx="55" cy="22" r="9" fill="oklch(0.25 0.03 50)" />
              <circle cx="68" cy="30" r="8" fill="oklch(0.25 0.03 50)" />
              <circle cx="28" cy="42" r="6" fill="oklch(0.25 0.03 50)" />
              <circle cx="72" cy="42" r="6" fill="oklch(0.25 0.03 50)" />
            </>
          )}
          {config.hairStyle === 'bun' && (
            <>
              <path
                d="M 28 42 Q 30 25 50 22 Q 70 25 72 42"
                fill="oklch(0.2 0.03 50)"
              />
              <circle cx="50" cy="15" r="10" fill="oklch(0.2 0.03 50)" />
            </>
          )}

          {/* Eyes */}
          <g className="transition-all duration-300">
            <ellipse cx="40" cy={expression.eyeY} rx="4" ry="5" fill="white" />
            <ellipse cx="60" cy={expression.eyeY} rx="4" ry="5" fill="white" />
            <circle cx="40" cy={expression.eyeY} r="2.5" fill="oklch(0.3 0.05 240)" />
            <circle cx="60" cy={expression.eyeY} r="2.5" fill="oklch(0.3 0.05 240)" />
            <circle cx="41" cy={expression.eyeY - 1} r="1" fill="white" />
            <circle cx="61" cy={expression.eyeY - 1} r="1" fill="white" />
          </g>

          {/* Eyebrows */}
          <line
            x1="35"
            y1={expression.eyeY - 8}
            x2="45"
            y2={expression.eyeY - 9 + (mood === 'tired' ? 2 : 0)}
            stroke="oklch(0.3 0.03 50)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="55"
            y1={expression.eyeY - 9 + (mood === 'tired' ? 2 : 0)}
            x2="65"
            y2={expression.eyeY - 8}
            stroke="oklch(0.3 0.03 50)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Blush */}
          {expression.blush && (
            <>
              <ellipse cx="32" cy="52" rx="5" ry="3" fill="oklch(0.8 0.12 15)" opacity="0.4" />
              <ellipse cx="68" cy="52" rx="5" ry="3" fill="oklch(0.8 0.12 15)" opacity="0.4" />
            </>
          )}

          {/* Mouth */}
          <path
            d={`M 42 56 Q 50 ${56 + expression.mouthCurve} 58 56`}
            stroke="oklch(0.5 0.12 20)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Score badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
          {score}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {message}
        </p>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          Mood: {mood}
        </p>
      </div>
    </div>
  )
}
