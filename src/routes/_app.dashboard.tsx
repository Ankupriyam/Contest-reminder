import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { contests, activity, platformMeta } from "@/lib/mock-data";
import type { Contest } from "@/lib/mock-data";
import { PlatformIcon } from "@/components/PlatformBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ContestDetailModal } from "@/components/ContestDetailModal";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck, Clock, Layers, RefreshCw, TrendingUp, Plus, Minus, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ContestSync" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Total Synced Contests", value: "248", delta: "+12 this week", Icon: CalendarCheck, accent: "text-success" },
  { label: "Upcoming Contests",     value: "9",   delta: "next 7 days",  Icon: TrendingUp,    accent: "text-primary" },
  { label: "Active Platforms",      value: "4 / 4", delta: "all connected", Icon: Layers,     accent: "text-foreground" },
  { label: "Last Sync",             value: "4m ago", delta: "auto every 1h", Icon: RefreshCw, accent: "text-muted-foreground" },
];

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Contest | null>(null);
  const openContest = (c: Contest) => { setActive(c); setOpen(true); };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">Good afternoon, Alex</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's coming up across your platforms.</p>
        </div>
        <Button size="sm" variant="outline" className="hidden sm:inline-flex">
          <RefreshCw className="h-4 w-4" /> Sync now
        </Button>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.Icon className="h-4 w-4" />
              </div>
            </div>
            <div className={cn("mt-3 text-xs", s.accent)}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Upcoming contests */}
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold">Upcoming contests</h2>
                <p className="text-xs text-muted-foreground">Next {contests.length} across all platforms</p>
              </div>
              <Button variant="ghost" size="sm">View all</Button>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr] gap-3 border-b border-border bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground">
              <div>Contest</div><div>Platform</div><div>Start time</div><div>Duration</div><div>Status</div>
            </div>

            <ul>
              {contests.map((c) => {
                const start = new Date(c.startTime);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => openContest(c)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/40 sm:grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PlatformIcon platform={c.platform} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {c.platform} · {start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>
                      <div className="hidden text-sm text-muted-foreground sm:block">{c.platform}</div>
                      <div className="hidden text-sm text-muted-foreground sm:block">
                        {start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <div className="hidden text-sm text-muted-foreground sm:block">
                        {Math.floor(c.durationMinutes / 60)}h {c.durationMinutes % 60 ? `${c.durationMinutes % 60}m` : ""}
                      </div>
                      <div className="hidden sm:block"><StatusBadge status={c.status} /></div>
                      <div className="sm:hidden"><StatusBadge status={c.status} /></div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Activity */}
        <section>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">Recent activity</h2>
              <p className="text-xs text-muted-foreground">Calendar changes in the last 48h</p>
            </div>
            <ul className="relative px-5 py-4">
              <div className="absolute left-[30px] top-6 bottom-6 w-px bg-border" />
              {activity.slice(0, 6).map((ev) => {
                const Icon = ev.type === "added" ? Plus : ev.type === "updated" ? Pencil : Minus;
                const cls =
                  ev.type === "added"   ? "bg-success/15 text-success" :
                  ev.type === "updated" ? "bg-primary/15 text-primary" :
                                          "bg-destructive/15 text-destructive";
                return (
                  <li key={ev.id} className="relative flex items-start gap-3 py-3">
                    <div className={cn("z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", cls)}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm">
                        <span className="font-medium capitalize">{ev.type === "added" ? "Added" : ev.type === "updated" ? "Updated" : "Removed"}</span>{" "}
                        <span className="text-muted-foreground">·</span>{" "}
                        <span className="truncate">{ev.contest}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ev.platform} · {timeAgo(ev.at)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      {/* Platforms snapshot */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Platform settings</h2>
          <Button variant="ghost" size="sm">Manage all</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(platformMeta) as (keyof typeof platformMeta)[]).map((p) => (
            <div key={p} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                     style={{ backgroundColor: platformMeta[p].color }}>{platformMeta[p].initials}</div>
                <div>
                  <div className="text-sm font-medium">{p}</div>
                  <div className="text-xs text-success">Active</div>
                </div>
              </div>
              <div className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full gradient-primary">
                <span className="ml-auto mr-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContestDetailModal contest={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)        return `${Math.floor(diff)}s ago`;
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
