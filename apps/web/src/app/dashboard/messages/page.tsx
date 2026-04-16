'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

interface StoredUser {
  profile_id: number | null
  full_name?: string
  email?: string
}

interface DirectoryUser {
  id: number
  full_name: string
  email: string
  role?: string
  department?: string
}

interface Message {
  id: number
  content: string
  sender_id: number | null
  recipient_id: number | null
  created_at: string
  is_seed?: boolean
  sender?: {
    id: number
    full_name: string
    email: string
  }
  recipient?: {
    id: number
    full_name: string
    email: string
  }
}

function getStoredUser(): StoredUser | null {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    const user = JSON.parse(storedUser)

    if (typeof user?.profile_id === 'number') {
      return user
    }

    return null
  } catch {
    return null
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [recipientId, setRecipientId] = useState('')
  const [content, setContent] = useState('')
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null)
  const [profileId, setProfileId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedUser = getStoredUser()
    setCurrentUser(storedUser)
    setProfileId(storedUser?.profile_id ?? null)
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const token = localStorage.getItem('token')
      const [messagesData, usersData] = await Promise.all([
        apiGet('/api/messages', token || undefined),
        apiGet('/api/users', token || undefined),
      ])

      setMessages(messagesData.messages || messagesData)
      setUsers(usersData.users || usersData)
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
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const visibleMessages = messages.filter((msg) => (
    msg.is_seed ||
    msg.sender_id === profileId ||
    msg.recipient_id === profileId
  ))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const availableRecipients = users.filter((user) => user.id !== profileId)
  const selectedRecipient = availableRecipients.find((user) => String(user.id) === recipientId)

  function getParticipantName(message: Message, side: 'sender' | 'recipient') {
    const participant = message[side]
    const participantId = side === 'sender' ? message.sender_id : message.recipient_id

    if (participant?.full_name) {
      return participant.full_name
    }

    if (participantId === profileId) {
      return currentUser?.full_name || currentUser?.email || 'You'
    }

    const user = users.find((entry) => entry.id === participantId)
    return user?.full_name || (participantId ? `User #${participantId}` : 'Unknown')
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Messages</h1>
          <p className="text-stone-400 text-sm mt-0.5">Demo conversations plus anything sent by or to your lab account.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">Shared demo inbox</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
        <div className="card !p-5 h-fit">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-stone-800">Compose</h2>
            <p className="text-stone-400 text-xs mt-1">Pick a recipient from the shared directory instead of guessing a numeric ID.</p>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-stone-700 mb-1.5">
                Recipient
              </label>
              <select
                id="recipient"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
                className="w-full"
              >
                <option value="">Choose a teammate</option>
                {availableRecipients.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} #{user.id}
                  </option>
                ))}
              </select>
            </div>

            {selectedRecipient && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-sm font-medium text-stone-800">{selectedRecipient.full_name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {selectedRecipient.role || 'employee'}{selectedRecipient.department ? ` · ${selectedRecipient.department}` : ''}
                </p>
                <p className="text-xs text-stone-500 mt-2">{selectedRecipient.email}</p>
              </div>
            )}

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-stone-700 mb-1.5">
                Message
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a message..."
                rows={5}
                required
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !recipientId}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <p className="text-stone-400 text-xs mt-4">
            The dashboard view stays scoped to the demo conversation plus messages touching your account.
          </p>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <p className="text-stone-400 text-center py-12 text-sm">Loading...</p>
          ) : visibleMessages.length === 0 ? (
            <div className="card text-center !py-12">
              <p className="text-stone-400 text-sm">No messages yet.</p>
            </div>
          ) : (
            visibleMessages.map((msg) => {
              const senderName = getParticipantName(msg, 'sender')
              const recipientName = getParticipantName(msg, 'recipient')

              return (
                <div key={msg.id} className="card !p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold flex items-center justify-center shrink-0">
                      {getInitials(senderName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="text-sm font-medium text-stone-900">
                          {senderName}
                          <span className="text-stone-400 font-normal"> to </span>
                          {recipientName}
                        </p>
                        {msg.is_seed && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                            Demo thread
                          </span>
                        )}
                      </div>

                      <p className="text-stone-700 text-sm leading-relaxed">{msg.content}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">
                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                        <span>From #{msg.sender_id}</span>
                        <span>To #{msg.recipient_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
