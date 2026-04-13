'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await apiPost('/api/posts', { title, content, category }, token || undefined)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">New Post</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1.5">
              Title
            </label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" required className="w-full" />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-1.5">
              Category
            </label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full">
              <option value="general">General</option>
              <option value="engineering">Engineering</option>
              <option value="announcement">Announcement</option>
              <option value="hr">HR</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-stone-700 mb-1.5">
              Content
            </label>
            <p className="text-stone-400 text-xs mb-1.5">HTML formatting supported.</p>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post..." rows={6} required className="w-full" />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-50">
              {loading ? 'Publishing...' : 'Publish'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
