import { motion } from 'framer-motion'
import type { Achievement } from '../lib/achievements'

export default function Badges({ achievements }: { achievements: Achievement[] }) {
  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Achievements</h2>
        <span className="text-sm text-espresso-500">
          {earnedCount}/{achievements.length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {achievements.map((a) => (
          <motion.div
            key={a.id}
            layout
            className={`card flex items-center gap-3 p-3 ${
              a.earned ? '' : 'opacity-50 grayscale'
            }`}
            title={a.description}
          >
            <div className="text-2xl">{a.earned ? a.emoji : '🔒'}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{a.title}</div>
              <div className="truncate text-xs text-espresso-500">
                {a.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
