import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Plan, Business } from "@/types";

interface PlanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  business: Business;
  memberId: string;
  requestType: 'new' | 'change' | 'renew';
}

export function PlanPaymentDialog({
  open,
  onOpenChange,
  plan,
  business,
  memberId,
  requestType,
}: PlanPaymentDialogProps) {
  const [customerUpiId, setCustomerUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUpiId = async () => {
    if (!business.upi_id) return;
    await navigator.clipboard.writeText(business.upi_id);
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaid = async () => {
    if (!customerUpiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }

    setLoading(true);

    const { error } = await db.from('payment_requests').insert({
      member_id: memberId,
      business_id: business.id,
      plan_id: plan.id,
      request_type: requestType,
      customer_upi_id: customerUpiId.trim(),
      amount: plan.price,
      status: 'pending',
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit payment request');
    } else {
      toast.success('Payment request submitted! Owner will verify and approve.');
      setCustomerUpiId("");
      onOpenChange(false);
    }
  };

  const handleVisitReception = () => {
    onOpenChange(false);
    toast.info('Please visit the gym reception');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {requestType === 'renew' ? 'Renew Plan' : requestType === 'change' ? 'Change Plan' : 'Subscribe to Plan'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-xl border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
            <p className="font-display text-lg font-medium">{plan.name}</p>
            <p className="text-2xl font-display font-semibold mt-2">₹{plan.price.toLocaleString('en-IN')}</p>
          </div>

          {business.upi_id ? (
            <>
              <div className="space-y-2">
                <Label>Gym UPI ID</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-background">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{business.upi_id}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyUpiId}
                    className="rounded-xl"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pay ₹{plan.price.toLocaleString('en-IN')} to this UPI ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerUpi">Your UPI ID (for verification)</Label>
                <Input
                  id="customerUpi"
                  value={customerUpiId}
                  onChange={(e) => setCustomerUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the UPI ID you used to make the payment
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePaid}
                  disabled={loading}
                  className="flex-1 rounded-xl"
                >
                  {loading ? 'Submitting...' : 'I Have Paid'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleVisitReception}
                  className="flex-1 rounded-xl"
                >
                  Visit Reception
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                UPI payment not available. Please visit the gym reception to subscribe.
              </p>
              <Button onClick={handleVisitReception} className="rounded-xl">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
