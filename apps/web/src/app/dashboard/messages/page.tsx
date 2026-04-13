'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [recipientId, setRecipientId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchMessages() }, [])

  async function fetchMessages() {
    try {
      const token = localStorage.getItem('token')
      const data = await apiGet('/api/messages', token || undefined)
      setMessages(data.messages || data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await apiPost('/api/messages', { recipient_id: parseInt(recipientId), content }, token || undefined)
      setContent('')
      setRecipientId('')
      fetchMessages()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Messages</h1>

      <div className="card mb-6">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Send a Message</h2>
        <form onSubmit={handleSend} className="flex gap-2">
          <input type="number" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="User ID" required className="w-24" />
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message..." required className="flex-1" />
          <button type="submit" disabled={sending} className="btn-primary text-sm disabled:opacity-50">
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-stone-400 text-center py-12 text-sm">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="text-stone-400 text-center py-12 text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="card !p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-stone-400 text-xs">
                  #{msg.sender_id} &rarr; #{msg.recipient_id}
                </span>
                <span className="text-stone-300 text-xs">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-stone-700 text-sm">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
