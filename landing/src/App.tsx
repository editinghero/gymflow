import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, CheckCircle, Clock, CreditCard, Dumbbell, Github, Instagram, Moon, Shield, Sun, Users, Zap } from 'lucide-react';
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
    <header className={cn('sticky top-0 z-50 border-b', scrolled ? 'glass border-border shadow-md' : 'bg-transparent border-transparent')}>
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
            href="https://gymflow.pages.dev"
            className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-border bg-background/50 hover:bg-muted transition-colors text-sm items-center"
          >
            Open App
          </a>
          <ThemeToggle />
          <a
            href="https://gymflow.pages.dev"
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
    <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-soft hover:shadow-md transition-shadow">
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
              <Badge>Complete gym management system</Badge>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-tight">
                Modern gym management for small fitness studios
              </h1>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                GymFlow is a complete membership management system built for gym owners. Manage members, track check-ins, handle payments, and schedule your gym hours - all in one beautiful interface.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://gymflow.pages.dev"
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
                  <p className="text-sm text-muted-foreground">Setup time</p>
                  <p className="mt-1 font-display text-xl font-semibold">2 minutes</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <p className="text-sm text-muted-foreground">Built for</p>
                  <p className="mt-1 font-display text-xl font-semibold">Small gyms</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <p className="text-sm text-muted-foreground">Tech stack</p>
                  <p className="mt-1 font-display text-xl font-semibold">React + Node</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">Complete feature set for gym owners</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to run your gym efficiently, from member onboarding to daily operations.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              title="Member management"
              description="Add members manually or let them register with your gym's access code. Approve, pause, cancel, or remove memberships with clear status tracking."
              icon={Users}
            />
            <FeatureCard
              title="Check-in system"
              description="Members can check in and out with one tap. Track visit history, total time spent, and view check-in calendar with holiday exclusions."
              icon={CheckCircle}
            />
            <FeatureCard
              title="Payment requests"
              description="Members submit payment requests for plan changes or renewals. Approve with one click and get instant notifications for pending requests."
              icon={CreditCard}
            />
            <FeatureCard
              title="Membership plans"
              description="Create unlimited plans with custom pricing, duration, and features. Set plans as active or inactive. Members can view and request plan changes."
              icon={Zap}
            />
            <FeatureCard
              title="Schedule management"
              description="Set your gym's working hours for each day of the week. Add multiple time slots per day. Members see today's hours and full weekly schedule."
              icon={Clock}
            />
            <FeatureCard
              title="Holiday tracking"
              description="Mark holidays when your gym is closed. Holidays appear on member calendars and are excluded from check-in statistics automatically."
              icon={Calendar}
            />
          </div>
        </section>

        <section id="how" className="container py-14 sm:py-16">
          <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10 shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-3xl font-semibold">How GymFlow works</h2>
                <p className="mt-3 text-muted-foreground">A streamlined workflow from gym setup to daily operations.</p>

                <div className="mt-6 space-y-4">
                  {[
                    { t: 'Owner signs up', d: 'Create your account and your gym profile is automatically generated with a unique access code.' },
                    { t: 'Configure your gym', d: 'Add membership plans, set working hours, mark holidays, and customize your gym details.' },
                    { t: 'Members join', d: 'Members register using your gym access code and request a membership plan.' },
                    { t: 'Approve & manage', d: 'Review payment requests, approve memberships, and manage member statuses from your dashboard.' },
                    { t: 'Track operations', d: 'Monitor check-ins, view member activity, and manage day-to-day operations effortlessly.' },
                  ].map((s) => (
                    <div key={s.t} className="flex gap-3">
                      <div className="mt-1 h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                <p className="text-sm text-muted-foreground">Technical highlights</p>
                <p className="mt-2 font-display text-2xl font-semibold">Built with modern web technologies</p>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Frontend</p>
                    <p className="mt-1 text-sm font-medium">React 18 + TypeScript + Vite</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Backend</p>
                    <p className="mt-1 text-sm font-medium">Express.js + PostgreSQL + JWT</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">UI/UX</p>
                    <p className="mt-1 text-sm font-medium">Tailwind CSS + Radix UI + Glassmorphism</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Security</p>
                    <p className="mt-1 text-sm font-medium">bcrypt password hashing + JWT tokens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">Dual dashboard system</h2>
            <p className="mt-3 text-muted-foreground">Separate interfaces optimized for owners and members.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Owner dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">Complete control panel for gym management</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>View all members with status filters (active, pending, paused, cancelled)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Manage membership plans and pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Review and approve payment requests with notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>View all member check-ins with calendar and filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Configure gym schedule and holidays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Update gym details and payment information</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-info" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Member dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">Simple interface for gym members</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>One-tap check-in and check-out system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>View current membership plan and expiry date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Browse available plans and request changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Track check-in history with calendar view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>See gym schedule and upcoming holidays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>View total visits, weekly stats, and workout time</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing" className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">Choose the plan that fits your gym size.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-soft">
              <p className="text-sm text-muted-foreground">Free</p>
              <p className="mt-2 font-display text-3xl font-semibold">$0</p>
              <p className="mt-2 text-sm text-muted-foreground">Perfect for trying out GymFlow</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Up to 10 members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>All core features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Check-in tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Payment requests</span>
                </li>
              </ul>
              <a
                href="https://gymflow.pages.dev"
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-2xl border border-border bg-background hover:bg-muted transition-colors"
              >
                Start free
              </a>
            </div>

            <div className="rounded-3xl border-2 border-primary bg-card/60 p-6 shadow-soft relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Recommended
              </div>
              <p className="text-sm text-muted-foreground">One-time purchase</p>
              <p className="mt-2 font-display text-3xl font-semibold">$25</p>
              <p className="mt-2 text-sm text-muted-foreground">Lifetime access, no recurring fees</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Unlimited members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>All features included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Future updates</span>
                </li>
              </ul>
              <a
                href="https://gymflow.pages.dev"
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get started
              </a>
            </div>
          </div>
        </section>

        <section id="faq" className="container py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold">Frequently asked questions</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to know about GymFlow.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[ 
              { q: 'Does it work for both owners and members?', a: 'Yes. GymFlow has separate dashboards for gym owners and members, each optimized for their specific needs.' },
              { q: 'Can I pause or cancel memberships?', a: 'Yes. Owners can pause memberships (keeps plan assigned) or cancel them (frees up the plan slot) with one click.' },
              { q: 'How do payment requests work?', a: 'Members submit payment requests for plan changes or renewals. Owners get notifications and can approve with one click.' },
              { q: 'Is check-in automatic?', a: 'No. Members must manually check in and out using the button in their dashboard. This prevents accidental check-ins.' },
              { q: 'Can I track member attendance?', a: 'Yes. View all check-ins in a calendar, filter by member, and see statistics like total visits and time spent.' },
              { q: 'How do I add members?', a: 'Members can self-register using your gym access code, or you can add them manually from the owner dashboard.' },
              { q: 'Can I customize membership plans?', a: 'Yes. Create unlimited plans with custom names, prices, durations, and feature lists. Toggle plans active/inactive anytime.' },
              { q: 'What about gym holidays?', a: 'Mark holidays in the schedule manager. They appear on member calendars and are excluded from attendance statistics.' },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-card/60 p-5">
                <p className="font-medium">{f.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-14 sm:py-16">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-info/5 p-8 sm:p-12 text-center">
            <h2 className="font-display text-3xl font-semibold">Ready to modernize your gym?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join gym owners who are simplifying their operations with GymFlow. Get started in minutes.
            </p>
            <a
              href="https://gymflow.pages.dev"
              className="mt-6 inline-flex h-11 px-6 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity items-center gap-2"
            >
              Open GymFlow <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <footer className="border-t">
          <div className="container py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Dumbbell className="h-4 w-4" />
                <span>GymFlow</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/editinghero/gymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/astralquarks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
              <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} GymFlow. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
