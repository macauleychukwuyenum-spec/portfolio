import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Shared browser Supabase client. Reads only public VITE_ variables
 * (project URL + publishable/anon key). Never put a service-role key here.
 */
export function readSupabaseConfig() {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  const missing = [!url && "VITE_SUPABASE_URL", !key && "VITE_SUPABASE_PUBLISHABLE_KEY"].filter(
    Boolean,
  );
  if (missing.length) {
    throw new Error(
      `Missing environment variable(s): ${missing.join(", ")}. Copy .env.example to .env.local, fill in your Supabase values and restart the dev server.`,
    );
  }
  if (!/^https?:\/\//.test(url!))
    throw new Error("VITE_SUPABASE_URL must start with https:// (e.g. https://abc.supabase.co).");
  return { url: url!.replace(/\/+$/, ""), key: key! };
}

function create() {
  const { url, key } = readSupabaseConfig();
  return createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: {
      // New sb_publishable_ keys are opaque (not JWTs): send them as apikey only.
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        new Headers(init?.headers).forEach((v, k) => headers.set(k, v));
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

let client: ReturnType<typeof create> | undefined;
export const supabase = new Proxy({} as ReturnType<typeof create>, {
  get(_, prop) {
    client ??= create();
    return Reflect.get(client, prop);
  },
});
