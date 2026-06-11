const map: Record<string, { cls: string; dot: string; pulse?: boolean; label: string }> = {
  synced: {
    cls: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
    pulse: true,
    label: "Synced",
  },
  upcoming: {
    cls: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
    label: "Upcoming",
  },
  live: {
    cls: "bg-warning/15 border-warning/30 text-[color:var(--warning-foreground)] dark:text-warning",
    dot: "bg-warning",
    pulse: true,
    label: "Live",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const { cls, dot, pulse, label } = map[status] || map.synced;
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
