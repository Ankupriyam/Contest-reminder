import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CalendarCheck, RefreshCcw, Trash2, Loader2 } from "lucide-react";
import { useProfile, useDeleteAccount } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — ContestSync" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const deleteAccount = useDeleteAccount();
  const { login } = useAuth();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone and your synced calendar events will remain on your Google Calendar but will not be updated anymore.")) {
      try {
        await deleteAccount.mutateAsync();
        toast.success("Account deleted successfully.");
      } catch (e: any) {
        toast.error("Failed to delete account", { description: e.message });
      }
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { user, syncStats } = profile;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account and connection details.</p>
      </div>

      {/* User card */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover shadow-glow" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-xl font-semibold text-white shadow-glow">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString([], { month: "short", year: "numeric" })}
            </div>
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
              <div className="truncate text-sm font-medium">{user.email}</div>
              <div className="text-xs text-success">Connected · Calendar access</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={login}><RefreshCcw className="h-4 w-4" /> Reconnect</Button>
        </div>
      </section>

      {/* Calendar */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-base font-semibold">Calendar details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail label="Calendar name" value="Contests · ContestSync" />
          <Detail label="Calendar ID" value={user.calendarId || "Not created yet"} />
          <Detail label="Events synced" value={syncStats.totalSynced.toString()} />
          <Detail label="Last sync" value={syncStats.lastSyncAt ? formatDistanceToNow(new Date(syncStats.lastSyncAt), { addSuffix: true }) : "Never"} />
        </div>
      </section>

      {/* Preferences */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-base font-semibold">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">Quick links to common settings.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/settings">Reminder defaults</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/settings">Platform toggles</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/settings">Sync schedule</Link></Button>
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
            <Button variant="outline" size="sm" onClick={login}><RefreshCcw className="h-4 w-4" /> Reconnect</Button>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-destructive">Delete account</div>
              <div className="text-xs text-muted-foreground">Remove your data and disconnect your calendar.</div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} 
              Delete account
            </Button>
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
      <div className="mt-1 text-sm font-medium truncate" title={value}>{value}</div>
    </div>
  );
}
