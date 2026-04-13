'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiGet } from '@/lib/api'
import { sanitizeHtml } from '@/lib/sanitize'

export default function PostDetailPage() {
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPost() {
      try {
        const token = localStorage.getItem('token')
        const data = await apiGet(`/api/posts/${params.id}`, token || undefined)
        setPost(data.post || data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  if (loading) return <p className="text-stone-400 py-12 text-sm">Loading...</p>
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  )
  if (!post) return <p className="text-stone-400 py-12 text-sm">Post not found.</p>

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="text-stone-400 hover:text-stone-900 text-sm mb-4 inline-block">
        &larr; Back
      </Link>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-stone-300 text-xs">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-xl font-semibold text-stone-900 mb-4">{post.title}</h1>

        <div
          className="text-stone-600 leading-relaxed text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        <div className="mt-6 pt-4 border-t border-stone-100">
          <p className="text-stone-400 text-xs">
            Employee #{post.author_id} &middot; Post #{post.id}
          </p>
        </div>
      </div>
    </div>
  )
}
