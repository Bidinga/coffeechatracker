export default function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card max-w-lg p-8">
        <div className="mb-4 text-5xl">☕</div>
        <h1 className="mb-2 text-2xl font-bold">Almost there!</h1>
        <p className="mb-4 text-navy-700">
          Your Supabase keys aren&apos;t configured yet. To connect the app:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-navy-700">
          <li>
            Copy <code className="rounded bg-navy-100 px-1">.env.example</code>{' '}
            to <code className="rounded bg-navy-100 px-1">.env</code>
          </li>
          <li>
            Fill in <code className="rounded bg-navy-100 px-1">VITE_SUPABASE_URL</code>{' '}
            and{' '}
            <code className="rounded bg-navy-100 px-1">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            from your Supabase project (Settings → API)
          </li>
          <li>Restart the dev server</li>
        </ol>
        <p className="text-sm text-navy-500">
          See the README for the full setup walkthrough.
        </p>
      </div>
    </div>
  )
}
