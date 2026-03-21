"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only render on fine-pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Show cursors
    dot.style.display = "block";
    ring.style.display = "block";

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.18);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.18);
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.09);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.09);

      if (dot) {
        dot.style.transform = `translate(${dotPos.current.x - 3.5}px, ${dotPos.current.y - 3.5}px)`;
      }
      if (ring) {
        ring.style.transform = `translate(${ringPos.current.x - 15}px, ${ringPos.current.y - 15}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onEnterHoverable = () => document.body.classList.add("cursor-hov");
    const onLeaveHoverable = () => document.body.classList.remove("cursor-hov");

    const addHoverListeners = () => {
      document.querySelectorAll("[data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", onEnterHoverable);
        el.addEventListener("mouseleave", onLeaveHoverable);
      });
    };

    document.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);
    addHoverListeners();

    // Re-add listeners when DOM changes (lazy-loaded content)
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      document.body.classList.remove("cursor-hov");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{ display: "none", top: 0, left: 0 }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{ display: "none", top: 0, left: 0 }}
        aria-hidden="true"
      />
    </>
  );
}
