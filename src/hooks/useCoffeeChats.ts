import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CoffeeChat, NewCoffeeChat } from '../types'

/** The current intern's own coffee chats, newest first. */
export function useCoffeeChats(internId: string | undefined) {
  const [chats, setChats] = useState<CoffeeChat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChats = useCallback(async () => {
    if (!internId) return
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('*')
      .eq('intern_id', internId)
      .order('chat_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error && data) setChats(data as CoffeeChat[])
    setLoading(false)
  }, [internId])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  async function addChat(chat: NewCoffeeChat) {
    if (!internId) throw new Error('Not signed in')
    const { error } = await supabase
      .from('coffee_chats')
      .insert({ ...chat, intern_id: internId })
    if (error) throw error
    await fetchChats()
  }

  async function deleteChat(id: string) {
    const { error } = await supabase.from('coffee_chats').delete().eq('id', id)
    if (error) throw error
    await fetchChats()
  }

  return { chats, loading, addChat, deleteChat, refresh: fetchChats }
}
