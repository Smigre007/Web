import type { Metadata } from "next";
import { Pricing } from "@/components/landing/pricing";
import Link from "next/link";
import { FAQ } from "@/components/landing/faq";
import { Navbar } from "@/components/landing/navbar";
import { PricingHero } from "@/components/landing/pricing-hero";

export const metadata: Metadata = {
  title: "Planos e Preços",
  description:
    "Escolha o plano ideal para você. Comece gratuitamente com 3 projetos por mês ou faça upgrade para criar mais com a IA mais avançada do mercado.",
  openGraph: {
    title: "Planos e Preços — NeuroCode AI",
    description: "Plano Free, Starter e Pro. Comece grátis, faça upgrade quando precisar.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <PricingHero />

      {/* Pricing component */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className="border-t border-ink-15 px-6 py-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-ink-35">
          <span>© {new Date().getFullYear()} NeuroCode AI. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink-60 transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-ink-60 transition-colors">Termos</Link>
            <Link href="/contact" className="hover:text-ink-60 transition-colors">Contato Enterprise</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
