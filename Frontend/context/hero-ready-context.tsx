"use client";

import { createContext, useContext } from "react";

export const HeroReadyContext = createContext(false);

export function useHeroReady() {
  return useContext(HeroReadyContext);
}
