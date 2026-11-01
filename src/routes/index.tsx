import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Mail, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPortfolio } from "@/lib/portfolio.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter, SocialRow } from "@/components/site/SiteFooter";
import { EmptyState, ResourceGrid, Section } from "@/components/site/Section";
import { ContentIcon } from "@/components/site/icons";
import { SupportSection } from "@/components/site/SupportSection";
import { usePortfolioMotion } from "@/hooks/use-portfolio-motion";

export const portfolioQuery = queryOptions({
  queryKey: ["portfolio"],
  queryFn: () => getPortfolio(),
  staleTime: 30_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
  head: ({ loaderData }) => {
    const title = loaderData?.settings?.meta_title || "Chozen — Portfolio";
    const description =
      loaderData?.settings?.meta_description ||
      "Projects, source code, classes and e-books by Chozen.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(/^https:\/\//.test(loaderData?.settings?.hero_image ?? "")
          ? [
              { property: "og:image", content: loaderData?.settings?.hero_image ?? "" },
              { name: "twitter:image", content: loaderData?.settings?.hero_image ?? "" },
            ]
          : []),
      ],
      links: loaderData?.settings?.hero_image
        ? [
            {
              rel: "preload",
              as: "image",
              href: loaderData.settings.hero_image,
              fetchpriority: "high",
            },
          ]
        : [],
    };
  },
  component: Index,
});

function CtaLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "default" | "soft";
}) {
  const external = /^https?:\/\//.test(href);
  return (
    <Button asChild size="lg" variant={variant} className="w-full sm:w-auto">
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {label} <ArrowRight />
      </a>
    </Button>
  );
}

function Index() {
  const motionRef = usePortfolioMotion();
  const { data } = useSuspenseQuery(portfolioQuery);
  const s = data.settings;
  const brand = s?.brand_name || "Chozen";
  const skills = data.stats.filter((x) => x.kind === "skill");
  const stats = data.stats.filter((x) => x.kind === "stat");

  return (
    <div ref={motionRef} className="portfolio-motion">
      <SiteHeader brand={brand} />
      <main>
        {/* Hero */}
        <section id="home" className="relative overflow-hidden px-5 pb-16 pt-28 sm:pt-36 lg:pb-24">
          <div
            className="deco-curves pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-70"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="portfolio-intro order-2 text-center lg:order-1 lg:text-left">
              {s?.hero_eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-gold" aria-hidden /> {s.hero_eyebrow}
                </span>
              )}
              <h1 className="mt-5 font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
                {s?.hero_name || brand}
              </h1>
              {s?.hero_title && (
                <p className="mt-3 text-xl font-semibold text-gold-deep sm:text-2xl">
                  {s.hero_title}
                </p>
              )}
              {s?.hero_intro && (
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                  {s.hero_intro}
                </p>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                {s?.primary_cta_label && (
                  <CtaLink
                    href={s.primary_cta_href}
                    label={s.primary_cta_label}
                    variant="default"
                  />
                )}
                {s?.secondary_cta_label && (
                  <CtaLink
                    href={s.secondary_cta_href}
                    label={s.secondary_cta_label}
                    variant="soft"
                  />
                )}
              </div>
            </div>
            <div className="portfolio-portrait order-1 mx-auto w-full max-w-[17rem] sm:max-w-sm lg:order-2 lg:max-w-md">
              <div className="relative aspect-square rounded-full bg-gold-gradient p-1.5 shadow-lift">
                <div className="h-full w-full overflow-hidden rounded-full bg-card">
                  {s?.hero_image ? (
                    <img
                      src={s.hero_image}
                      alt={`Portrait of ${s.hero_name || brand}`}
                      className="h-full w-full object-cover object-top"
                      fetchPriority="high"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-display text-8xl text-gold">
                      {brand.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {skills.length > 0 && (
          <div className="border-y border-border/70 bg-card/50 px-5 py-4">
            <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {skills.map((k) => (
                <li key={k.id} className="flex items-center gap-2 text-sm font-semibold">
                  <ContentIcon name={k.icon} className="h-4 w-4 text-gold-deep" /> {k.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {s?.show_about !== false && (
          <Section
            id="about"
            eyebrow="About"
            title={s?.about_heading || "About me"}
            intro={s?.about_intro || undefined}
          >
            {data.about.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {data.about.map((b) => (
                  <article key={b.id} className="surface rounded-3xl p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold-deep">
                        <ContentIcon name={b.icon} className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-bold">{b.title}</h3>
                    </div>
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                      {b.body}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {s?.show_stats !== false && stats.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
                {stats.map((st) => (
                  <div key={st.id} className="surface lift rounded-3xl p-6 text-center">
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold-deep">
                      <ContentIcon name={st.icon} className="h-5 w-5" />
                    </span>
                    <p className="mt-3 font-display text-5xl text-gold-gradient">{st.value}</p>
                    <p className="mt-1 text-sm font-semibold">{st.label}</p>
                    {st.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{st.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {s?.show_projects !== false && (
          <Section id="projects" eyebrow="My work" title="Featured" accent="projects">
            {data.projects.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.projects.map((p) => (
                  <Link
                    key={p.id}
                    to="/projects/$slug"
                    params={{ slug: p.slug }}
                    className="surface lift group flex flex-col overflow-hidden rounded-3xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="deco-curves h-full w-full bg-gold-soft/50" />
                      )}
                      {p.featured && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold">
                          <Star className="h-3 w-3 fill-gold text-gold" aria-hidden /> Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      {p.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-gold-deep">
                          {p.category}
                        </span>
                      )}
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {p.short_description}
                      </p>
                      {p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.technologies.slice(0, 4).map((t) => (
                            <Badge key={t} variant="secondary" className="rounded-full">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold">
                        View project{" "}
                        <ArrowUpRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState label="projects" />
            )}
          </Section>
        )}

        {s?.show_source_code !== false && (
          <Section id="source-code" eyebrow="Code library" title="Source" accent="code">
            {data.sourceCode.length ? (
              <ResourceGrid
                items={data.sourceCode.map((x) => ({
                  id: x.id,
                  title: x.title,
                  description: x.description,
                  image: x.cover_image,
                  category: x.category,
                  link: x.repo_url,
                  linkLabel: "Repository",
                  file: x.download_file,
                  price: x.price_label,
                  extraLink: x.demo_url ? { href: x.demo_url, label: "Demo" } : null,
                }))}
              />
            ) : (
              <EmptyState label="code resources" />
            )}
          </Section>
        )}

        {s?.show_classes !== false && (
          <Section id="classes" eyebrow="Learn" title="Classes &" accent="tutorials">
            {data.classes.length ? (
              <ResourceGrid
                items={data.classes.map((x) => ({
                  id: x.id,
                  title: x.title,
                  description: x.description,
                  image: x.thumbnail,
                  category: x.category,
                  link: x.resource_url,
                  linkLabel: "Open class",
                  file: x.download_file,
                }))}
              />
            ) : (
              <EmptyState label="classes" />
            )}
          </Section>
        )}

        {s?.show_ebooks !== false && (
          <Section id="ebooks" eyebrow="Resources" title="Guides &" accent="e-books">
            {data.ebooks.length ? (
              <ResourceGrid
                aspect="aspect-[3/4]"
                items={data.ebooks.map((x) => ({
                  id: x.id,
                  title: x.title,
                  description: x.description,
                  image: x.cover_image,
                  category: x.category,
                  link: x.resource_url,
                  linkLabel: "Get it",
                  file: x.download_file,
                  price: x.price_label,
                }))}
              />
            ) : (
              <EmptyState label="e-books" />
            )}
          </Section>
        )}

        <section id="contact" className="px-5 py-16 sm:py-24">
          <div className="surface deco-curves mx-auto max-w-4xl rounded-[2rem] px-6 py-12 text-center sm:px-12 sm:py-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
              Contact
            </span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">{s?.contact_heading}</h2>
            {s?.contact_text && (
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{s.contact_text}</p>
            )}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {s?.contact_email && (
                <Button asChild size="lg" variant="gold">
                  <a href={`mailto:${s.contact_email}`}>
                    <Mail /> {s.contact_cta_label}
                  </a>
                </Button>
              )}
              {s?.whatsapp_number && (
                <Button asChild size="lg" variant="soft">
                  <a
                    href={`https://wa.me/${s.whatsapp_number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <SocialRow socials={data.socials} />
            </div>
          </div>
        </section>
        {s?.show_support !== false && (
          <SupportSection
            brand={brand}
            heading={s?.support_heading || "Support the work"}
            text={s?.support_text ?? ""}
            amounts={s?.support_amounts ?? []}
          />
        )}
      </main>
      <SiteFooter brand={brand} text={s?.footer_text ?? ""} socials={data.socials} />
    </div>
  );
}
