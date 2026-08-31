# New Supabase project for Pillarstone

I cannot create the cloud project on your account. Create it in the dashboard, then run the SQL in this folder.

## 1. Create the project

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project**
3. Name: `pillarstone`
4. Set a strong database password and save it
5. Region: closest to you
6. Wait until the project is **Active**

## 2. Load the database (one paste)

1. Left sidebar → **SQL Editor** → **New query**
2. Open `supabase/complete_setup.sql` in this repo
3. Copy **everything** → paste → **Run**
4. You should see **Success**. That creates:
   - All tables and security (RLS)
   - Photo storage buckets (`property-images` and others)
   - Demo listings, locations, agents, and site content
   - Auto-create profile on signup

## 3. Copy the two public keys

**Project Settings** (gear) → **API**:

- `VITE_SUPABASE_URL` = **Project URL**
- `VITE_SUPABASE_ANON_KEY` = **anon** / **public** key (starts with `eyJ`)

Do **not** use the `service_role` key in the website.

## 4. Auth so login and admin work

**Authentication** → **Providers** → **Email**: leave email enabled.

**Authentication** → **URL Configuration**:

- Site URL: `https://pillarstone-black.vercel.app`
- Redirect URLs: `https://pillarstone-black.vercel.app/**` and `http://localhost:5173/**`

Optional for easier first login: turn **off** “Confirm email” while you set up, then turn it back on.

## 5. Create your admin user

This is **not** done on the website. The website has no “make me admin” button.

Signup on [pillarstone-black.vercel.app/register](https://pillarstone-black.vercel.app/register) only creates a normal account. Admin is stored in the Supabase table `profiles`.

**Easiest:** after `complete_setup.sql`, also run `supabase/make_first_user_admin.sql` in the **SQL Editor**. Then the **first** person who registers becomes admin automatically. Open `/admin` after you sign in.

**If you already registered** and `/admin` sends you home, open Supabase → **SQL Editor** and run (your real email):

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
```

That updates the database behind the site. Then sign out and sign in again.

## 6. Vercel (so the hosted site starts)

Vercel → **pillarstone-black** → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | from step 3 |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

**Deployments** → latest → **Redeploy**. Turn **off** Use existing Build Cache.

For local `npm run dev`, copy `.env.example` to `.env` and put the same two values there (`.env` is gitignored).
