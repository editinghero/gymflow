import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { User, Mail, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function OwnerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data }: any = await db
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .then((res: any) => res);

        if (data && data.length > 0) {
          setFullName(data[0].full_name || "");
          setEmail(data[0].email || "");
        } else {
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setEmail(user.email || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);

    try {
      await db
        .from('profiles')
        .update({
          full_name: fullName.trim(),
        })
        .eq('id', user?.id);

      toast.success('Profile saved!');
    } catch (error) {
      toast.error('Failed to save profile');
      console.error(error);
    }

    setSaving(false);
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
    </div>
  );
}
