import type { ContestStatus } from "@/lib/mock-data";

const map: Record<ContestStatus, { cls: string; dot: string; pulse?: boolean; label: string }> = {
  Synced: {
    cls: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
    pulse: true,
    label: "Synced",
  },
  Updated: {
    cls: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
    label: "Updated",
  },
  Scheduled: {
    cls: "bg-warning/15 border-warning/30 text-[color:var(--warning-foreground)] dark:text-warning",
    dot: "bg-warning",
    label: "Scheduled",
  },
};

export function StatusBadge({ status }: { status: ContestStatus }) {
  const { cls, dot, pulse, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dot}`} />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dot}`} />
      </span>
      {label}
    </span>
  );
}
