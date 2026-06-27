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
  const [username, setUsername] = useState(profile?.username ?? '')
  const [team, setTeam] = useState(profile?.team ?? '')
  const [emoji, setEmoji] = useState(profile?.emoji ?? '☕')
  const [loading, setLoading] = useState(false)

  // First-time setup vs. editing an existing profile.
  const isEditing = Boolean(profile?.username?.trim())

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !user) return
    setLoading(true)
    const { error } = await supabase
      .from('interns')
      .update({ username: username.trim(), team: team || null, emoji })
      .eq('id', user.id)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    await refreshProfile()
    toast.success(isEditing ? 'Profile updated!' : 'Profile saved!')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-7">
        <div className="mb-1 text-4xl">{emoji}</div>
        <h1 className="text-2xl font-extrabold">
          {isEditing ? 'Edit your profile' : 'Welcome! Set up your profile'}
        </h1>
        <p className="mb-6 mt-1 text-sm text-espresso-600">
          This is how you&apos;ll show up on the leaderboard.
        </p>

        <label htmlFor="username" className="label">
          Username
        </label>
        <input
          id="username"
          required
          autoFocus
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="alexcodes"
          className="input"
        />
        <p className="mt-1 text-xs text-espresso-400">
          This is the name shown on the leaderboard.
        </p>

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

        <div className="mt-6 flex gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading
              ? 'Saving…'
              : isEditing
                ? 'Save changes'
                : 'Start tracking ☕'}
          </button>
        </div>
      </form>
    </div>
  )
}
