import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bell, Calendar, CheckCircle2, ChevronRight, Github, Globe, Sparkles, Twitter, Zap,
} from "lucide-react";
import { platformMeta } from "@/lib/platform-config";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ContestSync — Never Miss a Coding Contest Again" },
      { name: "description", content: "Automatically sync coding contests from LeetCode, Codeforces, CodeChef and AtCoder to Google Calendar with smart reminders." },
    ],
  }),
  component: Landing,
});

function Nav() {
  const { login, isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="glass flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-2.5 shadow-soft">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#platforms" className="hover:text-foreground transition-colors">Platforms</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="gradient-primary text-white shadow-glow hover:opacity-90">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Button onClick={login} variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
                <Button onClick={login} size="sm" className="gradient-primary text-white shadow-glow hover:opacity-90">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { login, isAuthenticated } = useAuth();
  return (
    <section className="hero-bg relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            New — Auto-sync across 4 platforms
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Never miss a <span className="gradient-text">coding contest</span> again
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Automatically sync coding contests to Google Calendar and receive reminders before they start.
            One setup. Every platform. Zero missed rounds.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="gradient-primary h-11 px-6 text-white shadow-glow hover:opacity-90">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <Button onClick={login} size="lg" className="gradient-primary h-11 px-6 text-white shadow-glow hover:opacity-90">
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </Button>
            )}
            <a href="#how">
              <Button size="lg" variant="outline" className="h-11 px-6">
                See How It Works <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            Free forever • No credit card • Disconnect anytime
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="absolute inset-x-10 -top-6 h-40 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative rounded-2xl border border-border bg-card shadow-elevated">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <div className="ml-3 text-xs text-muted-foreground">contestsync.app/dashboard</div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {[
            { label: "Synced contests", value: "248", sub: "+12 this week" },
            { label: "Upcoming", value: "9", sub: "next 7 days" },
            { label: "Active platforms", value: "4 / 4", sub: "all connected" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-background/50 p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-0.5 text-xs text-success">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-border">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <div>Contest</div><div>Platform</div><div>Start</div><div>Status</div>
            </div>
            {[
              ["Weekly Contest 428", "LeetCode", "Today 8:00 AM", "Synced"],
              ["Codeforces Round 998", "Codeforces", "Tomorrow 14:35", "Scheduled"],
              ["Starters 167", "CodeChef", "Wed 20:00", "Synced"],
            ].map(([n, p, t, s]) => (
              <div key={n} className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] items-center px-4 py-3 text-sm">
                <div className="truncate font-medium">{n}</div>
                <div className="text-muted-foreground">{p}</div>
                <div className="text-muted-foreground">{t}</div>
                <div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s === "Synced" ? "bg-success/10 text-success" : "bg-warning/15 text-warning"
                  }`}>{s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { Icon: Calendar, title: "Google Calendar Sync", desc: "Every contest lands in your calendar automatically, with start times in your timezone." },
    { Icon: Bell,     title: "Smart Reminders",      desc: "Choose 5 min, 15 min, 30 min, 1 hour, or a custom heads-up — for every contest." },
    { Icon: Zap,      title: "Real-time Updates",    desc: "When a contest is rescheduled or canceled, your calendar updates instantly." },
    { Icon: Globe,    title: "4 Platforms, One Setup", desc: "LeetCode, Codeforces, CodeChef and AtCoder — sync any combination." },
    { Icon: CheckCircle2, title: "Conflict-aware",   desc: "Dedicated 'Contests' calendar keeps practice rounds separate from work." },
    { Icon: Sparkles, title: "Zero Maintenance",     desc: "Set it once. ContestSync silently keeps everything fresh in the background." },
  ];
  return (
    <section id="features" className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for competitive programmers</h2>
          <p className="mt-3 text-muted-foreground">A focused toolkit to keep your contest schedule one tap away.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elevated">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{title}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Sign in with Google", desc: "One click. We only ask for calendar permission." },
    { n: "02", title: "Pick your platforms", desc: "Choose any combination of LeetCode, Codeforces, CodeChef, AtCoder." },
    { n: "03", title: "Set a reminder", desc: "5 minutes to 1 hour before — your call. You can change it any time." },
    { n: "04", title: "Done. Forever.", desc: "Your calendar stays up to date. We handle the rest." },
  ];
  return (
    <section id="how" className="border-t border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">From zero to fully synced in under 60 seconds.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="font-mono text-xs font-medium text-primary">{s.n}</div>
              <div className="mt-3 font-semibold">{s.title}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Platforms() {
  const platforms = Object.keys(platformMeta) as (keyof typeof platformMeta)[];
  return (
    <section id="platforms" className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Supported platforms</h2>
          <p className="mt-3 text-muted-foreground">Every major competitive programming platform, in one place.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p) => (
            <div key={p} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                   style={{ backgroundColor: platformMeta[p].color }}>
                {platformMeta[p].initials}
              </div>
              <div>
                <div className="font-semibold">{p}</div>
                <div className="text-xs text-muted-foreground">Auto-synced</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Priya S.", handle: "ICPC Regionalist", text: "I used to miss at least one Codeforces round per month. Haven't missed one since I set this up." },
    { name: "Marcus K.", handle: "Expert · CF 1850", text: "Tiny tool, huge effect. Setup took 30 seconds and now my whole contest schedule is in Google Calendar." },
    { name: "Aisha R.", handle: "LeetCode Knight", text: "The reminder timing is perfect. I get 15 minutes before to wrap things up and focus." },
  ];
  return (
    <section className="border-t border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by competitive programmers</h2>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <blockquote className="text-sm leading-relaxed text-foreground">"{t.text}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.handle}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Is ContestSync free?", a: "Yes — fully free for individual use. We may add a paid tier for team/coach features later." },
    { q: "What permissions do you request?", a: "Only Google Calendar access — strictly to create, update, and delete contest events on a dedicated 'Contests' calendar." },
    { q: "How often does it sync?", a: "Automatically — every few hours and immediately when a platform publishes a new contest." },
    { q: "Can I disable a platform later?", a: "Yes. Toggle any platform off from Settings and we'll stop creating events for it." },
    { q: "Will it touch my other calendars?", a: "Never. ContestSync only writes to its own dedicated calendar." },
  ];
  return (
    <section id="faq" className="border-t border-border py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  const { login, isAuthenticated } = useAuth();
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 text-center text-white shadow-elevated sm:p-16">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">Start syncing in under a minute.</h3>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Connect Google, pick your platforms, set a reminder. That's it.</p>
          <div className="mt-7 flex justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-11 bg-white px-6 text-foreground hover:bg-white/90">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <Button onClick={login} size="lg" className="h-11 bg-white px-6 text-foreground hover:bg-white/90">
                <GoogleIcon className="h-4 w-4" /> Continue with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} ContestSync</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Status</a>
          <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
          <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13-5l-6-5c-1.9 1.3-4.2 2-7 2-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C8.8 39.6 15.8 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.3 5.5l6 5C40.2 35.2 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Platforms />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
