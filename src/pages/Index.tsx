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

  useEffect(() => {
    if (currentRole) return;
    const savedRole = localStorage.getItem('selected_role') as UserRole | null;
    if (savedRole === 'owner' || savedRole === 'customer') {
      setCurrentRole(savedRole);
    }
  }, [currentRole]);

  useEffect(() => {
    const checkRole = async () => {
      if (!user?.id) {
        setUserRole(null);
        setCurrentRole((prev) => prev ?? ((localStorage.getItem('selected_role') as UserRole | null) || null));
        checkedUserId.current = null;
        return;
      }

      if (checkedUserId.current === user.id) {
        return;
      }

      checkedUserId.current = user.id;
      setIsCheckingRole(true);

      try {
        const { data, error } = await db
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .then((res: any) => res);

        if (error) {
          console.error('Role check error:', error);
          const fallback = (localStorage.getItem('selected_role') as UserRole | null);
          if (fallback === 'owner' || fallback === 'customer') {
            setUserRole(fallback);
            setCurrentRole(fallback);
          }
          return;
        }

        if (data && data.length > 0) {
          const roles = data.map((r: any) => r.role);
          const role = roles.includes('owner') ? 'owner' : roles[0];
          
          setUserRole(role);
          setCurrentRole(role);
          localStorage.setItem('selected_role', role);
        } else {
          const fallback = (localStorage.getItem('selected_role') as UserRole | null);
          if (fallback === 'owner' || fallback === 'customer') {
            setUserRole(fallback);
            setCurrentRole(fallback);
          }
        }
      } catch (error) {
        console.error('Role check error:', error);
        const fallback = (localStorage.getItem('selected_role') as UserRole | null);
        if (fallback === 'owner' || fallback === 'customer') {
          setUserRole(fallback);
          setCurrentRole(fallback);
        }
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
  
  if (!user) {
    if (!currentRole) {
      return <RoleSelector onSelectRole={setCurrentRole} />;
    }
    if (currentRole === 'owner') {
      return <OwnerAuth onBack={() => {
        localStorage.removeItem('selected_role');
        setCurrentRole(null);
      }} />;
    }
    if (currentRole === 'customer') {
      return <CustomerAuth onBack={() => {
        localStorage.removeItem('selected_role');
        setCurrentRole(null);
      }} />;
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
