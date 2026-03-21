"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Building2, Phone, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { useLanguage } from "@/context/language-context";

export default function ContactPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    plan: "enterprise",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error ?? "Erro ao enviar mensagem");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-20 pt-32">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/25 bg-gold/[0.08] text-gold text-sm mb-6">
              <Building2 className="w-4 h-4" />
              Plano Enterprise
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 font-sans">
              <span className="text-ink">Vamos conversar</span>
              <br />
              <span className="text-[#b91c1c]">sobre seu projeto</span>
            </h1>

            <p className="text-ink-60 text-lg leading-relaxed mb-10 font-serif">
              O plano Enterprise é personalizado para cada empresa. Fale com
              nosso time comercial e descubra como o NeuroCode AI pode
              transformar seu desenvolvimento de software.
            </p>

            <div className="space-y-6">
              {[
                { icon: MessageSquare, title: "Limite personalizado",  desc: "Gerações ilimitadas ou cota definida por contrato" },
                { icon: Building2,    title: "Conta multi-usuário",    desc: "Toda a sua equipe em um único workspace" },
                { icon: Phone,        title: "Suporte dedicado",       desc: "Canal direto com engenheiros da NeuroCode" },
                { icon: Mail,         title: "SLA garantido",          desc: "Acordo de nível de serviço com uptime de 99,9%" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/[0.10] border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{item.title}</div>
                    <div className="text-sm text-ink-60 mt-0.5 font-serif">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 rounded-xl border border-ink-15 bg-ink/[0.03] text-sm text-ink-35">
              Prefere e-mail?{" "}
              <a
                href="mailto:enterprise@neurocode.ai"
                className="text-gold hover:text-gold-lt transition-colors"
              >
                enterprise@neurocode.ai
              </a>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-ink-15 bg-cream-2/60 backdrop-blur-sm p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/[0.12] border border-gold/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-ink mb-3">
                    {t("contact", "successTitle")}
                  </h2>
                  <p className="text-ink-60 mb-8 font-serif">
                    {t("contact", "successText")}
                  </p>
                  <Link href="/">
                    <Button variant="outline">Voltar ao início</Button>
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-ink mb-6">
                    {t("contact", "title")}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ink-60 mb-1.5 font-medium">{t("contact", "name")} *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t("contact", "namePlaceholder")}
                        className="w-full h-10 px-3 rounded-xl border border-ink-15 bg-ink/[0.03] text-ink placeholder-ink-35 text-sm outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-60 mb-1.5 font-medium">{t("contact", "email")} *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t("contact", "emailPlaceholder")}
                        className="w-full h-10 px-3 rounded-xl border border-ink-15 bg-ink/[0.03] text-ink placeholder-ink-35 text-sm outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ink-60 mb-1.5 font-medium">{t("contact", "company")}</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder={t("contact", "companyPlaceholder")}
                        className="w-full h-10 px-3 rounded-xl border border-ink-15 bg-ink/[0.03] text-ink placeholder-ink-35 text-sm outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-60 mb-1.5 font-medium">Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+55 11 9 0000-0000"
                        className="w-full h-10 px-3 rounded-xl border border-ink-15 bg-ink/[0.03] text-ink placeholder-ink-35 text-sm outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-60 mb-1.5 font-medium">Interesse</label>
                    <select
                      value={form.plan}
                      onChange={(e) => setForm({ ...form, plan: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-ink-15 bg-cream text-ink text-sm outline-none focus:border-gold/50 transition-colors"
                    >
                      <option value="enterprise">Plano Enterprise — personalizado</option>
                      <option value="team">Equipe com múltiplos usuários</option>
                      <option value="integration">Integração via API</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-60 mb-1.5 font-medium">{t("contact", "message")} *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t("contact", "messagePlaceholder")}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-15 bg-ink/[0.03] text-ink placeholder-ink-35 text-sm outline-none focus:border-gold/50 transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-[#b91c1c] bg-[#b91c1c]/10 border border-[#b91c1c]/20 rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="glow"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        {t("contact", "sending")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("contact", "send")}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-ink-35 text-center leading-relaxed">
                    Seus dados são usados apenas para responder este contato, conforme nossa{" "}
                    <Link href="/privacy" className="text-ink-60 hover:text-ink underline underline-offset-2 transition-colors">
                      Política de Privacidade
                    </Link>.
                    {" "}Respondemos em até 24 horas úteis.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-ink-15 px-6 py-8 mt-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-ink-35">
          <span>© {new Date().getFullYear()} NeuroCode AI. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink-60 transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-ink-60 transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
