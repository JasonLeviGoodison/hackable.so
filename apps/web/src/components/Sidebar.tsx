'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Feed' },
  { href: '/dashboard/posts/new', label: 'New Post' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/profile/1', label: 'My Profile' },
]

const adminItems = [
  { href: '/admin', label: 'Admin' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/config', label: 'Config' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-stone-200 min-h-[calc(100vh-49px)] py-5 px-3">
      <div className="space-y-0.5">
        <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-stone-100 text-stone-900 font-medium'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-8 space-y-0.5">
        <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider px-3 mb-2">
          Administration
        </p>
        {adminItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-stone-100 text-stone-900 font-medium'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-8 px-3">
        <p className="text-stone-300 text-xs">v2.1.4</p>
      </div>
    </aside>
  )
}
