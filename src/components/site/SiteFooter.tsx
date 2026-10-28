import type { SocialLink } from "@/lib/portfolio.functions";
import { BrandMark } from "./SiteHeader";
import { SocialIcon, socialHref } from "./icons";

export function SocialRow({ socials }: { socials: SocialLink[] }) {
  if (!socials.length) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {socials.map((s) => (
        <li key={s.id}>
          <a
            href={socialHref(s.platform, s.url)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label || s.platform}
            className="surface grid h-11 w-11 place-items-center rounded-full text-foreground transition-colors hover:text-gold-deep"
          >
            <SocialIcon platform={s.platform} className="h-5 w-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

const LINKS = [
  { href: "/#projects", label: "Projects" },
  { href: "/#source-code", label: "Source Code" },
  { href: "/#classes", label: "Classes" },
  { href: "/#ebooks", label: "E-books" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/#support", label: "Support me" },
];

export function SiteFooter({
  brand,
  text,
  socials,
}: {
  brand: string;
  text: string;
  socials: SocialLink[];
}) {
  return (
    <footer className="bg-foreground px-5 py-12 text-center text-background">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        <BrandMark name={brand} />
        {text && <p className="max-w-md text-sm text-background/70">{text}</p>}
        <SocialRow socials={socials} />
        <p className="text-sm text-background/60">
          © {new Date().getFullYear()} {brand}. All rights reserved.
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-background/80"
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-gold">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
