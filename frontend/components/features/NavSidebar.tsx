'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'History',   href: '/history',   icon: History },
  { label: 'Settings',  href: '/settings',  icon: Settings },
]

export default function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside className="
      fixed left-0 top-0 bottom-0
      w-64 bg-healy-surface border-r border-healy-border
      flex flex-col
      z-40
    ">
      {/* Logo */}
      <div className="p-6 border-b border-healy-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="
            w-10 h-10 rounded-xl
            bg-healy-sage
            flex items-center justify-center
            shadow-glow
            transition-transform duration-200
            group-hover:scale-105
          ">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-healy-graphite tracking-tight">
              HEALY
            </h1>
            <p className="text-[10px] font-body text-healy-slate -mt-0.5">
              Health Observer
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                font-body text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-healy-sage/10 text-healy-sage-dark shadow-sm'
                    : 'text-healy-slate hover:bg-healy-bg-alt hover:text-healy-graphite'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-healy-sage' : ''}`} />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-healy-sage" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-healy-border">
        <button
          className="
            flex items-center gap-3 w-full px-4 py-3 rounded-xl
            font-body text-sm font-medium text-healy-slate
            hover:bg-healy-critical/5 hover:text-healy-critical
            transition-all duration-200
          "
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
