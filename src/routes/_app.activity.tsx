import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncHistory } from "@/hooks/use-sync";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({ meta: [{ title: "Activity — ContestSync" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useSyncHistory({ page, limit: 50 });

  const logs = data?.logs || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every calendar change made by ContestSync.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">
            No activity found yet. Sync your contests to see activity here.
          </div>
        ) : (
          <>
            <div className="p-5">
              <ol className="relative">
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />
                {logs.map((ev: any) => {
                  const Icon = ev.action === "added" ? Plus : ev.action === "updated" ? Pencil : Minus;
                  const cls =
                    ev.action === "added"   ? "bg-success/15 text-success" :
                    ev.action === "updated" ? "bg-primary/15 text-primary" :
                                            "bg-destructive/15 text-destructive";
                  return (
                    <li key={ev._id} className="relative flex items-start gap-4 py-4">
                      <div className={cn("z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card ring-4 ring-card", cls)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium capitalize">
                          {ev.action} contest
                        </div>
                        <div className="truncate text-sm text-muted-foreground">{ev.contestName}</div>
                        {ev.details && <div className="text-xs text-muted-foreground">{ev.details}</div>}
                        <div className="mt-0.5 text-xs text-muted-foreground capitalize">
                          {ev.platform} · {new Date(ev.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/40">
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
    </div>
  );
}
