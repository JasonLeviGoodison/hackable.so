'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const data = await apiGet('/api/admin/users', token || undefined)
        setUsers(data.users || data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Users</h1>
        <Link href="/admin" className="text-stone-400 hover:text-stone-900 text-sm">&larr; Admin</Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-stone-400 text-center py-12 text-sm">Loading...</p>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-[11px] font-medium text-stone-400 uppercase tracking-wider py-3 px-4">ID</th>
                <th className="text-left text-[11px] font-medium text-stone-400 uppercase tracking-wider py-3 px-4">Name</th>
                <th className="text-left text-[11px] font-medium text-stone-400 uppercase tracking-wider py-3 px-4">Email</th>
                <th className="text-left text-[11px] font-medium text-stone-400 uppercase tracking-wider py-3 px-4">Role</th>
                <th className="text-left text-[11px] font-medium text-stone-400 uppercase tracking-wider py-3 px-4">Dept</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="py-2.5 px-4 text-stone-400 text-sm">{user.id}</td>
                  <td className="py-2.5 px-4 text-stone-900 text-sm font-medium">
                    <Link href={`/dashboard/profile/${user.id}`} className="hover:underline">{user.full_name}</Link>
                  </td>
                  <td className="py-2.5 px-4 text-stone-500 text-sm">{user.email}</td>
                  <td className="py-2.5 px-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-red-50 text-red-600' :
                      user.role === 'manager' ? 'bg-amber-50 text-amber-600' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-stone-500 text-sm">{user.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
