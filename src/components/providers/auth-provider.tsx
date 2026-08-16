"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { LoginPage } from "@/components/login-page";

/* ─── Credentials (single user) ────────────────────────────────────── */
// Change these to whatever you want
const VALID_USERNAME = "aniket";
const VALID_PASSWORD = "house@2026";
const AUTH_KEY = "house-ledger-auth-v1";

interface AuthContextValue {
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function checkCredentials(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === VALID_USERNAME.toLowerCase() &&
    password === VALID_PASSWORD
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start as null (unknown) to avoid SSR mismatch
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Read auth state from localStorage after mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    setAuthed(token === "true");
  }, []);

  function login() {
    localStorage.setItem(AUTH_KEY, "true");
    setAuthed(true);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  // Still hydrating — render nothing to avoid flash
  if (authed === null) return null;

  if (!authed) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}
