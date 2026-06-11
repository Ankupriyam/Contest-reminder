import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, ListChecks, Activity as ActivityIcon, Settings, UserRound,
  Search, Moon, Sun, RefreshCw, Menu, ChevronDown, LogOut, Bell, Sparkles,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { CommandPalette, useCommandPalette } from "@/components/layout/CommandPalette";
import { useAuth } from "@/hooks/use-auth";
import { useTriggerSync, useSyncStats } from "@/hooks/use-sync";
import { useProfile } from "@/hooks/use-profile";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app")({ component: AppShell });

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contests",  label: "Contests",  icon: ListChecks },
  { to: "/activity",  label: "Activity",  icon: ActivityIcon },
  { to: "/settings",  label: "Settings",  icon: Settings },
  { to: "/profile",   label: "Profile",   icon: UserRound },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link to="/" onClick={onNavigate}><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:translate-x-0.5",
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r gradient-primary" />}
              <Icon className={cn("h-4 w-4 transition-transform", active && "text-primary")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-to-br from-primary/10 to-transparent p-3">
        <SyncStatusWidget />
      </div>
    </div>
  );
}

function SyncStatusWidget() {
  const { data: syncStats } = useSyncStats();
  const status = syncStats?.status || 'healthy';
  const isHealthy = status === 'healthy';
  const isWarning = status === 'warning';
  const isError = status === 'error';

  const statusLabel = 
    isHealthy  ? "Sync healthy" :
    isWarning  ? "Sync warning" :
    isError    ? "Sync error"   :
                 "Sync inactive";

  const indicatorColor = 
    isHealthy  ? "bg-success" :
    isWarning  ? "bg-warning" :
    isError    ? "bg-destructive" :
                 "bg-muted-foreground";

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isHealthy && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />}
          {isWarning && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-70" />}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", indicatorColor)} />
        </span>
        <div className="text-xs font-semibold text-sidebar-foreground">
          {statusLabel}
        </div>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {syncStats?.lastSyncAt 
          ? `Last sync ${formatDistanceToNow(new Date(syncStats.lastSyncAt), { addSuffix: true })}` 
          : "Never synced"}
      </div>
    </>
  );
}

function Topbar({ onMenu, onOpenPalette }: { onMenu: () => void; onOpenPalette: () => void }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const triggerSync = useTriggerSync();

  const handleSync = () => {
    toast.promise(triggerSync.mutateAsync(), {
      loading: "Syncing your contests...",
      success: "Sync completed successfully!",
      error: "Failed to sync contests.",
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

      <button
        onClick={onOpenPalette}
        className="group relative flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border border-input bg-background/60 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent/40"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search or jump to…</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <span className="kbd">⌘</span><span className="kbd">K</span>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          size="sm"
          className="hidden gradient-primary text-white shadow-glow hover:opacity-90 sm:inline-flex"
          onClick={handleSync}
          disabled={triggerSync.isPending}
        >
          <RefreshCw className={cn("h-4 w-4", triggerSync.isPending && "animate-spin")} /> 
          {triggerSync.isPending ? "Syncing..." : "Sync now"}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 text-sm transition-colors hover:bg-accent">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-white shadow-glow">
                  {user?.name?.charAt(0) || "U"}
                </span>
              )}
              <span className="hidden sm:inline">{user?.name?.split(" ")[0] || "User"}</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const palette = useCommandPalette();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" /></div>;
  }

  if (!isAuthenticated) {
    login();
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <SidebarContent />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setMobileOpen(true)} onOpenPalette={() => palette.setOpen(true)} />
          <div key={pathname} className="flex-1 animate-page-in">
            <Outlet />
          </div>
        </div>
      </div>

      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </div>
  );
}
