import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RoleSelector } from "@/components/RoleSelector";
import { OwnerAuth } from "@/components/owner/OwnerAuth";
import { OwnerDashboard } from "@/components/owner/OwnerDashboard";
import { CustomerAuth } from "@/components/customer/CustomerAuth";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";
import { UserRole } from "@/types";
import { db } from "@/lib/db";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const checkedUserId = useRef<string | null>(null);
  const checkAttempts = useRef<number>(0);

  const persistRole = async (role: UserRole) => {
    setCurrentRole(role);
    setUserRole(role);
    localStorage.setItem('selected_role', role);
    if (!user?.id) return;

    const res = await (db.from('user_roles').insert({ user_id: user.id, role }) as any).select();
    const { error } = res || {};
    if (error) {
      const msg = (error.message || '').toLowerCase();
      const isDuplicate = msg.includes('duplicate') || msg.includes('unique');
      if (!isDuplicate) {
        console.error('Role insert error');
      }
    }
  };

  useEffect(() => {
    const checkRole = async () => {
      if (!user?.id) {
        setUserRole(null);
        setCurrentRole(null);
        checkedUserId.current = null;
        checkAttempts.current = 0;
        return;
      }

      const savedRole = localStorage.getItem('selected_role') as UserRole | null;
      if (savedRole === 'owner' || savedRole === 'customer') {
        setCurrentRole(savedRole);
      }

      if (checkedUserId.current === user.id && checkAttempts.current >= 3) {
        if (!userRole && (savedRole === 'owner' || savedRole === 'customer')) {
          await persistRole(savedRole);
        }
        return;
      }

      if (checkedUserId.current !== user.id) {
        checkedUserId.current = user.id;
        checkAttempts.current = 0;
      }

      checkAttempts.current += 1;
      setIsCheckingRole(true);

      try {
        const { data, error } = await db
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .then((res: any) => res);

        if (error) {
          console.error('Role check error:', error);
          setIsCheckingRole(false);
          return;
        }

        if (data && data.length > 0) {
          const roles = data.map((r: any) => r.role);
          const role = roles.includes('owner') ? 'owner' : roles[0];
          
          setUserRole(role);
          setCurrentRole(role);
          localStorage.setItem('selected_role', role);
          checkAttempts.current = 3;
        } else {
          if (savedRole === 'owner' || savedRole === 'customer') {
            await persistRole(savedRole);
            checkAttempts.current = 3;
          }
        }
      } catch (error) {
        console.error('Role check error:', error);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkRole();
  }, [user?.id]);

  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && userRole) {
    if (userRole === 'owner') {
      return <OwnerDashboard />;
    }
    if (userRole === 'customer') {
      return <CustomerDashboard />;
    }
  }

  if (user && !userRole) {
    return <RoleSelector onSelectRole={persistRole} />;
  }
  
  if (!user) {
    if (!currentRole) {
      return <RoleSelector onSelectRole={setCurrentRole} />;
    }
    if (currentRole === 'owner') {
      return <OwnerAuth onBack={() => setCurrentRole(null)} />;
    }
    if (currentRole === 'customer') {
      return <CustomerAuth onBack={() => setCurrentRole(null)} />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
