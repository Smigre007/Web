import { useRef, useCallback } from "react";

interface UseTiltOptions {
  maxDeg?: number;
  perspective?: number;
}

interface UseTiltResult {
  ref: React.RefObject<HTMLDivElement | null>;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
}

export function useTilt({ maxDeg = 12, perspective = 1000 }: UseTiltOptions = {}): UseTiltResult {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotateX = -dy * maxDeg;
      const rotateY = dx * maxDeg;
      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    [maxDeg, perspective]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
  }, [perspective]);

  return { ref, onMouseMove, onMouseLeave };
}
