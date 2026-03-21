"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Code2, Eye, Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

const DEMO_CONVERSATION = [
  {
    role: "user",
    text: "Sou agência e preciso de um MVP para um cliente de logística. Quero dashboard, cadastro de pedidos e área admin.",
    delay: 0,
  },
  {
    role: "assistant",
    text: "Perfeito. Vou abrir o onboarding técnico para sua agência.\n\n1) Qual o principal KPI desse MVP? (leads, pedidos ou conversão?)\n2) Qual stack preferida do cliente? (Next + Supabase, por exemplo)\n3) Existe prazo de entrega para demo comercial?\n\nCom isso, gero a V1 pronta para apresentar ao cliente.",
    delay: 1500,
  },
  {
    role: "user",
    text: "KPI: pedidos concluídos. Stack Next + Supabase. Preciso da primeira demo em 72h.",
    delay: 3000,
  },
  {
    role: "assistant",
    text: "Excelente. Gerando MVP de logística com foco em operações.\n\nSUMÁRIO:\n- Painel de pedidos + status em tempo real\n- CRUD de clientes e rotas\n- Área admin com autenticação\n- Entrega preparada para proposta comercial da agência\n\n[Gerando V1 funcional...]",
    delay: 5000,
  },
];

const DEMO_CODE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <title>Sabor Brasil — Autêntica Culinária Brasileira</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --primary: #C41E3A;
      --gold: #FFD700;
      --dark: #1a0a00;
    }
    body { margin: 0; font-family: 'Georgia', serif; background: var(--dark); }

    /* Hero Section */
    .hero {
      min-height: 100vh;
      background: linear-gradient(
        to bottom right,
        #1a0a00 0%,
        #2d1a00 50%,
        #1a0a00 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero h1 {
      font-size: clamp(3rem, 8vw, 7rem);
      color: var(--gold);
      text-shadow: 0 0 60px rgba(255,215,0,0.3);
      margin-bottom: 1rem;
    }
    /* ... 200+ linhas de código profissional */
  </style>
</head>
<body>
  <!-- Navegação com menu hambúrguer -->
  <!-- Hero com animação cinematográfica -->
  <!-- Seção do menu com filtros -->
  <!-- Galeria de fotos interativa -->
  <!-- Sistema de reservas online -->
  <!-- Depoimentos de clientes -->
  <!-- Mapa e localização -->
  <!-- Footer completo -->
</body>
</html>`;

const DEMO_PREVIEW_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--primary:#C41E3A;--gold:#FFD700;--dark:#1a0a00;--dark2:#2d1a00}
  body{font-family:'Georgia',serif;background:var(--dark);color:#f5f5f5;overflow-x:hidden}
  nav{position:fixed;top:0;width:100%;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;background:rgba(26,10,0,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,215,0,0.12);z-index:100}
  .nav-logo{font-size:18px;font-weight:700;color:var(--gold);letter-spacing:2px;text-transform:uppercase}
  .nav-links{display:flex;gap:24px;list-style:none}
  .nav-links a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase;transition:color .2s}
  .nav-links a:hover{color:var(--gold)}
  .nav-cta{background:var(--primary);color:white;padding:8px 18px;font-size:11px;letter-spacing:2px;text-transform:uppercase;border:none;cursor:pointer;transition:background .2s}
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 70%,var(--dark2),var(--dark));text-align:center;padding:100px 20px 60px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(255,215,0,0.04),transparent 70%)}
  .hero-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border:1px solid rgba(255,215,0,0.3);color:rgba(255,215,0,0.7);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px}
  .hero h1{font-size:clamp(2.5rem,7vw,5.5rem);color:var(--gold);text-shadow:0 0 60px rgba(255,215,0,0.25);line-height:1.05;font-weight:400;margin-bottom:12px}
  .hero-sub{font-size:14px;color:rgba(255,255,255,0.55);letter-spacing:2px;text-transform:uppercase;margin-bottom:32px}
  .hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--primary);color:white;padding:13px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;border:none;cursor:pointer}
  .btn-outline{background:transparent;color:var(--gold);padding:13px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;border:1px solid var(--gold)}
  .menu-section{padding:80px 32px;background:#120800}
  .section-label{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:0.7;margin-bottom:8px}
  .section-title{font-size:clamp(1.8rem,4vw,2.8rem);color:#f5f5f5;font-weight:400;margin-bottom:40px}
  .menu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;max-width:900px;margin:0 auto}
  .menu-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,215,0,0.1);padding:20px;text-align:center;transition:border-color .3s}
  .menu-card:hover{border-color:rgba(255,215,0,0.4)}
  .menu-emoji{font-size:36px;margin-bottom:10px}
  .menu-name{font-size:13px;color:#f5f5f5;margin-bottom:4px}
  .menu-desc{font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:10px}
  .menu-price{font-size:16px;font-weight:700;color:var(--gold)}
  .reserve-section{padding:80px 32px;text-align:center;background:var(--dark)}
  .reserve-card{display:inline-block;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);padding:40px 48px;max-width:480px}
  .reserve-card h3{font-size:24px;color:var(--gold);margin-bottom:8px;font-weight:400}
  .reserve-card p{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px}
  .reserve-form{display:flex;flex-direction:column;gap:10px;text-align:left}
  .reserve-form input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);padding:10px 14px;color:#f5f5f5;font-family:'Georgia',serif;font-size:13px;outline:none}
  footer{padding:24px;text-align:center;border-top:1px solid rgba(255,215,0,0.1);background:#0d0500}
  footer p{font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:2px;text-transform:uppercase}
</style>
</head>
<body>
<nav>
  <span class="nav-logo">🍖 Sabor Brasil</span>
  <ul class="nav-links">
    <li><a href="#">Menu</a></li>
    <li><a href="#">Sobre</a></li>
    <li><a href="#">Galeria</a></li>
    <li><a href="#">Contato</a></li>
  </ul>
  <button class="nav-cta">Reservar Mesa</button>
</nav>
<div class="hero">
  <div class="hero-badge">⭐ Premiado 3 anos consecutivos</div>
  <h1>Sabor Brasil</h1>
  <p class="hero-sub">Autêntica culinária brasileira desde 1998</p>
  <div class="hero-btns">
    <button class="btn-primary">Ver Cardápio Completo</button>
    <button class="btn-outline">Fazer Reserva</button>
  </div>
</div>
<div class="menu-section">
  <p class="section-label">Nosso Cardápio</p>
  <h2 class="section-title">Especialidades da Casa</h2>
  <div class="menu-grid">
    <div class="menu-card"><div class="menu-emoji">🥩</div><div class="menu-name">Picanha na Brasa</div><div class="menu-desc">Corte premium, 400g</div><div class="menu-price">R$ 89</div></div>
    <div class="menu-card"><div class="menu-emoji">🍖</div><div class="menu-name">Frango Mineiro</div><div class="menu-desc">Com angu e couve</div><div class="menu-price">R$ 54</div></div>
    <div class="menu-card"><div class="menu-emoji">🫘</div><div class="menu-name">Feijão Tropeiro</div><div class="menu-desc">Receita da vovó</div><div class="menu-price">R$ 38</div></div>
    <div class="menu-card"><div class="menu-emoji">🍲</div><div class="menu-name">Feijoada Completa</div><div class="menu-desc">Aos sábados · por pessoa</div><div class="menu-price">R$ 67</div></div>
  </div>
</div>
<div class="reserve-section">
  <div class="reserve-card">
    <h3>Faça sua Reserva</h3>
    <p>Garanta sua mesa para uma experiência única</p>
    <div class="reserve-form">
      <input type="text" placeholder="Seu nome completo" />
      <input type="date" />
      <input type="text" placeholder="Número de pessoas" />
      <button class="btn-primary" style="text-align:center">Confirmar Reserva</button>
    </div>
  </div>
</div>
<footer><p>© 2025 Sabor Brasil · Todos os direitos reservados</p></footer>
</body>
</html>`;

function DemoTypewriterTitleAnimated({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: false, margin: "-12% 0px" });
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!inView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOut("");
      return;
    }
    let i = 0;
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      i += 1;
      setOut(text.slice(0, i));
      if (i < text.length) {
        window.setTimeout(step, 40 + Math.random() * 35);
      }
    };
    const t0 = window.setTimeout(step, 320);
    return () => {
      cancelled = true;
      window.clearTimeout(t0);
    };
  }, [inView, text]);

  return (
    <h2 ref={ref} className={className}>
      {out}
      {inView && out.length < text.length && (
        <span
          className="inline-block w-0.5 h-[0.85em] ml-1 bg-ink align-middle animate-pulse"
          aria-hidden
        />
      )}
    </h2>
  );
}

function DemoTypewriterTitle({ text, className }: { text: string; className?: string }) {
  const reduced = useLandingReducedMotion();
  if (reduced) {
    return <h2 className={className}>{text}</h2>;
  }
  return <DemoTypewriterTitleAnimated text={text} className={className} />;
}

export function Demo() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview">("chat");
  const [messages, setMessages] = useState<typeof DEMO_CONVERSATION>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const startDemo = () => {
    setStarted(true);
    setMessages([]);

    DEMO_CONVERSATION.forEach((msg) => {
      setTimeout(() => {
        if (msg.role === "assistant") setIsTyping(true);
        setTimeout(
          () => {
            setIsTyping(false);
            setMessages((prev) => [...prev, msg]);
          },
          msg.role === "assistant" ? 1200 : 0
        );
      }, msg.delay);
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(DEMO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-24 md:py-32 px-6 relative bg-cream-2">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/15 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionHeaderReveal
            centered
            className="mb-0"
            eyebrow={
              <>
                <span className="w-8 h-px bg-ink-35 shrink-0" />
                <span>{t("demo", "eyebrow")}</span>
              </>
            }
            titleSlot={
              <DemoTypewriterTitle
                key={language + t("demo", "title")}
                text={t("demo", "title")}
                className="section-title text-5xl md:text-6xl lg:text-7xl text-ink mb-6 max-w-5xl mx-auto"
              />
            }
            description={t("demo", "subtitle")}
            descriptionClassName="text-xl text-ink-60 max-w-2xl mx-auto font-serif font-medium text-center"
            titleClassName=""
          />
        </div>

        {/* Demo window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-60px 0px" }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(10, 2, 20, 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 80px rgba(217, 119, 6, 0.1)",
          }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {[
                  { id: "chat", label: t("demo", "tabChat"), icon: Sparkles },
                  { id: "code", label: t("demo", "tabCode"), icon: Code2 },
                  { id: "preview", label: t("demo", "tabPreview"), icon: Eye },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`relative flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="demo-tab-pill"
                        className="absolute inset-0 bg-amber-600"
                        style={{ zIndex: 0, borderRadius: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <tab.icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="h-[500px] overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Messages area */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!started ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-amber-400" />
                          </div>
                          <p className="text-white/50 mb-6">
                            {t("demo", "startHint")}
                          </p>
                          <Button onClick={startDemo} variant="glow">
                            {t("demo", "startBtn")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {msg.role === "assistant" && (
                              <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === "user"
                                  ? "bg-amber-600 text-white rounded-br-sm"
                                  : "bg-white/[0.06] text-white/90 rounded-bl-sm border border-white/10"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}
                        {isTyping && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                              <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-amber-400"
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Descreva sua ideia aqui..."
                        className="flex-1 h-10 px-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/50 text-sm outline-none"
                        readOnly
                      />
                      <Button size="icon" disabled aria-label={t("demo", "sendDemoDecorative")}>
                        <Send className="w-4 h-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full relative"
                >
                  <div className="absolute top-4 right-4 z-10">
                    <Button size="sm" variant="outline" onClick={copyCode}>
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? t("demo", "copied") : t("demo", "copy")}
                    </Button>
                  </div>
                  <div className="h-full overflow-y-auto p-6">
                    <pre className="code-font text-xs text-amber-300/90 leading-relaxed">
                      {DEMO_CODE}
                    </pre>
                  </div>
                </motion.div>
              )}

              {activeTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <iframe
                    srcDoc={DEMO_PREVIEW_HTML}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                    title="Preview: Sabor Brasil"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
