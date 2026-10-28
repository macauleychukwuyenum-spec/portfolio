# Run Chozen outside Lovable (Windows 11 + VS Code)

Placeholders look like `<THIS>` — replace them with your own values (without the `< >`).

---

## A. Project requirements

Install:
1. **Node.js 22 LTS** — https://nodejs.org → "LTS" → Windows Installer (.msi). Keep default options (it includes npm).
2. **Git** — https://git-scm.com/download/win (defaults are fine).
3. **VS Code** — https://code.visualstudio.com

Check, in a terminal (PowerShell):
```powershell
node --version   # expected: v22.x.x (22.12 or newer)
npm --version    # expected: 10.x or 11.x
git --version    # expected: git version 2.x
```
If you see *"node is not recognized"*: close **all** VS Code / terminal windows and open them again (the installer updates PATH only for new windows). If it still fails, restart Windows.

---

## B. Get the project and open it in VS Code

1. Get the files from Lovable: connect the project to GitHub (Lovable → GitHub → Connect) and clone it:
   ```powershell
   cd $HOME\Documents
   git clone https://github.com/<YOUR-USER>/<YOUR-REPO>.git chozen
   ```
   (Or download the repository as a ZIP from GitHub and extract it to `Documents\chozen`.)
2. VS Code → **File → Open Folder…** → choose the `chozen` folder.
3. Open the terminal: **Terminal → New Terminal** (or `` Ctrl+` ``).
4. Confirm you are in the project root:
   ```powershell
   dir package.json, .env.example
   ```
   Both files must be listed. If not, `cd` into the folder that contains them.

---

## C. Install dependencies

The repository includes `package-lock.json`, so use:
```powershell
npm ci
```
Expected: `added ~520 packages` with no `ERR!`. Warnings (`npm warn deprecated …`) are harmless.

If it fails:
- Check `node --version` is 22.12+.
- Network/proxy errors: retry; run `npm config get registry` — it should be `https://registry.npmjs.org/`.
- `EPERM`/file locked: close VS Code's other terminals and any running `npm run dev`, then retry.
- As a last resort, delete only the `node_modules` folder and run `npm ci` again. Do not delete `package-lock.json`.

---

## D. Configure environment variables

```powershell
Copy-Item .env.example .env.local
```
Open `.env.local` in VS Code and fill in (from step E.1):
```dotenv
VITE_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR-PUBLISHABLE-KEY>
```
Save (`Ctrl+S`).

- `.env.local` holds your local configuration and is ignored by Git (`.gitignore`). Never commit it.
- The **publishable key** (`sb_publishable_…`, or the legacy **anon** key) is public: it is meant to be in the browser; Row Level Security protects your data.
- The **secret / service-role key** bypasses all security. Never put it in `.env.local` permanently, in any `VITE_` variable, in Vercel or in Git. It is only used once in step E.4 and then removed.

If a variable is missing, the app shows: *"Missing environment variable(s): VITE_SUPABASE_URL… Copy .env.example to .env.local…"*. After editing `.env.local`, stop and restart `npm run dev`.

---

## E. Set up Supabase

We use the **Supabase CLI** (it runs through `npx`, no separate install needed).

### E.1 Create the project and find your keys
1. https://supabase.com/dashboard → **New project**. Pick a name, a strong database password (save it privately) and a region.
2. **Project Settings → API keys**: copy the **Publishable key**.
3. **Project Settings → Data API** (or the "Connect" button): copy the **Project URL** (`https://<ref>.supabase.co`). The `<ref>` part is your project reference.

### E.2 Configure Authentication (before creating users)
**Authentication → Sign In / Providers**
- Email provider: **enabled**.
- **Allow new users to sign up: OFF** (there is no public registration).
- **Confirm email: OFF** (the owner is created already confirmed).
- Leave all social providers disabled.

**Authentication → URL Configuration**
- Site URL: `http://localhost:3000` (change to your Vercel URL later, step H.6).
- Redirect URLs — add:
  - `http://localhost:3000/reset-password`
  - `https://<YOUR-VERCEL-DOMAIN>/reset-password` (after deploying)

### E.3 Create the database schema (migrations)
In the VS Code terminal:
```powershell
npx supabase login
npx supabase link --project-ref <YOUR-PROJECT-REF>
npx supabase db push
```
- `login` opens the browser to authorize.
- `link` asks for the database password from E.1.
- `db push` applies, in order:
  1. `supabase/migrations/20261023000000_portfolio_schema.sql` — tables, roles (`user_roles`, `has_role`), RLS policies, first-admin trigger, storage policies, default settings row.
  2. `supabase/migrations/20261023000100_support_payments.sql` — support/bank fields and receipt submissions.

Expected: `Applying migration 20261023000000…` / `…000100…` then `Finished supabase db push.` Running it again is safe (already-applied migrations are skipped).

### E.4 Create the storage buckets (one time)
1. **Project Settings → API keys** → copy the **Secret key** (or legacy `service_role`).
2. Temporarily add this line to `.env.local`:
   `SUPABASE_SECRET_KEY=<YOUR-SECRET-KEY>`
3. Run:
   ```powershell
   npm run storage:setup
   ```
   Expected: `Configured private images bucket`, `…files…`, `…receipts…`.
4. **Delete the `SUPABASE_SECRET_KEY` line from `.env.local` and save.**

Buckets are private: `images` (5 MB, images), `files` (50 MB, PDF/ZIP/EPUB/TXT), `receipts` (10 MB). Access is controlled by the storage policies from the migration.

### E.5 Create the administrator (securely, no public sign-up)
**Authentication → Users → Add user → Create new user**: your email + strong password, tick **Auto Confirm User**.
The **first user created** automatically receives the `admin` role (database trigger). Check **Table Editor → user_roles**: one row with your user id and `admin`. Users created later are not admins.

### E.6 Password recovery
Uses Supabase's built-in email. For reliable delivery, configure SMTP in **Authentication → Emails → SMTP Settings** (the built-in sender is heavily rate-limited). Test in step F.

---

## F. Run locally

```powershell
npm run dev
```
The terminal prints `Local: http://localhost:3000/`. `Ctrl+Click` it. Stop the server with `Ctrl+C` (answer `Y` if asked).

Test:
1. `http://localhost:3000/` — portfolio loads (placeholder content on a fresh database).
2. `http://localhost:3000/chozen` → goes to `/admin` and shows sign-in. Try a wrong password (error shown), then your owner account.
3. In `/admin`: **Profile & settings** → change the hero name, upload a portrait → Save. Create a project as a draft, open the homepage in a private window (draft hidden), then publish it (now visible).
4. Upload an image and a PDF in Classes/E-books.
5. Sign out → **Forgot password?** → enter your email → open the email link → it lands on `/reset-password` → set a new password → sign in with it.

---

## G. Production build

```powershell
npm run build      # creates .output\ (Node server)
npm start          # serves it at http://localhost:3000
```
(`npm run preview` also works.) Other checks: `npm run typecheck`, `npm run lint`, `npm test`.

Common build errors:
- `Missing environment variable(s)` — `.env.local` missing/empty; fix and rebuild (VITE_ values are baked in at build time).
- TypeScript errors — run `npm run typecheck` to see the file and line.
- `Cannot find module` — run `npm ci` again.

---

## H. Deploy to Vercel

1. **GitHub**: create a repository (private is fine). If you cloned from GitHub, just commit and push:
   ```powershell
   git add .
   git commit -m "Portable setup"
   git push
   ```
   `git status` must **not** list `.env.local`.
2. https://vercel.com → **Add New → Project** → import the repository.
3. Build settings: Framework Preset **Other** (or leave auto), Install `npm ci`, Build `npm run build` (already in `vercel.json`). Leave **Output Directory empty** — the build writes Vercel's output automatically (`.vercel/output`), including server-side rendering.
4. **Environment Variables** (Production + Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Your `.env.local` is **not** uploaded — you must add them here. Do not add the secret key.
5. **Deploy**. Wait for "Ready" and open the URL.
6. Optional custom domain: Project → Settings → Domains. Then in Supabase **URL Configuration** set Site URL to `https://<YOUR-DOMAIN>` and add `https://<YOUR-DOMAIN>/reset-password` to Redirect URLs.
7. Verify on the live site: refresh `/chozen`, `/admin`, `/admin/projects` directly (no 404 — the server handles every route, no SPA rewrite needed), sign in/out, password reset, edit + publish content, upload images.

Changing env vars in Vercel requires **Redeploy**.

---

## I. Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm`/`node` not recognized | Reinstall Node 22 LTS, reopen VS Code/terminal, restart Windows if needed. |
| `npm ci` fails | Check Node version, registry (`npm config get registry`), close other terminals, delete `node_modules` only and retry. |
| "Missing environment variable" | `.env.local` in project root with both `VITE_` values; restart dev server. On Vercel: add vars and redeploy. |
| Invalid URL / key (`Invalid API key`, fetch failed) | URL must be `https://<ref>.supabase.co` with no trailing path; key copied completely; both from the **same** project. |
| `relation "public.site_settings" does not exist` / tables missing | Run `npx supabase db push` against the right project (`npx supabase link --project-ref …`). |
| `permission denied` / `new row violates row-level security` | You are not signed in as the admin, or your user has no `admin` row in `user_roles`. Never disable RLS; instead add the role in **SQL Editor**: `insert into public.user_roles (user_id, role) values ('<YOUR-USER-ID>', 'admin');` |
| Sign-in "email and password don't match" | Check the user exists and is confirmed (Authentication → Users). |
| Reset link opens localhost / wrong site | Update Site URL and Redirect URLs (E.2/H.6) to the exact domain + `/reset-password`. Request a new email after changing. |
| Reset email never arrives | Configure SMTP (E.6); check spam; built-in mailer is rate-limited. |
| Image upload fails | Run `npm run storage:setup`; file must be within size/type limits; you must be signed in as admin. |
| 404 on refresh | Locally use `npm start`/`npm run dev`, not opening files directly. On Vercel leave Output Directory empty so the server function is used. |
| Build fails on Vercel | Read the build log; usually missing env vars, or `package-lock.json` not committed. |
| Pushed `.env.local` by mistake | Remove it (`git rm --cached .env.local`), commit, and rotate your keys in Supabase. |

---

## J. Project structure

```text
chozen/
├─ .env.example               # documented env vars (placeholders only)
├─ .gitignore                 # ignores .env, .env.local, node_modules, build output
├─ package.json               # scripts + dependencies (no Drizzle)
├─ package-lock.json          # exact versions for `npm ci`
├─ vite.config.ts             # Vite + TanStack Start + Tailwind + Nitro
├─ vercel.json                # Vercel install/build commands
├─ README.md
├─ RUN_OUTSIDE_LOVABLE.md     # this guide
├─ scripts/
│  └─ setup-storage.mjs       # one-time private bucket setup
├─ supabase/
│  ├─ config.toml             # Supabase CLI project config
│  └─ migrations/             # SQL schema, RLS, roles, storage policies
├─ public/                    # favicon, robots.txt
└─ src/
   ├─ lib/supabase.ts         # shared browser Supabase client + env validation
   ├─ lib/portfolio.functions.ts # server reads of published content
   ├─ lib/media.ts            # storage refs / signed URLs
   ├─ integrations/supabase/types.ts # database types
   ├─ routes/                 # pages: /, /projects/$slug, /support, /chozen, /admin/*, /forgot-password, /reset-password
   ├─ components/             # site, admin and UI components
   ├─ server.ts, start.ts, router.tsx
   └─ test/                   # vitest tests
```

Note: `src/integrations/supabase/` also contains a few generated files used only by the Lovable editor preview; the app itself uses `src/lib/supabase.ts`.

## Moving existing content
A new Supabase project starts empty (placeholder settings). Content, uploaded files and users are not copied automatically. Re-enter content via `/admin` (recommended for a small portfolio), and re-upload your portrait and files.
