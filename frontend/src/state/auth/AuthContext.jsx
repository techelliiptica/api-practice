import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usersApi } from "../../utils/apiClient";

const AuthContext = createContext(null);

const TOKEN_KEY = "um_token";
const USER_KEY = "um_user";

function readStored() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const stored = readStored();
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    // Small bootstrap delay makes UI testing more realistic (skeletons / loading states).
    const t = setTimeout(() => setIsBootstrapping(false), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const isAuthenticated = Boolean(token);

  const value = useMemo(() => {
    return {
      token,
      user,
      isAuthenticated,
      isBootstrapping,
      async login({ email, password }) {
        const res = await usersApi.post("/auth/login", { email, password });
        setToken(res.data.data.token);
        setUser(res.data.data.user);
        return res.data.data;
      },
      async logout() {
        try {
          await usersApi.post("/auth/logout");
        } catch {
          // Ignored on purpose (logout should always succeed for user experience).
        } finally {
          setToken(null);
          setUser(null);
        }
      }
    };
  }, [token, user, isAuthenticated, isBootstrapping]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

