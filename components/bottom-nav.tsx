'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Calendar, User, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/insights', label: 'Insights', icon: BarChart2 },
  { href: '/monthly', label: 'Monthly', icon: Calendar },
  { href: '/avatar', label: 'Garden', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-100 dark:bg-zinc-900 border-t border-border/50 safe-bottom">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
