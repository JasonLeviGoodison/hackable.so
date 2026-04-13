'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const token = localStorage.getItem('token')
      const data = await apiGet('/api/posts', token || undefined)
      setPosts(data.posts || data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchPosts()
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const data = await apiGet(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`, token || undefined)
      setPosts(data.results || data.posts || data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Feed</h1>
          <p className="text-stone-400 text-sm mt-0.5">Latest updates from the team</p>
        </div>
        <Link href="/dashboard/posts/new" className="btn-primary text-sm">
          New Post
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1"
          />
          <button type="submit" className="btn-secondary text-sm">
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-stone-400 text-center py-12 text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-stone-400 text-center py-12 text-sm">No posts found.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
