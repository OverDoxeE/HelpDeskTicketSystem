// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "hd_auth";

function readStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { isAuthenticated: false, user: null };
  try {
    const saved = JSON.parse(raw);
    return {
      isAuthenticated: !!saved?.isAuthenticated,
      user: saved?.user ?? null,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { isAuthenticated: false, user: null };
  }
}

export function AuthProvider({ children }) {
  const initial = readStorage();
  const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated);
  const [user, setUser] = useState(initial.user);

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 200));

    const loggedUser = { email };
    setIsAuthenticated(true);
    setUser(loggedUser);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isAuthenticated: true, user: loggedUser })
    );

    return loggedUser;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
