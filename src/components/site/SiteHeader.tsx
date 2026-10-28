import { useEffect, useState } from "react";
import {
  BookOpen,
  Code2,
  FolderKanban,
  GraduationCap,
  Heart,
  Home,
  Mail,
  Menu,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#home", label: "Home", icon: Home },
  { href: "/#about", label: "About", icon: User },
  { href: "/#projects", label: "Projects", icon: FolderKanban },
  { href: "/#source-code", label: "Source Code", icon: Code2 },
  { href: "/#classes", label: "Classes", icon: GraduationCap },
  { href: "/#ebooks", label: "E-books", icon: BookOpen },
  { href: "/#contact", label: "Contact", icon: Mail },
  { href: "/#support", label: "Support me", icon: Heart },
];

export function BrandMark({ name }: { name: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-gradient font-display text-xl text-gold-foreground shadow-soft">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="truncate text-lg font-bold tracking-tight">{name}</span>
    </span>
  );
}

export function SiteHeader({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="surface pointer-events-auto mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full py-2 pl-4 pr-2 sm:pl-5">
        <a href="/#home" className="min-w-0" aria-label={`${brand} home`}>
          <BrandMark name={brand} />
        </a>
        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="!size-5" /> : <Menu className="!size-5" />}
          </Button>
        </div>
      </div>

      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "mx-auto mt-2 max-w-6xl origin-top transition-all duration-300 lg:hidden",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <nav className="surface rounded-3xl p-3" aria-label="Mobile">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <n.icon className="h-5 w-5 text-gold-deep" aria-hidden /> {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
