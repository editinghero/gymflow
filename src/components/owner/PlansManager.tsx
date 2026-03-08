import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit2, 
  Trash2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Plan } from "@/types";

interface PlansManagerProps {
  businessId: string;
}

const DURATION_OPTIONS = [
  { value: '7', label: 'Weekly (7 days)' },
  { value: '30', label: 'Monthly (30 days)' },
  { value: '90', label: 'Quarterly (90 days)' },
  { value: '180', label: 'Half Yearly (180 days)' },
  { value: '365', label: 'Annually (365 days)' },
];

export function PlansManager({ businessId }: PlansManagerProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '30',
    features: '',
  });

  const fetchPlans = async () => {
    const { data, error }: any = await db
      .from('plans')
      .select('*')
      .eq('business_id', businessId)
      .then((res: any) => res);

    if (data) setPlans(data);
    if (error) console.error(error);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, [businessId]);

  const handleSave = async () => {
    if (!newPlan.name || !newPlan.price) {
      toast.error('Please fill in required fields');
      return;
    }

    const planData = {
      business_id: businessId,
      name: newPlan.name,
      description: newPlan.description || null,
      price: parseInt(newPlan.price),
      duration_days: parseInt(newPlan.duration_days),
      features: newPlan.features.split('\n').filter(f => f.trim()),
      is_active: true,
    };

    if (editingPlan) {
      try {
        await db
          .from('plans')
          .update(planData)
          .eq('id', editingPlan.id);
        toast.success('Plan updated!');
        fetchPlans();
      } catch (error) {
        toast.error('Failed to update plan');
        console.error(error);
      }
    } else {
      try {
        await db.from('plans').insert(planData).then((res: any) => res);
        toast.success('Plan created!');
        fetchPlans();
      } catch (error) {
        toast.error('Failed to create plan');
        console.error(error);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setNewPlan({ name: '', description: '', price: '', duration_days: '30', features: '' });
    setEditingPlan(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      features: plan.features.join('\n'),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await db.from('plans').delete().eq('id', id).then((res: any) => res);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const getDurationLabel = (days: number) => {
    if (days <= 7) return '/week';
    if (days <= 30) return '/month';
    if (days <= 90) return '/quarter';
    if (days <= 180) return '/6 months';
    return '/year';
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading plans...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium mb-1">Membership Plans</h2>
          <p className="text-muted-foreground">{plans.length} plans available</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Premium Monthly"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Full access to all facilities..."
                  className="rounded-xl resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                    placeholder="1999"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select 
                    value={newPlan.duration_days} 
                    onValueChange={(value) => setNewPlan({ ...newPlan, duration_days: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Full gym access&#10;Group classes&#10;Personal trainer"
                  className="rounded-xl resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={resetForm} variant="outline" className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 rounded-xl">
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className={cn(
              "rounded-2xl border bg-card p-6 transition-all hover:shadow-large opacity-0 animate-fade-up relative group",
              `stagger-${(i % 5) + 1}`,
              !plan.is_active && "opacity-60"
            )}
          >
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(plan)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>

            <div className="mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {plan.duration_days} days
              </span>
              <h3 className="font-display text-xl font-medium mt-1">{plan.name}</h3>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-display font-semibold">₹{plan.price.toLocaleString('en-IN')}</span>
              <span className="text-muted-foreground">{getDurationLabel(plan.duration_days)}</span>
            </div>

            {plan.description && (
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            )}

            <ul className="space-y-2">
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 border rounded-xl border-dashed">
            <p className="text-muted-foreground">No plans created yet. Create your first membership plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

