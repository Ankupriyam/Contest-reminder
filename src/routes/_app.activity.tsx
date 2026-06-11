import { createFileRoute } from "@tanstack/react-router";
import { activity } from "@/lib/mock-data";
import { Plus, Minus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({ meta: [{ title: "Activity — ContestSync" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every calendar change made by ContestSync.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <ol className="relative">
          <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />
          {activity.map((ev) => {
            const Icon = ev.type === "added" ? Plus : ev.type === "updated" ? Pencil : Minus;
            const cls =
              ev.type === "added"   ? "bg-success/15 text-success" :
              ev.type === "updated" ? "bg-primary/15 text-primary" :
                                      "bg-destructive/15 text-destructive";
            return (
              <li key={ev.id} className="relative flex items-start gap-4 py-4">
                <div className={cn("z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", cls)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {ev.type === "added" ? "Added contest" : ev.type === "updated" ? "Updated contest" : "Removed contest"}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{ev.contest}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {ev.platform} · {new Date(ev.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
