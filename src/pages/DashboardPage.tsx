import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useCoffeeChats } from '../hooks/useCoffeeChats'
import { useLeaderboard } from '../hooks/useLeaderboard'
import LogChatModal from '../components/LogChatModal'
import Badges from '../components/Badges'
import { computeAchievements, MILESTONES } from '../lib/achievements'
import { celebrate } from '../lib/confetti'
import type { CoffeeChat, NewCoffeeChat } from '../types'

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
      <div className="font-display text-3xl font-bold text-navy-800">{value}</div>
      <div className="text-sm text-navy-500">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { chats, loading, addChat, deleteChat } = useCoffeeChats(profile?.id)
  const { rows } = useLeaderboard()
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

  const achievements = useMemo(() => computeAchievements(chats), [chats])

  // The user's rank among everyone who has a username set.
  const rank = useMemo(() => {
    const ranked = rows.filter((r) => r.username?.trim())
    const idx = ranked.findIndex((r) => r.id === profile?.id)
    return idx >= 0 ? { position: idx + 1, total: ranked.length } : null
  }, [rows, profile?.id])

  // Wrap addChat so we can fire confetti when a milestone is reached.
  async function handleSave(chat: NewCoffeeChat) {
    const nextCount = chats.length + 1
    await addChat(chat)
    if (MILESTONES.includes(nextCount)) {
      celebrate()
      toast.success(`🎉 Milestone! ${nextCount} coffee chats logged`)
    }
  }

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
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Hey {profile?.username} {profile?.emoji}
          </h1>
          <p className="text-navy-600">Keep the conversations brewing.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Log a chat
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total chats" value={chats.length} />
        <StatCard label="This week" value={thisWeek} />
        <StatCard label="Departments met" value={uniqueDepartments} />
        <StatCard
          label={rank ? `Your rank of ${rank.total}` : 'Your rank'}
          value={rank ? `#${rank.position}` : '—'}
        />
      </div>

      {chats.length > 0 && <Badges achievements={achievements} />}

      <h2 className="mb-3 text-lg font-bold">Your chats</h2>

      {loading ? (
        <div className="py-12 text-center text-navy-400">Loading…</div>
      ) : chats.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-3 text-5xl">☕</div>
          <p className="mb-4 font-semibold">No chats logged yet</p>
          <p className="mb-5 max-w-xs text-sm text-navy-500">
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
                    <span className="text-sm text-navy-500">
                      {chat.person_title}
                    </span>
                  )}
                  {chat.department && (
                    <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-700">
                      {chat.department}
                    </span>
                  )}
                </div>
                {chat.notes && (
                  <p className="mt-1 text-sm text-navy-600">{chat.notes}</p>
                )}
                <p className="mt-1 text-xs text-navy-400">
                  {formatDate(chat.chat_date)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(chat)}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-navy-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
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
        onSave={handleSave}
      />
    </main>
  )
}
