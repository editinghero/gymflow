import { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, Moon, Shield, Sparkles, Sun, Zap } from 'lucide-react';
import { cn } from './lib/utils';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('landing_theme');
    const initialDark = saved === 'dark';
    setIsDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('landing_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/50 hover:bg-muted transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('sticky top-0 z-50 border-b', scrolled ? 'glass border-border shadow-soft' : 'bg-transparent border-transparent')}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold">GymFlow</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/"
            className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-border bg-background/50 hover:bg-muted transition-colors text-sm items-center"
          >
            Open App
          </a>
          <ThemeToggle />
          <a
            href="#pricing"
            className="inline-flex h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm items-center gap-2"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-soft">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-info/10 blur-3xl" />
          </div>

          <div className="container py-16 sm:py-20 relative">
            <div className="max-w-3xl">
              <Badge>Owner + Member dashboards</Badge>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-tight">
                Run your gym membership flow with clarity.
              </h1>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                GymFlow helps you manage members, plans, schedules, check-ins, and payments with a clean, modern UI.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="/"
                  className="inline-flex h-11 px-5 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity items-center justify-center gap-2"
                >
                  Open the App <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#features"
                  className="inline-flex h-11 px-5 rounded-2xl border border-border bg-background/50 hover:bg-muted transition-colors items-center justify-center"
                >
                  Explore features
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <p className="text-sm text-muted-foreground">Setup</p>
                  <p className="mt-1 font-display text-xl font-semibold">2 minutes</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <p className="text-sm text-muted-foreground">Designed for</p>
                  <p className="mt-1 font-display text-xl font-semibold">Small gyms</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <p className="text-sm text-muted-foreground">Style</p>
                  <p className="mt-1 font-display text-xl font-semibold">Warm + modern</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">Everything you need, nothing you don’t</h2>
            <p className="mt-3 text-muted-foreground">A simple workflow for owners, and a smooth experience for members.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              title="Member management"
              description="Approve, pause, cancel, or remove members with clear states and instant updates."
              icon={Sparkles}
            />
            <FeatureCard
              title="Payments requests"
              description="Collect renewal requests and approve them with one click (with notifications)."
              icon={Zap}
            />
            <FeatureCard
              title="Secure by design"
              description="Minimal server logging and sanitized errors to avoid leaking internal details."
              icon={Shield}
            />
          </div>
        </section>

        <section id="how" className="container py-14 sm:py-16">
          <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10 shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-3xl font-semibold">How it works</h2>
                <p className="mt-3 text-muted-foreground">A clean flow from signup to check-in.</p>

                <div className="mt-6 space-y-4">
                  {[
                    { t: 'Create your gym', d: 'Signup as owner and your gym profile is created automatically.' },
                    { t: 'Add plans', d: 'Define memberships and duration once.' },
                    { t: 'Members join', d: 'Members register with access code and request a plan.' },
                    { t: 'Approve & manage', d: 'Approve payments, pause or cancel when needed.' },
                  ].map((s) => (
                    <div key={s.t} className="flex gap-3">
                      <div className="mt-1 h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-semibold">✓</span>
                      </div>
                      <div>
                        <p className="font-medium">{s.t}</p>
                        <p className="text-sm text-muted-foreground">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <p className="text-sm text-muted-foreground">Designed to feel calm</p>
                <p className="mt-2 font-display text-2xl font-semibold">Warm theme, soft shadows, and glass blur.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Navbar</p>
                    <p className="mt-1 text-sm font-medium">Blur + sticky</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Components</p>
                    <p className="mt-1 text-sm font-medium">Rounded + modern</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Calendar</p>
                    <p className="mt-1 text-sm font-medium">No orange</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Alerts</p>
                    <p className="mt-1 text-sm font-medium">Clear statuses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">Simple pricing</h2>
            <p className="mt-3 text-muted-foreground">Pick a plan and start managing members.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Free', price: 'Free', desc: '10 members only allowed.' },
              { name: 'One-time', price: '₹2000', desc: 'One-time purchase for the full app.' },
            ].map((p) => (
              <div key={p.name} className="rounded-3xl border border-border bg-card/60 p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-2 font-display text-3xl font-semibold">{p.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <a
                  href="/"
                  className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Start
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">FAQ</h2>
            <p className="mt-3 text-muted-foreground">Quick answers.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[ 
              { q: 'Does it work for owners and members?', a: 'Yes, both dashboards are built in.' },
              { q: 'Can I pause or cancel subscriptions?', a: 'Yes. Pause keeps plan; cancel frees plan.' },
              { q: 'Will it show payment request notifications?', a: 'Yes, the bell shows pending payment requests.' },
              { q: 'Does it auto check-in on login?', a: 'No, check-ins require clicking the Check In button.' },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-card/60 p-5">
                <p className="font-medium">{f.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t">
          <div className="container py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              <span>GymFlow</span>
            </div>
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} GymFlow. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
