import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, Field } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Chozen" },
      { name: "description", content: "Request a password reset link." },
      { property: "og:title", content: "Reset password — Chozen" },
      { property: "og:description", content: "Request a password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = z
      .string()
      .trim()
      .email()
      .max(255)
      .safeParse(new FormData(e.currentTarget).get("email"));
    if (!r.success) return setError("Enter a valid email address");
    setError(undefined);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a link to choose a new password.">
      {sent ? (
        <div className="space-y-5 text-center">
          <MailCheck className="mx-auto h-12 w-12 text-gold" aria-hidden />
          <p>
            If an account exists for that email, a reset link is on its way. Check your inbox and
            spam folder.
          </p>
          <Button asChild variant="soft" className="w-full">
            <Link to="/admin">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field id="email" label="Email" error={error}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-12 rounded-xl text-base"
              aria-invalid={!!error}
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
          <p className="text-center text-sm">
            <Link to="/admin" className="font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
