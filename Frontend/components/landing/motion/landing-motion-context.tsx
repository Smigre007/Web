"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LandingMotionGateValue = {
  gateOpen: boolean;
  setGateOpen: (open: boolean) => void;
};

const LandingMotionGateContext = createContext<LandingMotionGateValue | null>(null);

export function LandingMotionProvider({ children }: { children: ReactNode }) {
  const [gateOpen, setGateOpenState] = useState(false);
  const setGateOpen = useCallback((open: boolean) => {
    setGateOpenState(open);
  }, []);

  const value = useMemo(
    () => ({ gateOpen, setGateOpen }),
    [gateOpen, setGateOpen]
  );

  return (
    <LandingMotionGateContext.Provider value={value}>
      {children}
    </LandingMotionGateContext.Provider>
  );
}

/**
 * On pages without the provider, gate is always open (navbar visible).
 */
export function useLandingMotionGate(): LandingMotionGateValue {
  const ctx = useContext(LandingMotionGateContext);
  if (!ctx) {
    return {
      gateOpen: true,
      setGateOpen: () => {},
    };
  }
  return ctx;
}
