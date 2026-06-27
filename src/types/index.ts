export interface Intern {
  id: string
  username: string
  team: string | null
  emoji: string | null
  created_at: string
}

export interface CoffeeChat {
  id: string
  intern_id: string
  person_name: string
  person_title: string | null
  department: string | null
  chat_date: string // ISO date (YYYY-MM-DD)
  notes: string | null
  created_at: string
}

export interface LeaderboardRow {
  id: string
  username: string
  team: string | null
  emoji: string | null
  chat_count: number
  last_chat: string | null
  departments_met: number
}

// Fields the user fills in when logging a chat.
export type NewCoffeeChat = Pick<
  CoffeeChat,
  'person_name' | 'person_title' | 'department' | 'chat_date' | 'notes'
>
