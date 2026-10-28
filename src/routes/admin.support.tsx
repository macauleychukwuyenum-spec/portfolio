import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMediaUrl } from "@/components/admin/MediaField";
import { naira } from "@/components/site/SupportSection";

export const Route = createFileRoute("/admin/support")({
  head: () => adminHead("Support payments", "Review support receipts sent to Chozen."),
  component: SupportAdmin,
});

function ReceiptLink({ value }: { value: string }) {
  const url = useMediaUrl(value);
  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-semibold text-gold-deep underline-offset-4 hover:underline"
    >
      View receipt <ExternalLink className="h-3.5 w-3.5" />
    </a>
  ) : (
    <span className="text-sm text-muted-foreground">Loading receipt…</span>
  );
}

function SupportAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "support"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("support_payments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin", "support"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl">Support payments</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Receipts sent by supporters. Check your bank, then confirm or reject.
      </p>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      ) : error ? (
        <p role="alert" className="text-destructive">
          {(error as Error).message}
        </p>
      ) : !data?.length ? (
        <div className="surface rounded-3xl p-8 text-center text-muted-foreground">
          No support payments yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((p) => (
            <li
              key={p.id}
              className="surface flex flex-col gap-3 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{naira(p.amount)}</span>
                  <Badge
                    variant={
                      p.status === "confirmed"
                        ? "default"
                        : p.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                <p className="truncate text-sm">
                  {p.name ? `${p.name} · ` : ""}
                  {p.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </p>
                <ReceiptLink value={p.receipt} />
              </div>
              {p.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => setStatus.mutate({ id: p.id, status: "confirmed" })}
                  >
                    <Check /> Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus.mutate({ id: p.id, status: "rejected" })}
                  >
                    <X /> Reject
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
