export default function MissingConfig() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-lg">
        <h1 className="font-display text-3xl text-ink-900 mb-3">Site configuration missing</h1>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          This site was built without Supabase credentials, so the app cannot start. Add these
          environment variables on your host, then trigger a new production build (Vite bakes
          them in at build time):
        </p>
        <pre className="bg-ink-950 text-stone-200 text-xs p-4 overflow-x-auto mb-4 text-left">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <p className="text-xs text-stone-500">
          On Netlify, Vercel, or similar: Project settings → Environment variables → Redeploy.
          A local <code>.env</code> file is not sent to the host automatically.
        </p>
      </div>
    </div>
  )
}
