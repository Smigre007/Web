import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentação Operacional",
  description: "Guia rápido de operação comercial e técnica do NeuroCode AI para agências.",
};

export default function OperacaoPage() {
  return (
    <main className="min-h-screen bg-surface text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">NeuroCode AI</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentação Operacional Curta</h1>
        <p className="text-white/60 mb-10">
          Guia objetivo para vender e operar o produto no modelo “agência que entrega MVP para cliente”.
        </p>

        <section className="space-y-6">
          <article className="rounded-xl border border-white/10 p-6 bg-white/[0.03]">
            <h2 className="text-2xl font-semibold mb-3">1) Posicionamento comercial</h2>
            <ul className="list-disc ml-6 space-y-2 text-white/70">
              <li>Nicho recomendado: agências digitais e freelancers de produto.</li>
              <li>Oferta principal: MVP funcional em até 7 dias úteis.</li>
              <li>Entrega padrão: landing + dashboard básico + autenticação + deploy.</li>
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 p-6 bg-white/[0.03]">
            <h2 className="text-2xl font-semibold mb-3">2) Onboarding de cliente</h2>
            <ol className="list-decimal ml-6 space-y-2 text-white/70">
              <li>Briefing (objetivo, público, referência visual, stack preferida).</li>
              <li>Validação de escopo (o que entra e o que fica para fase 2).</li>
              <li>Geração inicial no NeuroCode + revisão com o cliente.</li>
              <li>Ajustes finais + entrega técnica.</li>
            </ol>
          </article>

          <article className="rounded-xl border border-white/10 p-6 bg-white/[0.03]">
            <h2 className="text-2xl font-semibold mb-3">3) Métricas para proposta</h2>
            <ul className="list-disc ml-6 space-y-2 text-white/70">
              <li>Projetos gerados (prova de uso).</li>
              <li>Usuários ativos (prova de adoção).</li>
              <li>Tipos de software suportados (prova de amplitude de entrega).</li>
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 p-6 bg-white/[0.03]">
            <h2 className="text-2xl font-semibold mb-3">4) Política de suporte incluído</h2>
            <p className="text-white/70">
              Toda venda inclui <strong>30 dias de suporte pós-entrega</strong> para correções de
              onboarding, ajustes de copy, pequenas melhorias visuais e orientação de operação.
            </p>
          </article>
        </section>

        <div className="mt-10">
          <Link href="/" className="text-white/70 hover:text-white underline underline-offset-4">
            Voltar para a home
          </Link>
        </div>
      </div>
    </main>
  );
}
