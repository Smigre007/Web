"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain } from "lucide-react";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

const LINKS = [
  { href: "/privacy", label: "Privacidade" },
  { href: "/terms", label: "Termos" },
  { href: "/docs/operacao", label: "Operação" },
  { href: "/proposta", label: "Proposta" },
  { href: "/contact", label: "Contato" },
] as const;

export function HomeFooter() {
  const reduced = useLandingReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-15 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          className="flex items-center gap-2.5"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-5% 0px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-8 h-8 rounded-xl bg-ink flex items-center justify-center">
            <Brain className="w-4 h-4 text-cream" />
          </div>
          <span className="font-bold text-ink">NeuroCode AI</span>
        </motion.div>

        <motion.nav
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-ink-60"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-5% 0px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduced ? 0 : 0.06,
                delayChildren: reduced ? 0 : 0.05,
              },
            },
          }}
          aria-label="Rodapé"
        >
          {LINKS.map((link) => (
            <motion.div
              key={link.href}
              variants={{
                hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <Link href={link.href} className="hover:text-ink transition-colors duration-300">
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.p
          className="text-sm text-ink-35"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          © {year} NeuroCode AI. Todos os direitos reservados.
        </motion.p>
      </div>
    </footer>
  );
}
