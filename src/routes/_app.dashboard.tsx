import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PlatformIcon } from "@/components/contests/PlatformBadge";
import { StatusBadge } from "@/components/contests/StatusBadge";
import { ContestDetailModal } from "@/components/contests/ContestDetailModal";
import { Sparkline } from "@/components/layout/Sparkline";
import { Button } from "@/components/ui/button";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  CalendarCheck, Layers, RefreshCw, TrendingUp, Plus, Minus, Pencil,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useUpcomingContests } from "@/hooks/use-contests";
import { useSyncHistory, useTriggerSync, useSyncStats } from "@/hooks/use-sync";
import { platformMeta, type PlatformKey } from "@/lib/platform-config";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ContestSync" }] }),
  component: Dashboard,
});

// pseudo-random but stable sparkline data
const spark = (seed: number, n = 18) =>
  Array.from({ length: n }, (_, i) => 5 + Math.sin(i / 1.3 + seed) * 2 + (i % 5));

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any | null>(null);
  const openContest = (c: any) => { setActive(c); setOpen(true); };

  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: upcomingContests = [] } = useUpcomingContests();
  const { data: history } = useSyncHistory({ limit: 6 });
  const { data: syncStats } = useSyncStats();
  const triggerSync = useTriggerSync();

  const handleSync = () => {
    toast.promise(triggerSync.mutateAsync(), {
      loading: "Syncing your contests...",
      success: "Sync completed successfully!",
      error: "Failed to sync contests.",
    });
  };

  const activePlatformsCount = useMemo(() => {
    if (!profile?.preferences?.platforms) return 0;
    return Object.values(profile.preferences.platforms).filter(Boolean).length;
  }, [profile]);

  const stats = [
    { label: "Total Synced Contests", value: syncStats?.totalSynced?.toString() || "0", delta: "lifetime", trend: "up", Icon: CalendarCheck, color: "var(--success)", spark: spark(1) },
    { label: "Upcoming Contests",     value: upcomingContests.length.toString(),   delta: "next 7 days",   trend: "up", Icon: TrendingUp,    color: "var(--primary)", spark: spark(2.4) },
    { label: "Failure Rate (24h)",    value: syncStats ? `${syncStats.failureRate}%` : "0%", delta: syncStats?.status === 'inactive' ? "inactive" : "sync health", trend: syncStats?.failureRate && syncStats.failureRate > 0 ? "down" : "flat", Icon: Layers,      color: "var(--primary)", spark: spark(3.1) },
    { label: "Last Sync",             value: syncStats?.lastSyncAt ? formatDistanceToNow(new Date(syncStats.lastSyncAt), { addSuffix: true }) : "Never",  delta: `Status: ${syncStats?.status || "unknown"}`, trend: "up", Icon: RefreshCw,     color: "var(--primary)", spark: spark(4.7) },
  ];

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
              Good afternoon, <span className="gradient-text">{user?.name?.split(" ")[0] || "User"}</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Here's what's coming up across your platforms.</p>
          </div>
          <Button 
            size="sm" 
            className="gradient-primary text-white shadow-glow hover:opacity-90"
            onClick={handleSync}
            disabled={triggerSync.isPending}
          >
            <RefreshCw className={cn("h-4 w-4", triggerSync.isPending && "animate-spin")} /> 
            {triggerSync.isPending ? "Syncing..." : "Sync now"}
          </Button>
        </header>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft card-hover hover:card-hover-on"
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
                  <AreaChart data={syncStats?.activitySeries || []} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
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
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-semibold">Recent activity</h2>
                  <p className="text-xs text-muted-foreground">Calendar changes in the last 48h</p>
                </div>
                <Button variant="ghost" size="sm" asChild><Link to="/activity">View all</Link></Button>
              </div>
              <ul className="relative px-5 py-3">
                <div className="absolute left-[30px] top-5 bottom-5 w-px bg-border" />
                {history?.logs?.length === 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">No recent activity</div>
                )}
                {history?.logs?.map((ev) => {
                  const Icon = ev.action === "added" ? Plus : ev.action === "updated" ? Pencil : Minus;
                  const cls =
                    ev.action === "added"   ? "bg-success/15 text-success" :
                    ev.action === "updated" ? "bg-primary/15 text-primary" :
                                            "bg-destructive/15 text-destructive";
                  return (
                    <li key={ev._id} className="relative flex items-start gap-3 py-3">
                      <div className={cn("z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-card", cls)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">
                          <span className="font-medium capitalize">
                            {ev.action}
                          </span>{" "}
                          <span className="text-muted-foreground">·</span>{" "}
                          <span title={ev.contestName}>{ev.contestName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{ev.platform} · {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}</div>
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
                <p className="text-xs text-muted-foreground">Next {upcomingContests.length} across all platforms</p>
              </div>
              <Button variant="ghost" size="sm" asChild><Link to="/contests">View all</Link></Button>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr] gap-3 border-b border-border bg-muted/40 px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <div>Contest</div><div>Platform</div><div>Start time</div><div>Duration</div><div>Status</div>
            </div>

            <ul>
              {upcomingContests.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No upcoming contests found.</div>
              )}
              {upcomingContests.map((c, i) => {
                const start = new Date(c.startTime);
                const durationMinutes = Math.floor(c.duration / 60);
                // format duration correctly
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                const durationStr = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;

                return (
                  <li key={c._id} className={cn(i !== 0 && "border-t border-border/60")}>
                    <button
                      type="button"
                      onClick={() => openContest(c)}
                      className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent/40 sm:grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PlatformIcon platform={c.platform} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium group-hover:text-primary">{c.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden capitalize">
                            {c.platform} · {start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>
                      <div className="hidden text-sm text-muted-foreground sm:block capitalize">{c.platform}</div>
                      <div className="hidden text-sm text-muted-foreground sm:block">
                        {start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <div className="hidden text-sm text-muted-foreground sm:block">
                        {durationStr}
                      </div>
                      <div><StatusBadge status="upcoming" /></div>
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
            <Button variant="ghost" size="sm" asChild><Link to="/settings">Manage all</Link></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(platformMeta) as PlatformKey[]).map((p) => {
              const isActive = profile?.preferences?.platforms?.[p] ?? false;
              const meta = platformMeta[p];
              const displayName = Object.keys(platformMeta).find(k => (platformMeta as any)[k].key === p) || p;
              
              return (
                <div
                  key={p}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft card-hover hover:card-hover-on"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white shadow-soft transition-transform group-hover:scale-105"
                         style={{ backgroundColor: meta.color }}>{meta.initials}</div>
                    <div>
                      <div className="text-sm font-medium capitalize">{displayName}</div>
                      <div className={cn("flex items-center gap-1 text-xs", isActive ? "text-success" : "text-muted-foreground")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-success" : "bg-muted-foreground")} /> 
                        {isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  <div className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full shadow-glow", isActive ? "gradient-primary" : "bg-muted")}>
                    <span className={cn("h-5 w-5 rounded-full bg-white shadow-sm transition-transform", isActive ? "ml-auto mr-0.5" : "ml-0.5")} />
                  </div>
                </div>
              );
            })}
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
