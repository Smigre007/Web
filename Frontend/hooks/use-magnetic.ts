"use client";

import { useRef, useCallback } from "react";

interface UseMagneticOptions {
  /** Max pixel displacement toward cursor. Default: 10 */
  strength?: number;
  /** Element to apply the transform to. If not provided, uses the same ref as the trigger. */
}

interface UseMagneticResult {
  ref: React.RefObject<HTMLElement | null>;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
}

/**
 * Magnetic button effect: element gently pulls toward the cursor on hover.
 * On mouse-leave, springs back with CSS transition.
 */
export function useMagnetic({ strength = 10 }: UseMagneticOptions = {}): UseMagneticResult {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      el.style.transition = "transform 0.1s linear";
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
