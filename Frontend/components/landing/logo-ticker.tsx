"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

// Tech stacks / tools that can be generated with NeuroCode
const LOGOS = [
  { name: "Next.js", icon: "▲" },
  { name: "React", icon: "⚛" },
  { name: "TypeScript", icon: "TS" },
  { name: "TailwindCSS", icon: "🎨" },
  { name: "Supabase", icon: "⚡" },
  { name: "Stripe", icon: "💳" },
  { name: "Node.js", icon: "🟢" },
  { name: "Python", icon: "🐍" },
  { name: "React Native", icon: "📱" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "GraphQL", icon: "◈" },
  { name: "Docker", icon: "🐳" },
  { name: "Prisma", icon: "◆" },
  { name: "Firebase", icon: "🔥" },
  { name: "MongoDB", icon: "🍃" },
  { name: "Redis", icon: "🔴" },
];

// Duplicate for seamless loop
const TRACK = [...LOGOS, ...LOGOS];

function LogoItem({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl border border-ink-15 bg-cream mx-2 flex-shrink-0 hover:border-gold/40 hover:bg-gold/10 transition-all duration-300 group cursor-default">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-sm font-semibold text-ink-60 group-hover:text-ink transition-colors duration-300 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function LogoTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });
  const reduced = useLandingReducedMotion();

  return (
    <motion.section
      ref={ref}
      className="py-16 relative overflow-hidden bg-cream"
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-10% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-cream to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-cream to-transparent" />

      <div className="text-center mb-8 px-4">
        <p className="text-[10px] text-ink-60 font-mono tracking-[0.3em] uppercase">
          Gera código em qualquer tecnologia
        </p>
      </div>

      {/* Row 1 — left to right */}
      <div className="overflow-hidden mb-3">
        <motion.div
          className="flex"
          animate={inView ? { x: ["0%", "-50%"] } : {}}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
          {TRACK.map((logo, i) => (
            <LogoItem key={`a-${i}`} {...logo} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — right to left */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={inView ? { x: ["-50%", "0%"] } : {}}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        >
          {TRACK.map((logo, i) => (
            <LogoItem key={`b-${i}`} {...logo} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
