import { useEffect, useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { isStorageRef, parseStorageRef, validateUpload, type Bucket } from "@/lib/media";

export function useMediaUrl(value: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!value) return setUrl(null);
    if (!isStorageRef(value)) return setUrl(value);
    const { bucket, path } = parseStorageRef(value);
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600)
      .then(({ data }) => alive && setUrl(data?.signedUrl ?? null));
    return () => {
      alive = false;
    };
  }, [value]);
  return url;
}

async function upload(file: File, bucket: Bucket): Promise<string | null> {
  const err = validateUpload(file, bucket);
  if (err) {
    toast.error(err);
    return null;
  }
  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    toast.error(`Upload failed: ${error.message}`);
    return null;
  }
  return `sb:${bucket}/${path}`;
}

async function removeStored(value: string | null | undefined) {
  if (!isStorageRef(value)) return;
  const { bucket, path } = parseStorageRef(value);
  await supabase.storage.from(bucket).remove([path]);
}

function Preview({ value, onRemove }: { value: string; onRemove: () => void }) {
  const url = useMediaUrl(value);
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-muted">
      {url ? (
        <img src={url} alt="" className="aspect-video w-full object-cover" />
      ) : (
        <div className="aspect-video w-full animate-pulse" />
      )}
      <Button
        type="button"
        size="icon"
        variant="destructive"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-2 top-2 h-9 w-9"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export function ImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(f?: File) {
    if (!f) return;
    setBusy(true);
    const r = await upload(f, "images");
    setBusy(false);
    if (r) {
      const old = value;
      onChange(r);
      await removeStored(old);
    }
  }
  return (
    <div className="space-y-2">
      {value && (
        <Preview
          value={value}
          onRemove={async () => {
            await removeStored(value);
            onChange(null);
          }}
        />
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}{" "}
        {value ? "Replace image" : "Upload image"}
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF or AVIF · up to 5 MB</p>
    </div>
  );
}

export function GalleryField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      const r = await upload(f, "images");
      if (r) added.push(r);
    }
    setBusy(false);
    onChange([...value, ...added]);
  }
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((v) => (
            <Preview
              key={v}
              value={v}
              onRemove={async () => {
                await removeStored(v);
                onChange(value.filter((x) => x !== v));
              }}
            />
          ))}
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} Add images
      </Button>
    </div>
  );
}

export function FileField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = useMediaUrl(value);
  async function pick(f?: File) {
    if (!f) return;
    setBusy(true);
    const r = await upload(f, "files");
    setBusy(false);
    if (r) {
      const old = value;
      onChange(r);
      await removeStored(old);
    }
  }
  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-3 rounded-2xl border bg-muted/50 p-3">
          <FileText className="h-5 w-5 shrink-0 text-gold-deep" />
          <a
            href={url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm underline-offset-2 hover:underline"
          >
            {value.split("/").pop()}
          </a>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove file"
            onClick={async () => {
              await removeStored(value);
              onChange(null);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept=".pdf,.epub,.zip,.txt"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Upload />}{" "}
        {value ? "Replace file" : "Upload file"}
      </Button>
      <p className="text-xs text-muted-foreground">PDF, EPUB, ZIP or TXT · up to 50 MB</p>
    </div>
  );
}
