import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { platformMeta, type Platform } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — ContestSync" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [enabled, setEnabled] = useState<Record<Platform, boolean>>({
    LeetCode: true, Codeforces: true, CodeChef: true, AtCoder: true,
  });
  const [reminder, setReminder] = useState("15");
  const [custom, setCustom] = useState("");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage platforms and reminder defaults.</p>
      </div>

      <Card title="Platforms" description="Toggle which platforms sync to your calendar.">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(platformMeta) as Platform[]).map((p) => (
            <label key={p} className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                     style={{ backgroundColor: platformMeta[p].color }}>{platformMeta[p].initials}</div>
                <div>
                  <div className="text-sm font-medium">{p}</div>
                  <div className="text-xs text-muted-foreground">{enabled[p] ? "Syncing" : "Disabled"}</div>
                </div>
              </div>
              <Switch checked={enabled[p]} onCheckedChange={(v) => setEnabled((e) => ({ ...e, [p]: v }))} />
            </label>
          ))}
        </div>
      </Card>

      <Card title="Reminder defaults" description="Default reminder added to every new contest event.">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={reminder} onValueChange={setReminder}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Pick a reminder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes before</SelectItem>
              <SelectItem value="15">15 minutes before</SelectItem>
              <SelectItem value="30">30 minutes before</SelectItem>
              <SelectItem value="60">1 hour before</SelectItem>
              <SelectItem value="custom">Custom…</SelectItem>
            </SelectContent>
          </Select>
          {reminder === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="number" min={1} max={1440} placeholder="45"
                className="w-32" value={custom} onChange={(e) => setCustom(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">minutes before</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="gradient-primary text-white">Save changes</Button>
        </div>
      </Card>

      <Card title="Sync schedule" description="How often ContestSync checks for new contests.">
        <Select defaultValue="1h">
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="15m">Every 15 minutes</SelectItem>
            <SelectItem value="1h">Every hour</SelectItem>
            <SelectItem value="6h">Every 6 hours</SelectItem>
            <SelectItem value="24h">Once a day</SelectItem>
          </SelectContent>
        </Select>
      </Card>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
