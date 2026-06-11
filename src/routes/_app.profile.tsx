import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CalendarCheck, RefreshCcw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — ContestSync" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account and connection details.</p>
      </div>

      {/* User card */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-xl font-semibold text-white shadow-glow">A</div>
          <div className="min-w-0">
            <div className="text-lg font-semibold">Alex Carter</div>
            <div className="text-sm text-muted-foreground">alex@contestsync.app</div>
            <div className="mt-1 text-xs text-muted-foreground">Member since Jan 2025</div>
          </div>
        </div>
      </section>

      {/* Google account */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-base font-semibold">Connected Google Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">ContestSync writes to your Google Calendar.</p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">alex@gmail.com</div>
              <div className="text-xs text-success">Connected · Calendar access</div>
            </div>
          </div>
          <Button variant="outline" size="sm"><RefreshCcw className="h-4 w-4" /> Reconnect</Button>
        </div>
      </section>

      {/* Calendar */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-base font-semibold">Calendar details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail label="Calendar name" value="Contests · ContestSync" />
          <Detail label="Timezone" value="Europe/Berlin (auto)" />
          <Detail label="Events synced" value="248" />
          <Detail label="Last sync" value="4 minutes ago" />
        </div>
      </section>

      {/* Preferences */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-base font-semibold">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">Quick links to common settings.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">Reminder defaults</Button>
          <Button variant="outline" size="sm">Platform toggles</Button>
          <Button variant="outline" size="sm">Sync schedule</Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-soft">
        <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Irreversible actions for your account.</p>
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">Reconnect Google</div>
              <div className="text-xs text-muted-foreground">Revoke and re-grant calendar permission.</div>
            </div>
            <Button variant="outline" size="sm"><RefreshCcw className="h-4 w-4" /> Reconnect</Button>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-destructive">Delete account</div>
              <div className="text-xs text-muted-foreground">Remove your data and disconnect your calendar.</div>
            </div>
            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /> Delete account</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
