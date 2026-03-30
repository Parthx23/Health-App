'use client'

import { useMemo } from 'react'
import type { GardenState, GardenTheme } from '@/lib/types'

interface LivingGardenProps {
  gardenState: GardenState
  theme: GardenTheme
  className?: string
  isBackground?: boolean
}

export function LivingGarden({ gardenState, theme, className = '', isBackground = false }: LivingGardenProps) {
  const { flowersBloom, skyClarity, fogLevel, particleCount, leafEnergy } = gardenState

  // Generate sky colors based on theme and clarity
  const skyGradient = useMemo(() => {
    const themes = {
      sunrise: {
        top: `oklch(${0.75 + skyClarity * 0.002} 0.08 40)`,
        bottom: `oklch(${0.85 + skyClarity * 0.001} 0.12 85)`,
      },
      daylight: {
        top: `oklch(${0.7 + skyClarity * 0.002} 0.12 230)`,
        bottom: `oklch(${0.9 + skyClarity * 0.001} 0.05 200)`,
      },
      sunset: {
        top: `oklch(${0.5 + skyClarity * 0.002} 0.15 30)`,
        bottom: `oklch(${0.8 + skyClarity * 0.001} 0.15 60)`,
      },
      moonlight: {
        top: `oklch(${0.2 + skyClarity * 0.002} 0.05 260)`,
        bottom: `oklch(${0.35 + skyClarity * 0.002} 0.08 240)`,
      },
    }
    return themes[theme]
  }, [theme, skyClarity])

  // Generate flowers based on bloom level - positioned on the ground
  const flowers = useMemo(() => {
    const count = Math.floor(flowersBloom / 8)
    // Pre-defined heights to avoid hydration mismatch
    const heights = [12, 14, 10, 13, 11, 15, 12, 14, 10, 13, 11, 15]
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 8 + (i * 27) % 84,
      groundY: 84, // Where the stem meets the ground
      stemHeight: heights[i % heights.length],
      scale: 0.6 + (flowersBloom / 100) * 0.5,
      delay: i * 0.08,
      hue: [350, 45, 145, 280, 200, 30][i % 6],
    }))
  }, [flowersBloom])

  // Generate particles (butterflies/sparkles) based on stress relief - use seeded positions to avoid hydration mismatch
  const particles = useMemo(() => {
    const count = Math.floor(particleCount / 12)
    // Use deterministic "random" values based on index to avoid hydration mismatch
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return x - Math.floor(x)
    }
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: 10 + seededRandom(i * 3 + 1) * 80,
      startY: 15 + seededRandom(i * 3 + 2) * 45,
      duration: 5 + seededRandom(i * 3 + 3) * 4,
      delay: i * 0.4,
    }))
  }, [particleCount])

  // Generate grass blades based on activity/energy
  const grassBlades = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 1 + i * 3.3,
      height: 10 + (leafEnergy / 100) * 8,
      sway: leafEnergy > 50 ? 2.5 : 1.2,
    }))
  }, [leafEnergy])

  // Generate distant trees/hills for depth - use deterministic values
  const trees = useMemo(() => {
    const scales = [0.85, 1.0, 0.75, 0.95, 0.8] // Pre-defined scales to avoid hydration mismatch
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 8 + i * 22,
      scale: scales[i],
    }))
  }, [])

  const containerClass = isBackground 
    ? 'fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none'
    : `relative w-full h-48 md:h-64 overflow-hidden rounded-xl ${className}`

  return (
    <div className={containerClass}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skyGradient.top} />
            <stop offset="100%" stopColor={skyGradient.bottom} />
          </linearGradient>
          
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.58 0.12 145)" />
            <stop offset="100%" stopColor="oklch(0.42 0.1 130)" />
          </linearGradient>

          <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.52 0.1 140)" />
            <stop offset="100%" stopColor="oklch(0.48 0.08 135)" />
          </linearGradient>

          <filter id="fog" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={fogLevel / 25} />
          </filter>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="100" height="75" fill="url(#skyGradient)" />

        {/* Sun/Moon based on theme */}
        {theme !== 'moonlight' ? (
          <g filter="url(#glow)">
            <circle
              cx={theme === 'sunrise' ? 82 : theme === 'sunset' ? 18 : 50}
              cy={theme === 'sunrise' ? 22 : theme === 'sunset' ? 28 : 12}
              r="10"
              fill={`oklch(${0.92 + skyClarity * 0.001} 0.15 85)`}
              opacity={0.95}
            />
          </g>
        ) : (
          <g filter="url(#glow)">
            <circle
              cx="78"
              cy="18"
              r="7"
              fill="oklch(0.92 0.02 240)"
              opacity={0.85 + skyClarity * 0.001}
            />
            {/* Stars */}
            {Array.from({ length: 12 }).map((_, i) => {
              const starOpacities = [0.5, 0.7, 0.45, 0.8, 0.55, 0.65, 0.75, 0.5, 0.6, 0.7, 0.55, 0.8]
              return (
                <circle
                  key={i}
                  cx={10 + (i * 29) % 85}
                  cy={8 + (i * 13) % 35}
                  r="0.3"
                  fill="white"
                  opacity={starOpacities[i]}
                />
              )
            })}
          </g>
        )}

        {/* Clouds */}
        <g opacity={0.4 + (100 - skyClarity) * 0.004}>
          <ellipse cx="22" cy="16" rx="14" ry="6" fill="white" />
          <ellipse cx="28" cy="14" rx="9" ry="5" fill="white" />
          <ellipse cx="72" cy="22" rx="12" ry="5" fill="white" />
          <ellipse cx="78" cy="20" rx="7" ry="4" fill="white" />
          <ellipse cx="50" cy="12" rx="10" ry="4" fill="white" opacity="0.6" />
        </g>

        {/* Distant hills */}
        <ellipse cx="25" cy="68" rx="30" ry="12" fill="url(#hillGradient)" opacity="0.7" />
        <ellipse cx="75" cy="70" rx="35" ry="14" fill="url(#hillGradient)" opacity="0.6" />

        {/* Distant trees */}
        {trees.map((tree) => (
          <g key={tree.id} transform={`translate(${tree.x}, 60) scale(${tree.scale})`} opacity="0.5">
            <path
              d="M 0 0 L -4 12 L 4 12 Z"
              fill="oklch(0.4 0.12 140)"
            />
            <rect x="-0.5" y="12" width="1" height="4" fill="oklch(0.35 0.05 50)" />
          </g>
        ))}

        {/* Main ground */}
        <ellipse cx="50" cy="100" rx="70" ry="35" fill="url(#groundGradient)" />

        {/* Grass blades */}
        <g>
          {grassBlades.map((blade) => (
            <path
              key={blade.id}
              d={`M ${blade.x} 85 Q ${blade.x + blade.sway} ${85 - blade.height / 2} ${blade.x} ${85 - blade.height}`}
              stroke="oklch(0.52 0.16 135)"
              strokeWidth="0.6"
              fill="none"
              style={{
                transformOrigin: `${blade.x}px 85px`,
                animation: `wn-sway ${2.5 + blade.id * 0.08}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </g>

        {/* Flowers - rooted on the ground */}
        <g filter={fogLevel > 30 ? 'url(#fog)' : undefined}>
          {flowers.map((flower) => (
            <g
              key={flower.id}
              style={{
                transformOrigin: `${flower.x}px ${flower.groundY}px`,
                /* bloom-in: scale from 0 → flower.scale */
                transform: `scale(${flower.scale})`,
                animation: `wn-bloom 0.6s ease-out ${flower.delay}s both`,
              }}
            >
              {/* Stem - from ground up */}
              <line
                x1={flower.x}
                y1={flower.groundY}
                x2={flower.x}
                y2={flower.groundY - flower.stemHeight}
                stroke="oklch(0.48 0.12 140)"
                strokeWidth={0.6}
              />
              {/* Leaf on stem */}
              <ellipse
                cx={flower.x - 1.5}
                cy={flower.groundY - flower.stemHeight * 0.4}
                rx={1.5}
                ry={0.7}
                fill="oklch(0.5 0.14 138)"
                transform={`rotate(-35 ${flower.x - 1.5} ${flower.groundY - flower.stemHeight * 0.4})`}
              />
              {/* Flower head at top of stem */}
              <g transform={`translate(${flower.x}, ${flower.groundY - flower.stemHeight})`}>
                {/* Petals */}
                {[0, 72, 144, 216, 288].map((angle) => (
                  <ellipse
                    key={angle}
                    cx={Math.cos((angle * Math.PI) / 180) * 2}
                    cy={Math.sin((angle * Math.PI) / 180) * 2}
                    rx="1.6"
                    ry="2.2"
                    fill={`oklch(0.72 0.2 ${flower.hue})`}
                    transform={`rotate(${angle} 0 0)`}
                  />
                ))}
                {/* Center */}
                <circle cx="0" cy="0" r="1.1" fill="oklch(0.88 0.16 85)" />
              </g>
            </g>
          ))}
        </g>

        {/* Fog overlay */}
        {fogLevel > 20 && (
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="white"
            opacity={fogLevel * 0.005}
          />
        )}

        {/* Particles (butterflies/sparkles) */}
        {particles.map((particle) => (
          <g
            key={particle.id}
            style={{
              animation: `wn-float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          >
            <path
              d={`M ${particle.startX} ${particle.startY} q -2 -1.2 -1.2 -3 q 0.6 -1.8 1.2 0.6 q 0.6 -2.4 1.2 -0.6 q 0.6 1.8 -1.2 3`}
              fill={theme === 'moonlight' ? 'oklch(0.85 0.05 240)' : 'oklch(0.8 0.12 280)'}
              opacity="0.75"
            />
          </g>
        ))}
      </svg>

      {/* Dark overlay so garden doesn't overpower UI */}
      {isBackground && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 100%)' }}
        />
      )}

      <style>{`
        @keyframes wn-sway {
          0%   { transform: rotate(-4deg); }
          100% { transform: rotate(4deg); }
        }
        @keyframes wn-bloom {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1);  opacity: 1; }
        }
        @keyframes wn-float {
          0%, 100% { transform: translate(0,    0); }
          25%       { transform: translate(6px, -4px); }
          50%       { transform: translate(3px, -8px); }
          75%       { transform: translate(-4px,-3px); }
        }
      `}</style>
    </div>
  )
}
