import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const EMOJIS = ['☕', '🧋', '🍵', '🚀', '🌟', '🐝', '🦊', '🐢', '🎯', '🔥']
const TEAMS = [
  'Engineering',
  'Product',
  'Design',
  'Data',
  'Risk',
  'Operations',
  'Finance',
  'Other',
]

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [team, setTeam] = useState(profile?.team ?? '')
  const [emoji, setEmoji] = useState(profile?.emoji ?? '☕')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !user) return
    setLoading(true)
    const { error } = await supabase
      .from('interns')
      .update({ full_name: fullName.trim(), team: team || null, emoji })
      .eq('id', user.id)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    await refreshProfile()
    toast.success('Profile saved!')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-7">
        <div className="mb-1 text-4xl">{emoji}</div>
        <h1 className="text-2xl font-extrabold">Welcome! Set up your profile</h1>
        <p className="mb-6 mt-1 text-sm text-espresso-600">
          This is how you&apos;ll show up on the leaderboard.
        </p>

        <label htmlFor="name" className="label">
          Full name
        </label>
        <input
          id="name"
          required
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Alex Rivera"
          className="input"
        />

        <label htmlFor="team" className="label mt-4">
          Team
        </label>
        <select
          id="team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="input"
        >
          <option value="">Select a team…</option>
          {TEAMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span className="label mt-4">Pick an emoji</span>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((em) => (
            <button
              type="button"
              key={em}
              onClick={() => setEmoji(em)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition ${
                emoji === em
                  ? 'border-espresso-700 bg-espresso-100'
                  : 'border-espresso-100 hover:bg-espresso-50'
              }`}
            >
              {em}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full"
        >
          {loading ? 'Saving…' : 'Start tracking ☕'}
        </button>
      </form>
    </div>
  )
}
