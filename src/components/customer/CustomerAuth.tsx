import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Dumbbell, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Business } from "@/types";

interface CustomerAuthProps {
  onBack: () => void;
}

export function CustomerAuth({ onBack }: CustomerAuthProps) {
  const { signUp, signIn } = useAuth();
  const [step, setStep] = useState<'signin' | 'code' | 'register'>('signin');
  const [accessCode, setAccessCode] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: memberData } = await db
          .from('members')
          .select('business_id, status')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (memberData) {
          localStorage.setItem('customer_business_id', memberData.business_id);
          
          if (memberData.status === 'pending') {
            toast.info('Your registration is pending approval');
          } else {
            toast.success('Welcome back!');
          }
        } else {
          toast.error('No membership found. Please register with your gym code.');
          await db.auth.signOut();
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/public/businesses/by-code/${accessCode}`);
      const result = await response.json();
      
      if (!result.data) {
        toast.error('Invalid access code. Please check with your gym.');
        setIsLoading(false);
        return;
      }

      setBusiness(result.data);
      setBusinessId(result.data.id);
      toast.success(`Found ${result.data.name}!`);
      setStep('register');
    } catch (error) {
      toast.error('Failed to verify access code');
    }

    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data: existingMember } = await db
        .from('members')
        .select('id, user_id, status')
        .eq('email', email)
        .eq('business_id', businessId)
        .maybeSingle();

      if (existingMember) {
        if (existingMember.user_id) {
          toast.error('This email is already registered with this gym. Please sign in.');
          setStep('signin');
          setIsLoading(false);
          return;
        }
      }
      const { data: signUpData, error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in.');
          setStep('signin');
        } else {
          toast.error(signUpError.message);
        }
        setIsLoading(false);
        return;
      }
      const { data: signInData, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        toast.success('Account created! Please sign in to continue.');
        setStep('signin');
        setIsLoading(false);
        return;
      }

      if (signInData.user) {
        const { error: memberError } = await db.from('members').insert({
          user_id: signInData.user.id,
          business_id: businessId,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          status: 'pending',
        }).then((res: any) => res);

        if (memberError) {
          console.error('Error creating member:', memberError);
        }
        await db.from('user_roles').insert({
          user_id: signInData.user.id,
          role: 'customer',
        }).then((res: any) => res);

        localStorage.setItem('customer_business_id', businessId);
        toast.success('Registration pending! Please wait for gym owner approval.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration pending. Please sign in to check your status.');
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (step === 'signin') {
      onBack();
    } else if (step === 'code') {
      setStep('signin');
    } else {
      setStep('code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6 sm:space-y-8 opacity-0 animate-fade-up">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {}
        {step === 'signin' && (
          <>
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-info/10 flex items-center justify-center">
                <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-info" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium">Welcome back</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Sign in to your member account</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Don't have an account? Register with gym code
              </button>
            </div>
          </>
        )}

        {}
        {step === 'code' && (
          <>
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-info/10 flex items-center justify-center">
                <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-info" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium">Enter Gym Code</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Get the code from your gym's front desk</p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <Input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={accessCode[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        const newCode = accessCode.split('');
                        newCode[i] = val;
                        setAccessCode(newCode.join(''));
                        if (val && i < 5) {
                          const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                          next?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !accessCode[i] && i > 0) {
                        const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                        prev?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-2xl font-display rounded-xl"
                  />
                ))}
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={accessCode.length !== 6 || isLoading}
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('signin')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        )}

        {}
        {step === 'register' && (
          <>
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-info/10 flex items-center justify-center">
                <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-info" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium">
                Join {business?.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter your details to register. The gym owner will configure your membership.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regEmail">Email *</Label>
                <Input
                  id="regEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regPassword">Password *</Label>
                <Input
                  id="regPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : 'Submit Registration'}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('signin')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>

            {}
            {business && (
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium">{business.name}</p>
                {business.location && (
                  <p className="text-xs text-muted-foreground">📍 {business.location}</p>
                )}
                {business.contact_phone && (
                  <p className="text-xs text-muted-foreground">📞 {business.contact_phone}</p>
                )}
                {business.upi_id && (
                  <p className="text-xs text-muted-foreground">💳 UPI: {business.upi_id}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

