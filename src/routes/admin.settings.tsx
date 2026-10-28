import { adminHead } from "@/lib/page-head";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/portfolio.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageField } from "@/components/admin/MediaField";

export const Route = createFileRoute("/admin/settings")({
  head: () => adminHead("Profile and settings", "Manage Chozen profile, contact and bank details."),
  component: SettingsPage,
});

type K = keyof SiteSettings;
type F = {
  name: K;
  label: string;
  type?: "textarea" | "image" | "switch";
  help?: string;
  max?: number;
};

const GROUPS: { id: string; label: string; fields: F[] }[] = [
  {
    id: "hero",
    label: "Profile & hero",
    fields: [
      { name: "hero_image", label: "Profile image", type: "image" },
      { name: "hero_eyebrow", label: "Greeting line", max: 80 },
      { name: "hero_name", label: "Name", max: 80 },
      { name: "hero_title", label: "Professional title", max: 120 },
      { name: "hero_intro", label: "Introduction", type: "textarea", max: 600 },
      { name: "primary_cta_label", label: "Primary button text", max: 40 },
      {
        name: "primary_cta_href",
        label: "Primary button link",
        max: 500,
        help: "A section like #projects or a full https:// link.",
      },
      { name: "secondary_cta_label", label: "Secondary button text", max: 40 },
      { name: "secondary_cta_href", label: "Secondary button link", max: 500 },
      { name: "about_heading", label: "About heading", max: 100 },
      { name: "about_intro", label: "About introduction", type: "textarea", max: 1500 },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    fields: [
      { name: "contact_heading", label: "Contact heading", max: 100 },
      { name: "contact_text", label: "Contact text", type: "textarea", max: 600 },
      { name: "contact_email", label: "Public email", max: 255 },
      { name: "contact_cta_label", label: "Email button text", max: 40 },
      {
        name: "whatsapp_number",
        label: "WhatsApp number",
        max: 30,
        help: "Include the country code, e.g. 2348012345678.",
      },
    ],
  },
  {
    id: "support",
    label: "Support & bank",
    fields: [
      { name: "show_support", label: "Show Support section", type: "switch" },
      { name: "support_heading", label: "Support heading", max: 80 },
      { name: "support_text", label: "Support text", type: "textarea", max: 300 },
      { name: "bank_account_number", label: "Account number", max: 20 },
      { name: "bank_account_name", label: "Account name", max: 120 },
      { name: "bank_name", label: "Bank name", max: 80 },
    ],
  },
  {
    id: "nav",
    label: "Navigation & footer",
    fields: [
      { name: "brand_name", label: "Brand name", max: 60 },
      { name: "footer_text", label: "Footer text", type: "textarea", max: 300 },
      { name: "show_about", label: "Show About section", type: "switch" },
      { name: "show_stats", label: "Show statistics", type: "switch" },
      { name: "show_projects", label: "Show Projects section", type: "switch" },
      { name: "show_source_code", label: "Show Source Code section", type: "switch" },
      { name: "show_classes", label: "Show Classes section", type: "switch" },
      { name: "show_ebooks", label: "Show E-books section", type: "switch" },
    ],
  },
  {
    id: "seo",
    label: "Site settings",
    fields: [
      { name: "meta_title", label: "Browser & share title", max: 70 },
      { name: "meta_description", label: "Share description", type: "textarea", max: 160 },
    ],
  },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
  const [v, setV] = useState<SiteSettings | null>(null);
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  useEffect(() => {
    if (data) setV(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async (values: SiteSettings) => {
      const { id: _i, updated_at: _u, ...rest } = values;
      const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !v)
    return error ? (
      <p role="alert" className="text-destructive">
        {(error as Error).message}
      </p>
    ) : (
      <Loader2 className="h-6 w-6 animate-spin text-gold" />
    );

  function submit() {
    if (!v) return;
    const e: Partial<Record<K, string>> = {};
    for (const g of GROUPS)
      for (const f of g.fields) {
        const val = v[f.name];
        if (typeof val === "string" && f.max && val.length > f.max)
          e[f.name] = `Keep it under ${f.max} characters`;
      }
    if (v.contact_email && !z.string().email().safeParse(v.contact_email.trim()).success)
      e.contact_email = "Enter a valid email";
    if (!v.brand_name.trim()) e.brand_name = "Brand name is required";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const cleaned = Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, typeof x === "string" ? x.trim() : x]),
    ) as SiteSettings;
    cleaned.contact_email = cleaned.contact_email || null;
    cleaned.whatsapp_number = cleaned.whatsapp_number || null;
    save.mutate(cleaned);
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl sm:text-4xl">Profile & settings</h1>
          <p className="text-sm text-muted-foreground">Changes go live as soon as you save.</p>
        </div>
        <Button variant="gold" onClick={submit} disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />} Save
        </Button>
      </div>
      <Tabs defaultValue="hero">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            {GROUPS.map((g) => (
              <TabsTrigger key={g.id} value={g.id}>
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {GROUPS.map((g) => (
          <TabsContent key={g.id} value={g.id}>
            <div className="surface mt-4 space-y-5 rounded-3xl p-5 sm:p-7">
              {g.fields.map((f) => (
                <div key={f.name} className="space-y-2">
                  {f.type === "switch" ? (
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Switch
                        id={f.name}
                        checked={Boolean(v[f.name])}
                        onCheckedChange={(c) => setV({ ...v, [f.name]: c })}
                      />
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={f.name}>{f.label}</Label>
                      {f.type === "image" ? (
                        <ImageField
                          value={v[f.name] as string | null}
                          onChange={(x) => setV({ ...v, [f.name]: x })}
                        />
                      ) : f.type === "textarea" ? (
                        <Textarea
                          id={f.name}
                          rows={4}
                          value={String(v[f.name] ?? "")}
                          onChange={(e) => setV({ ...v, [f.name]: e.target.value })}
                        />
                      ) : (
                        <Input
                          id={f.name}
                          value={String(v[f.name] ?? "")}
                          onChange={(e) => setV({ ...v, [f.name]: e.target.value })}
                        />
                      )}
                    </>
                  )}
                  {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                  {errors[f.name] && <p className="text-sm text-destructive">{errors[f.name]}</p>}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-4 text-xs text-muted-foreground">
        Image changes are saved when you press Save.
      </p>
    </div>
  );
}
