// Media values are stored as either an absolute/relative URL or a storage reference "sb:<bucket>/<path>".
export type Bucket = "images" | "files" | "receipts";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const FILE_MAX_BYTES = 50 * 1024 * 1024;
export const FILE_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
  "text/plain",
];

export function isStorageRef(v: unknown): v is string {
  return typeof v === "string" && v.startsWith("sb:");
}

export function parseStorageRef(ref: string): { bucket: Bucket; path: string } {
  const rest = ref.slice(3);
  const i = rest.indexOf("/");
  return { bucket: rest.slice(0, i) as Bucket, path: rest.slice(i + 1) };
}

export function validateUpload(file: File, bucket: Bucket): string | null {
  if (bucket === "images") {
    if (!IMAGE_TYPES.includes(file.type))
      return "Please choose a JPG, PNG, WebP, GIF or AVIF image.";
    if (file.size > IMAGE_MAX_BYTES) return "Images must be 5 MB or smaller.";
  } else {
    if (!FILE_TYPES.includes(file.type)) return "Allowed files: PDF, EPUB, ZIP or TXT.";
    if (file.size > FILE_MAX_BYTES) return "Files must be 50 MB or smaller.";
  }
  return null;
}

/** Collect every storage ref inside a JSON-like value. */
export function collectRefs(value: unknown, out = new Set<string>()): Set<string> {
  if (isStorageRef(value)) out.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectRefs(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectRefs(v, out));
  return out;
}

/** Replace storage refs with resolved URLs (deep). */
export function replaceRefs<T>(value: T, map: Map<string, string>): T {
  if (isStorageRef(value)) return (map.get(value) ?? null) as T;
  if (Array.isArray(value))
    return value.map((v) => replaceRefs(v, map)).filter((v) => v !== null) as T;
  if (value && typeof value === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) o[k] = replaceRefs(v, map);
    return o as T;
  }
  return value;
}
