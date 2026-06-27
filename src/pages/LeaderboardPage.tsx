import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useAuth } from '../hooks/useAuth'
import type { LeaderboardRow } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

function Podium({ rows }: { rows: LeaderboardRow[] }) {
  // Display order: 2nd, 1st, 3rd for the classic podium shape.
  const order = [rows[1], rows[0], rows[2]].filter(Boolean)
  const heights = ['h-24', 'h-32', 'h-20']
  const rank = [2, 1, 3]
  return (
    <div className="mb-8 flex items-end justify-center gap-3">
      {order.map((row, i) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex w-24 flex-col items-center sm:w-28"
        >
          <div className="text-3xl">{row.emoji ?? '☕'}</div>
          <div className="max-w-full truncate text-sm font-semibold">
            {row.full_name}
          </div>
          <div className="text-xs text-espresso-500">{row.chat_count} chats</div>
          <div
            className={`mt-2 flex w-full items-start justify-center rounded-t-xl bg-espresso-200 pt-2 ${heights[i]}`}
          >
            <span className="text-2xl">{MEDALS[rank[i] - 1]}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function LeaderboardPage({
  publicView = false,
}: {
  publicView?: boolean
}) {
  const { rows, loading } = useLeaderboard()
  const { profile } = useAuth()

  const ranked = rows.filter((r) => r.full_name?.trim())

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Leaderboard ☕</h1>
          <p className="flex items-center gap-1.5 text-sm text-espresso-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live — updates in real time
          </p>
        </div>
        {publicView && (
          <Link to="/login" className="btn-primary text-sm">
            Sign in
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-espresso-400">Loading…</div>
      ) : ranked.length === 0 ? (
        <div className="card px-6 py-12 text-center text-espresso-500">
          No chats logged yet. Be the first! ☕
        </div>
      ) : (
        <>
          {ranked.length >= 3 && <Podium rows={ranked} />}

          <ul className="space-y-2">
            {ranked.map((row, i) => {
              const isMe = row.id === profile?.id
              return (
                <motion.li
                  key={row.id}
                  layout
                  transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                  className={`card flex items-center gap-3 p-3.5 ${
                    isMe ? 'ring-2 ring-espresso-500' : ''
                  }`}
                >
                  <div className="w-8 text-center text-lg font-bold text-espresso-400">
                    {i < 3 ? MEDALS[i] : i + 1}
                  </div>
                  <div className="text-2xl">{row.emoji ?? '☕'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate font-semibold">
                      {row.full_name}
                      {isMe && (
                        <span className="rounded-full bg-espresso-700 px-2 py-0.5 text-xs font-medium text-cream">
                          you
                        </span>
                      )}
                    </div>
                    {row.team && (
                      <div className="text-xs text-espresso-500">{row.team}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-espresso-800">
                      {row.chat_count}
                    </div>
                    <div className="text-xs text-espresso-400">chats</div>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </>
      )}
    </main>
  )
}
