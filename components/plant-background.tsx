'use client'

import { useTodayLog, useTargets } from '@/lib/store'

export function PlantBackground() {
  const todayLog = useTodayLog()
  const targets = useTargets()

  /* Sync plant stage with activity habit */
  const activityTarget = targets.activity || 30
  const activityCurrent = todayLog.activity || 0
  const activityRatio = Math.min(activityCurrent / activityTarget, 1)

  const stage =
    activityRatio === 0   ? 0 :
    activityRatio <= 0.20 ? 1 :
    activityRatio <= 0.45 ? 2 :
    activityRatio <= 0.70 ? 3 :
    activityRatio <  1.0  ? 4 : 5

  const sO = (s: number) => (stage >= s ? 1 : 0)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: '100dvh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes plSway {
          0%,100% { transform: rotate(-1.2deg); }
          50%      { transform: rotate( 1.2deg); }
        }
        @keyframes birdFloat {
          0%,100% { transform: translateY(0px) translateX(0px); }
          33%      { transform: translateY(-6px) translateX(3px); }
          66%      { transform: translateY(-3px) translateX(-2px); }
        }
        @keyframes birdWing {
          0%,100% { transform: scaleY(1);   }
          50%      { transform: scaleY(-0.4); }
        }
        .wn-pl-sway {
          animation: plSway 5s ease-in-out infinite;
          transform-origin: 100px 265px;
        }
        .wn-pl-sway-s2 { animation-duration: 5.5s; animation-delay: 0.3s; }
        .wn-pl-sway-s3 { animation-duration: 6s;   animation-delay: 0.6s; }
        .wn-pl-sway-s4 { animation-duration: 6.5s; animation-delay: 0.9s; }
        .wn-pl-sway-s5 { animation-duration: 7s;   animation-delay: 1.2s; }
        .wn-bird { animation: birdFloat 4s ease-in-out infinite; }
        .wn-bird-2 { animation-delay: 1.1s; animation-duration: 4.5s; }
        .wn-bird-3 { animation-delay: 0.5s; animation-duration: 3.8s; }
        .wn-bird path { animation: birdWing 0.7s ease-in-out infinite; transform-origin: center; }
        .wn-bird-2 path { animation-duration: 0.85s; animation-delay: 0.2s; }
        .wn-bird-3 path { animation-duration: 0.65s; animation-delay: 0.4s; }
      `}</style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 320"
        aria-hidden="true"
        role="img"
        style={{
          width: 'min(460px, 110%)',
          height: 'auto',
          opacity: 0.95,
          display: 'block',
          flexShrink: 0,
          marginBottom: 72,
          filter: 'saturate(1.3)',
        }}
      >
        <defs>
          <linearGradient id="wn-pot-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#d4845a"/>
            <stop offset="100%" stopColor="#8b4513"/>
          </linearGradient>
          <radialGradient id="wn-soil-g" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#6b4226"/>
            <stop offset="100%" stopColor="#3e2010"/>
          </radialGradient>
          <linearGradient id="wn-leaf-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#81c784"/>
            <stop offset="100%" stopColor="#388e3c"/>
          </linearGradient>
          <linearGradient id="wn-leaf-g2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#66bb6a"/>
            <stop offset="100%" stopColor="#2e7d32"/>
          </linearGradient>
          <linearGradient id="wn-leaf-g3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#4caf50"/>
            <stop offset="100%" stopColor="#1b5e20"/>
          </linearGradient>
          <filter id="wn-leaf-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1b5e20" floodOpacity="0.18"/>
          </filter>
        </defs>

        {/* ── Pot & Soil ── */}
        <g>
          <path d="M 57 265 L 43 308 L 157 308 L 143 265 Z" fill="url(#wn-pot-g)"/>
          <rect x="46" y="257" width="108" height="13" rx="6.5" fill="#c4703d"/>
          <rect x="54" y="260" width="28"  height="3.5" rx="1.75" fill="#e08a5a" opacity="0.55"/>
          <ellipse cx="100" cy="305" rx="9"  ry="3"    fill="#7a3a16" opacity="0.35"/>
          <ellipse cx="100" cy="263" rx="49" ry="10"   fill="url(#wn-soil-g)"/>
          <ellipse cx="88"  cy="262" rx="13" ry="3.5"  fill="#3e2010" opacity="0.35"/>
          <ellipse cx="113" cy="264" rx="8"  ry="2.5"  fill="#3e2010" opacity="0.25"/>
        </g>

        {/* ── Stage 0: Seed ── */}
        <g style={{ opacity: stage === 0 ? 1 : 0, transition: 'opacity 0.8s' }}>
          <ellipse cx="100" cy="259" rx="6"   ry="4.5" fill="#5c3d1e"/>
          <ellipse cx="100" cy="257" rx="3"   ry="2"   fill="#7a5535" opacity="0.6"/>
        </g>

        {/* ── Stage 1: First sprout ── */}
        <g className="wn-pl-sway" style={{ opacity: sO(1), transition: 'opacity 1s', transformOrigin: '100px 265px' }}>
          <path d="M 100 261 Q 101 244 99 230" stroke="#66bb6a" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M 99 234 C 92 226 78 224 76 232 C 74 239 87 243 99 237" fill="url(#wn-leaf-g1)" filter="url(#wn-leaf-sh)"/>
          <path d="M 100 234 C 107 226 121 224 123 232 C 125 239 112 243 100 237" fill="url(#wn-leaf-g1)" filter="url(#wn-leaf-sh)"/>
        </g>

        {/* ── Stage 2: Growing stem + first real leaves ── */}
        <g className="wn-pl-sway wn-pl-sway-s2" style={{ opacity: sO(2), transition: 'opacity 1s', transformOrigin: '100px 265px' }}>
          <path d="M 99 230 Q 96 210 102 194" stroke="#4caf50" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
          <path d="M 101 213 C 88 202 68 198 63 210 C 59 221 76 229 101 220" fill="url(#wn-leaf-g2)" filter="url(#wn-leaf-sh)"/>
          <path d="M 101 213 Q 82 215 63 210" stroke="#388e3c" strokeWidth="0.9" fill="none" opacity="0.5"/>
          <path d="M 101 210 C 114 200 134 196 139 207 C 143 218 126 226 101 217" fill="url(#wn-leaf-g2)" filter="url(#wn-leaf-sh)"/>
          <path d="M 101 210 Q 120 212 139 207" stroke="#388e3c" strokeWidth="0.9" fill="none" opacity="0.5"/>
          <ellipse cx="102" cy="193" rx="4" ry="6" fill="#a5d6a7"/>
        </g>

        {/* ── Stage 3: Taller + second leaf pair ── */}
        <g className="wn-pl-sway wn-pl-sway-s3" style={{ opacity: sO(3), transition: 'opacity 1s', transformOrigin: '100px 265px' }}>
          <path d="M 102 194 Q 98 172 105 155" stroke="#388e3c" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 103 174 C 86 158 60 153 54 169 C 49 183 70 192 103 181" fill="url(#wn-leaf-g2)" filter="url(#wn-leaf-sh)"/>
          <path d="M 103 174 Q 78 175 54 169" stroke="#2e7d32" strokeWidth="0.8" fill="none" opacity="0.45"/>
          <path d="M 103 172 C 120 156 146 151 152 167 C 157 181 136 190 103 179" fill="url(#wn-leaf-g2)" filter="url(#wn-leaf-sh)"/>
          <path d="M 103 172 Q 128 173 152 167" stroke="#2e7d32" strokeWidth="0.8" fill="none" opacity="0.45"/>
          <path d="M 105 157 C 100 148 106 142 111 147 C 114 151 112 158 105 161" fill="#a5d6a7"/>
        </g>

        {/* ── Stage 4: Full plant + birds ── */}
        <g className="wn-pl-sway wn-pl-sway-s4" style={{ opacity: sO(4), transition: 'opacity 1s', transformOrigin: '100px 265px' }}>
          <path d="M 105 155 Q 101 133 108 118" stroke="#2e7d32" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M 104 138 C 83 120 52 114 45 133 C 39 149 62 160 104 148" fill="url(#wn-leaf-g3)" filter="url(#wn-leaf-sh)"/>
          <path d="M 104 138 Q 78 140 45 133" stroke="#1b5e20" strokeWidth="0.8" fill="none" opacity="0.4"/>
          <path d="M 106 136 C 127 118 158 112 165 131 C 171 147 148 158 106 146" fill="url(#wn-leaf-g3)" filter="url(#wn-leaf-sh)"/>
          {/* Bird 1 – near left */}
          <g className="wn-bird" transform="translate(38 118)">
            <path d="M -7 0 Q -3.5 -4 0 0 Q 3.5 -4 7 0" stroke="#4a7c59" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          </g>
          {/* Bird 2 – near right */}
          <g className="wn-bird wn-bird-2" transform="translate(162 112)">
            <path d="M -6 0 Q -3 -3.5 0 0 Q 3 -3.5 6 0" stroke="#4a7c59" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          </g>
        </g>

        {/* ── Stage 5: Full bloom + birds ── */}
        <g className="wn-pl-sway wn-pl-sway-s5" style={{ opacity: sO(5), transition: 'opacity 1.2s', transformOrigin: '100px 265px' }}>
          <path d="M 108 118 Q 104 100 106 86" stroke="#1b5e20" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          <path d="M 106 98 C 90 80 65 75 58 90 C 52 103 72 112 106 101" fill="url(#wn-leaf-g3)" filter="url(#wn-leaf-sh)"/>
          <path d="M 107 96 C 122 78 147 73 154 88 C 160 101 140 110 107 99" fill="url(#wn-leaf-g3)" filter="url(#wn-leaf-sh)"/>
          {/* Bird 1 – upper left */}
          <g className="wn-bird" transform="translate(52 72)">
            <path d="M -9 0 Q -4.5 -5 0 0 Q 4.5 -5 9 0" stroke="#2e7d32" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          </g>
          {/* Bird 2 – upper right */}
          <g className="wn-bird wn-bird-2" transform="translate(152 68)">
            <path d="M -8 0 Q -4 -4.5 0 0 Q 4 -4.5 8 0" stroke="#2e7d32" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </g>
          {/* Bird 3 – top center floating higher */}
          <g className="wn-bird wn-bird-3" transform="translate(100 55)">
            <path d="M -10 0 Q -5 -6 0 0 Q 5 -6 10 0" stroke="#388e3c" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
          </g>
        </g>

      </svg>
    </div>
  )
}
