'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiPost } from '@/lib/api'

function generateThrowawayPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
  const bytes = new Uint32Array(10)

  crypto.getRandomValues(bytes)

  return Array.from(bytes, (value) => chars[value % chars.length]).join('')
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPassword(generateThrowawayPassword())
  }, [])

  const handleCopyPassword = async () => {
    if (!password) {
      return
    }

    try {
      await navigator.clipboard.writeText(password)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1500)
    } catch {
      setError('Failed to copy the generated password')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiPost('/api/auth/register', {
        email,
        full_name: fullName,
        password,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
            hackable.so
          </Link>
          <p className="text-stone-400 text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm font-medium text-center">
            This site is intentionally vulnerable. Do not use real passwords or personal information.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Demo User"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hackable.test"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
                Generated Password
              </label>
              <div className="flex gap-2">
                <input
                  id="password"
                  type="text"
                  value={password}
                  readOnly
                  className="w-full font-mono tracking-[0.12em] bg-stone-50"
                />
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  disabled={!password}
                  className="btn-secondary text-sm shrink-0 disabled:opacity-50"
                >
                  {copyState === 'copied' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-stone-400 text-xs mt-1.5">
                We generated a throwaway password for you. Save it if you want to log back in, but don&apos;t use a real one.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-stone-400 text-sm">
              Have an account?{' '}
              <Link href="/login" className="text-stone-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
