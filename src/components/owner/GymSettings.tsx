import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Business } from "@/types";
import { Building2, MapPin, Globe, Phone, Wallet, Save } from "lucide-react";

interface GymSettingsProps {
  businessId: string;
}

export function GymSettings({ businessId }: GymSettingsProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data, error } = await db
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (data) {
        setBusiness(data);
        setName(data.name || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
        setContactPhone(data.contact_phone || "");
        setUpiId(data.upi_id || "");
        setCurrencySymbol((data as any).currency_symbol || "₹");
      }
      setLoading(false);
    };

    fetchBusiness();
  }, [businessId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Business name is required');
      return;
    }

    setSaving(true);

    const { error } = await db
      .from('businesses')
      .update({
        name: name.trim(),
        location: location.trim() || null,
        website: website.trim() || null,
        contact_phone: contactPhone.trim() || null,
        upi_id: upiId.trim() || null,
        currency_symbol: currencySymbol.trim() || '₹',
      })
      .eq('id', businessId);

    setSaving(false);

    if (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } else {
      toast.success('Settings saved successfully!');
    }
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-medium mb-1">Gym Settings</h2>
        <p className="text-muted-foreground">Customize your gym profile and payment details</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gymName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Gym Name *
            </Label>
            <Input
              id="gymName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="FitZone Gym"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="123 Main Street, City, State"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.yourgym.com"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Number
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upiId" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              UPI ID (for reference)
            </Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourgym@upi"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              This will be shown to customers for optional online payments. No payment integration - just for reference.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencySymbol" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Currency Symbol
            </Label>
            <Input
              id="currencySymbol"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              placeholder="₹"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Used when showing plan prices and payment amounts.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto rounded-xl"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {}
      <div className="rounded-2xl border bg-muted/30 p-5">
        <h3 className="font-medium mb-2">Access Code</h3>
        <p className="text-2xl font-display font-semibold tracking-wider">{business?.access_code}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Share this code with your customers so they can register for your gym.
        </p>
      </div>
    </div>
  );
}

