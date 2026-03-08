import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { db, User, Session } from '@/lib/db';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { token, user } = await db.auth.getSession();
      if (token && user) {
        setSession({ token, user });
        setUser(user);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    try {
      const data: any = await db.auth.signUp(email, password, fullName);
      if (data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setSession({ token: data.data.token, user: data.data.user });
        return { data: data.data, error: null };
      }
      return { data: null, error: data.error };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    try {
      const data: any = await db.auth.signIn(email, password);
      if (data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setSession({ token: data.data.token, user: data.data.user });
        return { data: data.data, error: null };
      }
      return { data: null, error: data.error };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    await db.auth.signOut();
    localStorage.removeItem('selected_role');
    localStorage.removeItem('customer_business_id');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_role_')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    setSession(null);
    return { error: null };
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    };
  }, [user, session, loading]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
