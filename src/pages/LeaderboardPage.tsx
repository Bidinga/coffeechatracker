import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useAuth } from '../hooks/useAuth'
import type { LeaderboardRow } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

type Timeframe = 'all' | 'week'

function Podium({
  rows,
  count,
}: {
  rows: LeaderboardRow[]
  count: (row: LeaderboardRow) => number
}) {
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
            {row.username}
          </div>
          <div className="text-xs text-espresso-500">{count(row)} chats</div>
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
  const [timeframe, setTimeframe] = useState<Timeframe>('all')

  const count = (row: LeaderboardRow) =>
    timeframe === 'week' ? row.chats_this_week : row.chat_count

  // Everyone who has a username AND a chat in the selected timeframe, ranked.
  const ranked = useMemo(() => {
    return rows
      .filter((r) => r.username?.trim() && count(r) > 0)
      .sort((a, b) => count(b) - count(a))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, timeframe])

  const teamTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.chat_count, 0),
    [rows],
  )

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

      {/* Team total + timeframe toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-espresso-600">
          <span className="font-bold text-espresso-800">{teamTotal}</span> coffee
          chats logged across the team 🎉
        </p>
        <div className="flex rounded-xl border border-espresso-100 bg-white p-1">
          {(['all', 'week'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                timeframe === tf
                  ? 'bg-espresso-700 text-cream'
                  : 'text-espresso-600 hover:bg-espresso-50'
              }`}
            >
              {tf === 'all' ? 'All-time' : 'This week'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-espresso-400">Loading…</div>
      ) : ranked.length === 0 ? (
        <div className="card px-6 py-12 text-center text-espresso-500">
          {timeframe === 'week'
            ? 'No chats logged this week yet. Be the first! ☕'
            : 'No chats logged yet. Be the first! ☕'}
        </div>
      ) : (
        <>
          {ranked.length >= 3 && <Podium rows={ranked} count={count} />}

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
                      {row.username}
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
                      {count(row)}
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
