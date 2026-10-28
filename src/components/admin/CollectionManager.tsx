import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileField, GalleryField, ImageField, useMediaUrl } from "./MediaField";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "tags" | "image" | "gallery" | "file" | "select" | "switch";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  max?: number;
};

type Rec = {
  id?: string;
  published?: boolean;
  featured?: boolean;
  slug?: string;
  sort_order?: number;
  [k: string]: unknown;
};
type Row = Rec & { id: string; published: boolean; sort_order: number };

export type CollectionTable =
  "projects" | "source_code" | "classes" | "ebooks" | "about_blocks" | "stats" | "social_links";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "item";

function isUrl(v: string) {
  if (v.startsWith("mailto:") || v.startsWith("tel:") || v.startsWith("/") || v.startsWith("#"))
    return true;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function Thumb({ value }: { value: unknown }) {
  const url = useMediaUrl(typeof value === "string" ? value : null);
  return url ? (
    <img src={url} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
  ) : (
    <div className="deco-curves h-14 w-20 shrink-0 rounded-xl bg-gold-soft/60" />
  );
}

export function CollectionManager({
  table,
  title,
  singular,
  fields,
  imageField,
  subtitleField,
  slugFrom,
  featured,
}: {
  table: CollectionTable;
  title: string;
  singular: string;
  fields: FieldDef[];
  imageField?: string;
  subtitleField?: string;
  slugFrom?: string;
  featured?: boolean;
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const tbl = () =>
    supabase.from(table as "projects") as unknown as ReturnType<typeof supabase.from>;
  const {
    data: rows,
    isLoading,
    error,
  } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await tbl().select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
  const [editing, setEditing] = useState<Rec | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin", "counts"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const save = useMutation({
    mutationFn: async (values: Rec) => {
      const { id, created_at: _c, updated_at: _u, ...rest } = values;
      if (id) {
        const { error } = await tbl()
          .update(rest as never)
          .eq("id", id as string);
        if (error) throw error;
      } else {
        const max = Math.max(-1, ...(rows ?? []).map((r) => r.sort_order));
        const { error } = await tbl().insert({ ...rest, sort_order: max + 1 } as never);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.published ? `${singular} published` : `${singular} saved as draft`);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("duplicate")
          ? "That URL slug is already used — choose another."
          : e.message,
      ),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Rec }) => {
      const { error } = await tbl()
        .update(values as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await tbl().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${singular} deleted`);
      setDeleting(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function move(i: number, dir: -1 | 1) {
    if (!rows) return;
    const a = rows[i],
      b = rows[i + dir];
    if (!a || !b) return;
    const ao = a.sort_order === b.sort_order ? i : a.sort_order;
    const bo = a.sort_order === b.sort_order ? i + dir : b.sort_order;
    await Promise.all([
      tbl()
        .update({ sort_order: bo } as never)
        .eq("id", a.id),
      tbl()
        .update({ sort_order: ao } as never)
        .eq("id", b.id),
    ]);
    invalidate();
  }

  function blank() {
    const o: Rec = { published: false };
    for (const f of fields)
      o[f.name] =
        f.type === "tags" || f.type === "gallery"
          ? []
          : f.type === "switch"
            ? false
            : f.type === "select"
              ? (f.options?.[0] ?? "")
              : f.type === "image" || f.type === "file"
                ? null
                : "";
    return o;
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl sm:text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {rows
              ? `${rows.length} total · ${rows.filter((r) => r.published).length} published`
              : " "}
          </p>
        </div>
        <Button onClick={() => setEditing(blank())}>
          <Plus /> <span className="hidden sm:inline">Add {singular.toLowerCase()}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface h-20 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          Couldn't load: {(error as Error).message}
        </p>
      ) : !rows?.length ? (
        <div className="surface rounded-3xl p-10 text-center">
          <p className="font-display text-2xl">No {title.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first {singular.toLowerCase()} to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li
              key={r.id}
              className="surface flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {imageField && <Thumb value={r[imageField]} />}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-semibold">
                    {featured && Boolean(r.featured) && (
                      <Star
                        className="h-4 w-4 shrink-0 fill-gold text-gold"
                        aria-label="Featured"
                      />
                    )}
                    <span className="truncate">{String(r[fields[0]!.name] ?? "")}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={r.published ? "default" : "secondary"} className="rounded-full">
                      {r.published ? "Published" : "Draft"}
                    </Badge>
                    {subtitleField && r[subtitleField] ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {String(r[subtitleField])}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Move down"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patch.mutate(
                      { id: r.id, values: { published: !r.published } },
                      { onSuccess: () => toast.success(r.published ? "Unpublished" : "Published") },
                    )
                  }
                >
                  {r.published ? (
                    <>
                      <EyeOff /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye /> Publish
                    </>
                  )}
                </Button>
                <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(r)}>
                  <Pencil />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete"
                  className="text-destructive"
                  onClick={() => setDeleting(r)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editing?.id ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
            </SheetTitle>
            <SheetDescription>Drafts stay hidden from visitors until you publish.</SheetDescription>
          </SheetHeader>
          {editing && (
            <ItemForm
              key={String(editing.id ?? "new")}
              initial={editing}
              fields={fields}
              featured={featured}
              slugFrom={slugFrom}
              saving={save.isPending}
              onSubmit={(v) => save.mutate(v)}
              onCancel={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              “{String(deleting?.[fields[0]!.name] ?? "")}” will be removed permanently. This can't
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (deleting) remove.mutate(deleting.id);
              }}
            >
              {remove.isPending && <Loader2 className="animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ItemForm({
  initial,
  fields,
  featured,
  slugFrom,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: Rec;
  fields: FieldDef[];
  featured?: boolean | undefined;
  slugFrom?: string | undefined;
  saving: boolean;
  onSubmit: (v: Rec) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Rec>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, val: unknown) => setV((p) => ({ ...p, [k]: val }));

  function submit(published: boolean) {
    const e: Record<string, string> = {};
    const out: Rec = { ...v, published };
    for (const f of fields) {
      const val = v[f.name];
      if (typeof val === "string") out[f.name] = val.trim();
      const s = typeof out[f.name] === "string" ? (out[f.name] as string) : "";
      if (f.required && (f.type === "text" || f.type === "textarea" || f.type === "url") && !s)
        e[f.name] = `${f.label} is required`;
      if (f.type === "url" && s && !isUrl(s))
        e[f.name] = "Enter a full link starting with https://";
      if (f.max && s.length > f.max) e[f.name] = `Keep it under ${f.max} characters`;
      if ((f.type === "url" || f.type === "select") && !s && !f.required) out[f.name] = null;
    }
    if (slugFrom) out.slug = slugify(String(v.slug || v[slugFrom] || ""));
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    onSubmit(out);
  }

  return (
    <form
      className="mt-6 space-y-5 pb-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit(Boolean(v.published));
      }}
      noValidate
    >
      {fields.map((f) => (
        <div key={f.name} className="space-y-2">
          {f.type === "switch" ? (
            <div className="flex items-center justify-between gap-4 rounded-2xl border p-3">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Switch
                id={f.name}
                checked={Boolean(v[f.name])}
                onCheckedChange={(c) => set(f.name, c)}
              />
            </div>
          ) : (
            <>
              <Label htmlFor={f.name}>
                {f.label}
                {f.required && <span className="text-destructive"> *</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  rows={5}
                  value={String(v[f.name] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                  aria-invalid={!!errors[f.name]}
                />
              ) : f.type === "tags" ? (
                <Input
                  id={f.name}
                  value={((v[f.name] as string[]) ?? []).join(", ")}
                  placeholder={f.placeholder ?? "Comma separated"}
                  onChange={(e) =>
                    set(
                      f.name,
                      e.target.value
                        .split(",")
                        .map((x) => x.trimStart())
                        .filter((x, i, a) => x || i === a.length - 1),
                    )
                  }
                  onBlur={(e) =>
                    set(
                      f.name,
                      e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    )
                  }
                />
              ) : f.type === "image" ? (
                <ImageField
                  value={(v[f.name] as string) ?? null}
                  onChange={(x) => set(f.name, x)}
                />
              ) : f.type === "gallery" ? (
                <GalleryField
                  value={(v[f.name] as string[]) ?? []}
                  onChange={(x) => set(f.name, x)}
                />
              ) : f.type === "file" ? (
                <FileField value={(v[f.name] as string) ?? null} onChange={(x) => set(f.name, x)} />
              ) : f.type === "select" ? (
                <select
                  id={f.name}
                  value={String(v[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={f.name}
                  type={f.type === "url" ? "url" : "text"}
                  inputMode={f.type === "url" ? "url" : undefined}
                  value={String(v[f.name] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                  aria-invalid={!!errors[f.name]}
                />
              )}
            </>
          )}
          {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
          {errors[f.name] && <p className="text-sm text-destructive">{errors[f.name]}</p>}
        </div>
      ))}
      {slugFrom && (
        <div className="space-y-2">
          <Label htmlFor="slug">Page address</Label>
          <Input
            id="slug"
            value={String(v.slug ?? "")}
            placeholder={slugify(String(v[slugFrom] ?? "")) || "auto from title"}
            onChange={(e) => set("slug", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Used in the link: /projects/{slugify(String(v.slug || v[slugFrom] || "")) || "…"}
          </p>
        </div>
      )}
      {featured && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border p-3">
          <Label htmlFor="featured">Featured</Label>
          <Switch
            id="featured"
            checked={Boolean(v.featured)}
            onCheckedChange={(c) => set("featured", c)}
          />
        </div>
      )}
      <div className="sticky bottom-0 -mx-6 flex flex-col-reverse gap-2 border-t bg-card px-6 py-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => submit(false)}>
          Save draft
        </Button>
        <Button type="button" variant="gold" disabled={saving} onClick={() => submit(true)}>
          {saving && <Loader2 className="animate-spin" />} Publish
        </Button>
      </div>
    </form>
  );
}
