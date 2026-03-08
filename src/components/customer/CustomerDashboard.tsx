import { useState, useEffect, useCallback, useRef } from "react";
import { 
  LogOut, 
  Check,
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  Globe,
  Wallet,
  User,
  Home,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { Member, Plan, Schedule, Business, Holiday } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CustomerProfile } from "./CustomerProfile";
import { PendingApproval } from "./PendingApproval";
import { CheckInOut } from "./CheckInOut";
import { PlanPaymentDialog } from "./PlanPaymentDialog";
import { CheckInsHistory } from "./CheckInsHistory";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type Tab = 'home' | 'schedule' | 'checkins' | 'profile';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function CustomerDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [member, setMember] = useState<Member | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentType, setPaymentType] = useState<'new' | 'change' | 'renew'>('change');
  const [plansExpanded, setPlansExpanded] = useState(() => {
    const saved = localStorage.getItem('plans_expanded');
    return saved ? JSON.parse(saved) : true;
  });

  const previousStatusRef = useRef<Member['status'] | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    const { data: memberData } = await db
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!memberData) {
      setLoading(false);
      return;
    }

    setMember(memberData);
    setBusinessId(memberData.business_id);
    localStorage.setItem('customer_business_id', memberData.business_id);

    const [plansRes, scheduleRes, businessRes, holidaysRes] = await Promise.all([
      db.from('plans').select('*').eq('business_id', memberData.business_id).eq('is_active', true),
      db.from('schedules').select('*').eq('business_id', memberData.business_id),
      db.from('businesses').select('*').eq('id', memberData.business_id).single(),
      db.from('holidays').select('*').eq('business_id', memberData.business_id),
    ]);

    if (plansRes.data) setPlans(plansRes.data);
    if (scheduleRes.data) setSchedule(scheduleRes.data);
    if (businessRes.data) setBusiness(businessRes.data);
    if (holidaysRes.data) setHolidays(holidaysRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user?.id) return;

    const id = window.setInterval(() => {
      fetchData();
    }, 15000);

    return () => window.clearInterval(id);
  }, [user?.id, fetchData]);
  useEffect(() => {
    if (!user?.id) return;
    if (member?.status !== 'pending') return;

    const id = window.setInterval(() => {
      fetchData();
    }, 8000);

    return () => window.clearInterval(id);
  }, [user?.id, member?.status, fetchData]);
  useEffect(() => {
    const prev = previousStatusRef.current;
    const next = member?.status ?? null;

    if (prev === 'pending' && next === 'active') {
      toast.success('Approved! Your membership is now active.');
    }

    previousStatusRef.current = next;
  }, [member?.status]);

  const currentPlan = plans.find(p => p.id === member?.plan_id);
  const daysRemaining = member?.end_date 
    ? differenceInDays(new Date(member.end_date), new Date()) 
    : 0;

  const today = new Date().getDay();
  const todaySchedules = schedule.filter(s => s.day_of_week === today && s.is_open);

  const handleSignOut = async () => {
    localStorage.removeItem('customer_business_id');
    await signOut();
    toast.success('Signed out successfully');
  };

  const getDurationLabel = (days: number) => {
    if (days <= 7) return '/week';
    if (days <= 30) return '/month';
    if (days <= 90) return '/quarter';
    if (days <= 180) return '/6 months';
    return '/year';
  };

  const handlePlanAction = (plan: Plan, type: 'new' | 'change' | 'renew') => {
    setSelectedPlan(plan);
    setPaymentType(type);
    setPaymentDialogOpen(true);
  };

  const togglePlans = () => {
    const newState = !plansExpanded;
    setPlansExpanded(newState);
    localStorage.setItem('plans_expanded', JSON.stringify(newState));
  };

  const getSchedulesForDay = (dayOfWeek: number) => {
    return schedule.filter(s => s.day_of_week === dayOfWeek && s.is_open).sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  if (member?.status === 'pending') {
    return <PendingApproval member={member} business={business} onRefresh={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <span className="font-display text-base sm:text-lg font-semibold text-info">
                {member?.full_name?.charAt(0) || 'M'}
              </span>
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-medium">{member?.full_name || 'Member'}</h1>
              <p className="text-xs text-muted-foreground">{business?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {}
      <nav className="sticky top-14 sm:top-16 z-40 bg-card/50 backdrop-blur-sm border-b">
        <div className="container px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('home')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'home'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'schedule'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'checkins'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Activity className="w-4 h-4" />
              Check-ins
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'profile'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      </nav>

      <main className="container px-4 py-6 sm:py-8 max-w-2xl mx-auto">
        {member?.status === 'paused' && (
          <div className="rounded-xl border bg-warning/5 border-warning/20 p-4 mb-6">
            <p className="text-sm font-medium text-warning">Subscription paused</p>
            <p className="text-xs text-muted-foreground mt-1">Your membership is paused. Please contact the gym to resume.</p>
          </div>
        )}

        {member?.status === 'cancelled' && (
          <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-4 mb-6">
            <p className="text-sm font-medium text-destructive">Subscription cancelled</p>
            <p className="text-xs text-muted-foreground mt-1">Your membership has been cancelled. Please contact the gym to subscribe again.</p>
          </div>
        )}

        {activeTab === 'profile' && businessId ? (
          <CustomerProfile businessId={businessId} />
        ) : activeTab === 'checkins' && member && businessId ? (
          <CheckInsHistory memberId={member.id} businessId={businessId} />
        ) : activeTab === 'schedule' ? (
          <div className="space-y-6 opacity-0 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-medium mb-1">Gym Schedule</h2>
              <p className="text-muted-foreground">Working hours and holidays</p>
            </div>

            {}
            <div className="space-y-3">
              {DAYS.map((day, dayIndex) => {
                const daySchedules = getSchedulesForDay(dayIndex);
                const isToday = dayIndex === today;
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "rounded-xl border bg-card p-4",
                      isToday && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          isToday && "text-primary"
                        )}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      {daySchedules.length > 0 ? (
                        <div className="text-right">
                          {daySchedules.map((slot, i) => (
                            <p key={i} className="text-sm">
                              {slot.start_time} – {slot.end_time}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Closed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {}
            {holidays.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-medium mb-3">Upcoming Holidays</h3>
                <div className="space-y-2">
                  {holidays
                    .filter(h => new Date(h.date) >= new Date())
                    .slice(0, 5)
                    .map((holiday) => (
                      <div
                        key={holiday.id}
                        className="flex items-center justify-between rounded-xl border bg-card p-4"
                      >
                        <div>
                          <p className="font-medium">{holiday.reason || 'Holiday'}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 opacity-0 animate-fade-up">
            
            {}
            {member && businessId && member.status === 'active' && (
              <CheckInOut memberId={member.id} businessId={businessId} />
            )}

            {}
            {currentPlan && member && member.status !== 'cancelled' && (
              <div className={cn(
                "rounded-3xl p-6 border-2",
                daysRemaining <= 3
                  ? "bg-destructive/5 border-destructive/30"
                  : daysRemaining <= 7 
                  ? "bg-warning/5 border-warning/30" 
                  : "bg-success/5 border-success/30"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                    <h2 className="font-display text-2xl font-medium">{currentPlan.name}</h2>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
                    daysRemaining <= 3
                      ? "bg-destructive/10 text-destructive"
                      : daysRemaining <= 7 
                      ? "bg-warning/10 text-warning" 
                      : "bg-success/10 text-success"
                  )}>
                    {daysRemaining <= 3 && <AlertCircle className="w-3 h-3" />}
                    {daysRemaining} days left
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Expires: {member.end_date && format(new Date(member.end_date), 'MMM d, yyyy')}
                  </span>
                </div>

                {daysRemaining <= 7 && (
                  <div className={cn(
                    "p-3 rounded-xl mb-4",
                    daysRemaining <= 3 ? "bg-destructive/10" : "bg-warning/10"
                  )}>
                    <p className={cn(
                      "text-sm font-medium",
                      daysRemaining <= 3 ? "text-destructive" : "text-warning"
                    )}>
                      Your plan expires soon! Renew now to continue your membership.
                    </p>
                  </div>
                )}

                {member.status !== 'paused' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePlanAction(currentPlan, 'renew')}
                      className="flex-1 rounded-xl"
                      variant={daysRemaining <= 7 ? "default" : "outline"}
                    >
                      Renew Plan
                    </Button>
                  </div>
                )}
              </div>
            )}

            {}
            {!currentPlan && member?.status === 'active' && (
              <div className="rounded-3xl p-6 border-2 bg-info/5 border-info/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-medium mb-2">No Active Plan</h2>
                    <p className="text-muted-foreground">
                      You don't have an active plan. Please visit the gym reception to choose a membership plan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            {todaySchedules.length > 0 && (
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Today's Hours</h3>
                </div>
                <div className="space-y-1">
                  {todaySchedules.map((slot, i) => (
                    <p key={i} className="text-xl font-display">
                      {slot.start_time} – {slot.end_time}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {schedule.filter(s => s.day_of_week === today).length === 0 && (
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Today's Hours</h3>
                </div>
                <p className="text-muted-foreground">Closed today</p>
              </div>
            )}

            {}
            {business && (
              <div className="rounded-2xl border bg-card p-5 space-y-3">
                <h3 className="font-display text-lg font-medium">{business.name}</h3>
                
                {business.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{business.location}</span>
                  </div>
                )}
                
                {business.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${business.contact_phone}`} className="hover:text-foreground transition-colors">
                      {business.contact_phone}
                    </a>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                      {business.website}
                    </a>
                  </div>
                )}
                
                {business.upi_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    <span>UPI: {business.upi_id}</span>
                  </div>
                )}
              </div>
            )}

            {}
            <div>
              <button
                onClick={togglePlans}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="font-display text-xl font-medium">Available Plans</h3>
                {plansExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {plansExpanded && (
                <div className="space-y-4">
                {plans.map((plan, i) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "rounded-2xl border bg-card p-5 transition-all opacity-0 animate-fade-up",
                      `stagger-${(i % 5) + 1}`,
                      plan.id === member?.plan_id && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {plan.duration_days} days
                        </span>
                        <h4 className="font-display text-xl font-medium mt-1">{plan.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-display font-semibold">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-muted-foreground">{getDurationLabel(plan.duration_days)}</span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    )}

                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 3).map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>

                    {plan.id === member?.plan_id ? (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CreditCard className="w-4 h-4" />
                        Current plan
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePlanAction(plan, 'change')}
                        variant="outline"
                        className="w-full rounded-xl"
                      >
                        {member?.plan_id ? 'Change to this plan' : 'Subscribe'}
                      </Button>
                    )}
                  </div>
                ))}

                {plans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No plans available yet
                  </div>
                )}
              </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-4">
                To subscribe or change plans, click the button above or visit the gym reception.
              </p>
            </div>
          </div>
        )}
      </main>

      {selectedPlan && business && member && (
        <PlanPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={selectedPlan}
          business={business}
          memberId={member.id}
          requestType={paymentType}
        />
      )}
    </div>
  );
}

