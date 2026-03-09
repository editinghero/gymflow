import { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Users, 
  IndianRupee, 
  Clock, 
  CreditCard,
  AlertCircle,
  RefreshCw,
  UserMinus,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { Member, Plan, CheckIn } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHomeProps {
  businessId: string;
}

export function DashboardHome({ businessId }: DashboardHomeProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRevenue, setShowRevenue] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [membersRes, plansRes, checkInsRes] = await Promise.all([
        db.from('members').select('*').eq('business_id', businessId).then((res: any) => res),
        db.from('plans').select('*').eq('business_id', businessId).then((res: any) => res),
        db.from('check_ins').select('*').eq('business_id', businessId).gte('check_in_time', today.toISOString()).then((res: any) => res),
      ]);

      if (membersRes.data) setMembers(membersRes.data);
      if (plansRes.data) setPlans(plansRes.data);
      if (checkInsRes.data) setTodayCheckIns(checkInsRes.data);

      const { data: businessData } = await db
        .from('businesses')
        .select('currency_symbol')
        .eq('id', businessId)
        .maybeSingle();
      setCurrencySymbol((businessData as any)?.currency_symbol || '₹');
      setLoading(false);
    };

    fetchData();
  }, [businessId]);

  const pendingMembers = members.filter(c => c.status === 'pending').length;
  const activeMembers = members.filter(c => c.status === 'active').length;
  const expiringMembers = members.filter(c => c.status === 'expiring').length;
  const leftMembers = members.filter(c => c.status === 'left' || c.status === 'cancelled' || c.status === 'paused').length;

  const monthlyRevenue = members
    .filter(c => c.status === 'active' && c.plan_id)
    .reduce((sum, member) => {
      const plan = plans.find(p => p.id === member.plan_id);
      if (!plan) return sum;
      const monthlyPrice = (plan.price / plan.duration_days) * 30;
      return sum + monthlyPrice;
    }, 0);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 opacity-0 animate-fade-up">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-medium mb-1">Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {}
      {pendingMembers > 0 && (
        <div className="rounded-xl border-2 border-info/30 bg-info/5 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm sm:text-base">New Member Requests</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {pendingMembers} member{pendingMembers > 1 ? 's' : ''} waiting for approval
            </p>
          </div>
          <Button variant="outline" className="border-info/30 text-info hover:bg-info/10 w-full sm:w-auto" asChild>
            <a href="#members">Review</a>
          </Button>
        </div>
      )}

      {}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={members.length}
          subtitle={`${activeMembers} active`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Monthly Revenue"
          value={showRevenue ? `${currencySymbol}${Math.round(monthlyRevenue).toLocaleString('en-IN')}` : '••••••'}
          subtitle={showRevenue ? "Estimated" : "Click to show"}
          icon={IndianRupee}
          variant="success"
          onClick={() => setShowRevenue(!showRevenue)}
        />
        <StatCard
          title="Check-ins Today"
          value={todayCheckIns.length}
          subtitle="Members visited"
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Active Plans"
          value={plans.filter(p => p.is_active).length}
          subtitle="Available"
          icon={CreditCard}
        />
      </div>

      {}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
        {pendingMembers > 0 && (
          <div className="rounded-xl border bg-info/5 border-info/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-display font-semibold">{pendingMembers}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </div>
        )}

        <div className="rounded-xl border bg-warning/5 border-warning/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold">{expiringMembers}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Within next 7 days</p>
        </div>

        <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold">{leftMembers}</p>
              <p className="text-sm text-muted-foreground">Left / Inactive</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Did not renew</p>
        </div>

        <div className="rounded-xl border bg-success/5 border-success/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold">0</p>
              <p className="text-sm text-muted-foreground">Renewals Today</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This week: 0</p>
        </div>
      </div>

      {}
      {todayCheckIns.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-display text-lg font-medium mb-4">Today's Check-ins</h3>
          <div className="space-y-2">
            {todayCheckIns.slice(0, 5).map((checkIn) => {
              const member = members.find(m => m.id === checkIn.member_id);
              return (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member?.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="font-medium">{member?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(checkIn.check_in_time), 'hh:mm a')}
                    {checkIn.check_out_time && (
                      <span> → {format(new Date(checkIn.check_out_time), 'hh:mm a')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {members.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-medium mb-2">No members yet</h3>
          <p className="text-muted-foreground">Start by adding your first member or creating membership plans.</p>
        </div>
      )}
    </div>
  );
}

