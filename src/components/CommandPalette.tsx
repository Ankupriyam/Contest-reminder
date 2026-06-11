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
import { contests } from "@/lib/mock-data";
import { toast } from "sonner";

export function CommandPalette({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const run = (fn: () => void) => { onOpenChange(false); setTimeout(fn, 50); };

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
          <CommandItem onSelect={() => run(() => toast.success("Sync started", { description: "Fetching latest contests…" }))}>
            <RefreshCw /> Sync now <CommandShortcut>⌘ R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => toast.success("Calendar opened in a new tab"))}>
            <CalendarCheck /> Open Google Calendar
          </CommandItem>
          <CommandItem onSelect={() => run(() => toast("Added new platform"))}>
            <Plus /> Add platform
          </CommandItem>
          <CommandItem onSelect={() => run(toggle)}>
            {theme === "dark" ? <Sun /> : <Moon />}
            Toggle theme <CommandShortcut>⌘ J</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Contests">
          {contests.slice(0, 6).map((c) => (
            <CommandItem key={c.id} onSelect={() => run(() => window.open(c.url, "_blank"))}>
              <ExternalLink />
              <span className="truncate">{c.name}</span>
              <CommandShortcut>{c.platform}</CommandShortcut>
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
