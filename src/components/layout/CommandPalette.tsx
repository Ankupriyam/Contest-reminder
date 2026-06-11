import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem,
  CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, ListChecks, Activity, Settings, UserRound, RefreshCw,
  Sun, Moon, ExternalLink, CalendarCheck, Plus,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useUpcomingContests } from "@/hooks/use-contests";
import { useTriggerSync } from "@/hooks/use-sync";
import { toast } from "sonner";

export function CommandPalette({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { data: contests = [] } = useUpcomingContests();
  const triggerSync = useTriggerSync();

  const run = (fn: () => void) => { onOpenChange(false); setTimeout(fn, 50); };

  const handleSync = () => {
    toast.promise(triggerSync.mutateAsync(), {
      loading: "Syncing your contests...",
      success: "Sync completed successfully!",
      error: "Failed to sync contests.",
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => navigate({ to: "/dashboard" }))}>
            <LayoutDashboard /> Dashboard <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/contests" }))}>
            <ListChecks /> Contests <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/activity" }))}>
            <Activity /> Activity
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/settings" }))}>
            <Settings /> Settings <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/profile" }))}>
            <UserRound /> Profile
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(handleSync)}>
            <RefreshCw /> Sync now <CommandShortcut>⌘ R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => window.open("https://calendar.google.com", "_blank"))}>
            <CalendarCheck /> Open Google Calendar
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/settings" }))}>
            <Plus /> Manage platforms
          </CommandItem>
          <CommandItem onSelect={() => run(toggle)}>
            {theme === "dark" ? <Sun /> : <Moon />}
            Toggle theme <CommandShortcut>⌘ J</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Contests">
          {contests.slice(0, 6).map((c: any) => (
            <CommandItem key={c._id} onSelect={() => run(() => window.open(c.url, "_blank"))}>
              <ExternalLink />
              <span className="truncate">{c.name}</span>
              <CommandShortcut className="capitalize">{c.platform}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
