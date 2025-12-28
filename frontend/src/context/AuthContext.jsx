import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../api/httpClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // bootstrap token -> axios
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // on refresh: verify token by calling /auth/me/
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me/");
        setUser(res.data?.user || null);
      } catch (e) {
        // invalid token
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setToken(null);
        setUser(null);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // run once

  const login = async (email, password) => {
    const res = await api.post("/auth/login/", { email, password });
    const t = res.data?.token;
    const u = res.data?.user;

    if (!t) throw new Error("No token returned");

    localStorage.setItem("authToken", t);
    if (u) localStorage.setItem("authUser", JSON.stringify(u));

    setToken(t);
    setUser(u || null);
    setAuthToken(t);

    return { token: t, user: u };
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      // ignore
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
