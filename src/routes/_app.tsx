import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, ListChecks, Activity as ActivityIcon, Settings, UserRound,
  Search, Moon, Sun, RefreshCw, Menu, ChevronDown, LogOut, Bell, Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";

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
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <div className="text-xs font-semibold text-sidebar-foreground">Sync healthy</div>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Last sync 4 min ago · 4 platforms</div>
      </div>
    </div>
  );
}

function Topbar({ onMenu, onOpenPalette }: { onMenu: () => void; onOpenPalette: () => void }) {
  const { theme, toggle } = useTheme();
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
          onClick={() => toast.success("Sync started", { description: "Fetching latest contests…" })}
        >
          <RefreshCw className="h-4 w-4" /> Sync now
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 text-sm transition-colors hover:bg-accent">
              <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-white shadow-glow">A</span>
              <span className="hidden sm:inline">Alex</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">Alex Carter</div>
              <div className="text-xs font-normal text-muted-foreground">alex@contestsync.app</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem><Sparkles className="h-4 w-4" /> What's new</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
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
