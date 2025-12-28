// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken, clearAuthToken } from "../api/httpClient";
import { loginRequest, logoutRequest, meRequest } from "../api/authApi";

const AuthContext = createContext(null);

const LS_TOKEN = "auth_token";
const LS_USER = "auth_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (token) {
          setAuthToken(token);

          const data = await meRequest();
          if (mounted && data?.user) {
            setUser(data.user);
            localStorage.setItem(LS_USER, JSON.stringify(data.user));
          }
        }
      } catch (e) {
        // token zły / wygasł / user usunięty
        if (mounted) {
          doLocalLogout();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          doLocalLogout();
        }
        return Promise.reject(err);
      }
    );

    return () => api.interceptors.response.eject(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLocalLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    clearAuthToken();
  };

  const login = async (email, password) => {
    const data = await loginRequest({ email, password });

    if (!data?.token || !data?.user) {
      throw new Error("Invalid login response");
    }

    setToken(data.token);
    setUser(data.user);

    localStorage.setItem(LS_TOKEN, data.token);
    localStorage.setItem(LS_USER, JSON.stringify(data.user));

    setAuthToken(data.token);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (e) {
      // ignorujemy błąd (np. token już nieważny)
    } finally {
      doLocalLogout();
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
