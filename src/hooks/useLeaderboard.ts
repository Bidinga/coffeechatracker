import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaderboardRow } from '../types'

/**
 * Live leaderboard. Queries the `leaderboard` view, then subscribes to any
 * change on `coffee_chats` (insert/update/delete) and re-queries so every
 * connected browser updates in real time.
 */
export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('chat_count', { ascending: false })
    if (!error && data) setRows(data as LeaderboardRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRows()

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coffee_chats' },
        () => fetchRows(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interns' },
        () => fetchRows(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRows])

  return { rows, loading, refresh: fetchRows }
}
