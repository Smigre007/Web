import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/navbar";
import Link from "next/link";
import { AboutContent } from "@/components/pages/about-content";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Conheça a missão da NeuroCode AI: democratizar o desenvolvimento de software com inteligência artificial para que qualquer pessoa possa criar produtos digitais incríveis.",
  openGraph: {
    title: "Sobre o NeuroCode AI",
    description: "Nossa missão é tornar o desenvolvimento de software acessível a todos.",
    url: "/about",
  },
};

export default async function AboutPage() {
  let userCount = 0;
  let projectCount = 0;
  try {
    const db = getSupabaseAdmin();
    const [u, p] = await Promise.all([
      db.from("users").select("id", { count: "exact", head: true }),
      db.from("projects").select("id", { count: "exact", head: true }),
    ]);
    userCount = u.count ?? 0;
    projectCount = p.count ?? 0;
  } catch {}

  return (
    <div className="min-h-screen">
      <Navbar />

      <AboutContent userCount={userCount} projectCount={projectCount} />

      <footer className="border-t border-ink-15 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-ink-35">
          <span>© {new Date().getFullYear()} NeuroCode AI. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink-60 transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-ink-60 transition-colors">Termos</Link>
            <Link href="/contact" className="hover:text-ink-60 transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
