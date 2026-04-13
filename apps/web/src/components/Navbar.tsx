'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-stone-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-base font-semibold tracking-tight text-stone-900">
          hackable.so
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-stone-500 text-sm hidden sm:inline">
              {user.full_name || user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-stone-400 hover:text-stone-900 text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
