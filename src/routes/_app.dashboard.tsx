import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { contests, activity, platformMeta } from "@/lib/mock-data";
import type { Contest } from "@/lib/mock-data";
import { PlatformIcon } from "@/components/PlatformBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ContestDetailModal } from "@/components/ContestDetailModal";
import { Sparkline } from "@/components/Sparkline";
import { Button } from "@/components/ui/button";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  CalendarCheck, Clock, Layers, RefreshCw, TrendingUp, Plus, Minus, Pencil,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ContestSync" }] }),
  component: Dashboard,
});

// pseudo-random but stable sparkline data
const spark = (seed: number, n = 18) =>
  Array.from({ length: n }, (_, i) => 5 + Math.sin(i / 1.3 + seed) * 2 + (i % 5));

const stats = [
  { label: "Total Synced Contests", value: "248", delta: "+12 this week", trend: "up", Icon: CalendarCheck, color: "var(--success)", spark: spark(1) },
  { label: "Upcoming Contests",     value: "9",   delta: "next 7 days",   trend: "up", Icon: TrendingUp,    color: "var(--primary)", spark: spark(2.4) },
  { label: "Active Platforms",      value: "4/4", delta: "all connected", trend: "flat", Icon: Layers,      color: "var(--primary)", spark: spark(3.1) },
  { label: "Last Sync",             value: "4m",  delta: "auto every 1h", trend: "up", Icon: RefreshCw,     color: "var(--primary)", spark: spark(4.7) },
];

// 30-day sync activity
const syncSeries = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    day: d.toLocaleDateString([], { month: "short", day: "numeric" }),
    synced: Math.round(4 + Math.sin(i / 2) * 3 + (i % 4) + Math.random() * 2),
    updated: Math.round(1 + Math.cos(i / 3) * 1.5 + Math.random()),
  };
});

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Contest | null>(null);
  const openContest = (c: Contest) => { setActive(c); setOpen(true); };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 grid-bg" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[700px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15" />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              All systems operational
            </div>
            <h1 className="mt-3 truncate text-3xl font-bold tracking-tight sm:text-[34px]">
              Good afternoon, <span className="gradient-text">Alex</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Here's what's coming up across your platforms.</p>
          </div>
          <Button size="sm" className="gradient-primary text-white shadow-glow hover:opacity-90">
            <RefreshCw className="h-4 w-4" /> Sync now
          </Button>
        </header>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft card-hover hover:[--tw:1] hover:card-hover-on"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <s.Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                {s.trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-success" />}
                <span className={cn(s.trend === "up" ? "text-success" : "text-muted-foreground")}>{s.delta}</span>
              </div>
              <div className="-mx-2 -mb-2 mt-3">
                <Sparkline data={s.spark} stroke={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart + activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold">Sync activity</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Contests added & updated · last 30 days</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <LegendDot color="var(--primary)" label="Added" />
                  <LegendDot color="var(--success)" label="Updated" />
                </div>
              </div>
              <div className="mt-4 h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={syncSeries} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g-added" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g-updated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" tickMargin={8} interval={4} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" width={32} />
                    <Tooltip
                      cursor={{ stroke: "var(--primary)", strokeOpacity: 0.2 }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                        boxShadow: "var(--shadow-elevated)",
                      }}
                      labelStyle={{ color: "var(--muted-foreground)" }}
                    />
                    <Area type="monotone" dataKey="synced"  stroke="var(--primary)" strokeWidth={2} fill="url(#g-added)" />
                    <Area type="monotone" dataKey="updated" stroke="var(--success)" strokeWidth={2} fill="url(#g-updated)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Activity */}
          <section>
            <div className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-semibold">Recent activity</h2>
                <p className="text-xs text-muted-foreground">Calendar changes in the last 48h</p>
              </div>
              <ul className="relative px-5 py-3">
                <div className="absolute left-[30px] top-5 bottom-5 w-px bg-border" />
                {activity.slice(0, 6).map((ev) => {
                  const Icon = ev.type === "added" ? Plus : ev.type === "updated" ? Pencil : Minus;
                  const cls =
                    ev.type === "added"   ? "bg-success/15 text-success" :
                    ev.type === "updated" ? "bg-primary/15 text-primary" :
                                            "bg-destructive/15 text-destructive";
                  return (
                    <li key={ev.id} className="relative flex items-start gap-3 py-3">
                      <div className={cn("z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-card", cls)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">
                          <span className="font-medium">
                            {ev.type === "added" ? "Added" : ev.type === "updated" ? "Updated" : "Removed"}
                          </span>{" "}
                          <span className="text-muted-foreground">·</span>{" "}
                          <span>{ev.contest}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{ev.platform} · {timeAgo(ev.at)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>

        {/* Upcoming contests */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold">Upcoming contests</h2>
                <p className="text-xs text-muted-foreground">Next {contests.length} across all platforms</p>
              </div>
              <Button variant="ghost" size="sm">View all</Button>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr] gap-3 border-b border-border bg-muted/40 px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <div>Contest</div><div>Platform</div><div>Start time</div><div>Duration</div><div>Status</div>
            </div>

            <ul>
              {contests.map((c, i) => {
                const start = new Date(c.startTime);
                return (
                  <li key={c.id} className={cn(i !== 0 && "border-t border-border/60")}>
                    <button
                      type="button"
                      onClick={() => openContest(c)}
                      className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent/40 sm:grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PlatformIcon platform={c.platform} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium group-hover:text-primary">{c.name}</div>
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
                      <div><StatusBadge status={c.status} /></div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Platforms */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Platform settings</h2>
            <Button variant="ghost" size="sm">Manage all</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(platformMeta) as (keyof typeof platformMeta)[]).map((p) => (
              <div
                key={p}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft card-hover hover:card-hover-on"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white shadow-soft transition-transform group-hover:scale-105"
                       style={{ backgroundColor: platformMeta[p].color }}>{platformMeta[p].initials}</div>
                  <div>
                    <div className="text-sm font-medium">{p}</div>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                    </div>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full gradient-primary shadow-glow">
                  <span className="ml-auto mr-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ContestDetailModal contest={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)        return `${Math.floor(diff)}s ago`;
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
