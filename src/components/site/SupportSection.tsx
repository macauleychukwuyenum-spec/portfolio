import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Lock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function SupportSection({
  brand,
  heading,
  text,
  amounts,
}: {
  brand: string;
  heading: string;
  text: string;
  amounts: number[];
}) {
  const navigate = useNavigate();
  const list = amounts.length ? amounts : [2000, 5000, 10000, 20000];
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(list[0]));
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const value = Number(amount.replace(/\D/g, "")) || 0;

  function pick(a: number) {
    setAmount(String(a));
    setErr(null);
    setOpen(true);
  }
  function go() {
    if (value < 100) return setErr("Enter an amount of at least ₦100.");
    if (!z.string().email().safeParse(email.trim()).success)
      return setErr("Enter a valid email address.");
    setOpen(false);
    navigate({
      to: "/support",
      search: { amount: value, email: email.trim(), name: name.trim() || undefined },
    });
  }

  return (
    <section id="support" className="support-band px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="flex items-center gap-3 text-2xl font-bold leading-tight sm:text-3xl">
          <Heart className="h-7 w-7 shrink-0 text-gold sm:h-8 sm:w-8" aria-hidden /> {heading}
        </h2>
        {text && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
            {text}
          </p>
        )}
        <div className="mt-7 grid grid-cols-2 gap-3 min-[480px]:flex min-[480px]:flex-wrap sm:gap-4">
          {list.map((a) => (
            <Button
              key={a}
              type="button"
              variant="support"
              onClick={() => pick(a)}
              className="h-14 rounded-full px-6 text-lg font-bold sm:h-16 sm:px-7 sm:text-2xl"
            >
              {naira(a)}
            </Button>
          ))}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl p-0">
          <SheetHeader className="border-b p-5 text-left">
            <SheetTitle>Support {brand}</SheetTitle>
            <SheetDescription>Keeps the free classes, code and guides coming</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="sup-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gold-deep">
                  ₦
                </span>
                <Input
                  id="sup-amount"
                  inputMode="numeric"
                  className="h-12 pl-10 text-lg font-semibold"
                  value={value ? value.toLocaleString("en-NG") : ""}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                {list.map((a) => (
                  <Button
                    key={a}
                    type="button"
                    variant="ghost"
                    onClick={() => setAmount(String(a))}
                    className={cn("px-0", value === a ? "text-gold-deep" : "text-muted-foreground")}
                  >
                    {naira(a)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-email">Email</Label>
              <Input
                id="sup-email"
                type="email"
                className="h-12"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-name">
                Name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="sup-name"
                className="h-12"
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
          </div>
          <div className="border-t p-5">
            <Button size="lg" className="w-full" onClick={go}>
              <Lock className="text-gold" /> Support with {naira(value)}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
