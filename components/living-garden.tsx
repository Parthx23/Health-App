'use client'

import { useMemo, useEffect, useState } from 'react'
import type { GardenState, GardenTheme } from '@/lib/types'

interface LivingGardenProps {
  gardenState: GardenState
  theme: GardenTheme
  className?: string
  isBackground?: boolean
}

export function LivingGarden({ gardenState, theme, className = '', isBackground = false }: LivingGardenProps) {
  const { flowersBloom, skyClarity, fogLevel, particleCount, leafEnergy } = gardenState
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Track mount state for hydration-safe rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Track scroll for parallax effect
  useEffect(() => {
    if (!isBackground) return

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isBackground])

  // Parallax offsets for different layers
  const skyOffset = scrollY * 0.1
  const hillsOffset = scrollY * 0.2
  const treesOffset = scrollY * 0.3
  const groundOffset = scrollY * 0.4
  const flowersOffset = scrollY * 0.5

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
    const count = Math.floor(flowersBloom / 8)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 5 + (i * 31) % 90,
      y: 70 + Math.sin(i * 2.5) * 6,
      scale: 0.6 + (flowersBloom / 100) * 0.6,
      delay: i * 0.08,
      hue: [350, 45, 145, 280, 200, 30][i % 6],
    }))
  }, [flowersBloom])

  // Pre-defined particle positions to avoid hydration mismatch
  const staticParticles = [
    { id: 0, startX: 15, startY: 20, duration: 5.5, delay: 0 },
    { id: 1, startX: 35, startY: 35, duration: 6.2, delay: 0.4 },
    { id: 2, startX: 55, startY: 25, duration: 5.8, delay: 0.8 },
    { id: 3, startX: 75, startY: 40, duration: 6.5, delay: 1.2 },
    { id: 4, startX: 25, startY: 50, duration: 5.3, delay: 1.6 },
    { id: 5, startX: 65, startY: 30, duration: 6.0, delay: 2.0 },
    { id: 6, startX: 45, startY: 45, duration: 5.7, delay: 2.4 },
    { id: 7, startX: 85, startY: 22, duration: 6.3, delay: 2.8 },
  ]
  
  const particles = useMemo(() => {
    const count = Math.min(Math.floor(particleCount / 12), staticParticles.length)
    return staticParticles.slice(0, count)
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
    ? 'fixed inset-0 w-full h-full -z-10 overflow-hidden'
    : `relative w-full h-48 md:h-64 overflow-hidden rounded-xl ${className}`

  return (
    <div className={containerClass}>
      {/* Sky layer - slowest parallax */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-[120%] transition-transform duration-75 ease-out"
        style={{ transform: isBackground ? `translateY(${-skyOffset * 0.1}px)` : undefined }}
      >
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skyGradient.top} />
            <stop offset="100%" stopColor={skyGradient.bottom} />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="100" height="100" fill="url(#skyGradient)" />

        {/* Sun/Moon based on theme */}
        {theme !== 'moonlight' ? (
          <g>
            <circle
              cx={theme === 'sunrise' ? 82 : theme === 'sunset' ? 18 : 50}
              cy={theme === 'sunrise' ? 22 : theme === 'sunset' ? 28 : 12}
              r="10"
              fill={`oklch(${0.92 + skyClarity * 0.001} 0.15 85)`}
              opacity={0.95}
              filter="url(#glow)"
            />
            {/* Sun glow */}
            <circle
              cx={theme === 'sunrise' ? 82 : theme === 'sunset' ? 18 : 50}
              cy={theme === 'sunrise' ? 22 : theme === 'sunset' ? 28 : 12}
              r="14"
              fill={`oklch(${0.92 + skyClarity * 0.001} 0.1 85)`}
              opacity={0.3}
            />
          </g>
        ) : (
          <g>
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
      </svg>

      {/* Hills layer - medium-slow parallax */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-[130%] top-auto bottom-0 transition-transform duration-75 ease-out"
        style={{ transform: isBackground ? `translateY(${-hillsOffset * 0.08}px)` : undefined }}
      >
        <defs>
          <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.52 0.1 140)" />
            <stop offset="100%" stopColor="oklch(0.48 0.08 135)" />
          </linearGradient>
        </defs>

        {/* Distant hills */}
        <ellipse cx="25" cy="68" rx="30" ry="12" fill="url(#hillGradient)" opacity="0.7" />
        <ellipse cx="75" cy="70" rx="35" ry="14" fill="url(#hillGradient)" opacity="0.6" />
        <ellipse cx="50" cy="72" rx="28" ry="10" fill="url(#hillGradient)" opacity="0.5" />
      </svg>

      {/* Trees layer - medium parallax */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-[140%] top-auto bottom-0 transition-transform duration-75 ease-out"
        style={{ transform: isBackground ? `translateY(${-treesOffset * 0.06}px)` : undefined }}
      >
        {/* Distant trees */}
        {trees.map((tree) => (
          <g key={tree.id} transform={`translate(${tree.x}, 56) scale(${tree.scale})`} opacity="0.6">
            <path
              d="M 0 0 L -5 14 L 5 14 Z"
              fill="oklch(0.4 0.12 140)"
            />
            <path
              d="M 0 -4 L -4 10 L 4 10 Z"
              fill="oklch(0.45 0.13 142)"
            />
            <rect x="-0.7" y="14" width="1.4" height="5" fill="oklch(0.35 0.05 50)" />
          </g>
        ))}
      </svg>

      {/* Ground and grass layer - medium-fast parallax */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-[150%] top-auto bottom-0 transition-transform duration-75 ease-out"
        style={{ transform: isBackground ? `translateY(${-groundOffset * 0.04}px)` : undefined }}
      >
        <defs>
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.58 0.12 145)" />
            <stop offset="100%" stopColor="oklch(0.42 0.1 130)" />
          </linearGradient>
          <filter id="fog" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={fogLevel / 25} />
          </filter>
        </defs>

        {/* Main ground */}
        <ellipse cx="50" cy="110" rx="80" ry="40" fill="url(#groundGradient)" />

        {/* Grass blades */}
        <g>
          {grassBlades.map((blade) => (
            <path
              key={blade.id}
              d={`M ${blade.x} 82 Q ${blade.x + blade.sway} ${82 - blade.height / 2} ${blade.x} ${82 - blade.height}`}
              stroke="oklch(0.52 0.16 135)"
              strokeWidth="0.6"
              fill="none"
              className="origin-bottom"
              style={{
                animation: `sway ${2.5 + blade.id * 0.08}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* Flowers layer - fastest parallax (foreground) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-[160%] top-auto bottom-0 transition-transform duration-75 ease-out"
        style={{ transform: isBackground ? `translateY(${-flowersOffset * 0.03}px)` : undefined }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Flowers */}
        <g filter={fogLevel > 30 ? 'url(#fog)' : undefined}>
          {flowers.map((flower) => (
            <g
              key={flower.id}
              transform={`translate(${flower.x}, ${flower.y - 5}) scale(${flower.scale})`}
              className="origin-center"
              style={{
                animation: `bloom 0.6s ease-out ${flower.delay}s both`,
              }}
            >
              {/* Stem */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="12"
                stroke="oklch(0.48 0.12 140)"
                strokeWidth="0.5"
              />
              {/* Leaf */}
              <ellipse
                cx="-1.5"
                cy="7"
                rx="1.2"
                ry="0.6"
                fill="oklch(0.5 0.14 138)"
                transform="rotate(-30 -1.5 7)"
              />
              <ellipse
                cx="1.5"
                cy="9"
                rx="1.2"
                ry="0.6"
                fill="oklch(0.5 0.14 138)"
                transform="rotate(30 1.5 9)"
              />
              {/* Petals */}
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx={Math.cos((angle * Math.PI) / 180) * 2.2}
                  cy={Math.sin((angle * Math.PI) / 180) * 2.2 - 1}
                  rx="1.8"
                  ry="2.5"
                  fill={`oklch(0.72 0.2 ${flower.hue})`}
                  transform={`rotate(${angle} 0 -1)`}
                />
              ))}
              {/* Center */}
              <circle cx="0" cy="-1" r="1.2" fill="oklch(0.88 0.16 85)" />
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
      </svg>

      {/* Particles layer - floating above everything, only render after mount to avoid hydration issues */}
      {isMounted && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {particles.map((particle) => (
            <g
              key={particle.id}
              style={{
                animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
              }}
            >
              <path
                d={`M ${particle.startX} ${particle.startY} q -2 -1.2 -1.2 -3 q 0.6 -1.8 1.2 0.6 q 0.6 -2.4 1.2 -0.6 q 0.6 1.8 -1.2 3`}
                fill={theme === 'moonlight' ? 'oklch(0.85 0.05 240)' : 'oklch(0.8 0.12 280)'}
                opacity="0.75"
                className="origin-center"
              />
            </g>
          ))}
        </svg>
      )}

      <style jsx>{`
        @keyframes sway {
          0% {
            transform: rotate(-4deg);
          }
          100% {
            transform: rotate(4deg);
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
            transform: translate(6px, -4px);
          }
          50% {
            transform: translate(3px, -8px);
          }
          75% {
            transform: translate(-4px, -3px);
          }
        }
      `}</style>
    </div>
  )
}
