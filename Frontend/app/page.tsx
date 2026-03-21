import type { Metadata } from "next";
import { LandingWrapper } from "@/components/landing/landing-wrapper";
import { HomeLandingShell } from "@/components/landing/home-landing-shell";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { AgencyPack } from "@/components/landing/agency-pack";
import { CaseROI } from "@/components/landing/case-roi";
import { SalesObjections } from "@/components/landing/sales-objections";
import { getPublicAppUrl } from "@/lib/env";

const APP_URL = getPublicAppUrl();

export const metadata: Metadata = {
  title: "NeuroCode AI — Plataforma para agências criarem MVPs com IA",
  description:
    "Nicho claro para agências: gere MVPs completos para clientes com onboarding pronto, demo funcional, métricas reais e documentação operacional.",
  keywords: [
    "IA para programação",
    "gerador de código IA",
    "criar site com IA",
    "criar software sem programar",
    "mvp para agências",
    "plataforma para agência digital",
    "NeuroCode AI",
    "NeuroCode Engine",
    "landing page IA",
    "SaaS IA",
  ],
  openGraph: {
    title: "NeuroCode AI — Plataforma para agências criarem MVPs com IA",
    description:
      "Gere MVPs para clientes com IA: onboarding, demo e operação prontos para venda.",
    url: APP_URL,
    siteName: "NeuroCode AI",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroCode AI — Plataforma de MVP para agências",
    description: "Gere MVPs para clientes com IA, onboarding e operação prontos.",
  },
  alternates: {
    canonical: APP_URL,
  },
};
import { LogoTicker } from "@/components/landing/logo-ticker";
import { Features } from "@/components/landing/features";
import { HorizontalScroll } from "@/components/landing/horizontal-scroll";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Demo } from "@/components/landing/demo";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { SectionNav } from "@/components/landing/section-nav";
import { BackToTop } from "@/components/landing/back-to-top";
import { ValueMorph } from "@/components/landing/value-morph";
import { ManifestoStrip } from "@/components/landing/manifesto-strip";
import { HomeFooter } from "@/components/landing/home-footer";

export default function Home() {
  return (
    <LandingWrapper>
      <HomeLandingShell>
      <Navbar />
      <SectionNav />
      <BackToTop />
      <Hero />
      <AgencyPack />
      <CaseROI />
      <ValueMorph />
      <HorizontalScroll />
      <LogoTicker />
      <ManifestoStrip />
      <Features />
      <HowItWorks />
      <Demo />
      <Testimonials />
      <Pricing />
      <SalesObjections />
      <FAQ />
      <CTA />

      <HomeFooter />
      </HomeLandingShell>
    </LandingWrapper>
  );
}
