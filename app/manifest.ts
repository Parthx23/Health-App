import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WellNest – Your Wellness Companion',
    short_name: 'WellNest',
    description: 'Track habits, grow your garden, and prevent burnout.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a2e',
    theme_color: '#2a2520',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/0001-9118036015437569928.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any' as const,
      },
      {
        src: '/0001-9118036015437569928.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable' as const,
      },
      {
        src: '/0001-9118036015437569928.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any' as const,
      },
      {
        src: '/0001-9118036015437569928.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable' as const,
      },
    ],
    screenshots: [],
    categories: ['health', 'lifestyle'],
  }
}
