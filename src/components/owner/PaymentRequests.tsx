import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Check, X, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { db } from "@/lib/db";

interface PaymentRequest {
  id: string;
  member_id: string;
  business_id: string;
  plan_id: string;
  request_type: 'new' | 'change' | 'renew';
  customer_upi_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Member {
  id: string;
  full_name: string;
  email: string;
  plan_id: string | null;
  end_date: string | null;
}

interface Plan {
  id: string;
  name: string;
  duration_days: number;
}

interface PaymentRequestsProps {
  businessId: string;
}

export function PaymentRequests({ businessId }: PaymentRequestsProps) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    const [requestsRes, membersRes, plansRes] = await Promise.all([
      db.from('payment_requests').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
      db.from('members').select('id, full_name, email, plan_id, end_date').eq('business_id', businessId),
      db.from('plans').select('id, name, duration_days').eq('business_id', businessId),
    ]);

    if (requestsRes.data) setRequests(requestsRes.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (plansRes.data) setPlans(plansRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const handleApprove = async (request: PaymentRequest) => {
    setProcessingId(request.id);

    const member = members.find(m => m.id === request.member_id);
    const plan = plans.find(p => p.id === request.plan_id);

    if (!member || !plan) {
      toast.error('Member or plan not found');
      setProcessingId(null);
      return;
    }

    let newEndDate: string;
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];

    if (request.request_type === 'renew' && member.end_date) {
      const currentEndDate = new Date(member.end_date);
      if (currentEndDate > today) {
        newEndDate = addDays(currentEndDate, plan.duration_days).toISOString().split('T')[0];
      } else {
        newEndDate = addDays(today, plan.duration_days).toISOString().split('T')[0];
      }
    } else {
      newEndDate = addDays(today, plan.duration_days).toISOString().split('T')[0];
    }

    const memberUpdate: any = {
      plan_id: request.plan_id,
      end_date: newEndDate,
      status: 'active',
    };

    if (request.request_type !== 'renew') {
      memberUpdate.start_date = startDate;
    }

    const { error: updateError } = await db.from('members').update(memberUpdate).eq('id', request.member_id);

    if (updateError) {
      toast.error(updateError.message || 'Failed to update member');
      setProcessingId(null);
      return;
    }

    const { error: requestError } = await db.from('payment_requests').update({
      status: 'approved',
      processed_at: new Date().toISOString(),
    }).eq('id', request.id);

    setProcessingId(null);

    if (requestError) {
      toast.error(requestError.message || 'Failed to update request status');
    } else {
      toast.success('Payment approved and plan updated!');
      fetchData();
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);

    const { error } = await db.from('payment_requests').update({
      status: 'rejected',
      processed_at: new Date().toISOString(),
    }).eq('id', requestId);

    setProcessingId(null);

    if (error) {
      toast.error('Failed to reject request');
    } else {
      toast.success('Payment request rejected');
      fetchData();
    }
  };

  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.full_name || 'Unknown';
  };

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Unknown';
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading payment requests...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-medium mb-1">Payment Requests</h2>
        <p className="text-muted-foreground">Review and approve member payment requests</p>
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Pending Requests ({pendingRequests.length})</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{getMemberName(request.member_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.request_type === 'renew' ? 'Renew' : request.request_type === 'change' ? 'Change to' : 'Subscribe to'} {getPlanName(request.plan_id)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold">₹{request.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(request.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{request.customer_upi_id}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request)}
                    disabled={processingId === request.id}
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {processingId === request.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length === 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
          <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No pending payment requests</p>
        </div>
      )}

      {processedRequests.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Recent History</h3>
          <div className="space-y-2">
            {processedRequests.slice(0, 10).map((request) => (
              <div key={request.id} className="rounded-lg border bg-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{getMemberName(request.member_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {getPlanName(request.plan_id)} • ₹{request.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.status === 'approved' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(request.created_at), 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
