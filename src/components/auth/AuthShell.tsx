import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/site/SiteHeader";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div
        className="deco-curves pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-70"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mx-auto mb-6 flex w-fit">
          <BrandMark name="Chozen" />
        </Link>
        <div className="surface rounded-[2rem] p-6 sm:p-9">
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-medium text-foreground hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}

export function Field({
  id,
  label,
  error,
  children,
  extra,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {extra}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className="h-12 rounded-xl pr-12 text-base"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
