import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SetupNotice from './components/SetupNotice'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-bounce text-5xl">☕</div>
    </div>
  )
}

export default function App() {
  const { session, profile, loading } = useAuth()

  if (!isSupabaseConfigured) return <SetupNotice />
  if (loading) return <LoadingScreen />

  // Signed in but no username set yet -> force onboarding.
  const needsOnboarding = session && profile && !profile.username?.trim()

  return (
    <div className="min-h-screen">
      {session && profile && !needsOnboarding && <Navbar />}
      <Routes>
        {!session ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : needsOnboarding ? (
          <>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </div>
  )
}
