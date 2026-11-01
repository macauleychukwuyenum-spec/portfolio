import type { ReactNode } from "react";
import { ArrowUpRight, Download, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Section({
  id,
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  accent?: string | undefined;
  intro?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <span className="inline-block rounded-full border border-gold/40 bg-gold-soft/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
            {eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            {title} {accent && <em className="text-gold-gradient">{accent}</em>}
          </h2>
          {intro && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {intro}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="surface mx-auto flex max-w-md flex-col items-center rounded-3xl px-6 py-12 text-center">
      <Inbox className="h-10 w-10 text-gold" aria-hidden />
      <p className="mt-4 font-display text-2xl">Nothing here yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        New {label} will show up here as soon as they're published.
      </p>
    </div>
  );
}

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: string | null;
  link: string | null;
  linkLabel: string;
  file: string | null;
  price?: string | null;
  extraLink?: { href: string; label: string } | null;
};

export function ResourceGrid({
  items,
  aspect = "aspect-[16/10]",
}: {
  items: ResourceItem[];
  aspect?: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <article key={it.id} className="surface lift flex flex-col overflow-hidden rounded-3xl">
          {it.image ? (
            <img src={it.image} alt="" loading="lazy" className={`${aspect} w-full object-cover`} />
          ) : (
            <div className={`${aspect} deco-curves w-full bg-gold-soft/50`} aria-hidden />
          )}
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {it.category && (
                <Badge variant="secondary" className="rounded-full">
                  {it.category}
                </Badge>
              )}
              {it.price && (
                <span className="ml-auto text-sm font-bold text-gold-deep">{it.price}</span>
              )}
            </div>
            <h3 className="text-lg font-bold leading-snug">{it.title}</h3>
            {it.description && (
              <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {it.description}
              </p>
            )}
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {it.link && (
                <a
                  href={it.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {it.linkLabel} <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              )}
              {it.extraLink && (
                <a
                  href={it.extraLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-accent"
                >
                  {it.extraLink.label} <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              )}
              {it.file && (
                <a
                  href={it.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-accent"
                >
                  <Download className="h-4 w-4" aria-hidden /> Download
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
