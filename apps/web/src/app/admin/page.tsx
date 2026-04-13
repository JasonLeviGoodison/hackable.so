'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setIsAdmin(user.role === 'admin')
      } catch {}
    }
    setChecking(false)
  }, [])

  if (checking) return <p className="text-stone-400 py-12 text-sm">Checking permissions...</p>

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto text-center py-20">
        <h1 className="text-lg font-semibold text-stone-900 mb-2">Access Denied</h1>
        <p className="text-stone-400 text-sm mb-6">Admin privileges required.</p>
        <Link href="/dashboard" className="btn-secondary text-sm">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-stone-900 mb-1">Admin</h1>
      <p className="text-stone-400 text-sm mb-8">System administration</p>

      <div className="space-y-3">
        <Link href="/admin/users" className="card block hover:border-stone-300 transition-colors">
          <h3 className="text-stone-900 font-medium text-sm">User Management</h3>
          <p className="text-stone-400 text-sm mt-0.5">View and manage all accounts</p>
        </Link>
        <Link href="/admin/config" className="card block hover:border-stone-300 transition-colors">
          <h3 className="text-stone-900 font-medium text-sm">System Configuration</h3>
          <p className="text-stone-400 text-sm mt-0.5">Settings and API keys</p>
        </Link>
      </div>
    </div>
  )
}
