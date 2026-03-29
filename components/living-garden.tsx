'use client'

import { useMemo } from 'react'
import type { GardenState, GardenTheme } from '@/lib/types'

interface LivingGardenProps {
  gardenState: GardenState
  theme: GardenTheme
  className?: string
}

export function LivingGarden({ gardenState, theme, className = '' }: LivingGardenProps) {
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

  // Generate flowers based on bloom level
  const flowers = useMemo(() => {
    const count = Math.floor(flowersBloom / 10)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 10 + (i * 37) % 80,
      y: 65 + Math.sin(i * 2.5) * 8,
      scale: 0.5 + (flowersBloom / 100) * 0.5,
      delay: i * 0.1,
      hue: [350, 45, 145, 280, 200][i % 5],
    }))
  }, [flowersBloom])

  // Generate particles (butterflies/sparkles) based on stress relief
  const particles = useMemo(() => {
    const count = Math.floor(particleCount / 15)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: 10 + Math.random() * 80,
      startY: 20 + Math.random() * 40,
      duration: 4 + Math.random() * 3,
      delay: i * 0.5,
    }))
  }, [particleCount])

  // Generate grass blades based on activity/energy
  const grassBlades = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 2 + i * 5,
      height: 8 + (leafEnergy / 100) * 6,
      sway: leafEnergy > 50 ? 2 : 1,
    }))
  }, [leafEnergy])

  return (
    <div className={`relative w-full h-48 md:h-64 overflow-hidden rounded-xl ${className}`}>
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
            <stop offset="0%" stopColor="oklch(0.55 0.12 145)" />
            <stop offset="100%" stopColor="oklch(0.4 0.1 130)" />
          </linearGradient>

          <filter id="fog" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={fogLevel / 25} />
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="100" height="70" fill="url(#skyGradient)" />

        {/* Sun/Moon based on theme */}
        {theme !== 'moonlight' ? (
          <circle
            cx={theme === 'sunrise' ? 80 : theme === 'sunset' ? 20 : 50}
            cy={theme === 'sunrise' ? 25 : theme === 'sunset' ? 30 : 15}
            r="8"
            fill={`oklch(${0.9 + skyClarity * 0.001} 0.15 85)`}
            opacity={0.9}
          />
        ) : (
          <circle
            cx="75"
            cy="20"
            r="6"
            fill="oklch(0.9 0.02 240)"
            opacity={0.8 + skyClarity * 0.002}
          />
        )}

        {/* Clouds */}
        <g opacity={0.3 + (100 - skyClarity) * 0.005}>
          <ellipse cx="25" cy="18" rx="12" ry="5" fill="white" />
          <ellipse cx="30" cy="16" rx="8" ry="4" fill="white" />
          <ellipse cx="70" cy="25" rx="10" ry="4" fill="white" />
        </g>

        {/* Ground */}
        <ellipse cx="50" cy="95" rx="60" ry="30" fill="url(#groundGradient)" />

        {/* Grass blades */}
        <g>
          {grassBlades.map((blade) => (
            <path
              key={blade.id}
              d={`M ${blade.x} 82 Q ${blade.x + blade.sway} ${82 - blade.height / 2} ${blade.x} ${82 - blade.height}`}
              stroke="oklch(0.5 0.15 135)"
              strokeWidth="0.5"
              fill="none"
              className="origin-bottom"
              style={{
                animation: `sway ${2 + blade.id * 0.1}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </g>

        {/* Flowers */}
        <g filter={fogLevel > 30 ? 'url(#fog)' : undefined}>
          {flowers.map((flower) => (
            <g
              key={flower.id}
              transform={`translate(${flower.x}, ${flower.y}) scale(${flower.scale})`}
              className="origin-center"
              style={{
                animation: `bloom 0.5s ease-out ${flower.delay}s both`,
              }}
            >
              {/* Stem */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="oklch(0.5 0.12 140)"
                strokeWidth="0.4"
              />
              {/* Petals */}
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx={Math.cos((angle * Math.PI) / 180) * 2}
                  cy={Math.sin((angle * Math.PI) / 180) * 2 - 1}
                  rx="1.5"
                  ry="2"
                  fill={`oklch(0.7 0.18 ${flower.hue})`}
                  transform={`rotate(${angle} 0 -1)`}
                />
              ))}
              {/* Center */}
              <circle cx="0" cy="-1" r="1" fill="oklch(0.85 0.15 85)" />
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
            opacity={fogLevel * 0.004}
          />
        )}

        {/* Particles (butterflies/sparkles) */}
        {particles.map((particle) => (
          <g
            key={particle.id}
            style={{
              animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          >
            <path
              d={`M ${particle.startX} ${particle.startY} 
                  q -1.5 -1 -1 -2.5 q 0.5 -1.5 1 0.5 
                  q 0.5 -2 1 -0.5 q 0.5 1.5 -1 2.5`}
              fill="oklch(0.8 0.1 280)"
              opacity="0.7"
              className="origin-center"
            />
          </g>
        ))}
      </svg>

      <style jsx>{`
        @keyframes sway {
          0% {
            transform: rotate(-3deg);
          }
          100% {
            transform: rotate(3deg);
          }
        }
        @keyframes bloom {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(${flowersBloom / 100});
            opacity: 1;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(5px, -3px);
          }
          50% {
            transform: translate(2px, -6px);
          }
          75% {
            transform: translate(-3px, -2px);
          }
        }
      `}</style>
    </div>
  )
}
