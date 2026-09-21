"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Customer, CustomerSession } from "@/lib/types";

type AuthContextValue = {
  customer: Customer | null;
  token: string | null;
  ready: boolean;
  setSession: (session: CustomerSession) => void;
  refreshSession: () => Promise<CustomerSession | null>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<CustomerSession | null>(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const nextSession = await api.refreshCustomer();
      setSessionState(nextSession);
      return nextSession;
    } catch {
      setSessionState(null);
      return null;
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.removeItem("zd-crown-customer-session");
    refreshSession().finally(() => setReady(true));
  }, [refreshSession]);

  useEffect(() => {
    if (!session) return;
    const interval = window.setInterval(() => void refreshSession(), 12 * 60 * 1000);
    const onFocus = () => void refreshSession();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshSession, session]);

  const value = useMemo<AuthContextValue>(() => ({
    customer: session?.customer ?? null,
    token: session?.accessToken ?? null,
    ready,
    setSession: setSessionState,
    refreshSession,
    signOut() {
      setSessionState(null);
      void api.logoutCustomer().catch(() => undefined);
    }
  }), [ready, refreshSession, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
