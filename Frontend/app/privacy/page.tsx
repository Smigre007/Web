import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade da plataforma NeuroCode AI.",
};

export default function PrivacyPage() {
  const lastUpdated = "15 de março de 2026";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 pt-28">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-3">Política de Privacidade</h1>
          <p className="text-ink-35 text-sm">Última atualização: {lastUpdated}</p>
        </div>

        <div className="prose prose-invert prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-300 max-w-none space-y-8 text-ink-60 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">1. Informações que Coletamos</h2>
            <p>
              A NeuroCode AI coleta informações necessárias para fornecer nossos serviços de geração de código com inteligência artificial. As informações coletadas incluem:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-ink">Dados de conta:</strong> Nome, endereço de e-mail e informações de perfil fornecidas ao criar sua conta via Clerk.</li>
              <li><strong className="text-ink">Dados de uso:</strong> Projetos gerados, prompts enviados, tipo de projetos e histórico de gerações.</li>
              <li><strong className="text-ink">Dados de pagamento:</strong> Informações de assinatura processadas com segurança pelo Stripe (não armazenamos dados de cartão).</li>
              <li><strong className="text-ink">Dados técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional e dados de desempenho do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">2. Como Usamos suas Informações</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Fornecer, operar e melhorar nossos serviços de geração de código;</li>
              <li>Processar pagamentos e gerenciar assinaturas;</li>
              <li>Enviar comunicações sobre sua conta, atualizações de serviço e novidades;</li>
              <li>Analisar padrões de uso para melhorar a qualidade do serviço;</li>
              <li>Cumprir obrigações legais e prevenir fraudes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">3. Seus Prompts e Projetos Gerados</h2>
            <p>
              Os prompts que você envia e os projetos gerados pela IA são armazenados em nossa infraestrutura segura (Supabase) vinculados à sua conta. Esses dados são usados para:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Manter seu histórico de projetos acessível;</li>
              <li>Melhorar a qualidade das gerações de código (de forma agregada e anonimizada);</li>
              <li>Garantir o cumprimento dos termos de uso da plataforma.</li>
            </ul>
            <p className="mt-3">
              Você pode excluir seus projetos a qualquer momento pelo painel de controle. Ao excluir sua conta, todos os seus dados são removidos permanentemente em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar dados com terceiros apenas nas seguintes circunstâncias:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-ink">Provedores de serviço:</strong> Clerk (autenticação), Supabase (banco de dados), Stripe (pagamentos), NeuroCode Engine (IA), Vercel (hospedagem).</li>
              <li><strong className="text-ink">Obrigações legais:</strong> Quando exigido por lei ou ordem judicial.</li>
              <li><strong className="text-ink">Proteção de direitos:</strong> Para proteger os direitos, propriedade ou segurança da NeuroCode AI e seus usuários.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">5. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (TLS/HTTPS), criptografia em repouso, controle de acesso por função (RLS no Supabase), monitoramento contínuo e backups regulares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">6. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Confirmar a existência de tratamento dos seus dados;</li>
              <li>Acessar seus dados pessoais;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade dos dados;</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato: <a href="mailto:privacidade@neurocode.ai" className="text-gold hover:text-gold-lt">privacidade@neurocode.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">7. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação, sessão) e cookies analíticos para entender como nossos serviços são utilizados. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pessoais enquanto sua conta estiver ativa. Após o encerramento da conta, os dados são retidos por até 30 dias antes da exclusão permanente, exceto quando a retenção for exigida por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">9. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos usuários por e-mail sobre mudanças significativas. O uso continuado do serviço após as alterações constitui aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">10. Contato</h2>
            <p>
              Para dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <div className="mt-3 p-4 rounded-xl border border-ink-15 bg-ink/[0.03]">
              <p><strong className="text-ink">NeuroCode AI</strong></p>
              <p>E-mail: <a href="mailto:privacidade@neurocode.ai" className="text-gold hover:text-gold-lt">privacidade@neurocode.ai</a></p>
              <p>Suporte: <a href="mailto:suporte@neurocode.ai" className="text-gold hover:text-gold-lt">suporte@neurocode.ai</a></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-15 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-35">
          <p>© {new Date().getFullYear()} NeuroCode AI. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-ink-60 transition-colors">Termos de Uso</Link>
            <Link href="/" className="hover:text-ink-60 transition-colors">Início</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
