import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProject } from "@/lib/portfolio.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const projectQuery = (slug: string) =>
  queryOptions({ queryKey: ["project", slug], queryFn: () => getProject({ data: { slug } }) });

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!d.project) throw notFound();
    return d;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    const title = p
      ? `${p.title} — ${loaderData?.settings?.brand_name ?? "Chozen"}`
      : "Project unavailable";
    const description = p?.short_description || "A project from Chozen's portfolio.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(/^https:\/\//.test(p?.cover_image ?? "")
          ? [
              { property: "og:image", content: p?.cover_image ?? "" },
              { name: "twitter:image", content: p?.cover_image ?? "" },
            ]
          : []),
        ...(p ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="font-display text-4xl">Project not found</h1>
        <Button asChild className="mt-6">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const p = data.project;
  if (!p) throw notFound();
  const brand = data.settings?.brand_name || "Chozen";
  return (
    <>
      <SiteHeader brand={brand} />
      <main className="px-5 pb-20 pt-28 sm:pt-36">
        <article className="mx-auto max-w-4xl">
          <Link
            to="/"
            hash="projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> All projects
          </Link>
          {p.category && (
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
              {p.category}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-6xl">{p.title}</h1>
          {p.short_description && (
            <p className="mt-4 text-lg text-muted-foreground">{p.short_description}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {p.live_url && (
              <Button asChild size="lg">
                <a href={p.live_url} target="_blank" rel="noopener noreferrer">
                  Live demo <ArrowUpRight />
                </a>
              </Button>
            )}
            {p.source_url && (
              <Button asChild size="lg" variant="soft">
                <a href={p.source_url} target="_blank" rel="noopener noreferrer">
                  <Github /> Source code
                </a>
              </Button>
            )}
          </div>
          {p.cover_image && (
            <img
              src={p.cover_image}
              alt={`${p.title} cover`}
              className="surface mt-10 w-full rounded-3xl object-cover"
            />
          )}
          {p.technologies.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {p.technologies.map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full px-3 py-1">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          {p.description && (
            <div className="mt-8 whitespace-pre-line text-base leading-relaxed sm:text-lg">
              {p.description}
            </div>
          )}
          {p.gallery.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {p.gallery.map((g, i) => (
                <img
                  key={g}
                  src={g}
                  alt={`${p.title} screenshot ${i + 1}`}
                  loading="lazy"
                  className="surface w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          )}
        </article>
      </main>
      <SiteFooter brand={brand} text={data.settings?.footer_text ?? ""} socials={data.socials} />
    </>
  );
}
