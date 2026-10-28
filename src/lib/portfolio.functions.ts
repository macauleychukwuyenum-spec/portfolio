import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { collectRefs, parseStorageRef, replaceRefs } from "./media";

type Tables = Database["public"]["Tables"];
export type SiteSettings = Tables["site_settings"]["Row"];
export type AboutBlock = Tables["about_blocks"]["Row"];
export type Stat = Tables["stats"]["Row"];
export type Project = Tables["projects"]["Row"];
export type SourceCode = Tables["source_code"]["Row"];
export type ClassItem = Tables["classes"]["Row"];
export type Ebook = Tables["ebooks"]["Row"];
export type SocialLink = Tables["social_links"]["Row"];

function publicClient() {
  // Server reads the same public values; SUPABASE_* overrides are optional.
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key)
    throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. See .env.example.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function signAll<T>(sb: SupabaseClient<Database>, value: T): Promise<T> {
  const refs = [...collectRefs(value)];
  if (!refs.length) return value;
  const byBucket = new Map<string, string[]>();
  for (const r of refs) {
    const { bucket, path } = parseStorageRef(r);
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), path]);
  }
  const map = new Map<string, string>();
  await Promise.all(
    [...byBucket].map(async ([bucket, paths]) => {
      const { data } = await sb.storage.from(bucket).createSignedUrls(paths, 60 * 60 * 24);
      data?.forEach((d) => {
        if (d.signedUrl && d.path) map.set(`sb:${bucket}/${d.path}`, d.signedUrl);
      });
    }),
  );
  return replaceRefs(value, map);
}

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const order = { ascending: true } as const;
  const [settings, about, stats, projects, source, classes, ebooks, socials] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("about_blocks").select("*").eq("published", true).order("sort_order", order),
    sb.from("stats").select("*").eq("published", true).order("sort_order", order),
    sb
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("sort_order", order),
    sb.from("source_code").select("*").eq("published", true).order("sort_order", order),
    sb.from("classes").select("*").eq("published", true).order("sort_order", order),
    sb.from("ebooks").select("*").eq("published", true).order("sort_order", order),
    sb.from("social_links").select("*").eq("published", true).order("sort_order", order),
  ]);
  const err = [settings, about, stats, projects, source, classes, ebooks, socials].find(
    (r) => r.error,
  );
  if (err?.error) throw new Error(err.error.message);
  return signAll(sb, {
    settings: settings.data as SiteSettings | null,
    about: about.data ?? [],
    stats: stats.data ?? [],
    projects: projects.data ?? [],
    sourceCode: source.data ?? [],
    classes: classes.data ?? [],
    ebooks: ebooks.data ?? [],
    socials: socials.data ?? [],
  });
});

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: project, error }, { data: settings }, { data: socials }] = await Promise.all([
      sb.from("projects").select("*").eq("slug", data.slug).eq("published", true).maybeSingle(),
      sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      sb.from("social_links").select("*").eq("published", true).order("sort_order"),
    ]);
    if (error) throw new Error(error.message);
    return signAll(sb, { project, settings, socials: socials ?? [] });
  });
