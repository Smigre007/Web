import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da plataforma NeuroCode AI.",
};

export default function TermsPage() {
  const lastUpdated = "15 de março de 2026";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 pt-28">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-3">Termos de Uso</h1>
          <p className="text-ink-35 text-sm">Última atualização: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-ink-60 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma NeuroCode AI (&ldquo;Serviço&rdquo;), você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">2. Descrição do Serviço</h2>
            <p>
              O NeuroCode AI é uma plataforma de geração de código com inteligência artificial que permite aos usuários criar websites, aplicativos, APIs, dashboards e outros projetos de software através de descrições em linguagem natural. O serviço utiliza o motor de IA proprietário do NeuroCode para gerar o código.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">3. Elegibilidade e Conta</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Você deve ter pelo menos 18 anos para utilizar o serviço;</li>
              <li>É responsável por manter a segurança de suas credenciais de acesso;</li>
              <li>Uma conta por pessoa. Contas corporativas devem ser registradas em nome da empresa;</li>
              <li>Qualquer atividade realizada com sua conta é de sua responsabilidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">4. Planos e Pagamentos</h2>
            <div className="space-y-3">
              <p><strong className="text-ink">Plano Gratuito:</strong> Inclui 3 gerações de projetos por mês, sem necessidade de cartão de crédito.</p>
              <p><strong className="text-ink">Planos Pagos:</strong> Cobrados mensalmente ou anualmente via Stripe. Os valores são conforme exibidos na página de assinatura.</p>
              <p><strong className="text-ink">Renovação:</strong> Assinaturas se renovam automaticamente. Você pode cancelar a qualquer momento pelo painel de controle.</p>
              <p><strong className="text-ink">Reembolsos:</strong> Solicitações de reembolso podem ser feitas em até 7 dias após a cobrança. Após esse período, não oferecemos reembolsos pro-rata para o período não utilizado.</p>
              <p><strong className="text-ink">Reajustes:</strong> Notificaremos com pelo menos 30 dias de antecedência sobre qualquer alteração de preços.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">5. Uso Aceitável</h2>
            <p>Ao usar o NeuroCode AI, você concorda em <strong className="text-ink">não</strong>:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Gerar código malicioso, malware, vírus ou qualquer software que cause danos;</li>
              <li>Criar conteúdo ilegal, fraudulento, difamatório ou que viole direitos de terceiros;</li>
              <li>Usar o serviço para atividades de spam, phishing ou engenharia social;</li>
              <li>Tentar contornar limites de uso, abusar de APIs ou realizar ataques de força bruta;</li>
              <li>Revender ou sublicenciar o acesso à plataforma sem autorização expressa;</li>
              <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte da plataforma;</li>
              <li>Usar o serviço para discriminação baseada em raça, gênero, religião ou outras características protegidas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">6. Propriedade Intelectual do Código Gerado</h2>
            <p>
              O código gerado pela plataforma é de sua propriedade. Você pode usar, modificar, distribuir e comercializar o código gerado sem restrições, incluindo em projetos comerciais.
            </p>
            <p className="mt-3">
              No entanto, a NeuroCode AI retém todos os direitos sobre a plataforma em si, incluindo a interface, algoritmos, marca e demais elementos que não sejam o código gerado por você.
            </p>
            <p className="mt-3">
              Observe que o código é gerado por IA e pode conter similaridades com outros projetos. É sua responsabilidade garantir que o uso do código não infrinja direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">7. Limitação de Responsabilidade</h2>
            <p>
              O NeuroCode AI fornece o serviço &ldquo;como está&rdquo;. Não garantimos que o código gerado seja isento de erros, vulnerabilidades de segurança ou que seja adequado para qualquer finalidade específica.
            </p>
            <p className="mt-3">
              Na extensão máxima permitida por lei, nossa responsabilidade total não excederá o valor pago pelo serviço nos últimos 3 meses. Não somos responsáveis por danos indiretos, lucros cessantes, perda de dados ou danos resultantes do uso do código gerado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">8. Disponibilidade do Serviço</h2>
            <p>
              Nos esforçamos para manter a plataforma disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência. Não somos responsáveis por interrupções causadas por fatores fora de nosso controle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">9. Suspensão e Encerramento</h2>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves. Em casos de violação menor, enviaremos uma notificação e daremos oportunidade de correção antes de qualquer ação.
            </p>
            <p className="mt-3">
              Você pode encerrar sua conta a qualquer momento pelo painel de configurações. Após o encerramento, seus dados serão mantidos por 30 dias antes da exclusão permanente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">10. Modificações dos Termos</h2>
            <p>
              Podemos modificar estes termos a qualquer momento. Notificaremos usuários por e-mail sobre mudanças significativas com pelo menos 15 dias de antecedência. O uso continuado após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">11. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas no foro da comarca de São Paulo, SP, Brasil, salvo disposição legal em contrário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">12. Contato</h2>
            <p>
              Para dúvidas sobre estes termos:
            </p>
            <div className="mt-3 p-4 rounded-xl border border-ink-15 bg-ink/[0.03]">
              <p><strong className="text-ink">NeuroCode AI</strong></p>
              <p>E-mail: <a href="mailto:legal@neurocode.ai" className="text-gold hover:text-gold-lt">legal@neurocode.ai</a></p>
              <p>Suporte: <a href="mailto:suporte@neurocode.ai" className="text-gold hover:text-gold-lt">suporte@neurocode.ai</a></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-15 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-35">
          <p>© {new Date().getFullYear()} NeuroCode AI. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink-60 transition-colors">Política de Privacidade</Link>
            <Link href="/" className="hover:text-ink-60 transition-colors">Início</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
