"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserSession, UserRole, Permission, hasPermission as checkPermission } from "./session";

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
  login: (role: UserRole, customName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current session on load
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSession(json.data);
        } else {
          setSession(null);
        }
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (role: UserRole, customName?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, customName }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
        return { success: true };
      }
      return { success: false, error: json.error || "Gagal masuk sistem" };
    } catch (err: any) {
      return { success: false, error: err.message || "Koneksi terganggu" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setSession(null);
      window.location.href = "/";
    }
  };

  const hasPerm = useCallback(
    (perm: Permission) => {
      return checkPermission(session, perm);
    },
    [session]
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        hasPermission: hasPerm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
