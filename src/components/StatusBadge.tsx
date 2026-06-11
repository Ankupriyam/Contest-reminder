import type { ContestStatus } from "@/lib/mock-data";
import { Check, Clock, RefreshCw } from "lucide-react";

const map: Record<ContestStatus, { cls: string; Icon: typeof Check; label: string }> = {
  Synced:    { cls: "bg-success/10 text-success border-success/20",            Icon: Check,     label: "Synced" },
  Updated:   { cls: "bg-primary/10 text-primary border-primary/20",            Icon: RefreshCw, label: "Updated" },
  Scheduled: { cls: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning", Icon: Clock,     label: "Scheduled" },
};

export function StatusBadge({ status }: { status: ContestStatus }) {
  const { cls, Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
