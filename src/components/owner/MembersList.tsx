import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Search, 
  MoreHorizontal,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  Activity,
  PauseCircle,
  Ban,
  Trash2
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Member, Plan } from "@/types";
import { MemberCheckIns } from "./MemberCheckIns";

interface MembersListProps {
  businessId: string;
}

export function MembersList({ businessId }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'expiring' | 'expired' | 'left'>('all');
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [checkInsDialogOpen, setCheckInsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberForCheckIns, setSelectedMemberForCheckIns] = useState<Member | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const [membersRes, plansRes] = await Promise.all([
      db.from('members').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).then((res: any) => res),
      db.from('plans').select('*').eq('business_id', businessId).eq('is_active', true).then((res: any) => res),
    ]);

    if (membersRes.data) setMembers(membersRes.data);
    if (plansRes.data) setPlans(plansRes.data);
    setLoading(false);
  };

  const fetchCurrency = async () => {
    const { data } = await db
      .from('businesses')
      .select('currency_symbol')
      .eq('id', businessId)
      .maybeSingle();
    setCurrencySymbol((data as any)?.currency_symbol || '₹');
  };

  useEffect(() => {
    fetchData();
    fetchCurrency();
  }, [businessId]);

  const pendingCount = members.filter(m => m.status === 'pending').length;

  const filteredMembers = members.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveMember = async () => {
    if (!selectedMember || !selectedPlanId) {
      toast.error('Please select a plan');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.max(0, plan.duration_days - 1));

    const { error } = await db
      .from('members')
      .update({
        plan_id: selectedPlanId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
      })
      .eq('id', selectedMember.id);

    if (error) {
      toast.error('Failed to approve member');
      console.error(error);
    } else {
      toast.success(`${selectedMember.full_name} approved and assigned to ${plan.name}!`);
      setIsApproveDialogOpen(false);
      setSelectedMember(null);
      setSelectedPlanId("");
      fetchData();
    }
  };

  const handleRejectMember = async (member: Member) => {
    const { error } = await db
      .from('members')
      .update({ status: 'left' })
      .eq('id', member.id);

    if (error) {
      toast.error('Failed to reject member');
    } else {
      toast.success(`${member.full_name} registration rejected`);
      fetchData();
    }
  };

  const handlePauseMember = async (member: Member) => {
    const now = new Date();
    const todayDate = new Date(now);
    todayDate.setHours(0, 0, 0, 0);
    const today = todayDate.toISOString().split('T')[0];

    const end = member.end_date ? new Date(member.end_date) : null;
    if (end) end.setHours(0, 0, 0, 0);
    const remainingDays = end ? Math.max(0, differenceInDays(end, todayDate) + 1) : 0;
    const pausedEndDate = member.end_date || null;

    const { error } = await db
      .from('members')
      .update({
        status: 'paused',
        paused_end_date: pausedEndDate,
        paused_at: today,
        paused_remaining_days: remainingDays,
      })
      .eq('id', member.id);

    if (error) {
      toast.error(error.message || 'Failed to pause member');
    } else {
      toast.success(`${member.full_name}'s subscription paused`);
      fetchData();
    }
  };

  const handleCancelSubscription = async (member: Member) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await db
      .from('members')
      .update({ 
        plan_id: null,
        end_date: today,
        status: 'cancelled',
        paused_end_date: null,
      })
      .eq('id', member.id);

    if (error) {
      toast.error(error.message || 'Failed to cancel subscription');
    } else {
      toast.success(`${member.full_name}'s subscription cancelled`);
      fetchData();
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!confirm(`Are you sure you want to permanently remove ${member.full_name}? This cannot be undone.`)) {
      return;
    }

    if (member.user_id) {
      await db.from('users').delete().eq('id', member.user_id);
    }

    const { error } = await db.from('members').delete().eq('id', member.id);

    if (error) {
      toast.error(error.message || 'Failed to remove member');
    } else {
      toast.success(`${member.full_name} removed`);
      fetchData();
    }
  };

  const openApproveDialog = (member: Member) => {
    setSelectedMember(member);
    setSelectedPlanId("");
    setIsApproveDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-info/10 text-info',
    active: 'bg-success/10 text-success',
    expiring: 'bg-warning/10 text-warning',
    expired: 'bg-destructive/10 text-destructive',
    left: 'bg-muted text-muted-foreground',
    paused: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive/10 text-destructive',
  };
  const expirationDates = members
    .filter(m => m.end_date)
    .map(m => new Date(m.end_date!));

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading members...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium mb-1">Members</h2>
          <p className="text-muted-foreground">
            {members.length} total members
            {pendingCount > 0 && (
              <span className="ml-2 text-info">• {pendingCount} pending approval</span>
            )}
          </p>
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'pending', 'active', 'expiring', 'expired', 'left'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap",
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
                status === 'pending' && pendingCount > 0 && statusFilter !== status && "ring-2 ring-info/50"
              )}
            >
              {status}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-info text-info-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="space-y-3">
        {filteredMembers.map((member, i) => {
          const plan = plans.find(p => p.id === member.plan_id);
          const isPending = member.status === 'pending';
          
          return (
            <div
              key={member.id}
              className={cn(
                "rounded-xl border bg-card p-4 transition-all hover:shadow-medium opacity-0 animate-fade-up",
                `stagger-${(i % 5) + 1}`,
                isPending && "border-info/30 bg-info/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  isPending ? "bg-info/10" : "bg-primary/10"
                )}>
                  <span className={cn(
                    "font-display text-lg font-semibold",
                    isPending ? "text-info" : "text-primary"
                  )}>
                    {member.full_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{member.full_name}</h3>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      statusColors[member.status] || statusColors.active
                    )}>
                      {member.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </span>
                    {member.phone && (
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </span>
                    )}
                  </div>
                </div>
                
                {isPending ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openApproveDialog(member)}
                      className="rounded-lg text-success border-success/30 hover:bg-success/10"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectMember(member)}
                      className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-right hidden md:block">
                      {plan && (
                        <>
                          <p className="text-sm font-medium">{plan.name}</p>
                          {member.status === 'paused' ? (
                            <p className="text-xs text-muted-foreground">
                              Frozen: {typeof (member as any).paused_remaining_days === 'number' ? (member as any).paused_remaining_days : 0} days
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Expires: {member.end_date ? format(new Date(member.end_date), 'MMM d, yyyy') : 'N/A'}
                            </p>
                          )}
                        </>
                      )}
                      {!plan && member.status === 'active' && (
                        <p className="text-sm text-muted-foreground">No plan assigned</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openApproveDialog(member)}>
                          Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedMemberForCheckIns(member);
                          setCheckInsDialogOpen(true);
                        }}>
                          <Activity className="w-4 h-4 mr-2" />
                          View Check-ins
                        </DropdownMenuItem>
                        {member.status === 'active' && (
                          <DropdownMenuItem onClick={() => handlePauseMember(member)}>
                            <PauseCircle className="w-4 h-4 mr-2" />
                            Pause Subscription
                          </DropdownMenuItem>
                        )}
                        {member.status === 'paused' && (
                          <DropdownMenuItem onClick={() => {
                            (async () => {
                              const remaining = (member as any).paused_remaining_days;
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const restoredEndDate =
                                typeof remaining === 'number'
                                  ? addDays(today, Math.max(0, remaining - 1)).toISOString().split('T')[0]
                                  : ((member as any).paused_end_date || member.end_date || null);
                              const { error } = await db.from('members').update({ 
                                status: 'active',
                                end_date: restoredEndDate,
                                paused_end_date: null,
                                paused_at: null,
                                paused_remaining_days: null,
                              }).eq('id', member.id);
                              if (error) {
                                toast.error('Failed to resume subscription');
                                return;
                              }
                              toast.success(`${member.full_name}'s subscription resumed`);
                              fetchData();
                            })();
                          }}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resume Subscription
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleCancelSubscription(member)}>
                          <Ban className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemoveMember(member)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No members found
          </div>
        )}
      </div>

      {}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedMember?.status === 'pending' ? 'Approve Member' : 'Change Plan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMember && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="font-medium">{selectedMember.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                {selectedMember.phone && (
                  <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Select Plan *</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a membership plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {currencySymbol}{plan.price.toLocaleString('en-IN')} ({plan.duration_days} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleApproveMember} 
              disabled={!selectedPlanId}
              className="w-full rounded-xl"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {selectedMember?.status === 'pending' ? 'Approve & Assign Plan' : 'Update Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedMemberForCheckIns && (
        <MemberCheckIns
          member={selectedMemberForCheckIns}
          businessId={businessId}
          open={checkInsDialogOpen}
          onOpenChange={setCheckInsDialogOpen}
        />
      )}
    </div>
  );
}

