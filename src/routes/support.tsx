import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Copy, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { naira } from "@/components/site/SupportSection";
import { portfolioQuery } from "./index";

const search = z.object({
  amount: z.coerce.number().int().min(100).max(100000000).catch(2000),
  email: z.string().max(255).catch(""),
  name: z.string().max(120).optional().catch(undefined),
});

export const Route = createFileRoute("/support")({
  validateSearch: search,
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
  head: () => ({
    meta: [
      { title: "Support — Bank transfer details" },
      {
        name: "description",
        content: "Send your support by bank transfer and upload your receipt.",
      },
      { property: "og:title", content: "Support — Bank transfer details" },
      {
        property: "og:description",
        content: "Send your support by bank transfer and upload your receipt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupportPage,
});

const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-lg font-bold">{value || "Not set yet"}</p>
      </div>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Copy ${label}`}
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
          }}
        >
          <Copy />
        </Button>
      )}
    </div>
  );
}

function SupportPage() {
  const { amount, email, name } = Route.useSearch();
  const { data } = useSuspenseQuery(portfolioQuery);
  const s = data.settings;
  const brand = s?.brand_name || "Chozen";
  const [paid, setPaid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const emailOk = z.string().email().safeParse(email).success;

  async function submit() {
    if (!file) {
      toast.error("Please choose your receipt.");
      return;
    }
    if (!RECEIPT_TYPES.includes(file.type)) {
      toast.error("Receipt must be a JPG, PNG, WebP or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Receipt must be 10 MB or smaller.");
      return;
    }
    setBusy(true);
    const ext =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage
      .from("receipts")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) {
      setBusy(false);
      toast.error(`Upload failed: ${up.error.message}`);
      return;
    }
    const { error } = await supabase
      .from("support_payments")
      .insert({ amount, email, name: name || null, receipt: `sb:receipts/${path}` });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <SiteHeader brand={brand} />
      <main className="px-5 pb-16 pt-28 sm:pt-36">
        <div className="mx-auto max-w-lg">
          <Link
            to="/"
            hash="support"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          {done ? (
            <div className="surface mt-4 rounded-3xl p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
              <h1 className="mt-4 font-display text-3xl">Thank you!</h1>
              <p className="mt-2 text-muted-foreground">
                Your receipt for {naira(amount)} has been sent. It will be confirmed shortly.
              </p>
              <Button asChild className="mt-6">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-4 font-display text-4xl">Make a transfer</h1>
              <p className="mt-2 text-muted-foreground">
                Transfer <span className="font-bold text-foreground">{naira(amount)}</span> to the
                account below, then upload your receipt.
              </p>
              <div className="surface mt-6 rounded-3xl px-5 sm:px-7">
                <Row label="Amount" value={naira(amount)} />
                <Row label="Account number" value={s?.bank_account_number} />
                <Row label="Account name" value={s?.bank_account_name} />
                <Row label="Bank name" value={s?.bank_name} />
              </div>
              {!emailOk ? (
                <p className="mt-6 text-sm text-destructive">
                  Your email is missing.{" "}
                  <Link to="/" hash="support" className="underline">
                    Start again
                  </Link>{" "}
                  to add it.
                </p>
              ) : !paid ? (
                <Button
                  size="lg"
                  variant="gold"
                  className="mt-6 w-full"
                  onClick={() => setPaid(true)}
                >
                  I have made the payment
                </Button>
              ) : (
                <div className="surface mt-6 space-y-4 rounded-3xl p-5 sm:p-7">
                  <p className="font-semibold">Upload your payment receipt</p>
                  <input
                    ref={ref}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => ref.current?.click()}
                  >
                    <Upload /> {file ? file.name : "Choose receipt"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP or PDF · up to 10 MB
                  </p>
                  <Button size="lg" className="w-full" onClick={submit} disabled={busy || !file}>
                    {busy && <Loader2 className="animate-spin" />} Submit receipt
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter brand={brand} text={s?.footer_text ?? ""} socials={data.socials} />
    </>
  );
}
