import { useState } from "react";
import { LogOut, HourglassIcon, MapPin, Phone, Globe, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Business, Member } from "@/types";

interface PendingApprovalProps {
  member: Member;
  business: Business | null;
  onRefresh: () => void;
}

export function PendingApproval({ member, business, onRefresh }: PendingApprovalProps) {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('customer_business_id');
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <HourglassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-medium">{member.full_name}</h1>
              <p className="text-xs text-muted-foreground">{business?.name || 'Gym'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 sm:space-y-6 opacity-0 animate-fade-up">
          {}
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 bg-warning/5 border-warning/30 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <HourglassIcon className="w-8 h-8 sm:w-10 sm:h-10 text-warning animate-pulse" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-medium mb-2 sm:mb-3">
              Waiting for Approval
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Your registration has been submitted successfully. The gym owner will review and approve your membership soon.
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1 mb-4">
              <p>Please visit the gym reception to:</p>
              <ul className="list-disc list-inside text-left space-y-1 mt-2">
                <li>Complete your registration</li>
                <li>Select your membership plan</li>
                <li>Make payment at reception</li>
              </ul>
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Checking...' : 'Check Approval Status'}
            </Button>
          </div>

          {}
          {business && (
            <div className="rounded-xl sm:rounded-2xl border bg-card p-4 sm:p-5 space-y-2 sm:space-y-3">
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
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout and Try Later
          </Button>
        </div>
      </main>
    </div>
  );
}
