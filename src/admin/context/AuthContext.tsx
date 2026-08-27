import React, { createContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../../services/supabase";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: new Error("Supabase is not configured") }),
  signOut: async () => {},
  checkAdminStatus: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const verifyAdminRpc = async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase.rpc("is_admin");
      if (error || !data) {
        setIsAdmin(false);
        return false;
      }
      setIsAdmin(true);
      return true;
    } catch {
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await client.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await verifyAdminRpc();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await verifyAdminRpc();
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      return { error: new Error("Supabase is not configured. Please check your environment variables.") };
    }

    setIsLoading(true);
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        const adminVerified = await verifyAdminRpc();
        if (!adminVerified) {
          await client.auth.signOut();
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return { error: new Error("Access Denied: Your account does not have administrative privileges.") };
        }
      }

      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      return { error: err as Error };
    }
  };

  const signOut = async (): Promise<void> => {
    const client = supabase;
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.error("Error signing out:", err);
      }
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signIn,
        signOut,
        checkAdminStatus: verifyAdminRpc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
