"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setWidth(height ? (winScroll / height) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[2px] bg-gold z-[9999] pointer-events-none transition-[width] duration-100 ease-linear shadow-[0_0_14px_rgba(201,150,64,0.45)]"
      style={{ width: `${width}%` }}
      aria-hidden
    />
  );
}
