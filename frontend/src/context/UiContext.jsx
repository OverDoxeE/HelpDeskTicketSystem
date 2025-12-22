import React, { createContext, useContext, useRef, useState, useCallback } from "react";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [flash, setFlash] = useState(null); // { type: "success"|"error"|"info", text: string }
  const timerRef = useRef(null);

  const clearFlash = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFlash(null);
  }, []);

  const showFlash = useCallback((type, text, timeoutMs = 2500) => {
    clearFlash();
    setFlash({ type, text });

    timerRef.current = setTimeout(() => {
      setFlash(null);
      timerRef.current = null;
    }, timeoutMs);
  }, [clearFlash]);

  return (
    <UiContext.Provider value={{ flash, showFlash, clearFlash }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}
