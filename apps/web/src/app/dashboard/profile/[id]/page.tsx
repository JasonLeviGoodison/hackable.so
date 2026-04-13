'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiGet } from '@/lib/api'

export default function ProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('token')
        const data = await apiGet(`/api/users/${params.id}`, token || undefined)
        setUser(data.user || data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [params.id])

  if (loading) return <p className="text-stone-400 py-12 text-sm">Loading...</p>
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  )
  if (!user) return <p className="text-stone-400 py-12 text-sm">User not found.</p>

  return (
    <div className="max-w-lg">
      <Link href="/dashboard" className="text-stone-400 hover:text-stone-900 text-sm mb-4 inline-block">
        &larr; Back
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
            <span className="text-stone-500 text-sm font-medium">
              {user.full_name ? user.full_name.charAt(0) : '?'}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-900">{user.full_name}</h1>
            <p className="text-stone-400 text-sm">{user.role} &middot; {user.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400 text-xs mb-0.5">Email</p>
            <p className="text-stone-700">{user.email}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs mb-0.5">Phone</p>
            <p className="text-stone-700">{user.phone || '—'}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs mb-0.5">Department</p>
            <p className="text-stone-700">{user.department || '—'}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs mb-0.5">Role</p>
            <p className="text-stone-700 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-100">
          <p className="text-stone-300 text-xs">User #{user.id}</p>
        </div>
      </div>
    </div>
  )
}
