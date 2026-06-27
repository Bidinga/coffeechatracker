import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { profile, signOut } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
      isActive
        ? 'bg-espresso-700 text-cream'
        : 'text-espresso-700 hover:bg-espresso-100'
    }`

  return (
    <header className="sticky top-0 z-20 border-b border-espresso-100 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="text-xl">☕</span>
          <span className="hidden sm:inline">Coffee Chat Tracker</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Leaderboard
          </NavLink>
          <span className="mx-1 hidden text-sm text-espresso-500 sm:inline">
            {profile?.emoji} {profile?.username}
          </span>
          <button onClick={signOut} className="btn-ghost text-sm">
            Sign out
          </button>
        </div>
      </nav>
    </header>
  )
}
