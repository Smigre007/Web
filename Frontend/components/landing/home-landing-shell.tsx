"use client";

import type { ReactNode } from "react";
import { LandingMotionProvider, useLandingMotionGate } from "./motion/landing-motion-context";
import { SideLines } from "./side-lines";

function SideLinesGate() {
  const { gateOpen } = useLandingMotionGate();
  return <SideLines visible={gateOpen} />;
}

/**
 * Wraps the home page: motion gate for navbar / side lines after hero preloader.
 */
export function HomeLandingShell({ children }: { children: ReactNode }) {
  return (
    <LandingMotionProvider>
      {children}
      <SideLinesGate />
    </LandingMotionProvider>
  );
}
