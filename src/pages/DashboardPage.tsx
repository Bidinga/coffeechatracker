import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useCoffeeChats } from '../hooks/useCoffeeChats'
import LogChatModal from '../components/LogChatModal'
import type { CoffeeChat } from '../types'

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card flex-1 p-4">
      <div className="text-3xl font-extrabold text-espresso-800">{value}</div>
      <div className="text-sm text-espresso-500">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { chats, loading, addChat, deleteChat } = useCoffeeChats(profile?.id)
  const [modalOpen, setModalOpen] = useState(false)

  const uniqueDepartments = useMemo(() => {
    const set = new Set(
      chats.map((c) => c.department?.trim()).filter(Boolean) as string[],
    )
    return set.size
  }, [chats])

  const thisWeek = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return chats.filter((c) => new Date(c.chat_date + 'T00:00:00') >= weekAgo)
      .length
  }, [chats])

  async function handleDelete(chat: CoffeeChat) {
    if (!confirm(`Delete your chat with ${chat.person_name}?`)) return
    try {
      await deleteChat(chat.id)
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            Hey {profile?.username} {profile?.emoji}
          </h1>
          <p className="text-espresso-600">Keep the conversations brewing.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Log a chat
        </button>
      </div>

      <div className="mb-8 flex gap-3">
        <StatCard label="Total chats" value={chats.length} />
        <StatCard label="This week" value={thisWeek} />
        <StatCard label="Departments met" value={uniqueDepartments} />
      </div>

      <h2 className="mb-3 text-lg font-bold">Your chats</h2>

      {loading ? (
        <div className="py-12 text-center text-espresso-400">Loading…</div>
      ) : chats.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-3 text-5xl">☕</div>
          <p className="mb-4 font-semibold">No chats logged yet</p>
          <p className="mb-5 max-w-xs text-sm text-espresso-500">
            Had a coffee with someone? Log it and start climbing the leaderboard.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            + Log your first chat
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <motion.li
              key={chat.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card group flex items-start justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{chat.person_name}</span>
                  {chat.person_title && (
                    <span className="text-sm text-espresso-500">
                      {chat.person_title}
                    </span>
                  )}
                  {chat.department && (
                    <span className="rounded-full bg-espresso-100 px-2 py-0.5 text-xs font-medium text-espresso-700">
                      {chat.department}
                    </span>
                  )}
                </div>
                {chat.notes && (
                  <p className="mt-1 text-sm text-espresso-600">{chat.notes}</p>
                )}
                <p className="mt-1 text-xs text-espresso-400">
                  {formatDate(chat.chat_date)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(chat)}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-espresso-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                aria-label="Delete chat"
              >
                Delete
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <LogChatModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addChat}
      />
    </main>
  )
}
