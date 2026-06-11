import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { platformMeta, platformKeyToDisplay, type PlatformKey } from "@/lib/platform-config";
import { PlatformIcon } from "@/components/contests/PlatformBadge";
import { StatusBadge } from "@/components/contests/StatusBadge";
import { ContestDetailModal } from "@/components/contests/ContestDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useContests } from "@/hooks/use-contests";
import { useDebounce } from "@/hooks/use-debounce";

export const Route = createFileRoute("/_app/contests")({
  head: () => ({ meta: [{ title: "Contests — ContestSync" }] }),
  component: ContestsPage,
});

function ContestsPage() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  
  const [enabled, setEnabled] = useState<Record<PlatformKey, boolean>>({
    leetcode: true, codeforces: true, codechef: true, atcoder: true,
  });
  
  const [active, setActive] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Compute platform string for API query
  const platformsString = useMemo(() => {
    const activeKeys = Object.entries(enabled).filter(([_, isEnabled]) => isEnabled).map(([k]) => k);
    return activeKeys.join(",");
  }, [enabled]);

  const { data, isLoading, isFetching } = useContests({
    platform: platformsString,
    search: debouncedQ,
    page,
    limit: 20,
  });

  const contests = data?.contests || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contests</h1>
        <p className="text-sm text-muted-foreground">All synced and scheduled contests across your platforms.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search contest" className="pl-9" />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Platforms</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(platformMeta) as PlatformKey[]).map((p) => {
              const displayName = Object.keys(platformMeta).find(k => (platformMeta as any)[k].key === p) || p;
              return (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={enabled[p]}
                  onCheckedChange={(v) => {
                    setEnabled((e) => ({ ...e, [p]: !!v }));
                    setPage(1);
                  }}
                  className="capitalize"
                >
                  {displayName}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="hidden sm:grid sm:grid-cols-[1.6fr_1fr_1.1fr_0.7fr_0.9fr] gap-3 border-b border-border bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground">
          <div>Contest</div><div>Platform</div><div>Start time</div><div>Duration</div><div>Status</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : contests.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul>
              {contests.map((c: any, i: number) => {
                const start = new Date(c.startTime);
                const durationMinutes = Math.floor(c.duration / 60);
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                const durationStr = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
                // If start is in the past and end is in the future, it's live. If start is in future it's upcoming.
                const now = new Date();
                const end = new Date(c.endTime);
                const status = now >= start && now <= end ? "live" : now < start ? "upcoming" : "synced";

                return (
                  <li key={c._id} className={cn(i !== 0 && "border-t border-border/60")}>
                    <button
                      type="button"
                      onClick={() => { setActive(c); setOpen(true); }}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/40 sm:grid-cols-[1.6fr_1fr_1.1fr_0.7fr_0.9fr]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PlatformIcon platform={c.platform} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden capitalize">{c.platform}</div>
                        </div>
                      </div>
                      <div className="hidden text-sm text-muted-foreground sm:block capitalize">{c.platform}</div>
                      <div className="hidden text-sm text-muted-foreground sm:block">
                        {start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <div className="hidden text-sm text-muted-foreground sm:block">
                        {durationStr}
                      </div>
                      <div><StatusBadge status={status} /></div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      <ContestDetailModal contest={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
          <Search className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5 text-base font-semibold">No contests match your filters</div>
      <div className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Try a different search term, or enable more platforms in your filters.
      </div>
    </div>
  );
}
