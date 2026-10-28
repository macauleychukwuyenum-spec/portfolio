import { useState } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Code2,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Heart,
  Settings,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandMark } from "@/components/site/SiteHeader";
import { SignInForm } from "@/components/auth/SignInForm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      if (location.pathname.replace(/\/+$/, "") !== "/admin")
        throw redirect({ to: "/admin", replace: true });
      return { user: null, isAdmin: false };
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    return { user: data.user, isAdmin: Boolean(isAdmin) };
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Chozen" },
      { name: "description", content: "Manage the Chozen portfolio." },
      { property: "og:title", content: "Dashboard — Chozen" },
      { property: "og:description", content: "Manage the Chozen portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/settings", label: "Profile & settings", icon: Settings },
  { to: "/admin/about", label: "About", icon: User },
  { to: "/admin/stats", label: "Skills & stats", icon: Sparkles },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/source-code", label: "Source code", icon: Code2 },
  { to: "/admin/classes", label: "Classes", icon: GraduationCap },
  { to: "/admin/ebooks", label: "E-books", icon: BookOpen },
  { to: "/admin/socials", label: "Social links", icon: Share2 },
  { to: "/admin/support", label: "Support payments", icon: Heart },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1" aria-label="Dashboard">
      {NAV.map((n) => {
        const active =
          n.to === "/admin" ? path === "/admin" || path === "/admin/" : path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gold-soft text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <n.icon className={cn("h-4 w-4", active && "text-gold-deep")} aria-hidden /> {n.label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
      >
        <ExternalLink className="h-4 w-4" aria-hidden /> View website
      </a>
    </nav>
  );
}

function AdminLayout() {
  const { user, isAdmin } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  if (!user) return <SignInForm />;

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="surface max-w-md rounded-3xl p-8 text-center">
          <h1 className="font-display text-3xl">No access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.email} isn't the administrator of this portfolio.
          </p>
          <Button className="mt-6" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </main>
    );
  }

  const footer = (
    <div className="border-t pt-4">
      <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
      <Button variant="ghost" className="mt-2 w-full justify-start" onClick={signOut}>
        <LogOut /> Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r bg-sidebar p-4 lg:flex">
        <Link to="/admin" className="px-2 pt-2">
          <BrandMark name="Chozen" />
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        {footer}
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/admin" className="min-w-0">
          <BrandMark name="Chozen" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open dashboard menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="!size-5" />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-72 flex-col gap-6 bg-sidebar p-4">
          <SheetTitle className="px-2 pt-2">
            <BrandMark name="Chozen" />
          </SheetTitle>
          <div className="flex-1 overflow-y-auto">
            <NavList onNavigate={() => setOpen(false)} />
          </div>
          {footer}
        </SheetContent>
      </Sheet>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
