import { Badge } from "@/components/ui/badge";
import type { QuoteStatus } from "@/lib/data/admin";

const MAP: Record<
  QuoteStatus,
  { label: string; variant: "accent" | "steel" | "default" }
> = {
  new: { label: "Yeni", variant: "accent" },
  quoted: { label: "Teklif verildi", variant: "steel" },
  closed: { label: "Kapandı", variant: "default" },
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const s = MAP[status] ?? MAP.new;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export const STATUS_LABEL: Record<QuoteStatus, string> = {
  new: "Yeni",
  quoted: "Teklif verildi",
  closed: "Kapandı",
};
