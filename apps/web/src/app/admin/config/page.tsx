'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import Link from 'next/link'

export default function AdminConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchConfig() {
      try {
        const token = localStorage.getItem('token')
        const data = await apiGet('/api/admin/config', token || undefined)
        setConfig(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Configuration</h1>
        <Link href="/admin" className="text-stone-400 hover:text-stone-900 text-sm">&larr; Admin</Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-stone-400 text-center py-12 text-sm">Loading...</p>
      ) : config ? (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-medium text-stone-700 mb-3">Application</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-stone-400 text-xs">Name</p>
                <p className="text-stone-700">{config.app}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs">Version</p>
                <p className="text-stone-700">{config.version}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs">Environment</p>
                <p className="text-stone-700">{config.environment}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs">JWT Secret</p>
                <p className="text-stone-700 font-mono text-xs">{config.jwt_secret}</p>
              </div>
            </div>
          </div>

          {config.database && (
            <div className="card">
              <h2 className="text-sm font-medium text-stone-700 mb-3">Database</h2>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-stone-400 text-xs">Host</p>
                  <p className="text-stone-700 font-mono text-xs">{config.database.host}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Port</p>
                  <p className="text-stone-700 font-mono text-xs">{config.database.port}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Database</p>
                  <p className="text-stone-700 font-mono text-xs">{config.database.name}</p>
                </div>
              </div>
            </div>
          )}

          {config.flags && (
            <div className="card">
              <h2 className="text-sm font-medium text-stone-700 mb-3">Flags</h2>
              <div className="space-y-2">
                {Object.entries(config.flags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-stone-50 last:border-0">
                    <span className="text-stone-400 text-xs">{key}</span>
                    <code className="text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded">{String(value)}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
