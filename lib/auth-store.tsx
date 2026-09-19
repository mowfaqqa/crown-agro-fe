"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Customer, CustomerSession } from "@/lib/types";

type AuthContextValue = {
  customer: Customer | null;
  token: string | null;
  ready: boolean;
  setSession: (session: CustomerSession) => void;
  signOut: () => void;
};

const SESSION_KEY = "zd-crown-customer-session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setStoredSession] = useState<CustomerSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      setReady(true);
      return;
    }
    try {
      const stored = JSON.parse(raw) as CustomerSession;
      api.customerProfile(stored.accessToken)
        .then((customer) => setStoredSession({ ...stored, customer }))
        .catch(() => window.sessionStorage.removeItem(SESSION_KEY))
        .finally(() => setReady(true));
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
      setReady(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    customer: session?.customer ?? null,
    token: session?.accessToken ?? null,
    ready,
    setSession(nextSession) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setStoredSession(nextSession);
    },
    signOut() {
      window.sessionStorage.removeItem(SESSION_KEY);
      setStoredSession(null);
    }
  }), [ready, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
