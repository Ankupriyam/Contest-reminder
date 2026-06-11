import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { platformMeta, type Platform } from "@/lib/mock-data";
import { Check, CalendarPlus, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — ContestSync" }] }),
  component: Onboarding,
});

const steps = ["Platforms", "Reminder", "Calendar", "Finish"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Platform[]>(["LeetCode", "Codeforces", "CodeChef", "AtCoder"]);
  const [reminder, setReminder] = useState<string>("15");
  const [custom, setCustom] = useState<string>("");
  const [calendarCreated, setCalendarCreated] = useState(false);

  const togglePlatform = (p: Platform) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background hero-bg">
      <div className="mx-auto flex max-w-3xl flex-col px-6 py-10">
        <Logo />

        <div className="mt-10 grid grid-cols-4 gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-col gap-2">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  i <= step ? "gradient-primary" : "bg-border",
                )}
              />
              <div className={cn("text-xs font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>
                Step {i + 1} · {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div key={step} className="animate-fade-in-up">
            {step === 0 && (
              <Section
                title="Choose your platforms"
                description="Select every platform whose contests you want on your calendar. You can change this any time."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(platformMeta) as Platform[]).map((p) => {
                    const on = selected.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          "group flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                          on
                            ? "border-primary/40 bg-primary/5 shadow-soft"
                            : "border-border bg-background hover:border-primary/30",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                               style={{ backgroundColor: platformMeta[p].color }}>
                            {platformMeta[p].initials}
                          </div>
                          <div>
                            <div className="font-medium">{p}</div>
                            <div className="text-xs text-muted-foreground">Auto-sync contests</div>
                          </div>
                        </div>
                        <div className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border",
                          on ? "gradient-primary border-transparent text-white" : "border-border text-transparent",
                        )}>
                          <Check className="h-4 w-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {step === 1 && (
              <Section
                title="When should we remind you?"
                description="We'll add a reminder to each contest event so you can prepare in time."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {["5", "15", "30", "60", "custom"].map((opt) => {
                    const label = opt === "custom" ? "Custom" : opt === "60" ? "1 Hour" : `${opt} Minutes`;
                    const on = reminder === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setReminder(opt)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          on ? "border-primary/40 bg-primary/5 shadow-soft" : "border-border bg-background hover:border-primary/30",
                        )}
                      >
                        <div className="text-sm font-medium">{label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {opt === "custom" ? "Pick any value" : "before start"}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {reminder === "custom" && (
                  <div className="mt-4 flex items-center gap-2">
                    <Input
                      type="number" min={1} max={1440} placeholder="e.g. 45"
                      value={custom} onChange={(e) => setCustom(e.target.value)}
                      className="max-w-[160px]"
                    />
                    <span className="text-sm text-muted-foreground">minutes before</span>
                  </div>
                )}
              </Section>
            )}

            {step === 2 && (
              <Section
                title="Create your Contest calendar"
                description="We'll create a dedicated calendar in your Google account so contest events stay tidy."
              >
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-white shadow-glow">
                      <CalendarPlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Contests · ContestSync</div>
                      <div className="text-xs text-muted-foreground">Dedicated Google Calendar</div>
                    </div>
                    {calendarCreated ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        <Check className="h-3 w-3" /> Created
                      </span>
                    ) : (
                      <Button onClick={() => setCalendarCreated(true)} size="sm" className="gradient-primary text-white">
                        Create calendar
                      </Button>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {step === 3 && (
              <Section
                title="You're all set"
                description="ContestSync is now keeping your calendar in sync. You can tweak everything from the dashboard."
              >
                <div className="flex flex-col items-center rounded-xl border border-border bg-background p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
                    <PartyPopper className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-lg font-semibold">Setup complete</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selected.length} platform{selected.length === 1 ? "" : "s"} connected · reminder{" "}
                    {reminder === "custom" ? `${custom || "?"} min` : reminder === "60" ? "1 hr" : `${reminder} min`} before
                  </div>
                  <Button onClick={() => navigate({ to: "/dashboard" })} className="mt-6 gradient-primary text-white">
                    Open dashboard
                  </Button>
                </div>
              </Section>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} className="gradient-primary text-white">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">All done</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
