<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Portfolio architecture
- The repo itself is portable: plain Vite config (Nitro auto-detects host), app code uses `src/lib/supabase.ts` (env-validated, VITE_ vars only), SQL lives in `supabase/migrations`; no Drizzle or @lovable packages, so it runs on any Node host/Vercel.
- Public pages read content through server functions in `src/lib/portfolio.functions.ts` (publishable client, published rows only) so SSR works and drafts never leak.
- Admin pages under `/admin` (ssr:false gate, inline owner sign-in at `/admin`, signed-out child routes redirect to `/admin`) write directly with the browser client; RLS `has_role(auth.uid(),'admin')` is the real authorization.
- Media columns store `sb:<bucket>/<path>` refs (buckets `images`, `files` are private because public buckets are blocked); resolve to signed URLs server-side for public pages and via `useMediaUrl` in admin.
- Public sign-up is disabled; the first account created (Users → Add user) becomes admin via a trigger on auth.users.
- Content collections share one config-driven `CollectionManager`; add new types by passing field definitions, not new editors.
- The shared public portfolio query uses bounded freshness and admin-write invalidation to avoid redundant reads without hiding saved updates.
- Sign private media URLs concurrently by bucket to avoid serial storage requests while preserving private access.
- Admin leaf routes use the shared `adminHead` helper for distinct titles and private indexing metadata.

- The shared owner sign-in form renders only when the admin gate has no user; never render protected child content until authenticated, so private queries do not run signed out.
