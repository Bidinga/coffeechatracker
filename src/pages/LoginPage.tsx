import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="mb-3 text-6xl">☕</div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-navy-900">
          Coffee <span className="text-teal-500">Chat</span> Tracker
        </h1>
        <p className="mt-2 max-w-sm text-navy-600">
          Log your coffee chats, climb the leaderboard, meet everyone.
        </p>
      </div>

      <div className="card w-full max-w-sm p-6">
        {sent ? (
          <div className="text-center">
            <div className="mb-3 text-4xl">📬</div>
            <h2 className="mb-1 text-lg font-bold">Check your email</h2>
            <p className="text-sm text-navy-600">
              We sent a magic sign-in link to{' '}
              <span className="font-semibold">{email}</span>. Click it to log in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="btn-ghost mt-4 text-sm"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="label">
              Personal email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-4 w-full"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
            <p className="mt-3 text-center text-xs text-navy-500">
              No password needed — we&apos;ll email you a one-click sign-in link.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
