import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, PasswordInput } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password — Chozen" },
      { name: "description", content: "Set a new password for your account." },
      { property: "og:title", content: "Choose a new password — Chozen" },
      { property: "og:description", content: "Set a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
    });
    const t = setTimeout(() => setReady((r) => (r === null ? false : r)), 4000);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== confirm) return setError("The passwords don't match.");
    setError(undefined);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return setError(error.message);
    await supabase.auth.signOut();
    toast.success("Password updated. Please sign in.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <AuthShell title="New password" subtitle="Choose a strong password you haven't used before.">
      {ready === null ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" aria-label="Checking link" />
      ) : ready === false ? (
        <div className="space-y-4 text-center">
          <p>This reset link is invalid or has expired.</p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field id="password" label="New password">
            <PasswordInput id="password" name="password" autoComplete="new-password" />
          </Field>
          <Field id="confirm" label="Confirm password" error={error}>
            <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
