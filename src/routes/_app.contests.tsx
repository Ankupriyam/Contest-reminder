import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { contests, platformMeta, type Contest, type Platform } from "@/lib/mock-data";
import { PlatformIcon } from "@/components/PlatformBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ContestDetailModal } from "@/components/ContestDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/contests")({
  head: () => ({ meta: [{ title: "Contests — ContestSync" }] }),
  component: ContestsPage,
});

function ContestsPage() {
  const [q, setQ] = useState("");
  const [enabled, setEnabled] = useState<Record<Platform, boolean>>({
    LeetCode: true, Codeforces: true, CodeChef: true, AtCoder: true,
  });
  const [active, setActive] = useState<Contest | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => contests.filter((c) =>
      enabled[c.platform] && c.name.toLowerCase().includes(q.toLowerCase())),
    [q, enabled],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contests</h1>
        <p className="text-sm text-muted-foreground">All synced and scheduled contests across your platforms.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contest" className="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Platforms</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(platformMeta) as Platform[]).map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={enabled[p]}
                onCheckedChange={(v) => setEnabled((e) => ({ ...e, [p]: !!v }))}
              >
                {p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="hidden sm:grid sm:grid-cols-[1.6fr_1fr_1.1fr_0.7fr_0.9fr] gap-3 border-b border-border bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground">
          <div>Contest</div><div>Platform</div><div>Start time</div><div>Duration</div><div>Status</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul>
            {filtered.map((c, i) => {
              const start = new Date(c.startTime);
              return (
                <li key={c.id} className={cn(i !== 0 && "border-t border-border/60")}>
                  <button
                    type="button"
                    onClick={() => { setActive(c); setOpen(true); }}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/40 sm:grid-cols-[1.6fr_1fr_1.1fr_0.7fr_0.9fr]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <PlatformIcon platform={c.platform} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{c.platform}</div>
                      </div>
                    </div>
                    <div className="hidden text-sm text-muted-foreground sm:block">{c.platform}</div>
                    <div className="hidden text-sm text-muted-foreground sm:block">
                      {start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                    <div className="hidden text-sm text-muted-foreground sm:block">
                      {Math.floor(c.durationMinutes / 60)}h {c.durationMinutes % 60 ? `${c.durationMinutes % 60}m` : ""}
                    </div>
                    <div><StatusBadge status={c.status} /></div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ContestDetailModal contest={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm font-medium">No contests match your filters</div>
      <div className="mt-1 text-xs text-muted-foreground">Try a different search or enable more platforms.</div>
    </div>
  );
}
