"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plug,
  Github,
  Key,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Cloud,
  Figma,
  FileCode2,
  Rocket,
} from "lucide-react";

// ── Coming soon integrations ──────────────────────────────────────────────────

const COMING_SOON = [
  {
    icon: Key,
    name: "Chaves de API",
    tagline: "Acesso programático",
    description:
      "Gere e revogue chaves para integrar com a API do NeuroCode. Backend em preparação.",
    eta: "Em breve",
  },
  {
    icon: Cloud,
    name: "Vercel",
    tagline: "Deploy automático",
    description: "Faça deploy dos seus projetos com um clique direto na Vercel. URL automática e SSL incluso.",
    eta: "Em breve",
  },
  {
    icon: Rocket,
    name: "Netlify",
    tagline: "Deploy em um clique",
    description: "Deploy contínuo para a Netlify com preview automático para cada projeto gerado.",
    eta: "Em breve",
  },
  {
    icon: Figma,
    name: "Figma",
    tagline: "Importar designs",
    description: "Importe designs do Figma e converta componentes em código automaticamente.",
    eta: "Planejado",
  },
  {
    icon: FileCode2,
    name: "VS Code",
    tagline: "Extensão oficial",
    description: "Abra projetos gerados diretamente no VS Code com a extensão oficial do NeuroCode.",
    eta: "Planejado",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [githubConnecting, setGithubConnecting] = useState(false);

  const refreshGithub = useCallback(() => {
    return fetch("/api/github/status")
      .then((r) => r.json())
      .then((d: { connected?: boolean; username?: string | null }) => {
        setGithubConnected(!!d.connected);
        setGithubUsername(d.username ?? null);
      })
      .catch(() => {
        setGithubConnected(false);
        setGithubUsername(null);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "github_state") {
      toast.error("Sessão de conexão expirou ou é inválida. Tente conectar o GitHub novamente.");
    } else if (err === "github_denied" || err === "github_token" || err === "github_error") {
      toast.error("Não foi possível conectar ao GitHub. Tente novamente.");
    } else if (params.get("github") === "connected") {
      toast.success("GitHub conectado com sucesso.");
    }
    if (err || params.get("github")) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    refreshGithub().finally(() => setGithubLoading(false));
  }, [refreshGithub]);

  const handleConnectGithub = () => {
    setGithubConnecting(true);
    window.location.href = "/api/github/connect";
  };

  const handleDisconnectGithub = async () => {
    try {
      await fetch("/api/github/disconnect", { method: "POST" });
      setGithubConnected(false);
      setGithubUsername(null);
      toast.success("GitHub desconectado.");
    } catch {
      toast.error("Erro ao desconectar GitHub.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink flex items-center gap-3">
          <Plug className="w-8 h-8 text-gold" />
          Integrações
        </h1>
        <p className="text-ink-35 mt-1 text-sm">
          Conecte o NeuroCode AI aos seus serviços e ferramentas favoritas.
        </p>
      </div>

      {/* ── GitHub Integration ──────────────────────────────────────────────── */}
      <section className="bg-cream border border-ink-15 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-5">
          <Github className="w-4 h-4 text-ink" />
          GitHub
        </h2>

        {githubLoading ? (
          <div className="flex items-center gap-2 text-ink-35 text-sm py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            A carregar estado da integração…
          </div>
        ) : githubConnected && githubUsername ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gold/[0.06] border border-gold/25">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink">@{githubUsername}</p>
                  <p className="text-xs text-ink-35">Conta ligada — push e OAuth ativos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDisconnectGithub}
                className="border border-ink-15 text-ink-35 rounded-xl px-4 py-2 text-sm hover:bg-cream-2 hover:text-ink transition-all"
              >
                Desconectar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Push to repo", desc: "Envie código diretamente para um repositório" },
                { label: "Auto-commit", desc: "Commit automático ao gerar um projeto" },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="p-3 rounded-xl border border-ink-15 bg-cream-2/40"
                >
                  <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-gold" />
                    {feat.label}
                  </p>
                  <p className="text-xs text-ink-35 mt-0.5 ml-5">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-ink/[0.05] border border-ink-15 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-ink-35" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink mb-1">GitHub não conectado</p>
              <p className="text-xs text-ink-35 mb-4 leading-relaxed">
                Conecte sua conta do GitHub para fazer push de projetos gerados diretamente
                para repositórios, criar branches e commits automaticamente.
              </p>
              <button
                type="button"
                onClick={handleConnectGithub}
                disabled={githubConnecting}
                className="bg-ink text-cream rounded-xl px-4 py-2 text-sm font-medium hover:bg-ink/80 disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {githubConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Conectando...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" /> Conectar GitHub
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Coming soon integrations ───────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-ink-35" />
          Em Breve
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMING_SOON.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl border border-ink-15 bg-cream-2 opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink/[0.04] border border-ink-15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-ink-35" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-ink">{item.name}</span>
                    <span className="text-xs text-ink-35">·</span>
                    <span className="text-xs text-ink-35">{item.tagline}</span>
                    <span className="flex items-center gap-1 text-[10px] text-ink-35 bg-ink/[0.05] px-1.5 py-0.5 rounded-full font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {item.eta}
                    </span>
                  </div>
                  <p className="text-xs text-ink-35 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-2xl border border-gold/20 bg-gold/[0.04] text-center"
      >
        <p className="text-sm text-ink-35">
          Quer priorizar uma integração?{" "}
          <a
            href="/contact"
            className="text-gold font-medium underline underline-offset-2 hover:text-gold-lt transition-colors inline-flex items-center gap-1"
          >
            Fale com nossa equipe
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </motion.div>
    </div>
  );
}
