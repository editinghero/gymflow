import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { User, Phone, Mail, Save, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface CheckIn {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
}

interface CustomerProfileProps {
  businessId: string;
}

export function CustomerProfile({ businessId }: CustomerProfileProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchMember = async () => {
      if (!user) return;
      
      const { data, error } = await db
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle();

      if (data) {
        setMemberId(data.id);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        
        const { data: checkInData } = await db
          .from('check_ins')
          .select('*')
          .eq('member_id', data.id)
          .order('check_in_time', { ascending: false });
        
        if (checkInData) {
          setCheckIns(checkInData);
        }
      }
      setLoading(false);
    };

    fetchMember();
  }, [user, businessId]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);

    const { error } = await db
      .from('members')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('user_id', user?.id)
      .eq('business_id', businessId);

    setSaving(false);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved!');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-medium mb-1">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="rounded-xl bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto rounded-xl"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div>
        <h3 className="font-display text-xl font-medium mb-4">Check-in History</h3>
        {checkIns.length > 0 ? (
          <div className="space-y-2">
            {checkIns.slice(0, 20).map((checkIn) => (
              <div key={checkIn.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{format(new Date(checkIn.check_in_time), 'EEEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(checkIn.check_in_time), 'h:mm a')}
                      {checkIn.check_out_time && (
                        <> → {format(new Date(checkIn.check_out_time), 'h:mm a')}</>
                      )}
                    </p>
                  </div>
                  {checkIn.duration_minutes ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDuration(checkIn.duration_minutes)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-success">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No check-in history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

