import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "./PlatformBadge";
import { StatusBadge } from "./StatusBadge";
import { CalendarCheck, ExternalLink, Clock, Bell } from "lucide-react";

export function ContestDetailModal({
  contest, open, onOpenChange,
}: { contest: any | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!contest) return null;
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime || start.getTime() + (contest.duration || 0) * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <PlatformIcon platform={contest.platform} className="h-10 w-10 rounded-xl text-xs" />
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-left">{contest.name}</DialogTitle>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{contest.platform}</span>
                <span>·</span>
                <StatusBadge status={new Date() >= start && new Date() <= end ? "live" : new Date() < start ? "upcoming" : "synced"} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Info label="Start" value={start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} />
          <Info label="End"   value={end.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} />
          <Info label="Duration" value={`${Math.floor((contest.duration || 0) / 3600)}h ${Math.floor(((contest.duration || 0) % 3600) / 60)}m`} icon={<Clock className="h-3.5 w-3.5" />} />
          <Info label="Reminder" value={`15 min before`} icon={<Bell className="h-3.5 w-3.5" />} />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <div className="flex items-center gap-2 text-success">
            <CalendarCheck className="h-4 w-4" />
            <span className="font-medium">Synced to Google Calendar</span>
          </div>
          <div className="mt-1 text-muted-foreground">Event saved on the "Contests · ContestSync" calendar.</div>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <a href="#" target="_blank" rel="noreferrer"><CalendarCheck className="h-4 w-4" /> Open Calendar event</a>
          </Button>
          <Button asChild className="gradient-primary text-white">
            <a href={contest.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Open contest
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
