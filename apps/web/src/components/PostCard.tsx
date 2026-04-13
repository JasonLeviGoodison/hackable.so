import Link from 'next/link'
import { sanitizeHtml } from '@/lib/sanitize'

interface Post {
  id: number
  title: string
  content: string
  category: string
  author_id: number
  created_at: string
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/dashboard/posts/${post.id}`} className="block">
      <div className="card hover:border-stone-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-medium text-stone-900">{post.title}</h3>
          <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
        </div>
        <div
          className="text-stone-500 text-sm line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
          <span className="text-stone-400 text-xs">
            #{post.id} &middot; Employee #{post.author_id}
          </span>
          <span className="text-stone-300 text-xs">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
