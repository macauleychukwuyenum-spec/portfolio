import { createClient } from "@supabase/supabase-js";
// Run locally with a secret key from YOUR external project, never in the browser.
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key)
  throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY for your external project.");
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
        headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    },
  },
});
const buckets = [
  ["images", 5 * 1024 * 1024, ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]],
  [
    "files",
    50 * 1024 * 1024,
    [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/epub+zip",
      "text/plain",
    ],
  ],
  ["receipts", 10 * 1024 * 1024, ["image/jpeg", "image/png", "image/webp", "application/pdf"]],
];
const existing = await client.storage.listBuckets();
if (existing.error) throw existing.error;
for (const [name, fileSizeLimit, allowedMimeTypes] of buckets) {
  const options = { public: false, fileSizeLimit, allowedMimeTypes };
  const result = existing.data.some((bucket) => bucket.name === name)
    ? await client.storage.updateBucket(name, options)
    : await client.storage.createBucket(name, options);
  if (result.error) throw new Error(`Could not configure ${name}: ${result.error.message}`);
  console.log(`Configured private ${name} bucket`);
}
