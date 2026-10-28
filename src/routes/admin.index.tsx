import { adminHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Code2, FileClock, FolderKanban, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  head: () => adminHead("Overview", "View content totals for the Chozen portfolio."),
  component: Overview,
});

const TABLES = ["projects", "classes", "ebooks", "source_code", "about_blocks", "stats"] as const;

async function count(table: (typeof TABLES)[number], published?: boolean) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (published !== undefined) q = q.eq("published", published);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

function Overview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [projects, classes, ebooks, source, ...drafts] = await Promise.all([
        count("projects", true),
        count("classes", true),
        count("ebooks", true),
        count("source_code", true),
        ...TABLES.map((t) => count(t, false)),
      ]);
      return { projects, classes, ebooks, source, drafts: drafts.reduce((a, b) => a + b, 0) };
    },
  });

  const cards = [
    {
      label: "Published projects",
      value: data?.projects,
      icon: FolderKanban,
      to: "/admin/projects",
    },
    { label: "Published classes", value: data?.classes, icon: GraduationCap, to: "/admin/classes" },
    { label: "Published e-books", value: data?.ebooks, icon: BookOpen, to: "/admin/ebooks" },
    { label: "Published source code", value: data?.source, icon: Code2, to: "/admin/source-code" },
    {
      label: "Drafts awaiting publication",
      value: data?.drafts,
      icon: FileClock,
      to: "/admin/projects",
    },
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl">Overview</h1>
      <p className="text-sm text-muted-foreground">
        A live summary of everything on your portfolio.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error).message}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="surface lift rounded-3xl p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-soft text-gold-deep">
              <c.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 font-display text-5xl">
              {isLoading ? (
                <span className="inline-block h-10 w-12 animate-pulse rounded bg-muted" />
              ) : (
                c.value
              )}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
