import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, Field, PasswordInput } from "@/components/auth/AuthShell";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password").max(200),
});

export function SignInForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{
    email?: string | undefined;
    password?: string | undefined;
    form?: string | undefined;
  }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      setErrors({
        form:
          error.message === "Invalid login credentials"
            ? "That email and password don't match."
            : error.message,
      });
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your portfolio.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="h-12 rounded-xl text-base"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password}
          extra={
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-gold-deep hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </Field>
        {errors.form && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
