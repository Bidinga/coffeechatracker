import type { CoffeeChat } from '../types'

export interface Achievement {
  id: string
  emoji: string
  title: string
  description: string
  earned: boolean
}

/** Milestone chat counts that trigger a confetti celebration. */
export const MILESTONES = [1, 5, 10, 25, 50, 100]

/** Computes the full badge list (earned + locked) from a user's chats. */
export function computeAchievements(chats: CoffeeChat[]): Achievement[] {
  const total = chats.length

  const departments = new Set(
    chats.map((c) => c.department?.trim().toLowerCase()).filter(Boolean),
  )

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = chats.filter(
    (c) => new Date(c.chat_date + 'T00:00:00') >= weekAgo,
  ).length

  return [
    {
      id: 'first',
      emoji: '☕',
      title: 'First Sip',
      description: 'Logged your first coffee chat',
      earned: total >= 1,
    },
    {
      id: 'five',
      emoji: '🖐️',
      title: 'High Five',
      description: 'Logged 5 coffee chats',
      earned: total >= 5,
    },
    {
      id: 'ten',
      emoji: '🔟',
      title: '10 Club',
      description: 'Logged 10 coffee chats',
      earned: total >= 10,
    },
    {
      id: 'twentyfive',
      emoji: '🏆',
      title: 'Quarter Century',
      description: 'Logged 25 coffee chats',
      earned: total >= 25,
    },
    {
      id: 'explorer',
      emoji: '🧭',
      title: 'Cross-Dept Explorer',
      description: 'Met people from 5+ departments',
      earned: departments.size >= 5,
    },
    {
      id: 'onfire',
      emoji: '🔥',
      title: 'On Fire',
      description: '3+ chats in a single week',
      earned: thisWeek >= 3,
    },
  ]
}
