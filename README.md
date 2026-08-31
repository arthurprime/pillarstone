# Pillarstone

Real estate platform for homes, land, and developments.

## Setup

1. Copy `.env.example` to `.env` and add your Supabase URL and anon key.
2. Install and run locally:

```bash
npm install
npm run dev
```

## Hosting

Vite inlines `VITE_*` variables at **build** time. On Netlify, Vercel, or similar:

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host’s environment settings.
2. Redeploy so a new production build is created.

This is a single-page app. Redirects in `netlify.toml`, `vercel.json`, and `public/_redirects` send unknown routes to `index.html`.
