import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar, 
  LogOut,
  Copy,
  Check,
  Settings,
  User,
  Bell,
  RefreshCw,
  Building2,
  Wallet,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardHome } from "./DashboardHome";
import { MembersList } from "./MembersList";
import { PlansManager } from "./PlansManager";
import { ScheduleManager } from "./ScheduleManager";
import { GymSettings } from "./GymSettings";
import { OwnerProfile } from "./OwnerProfile";
import { PaymentRequests } from "./PaymentRequests";
import { AllCheckIns } from "./AllCheckIns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { Business } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

type Tab = 'dashboard' | 'members' | 'plans' | 'schedule' | 'payments' | 'checkins' | 'settings' | 'profile';

const tabs = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members' as Tab, label: 'Members', icon: Users },
  { id: 'plans' as Tab, label: 'Plans', icon: CreditCard },
  { id: 'schedule' as Tab, label: 'Schedule', icon: Calendar },
  { id: 'payments' as Tab, label: 'Payments', icon: Wallet },
  { id: 'checkins' as Tab, label: 'Check-ins', icon: Activity },
  { id: 'settings' as Tab, label: 'Gym', icon: Settings },
  { id: 'profile' as Tab, label: 'Profile', icon: User },
];

export function OwnerDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [copied, setCopied] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [businessError, setBusinessError] = useState<string | null>(null);

  const fetchBusiness = async () => {
    const hasCachedBusiness = Boolean(business);
    if (!hasCachedBusiness) {
      setLoading(true);
    }

    setBusinessError(null);

    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    try {
      const { data: existingBusiness, error: fetchError } = await db
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching business:', fetchError);
        if (!hasCachedBusiness) setBusiness(null);
        setBusinessError(fetchError.message);
        toast.error('Unable to load business data');
        setLoading(false);
        return;
      }

      if (existingBusiness) {
        setBusiness(existingBusiness);
        setLoading(false);
        return;
      }
      if (hasCachedBusiness) {
        setBusinessError('Business not found for this account.');
        toast.error('Unable to refresh business');
        setLoading(false);
        return;
      }
      const businessName = user.user_metadata?.full_name || 'My Gym';
      let created: Business | null = null;
      let lastCreateError: { message?: string } | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

        const insertResult = await (db
          .from('businesses')
          .insert({
            owner_id: user.id,
            name: businessName,
            access_code: accessCode,
          }) as any);
        
        const { data: newBusiness, error: createError } = insertResult;

        if (!createError && newBusiness) {
          created = newBusiness[0] as Business;
          break;
        }

        lastCreateError = createError;
        const msg = (createError?.message || '').toLowerCase();
        const isAccessCodeCollision = msg.includes('duplicate') || msg.includes('unique');
        if (!isAccessCodeCollision) break;
      }

      if (!created) {
        console.error('Error creating business:', lastCreateError);
        setBusiness(null);
        setBusinessError(lastCreateError?.message || 'Failed to create business.');
        toast.error('Failed to create business');
        setLoading(false);
        return;
      }

      setBusiness(created);
      const roleInsertResult = await (db.from('user_roles').insert({
        user_id: user.id,
        role: 'owner',
      }) as any);
      
      const { error: roleError } = roleInsertResult;

      if (roleError) {
        const msg = (roleError.message || '').toLowerCase();
        const isDuplicate = msg.includes('duplicate') || msg.includes('unique');
        if (!isDuplicate) console.error('Error inserting owner role:', roleError);
      }

      toast.success(`Your access code is: ${created.access_code}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      if (!hasCachedBusiness) setBusiness(null);
      setBusinessError('Unexpected error while setting up your business.');
    }

    setLoading(false);
  };

  const fetchPendingCount = async (businessId: string) => {
    const result = await (db
      .from('payment_requests')
      .select('id')
      .eq('business_id', businessId)
      .eq('status', 'pending') as any);

    const { data, error } = result;

    if (!error && data) {
      setPendingCount(data.length);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBusiness();
    }
  }, [user?.id]);
  
  useEffect(() => {
    if (business && (activeTab === 'dashboard' || activeTab === 'payments')) {
      fetchPendingCount(business.id);
    }
  }, [activeTab, business?.id]);

  const copyAccessCode = async () => {
    if (!business) return;
    await navigator.clipboard.writeText(business.access_code);
    setCopied(true);
    toast.success('Access code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('customer_business_id');
    toast.success('Signed out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-warning" />
          </div>
          <h2 className="font-display text-xl font-medium">
            {businessError ? "Couldn't set up your business" : 'Setting up your business'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {businessError
              ? "We couldn't finish setting up your business. Tap Retry to try again."
              : "We're creating your business profile. This may take a moment."}
          </p>
          {businessError && (
            <div className="rounded-xl border bg-card p-3 text-left">
              <p className="text-xs text-muted-foreground break-words">{businessError}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={fetchBusiness} className="w-full rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="font-display text-base sm:text-lg font-semibold text-primary">
                {business.name?.charAt(0) || 'G'}
              </span>
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-medium">{business.name || 'My Gym'}</h1>
              <button
                onClick={copyAccessCode}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Code: {business.access_code}</span>
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {}
            {pendingCount > 0 && (
              <button
                onClick={() => setActiveTab('payments')}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-info text-info-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {}
      <nav className="sticky top-14 sm:top-16 z-40 bg-card/50 backdrop-blur-sm border-b">
        <div className="container px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const showBadge = tab.id === 'members' && pendingCount > 0;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {showBadge && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                      activeTab === tab.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-info text-info-foreground"
                    )}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {}
      <main className="container px-4 py-4 sm:py-6">
        {activeTab === 'dashboard' && <DashboardHome businessId={business.id} />}
        {activeTab === 'members' && <MembersList businessId={business.id} />}
        {activeTab === 'plans' && <PlansManager businessId={business.id} />}
        {activeTab === 'schedule' && <ScheduleManager businessId={business.id} />}
        {activeTab === 'payments' && <PaymentRequests businessId={business.id} />}
        {activeTab === 'checkins' && <AllCheckIns businessId={business.id} />}
        {activeTab === 'settings' && <GymSettings businessId={business.id} />}
        {activeTab === 'profile' && <OwnerProfile />}
      </main>
    </div>
  );
}

