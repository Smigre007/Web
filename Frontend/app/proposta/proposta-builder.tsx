"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ITEMS = [
  "Diagnóstico e briefing (1 reunião estratégica)",
  "Setup do projeto e onboarding do cliente final",
  "Geração de MVP funcional com IA (V1 navegável)",
  "Ajustes de escopo e refinamento visual",
  "Entrega técnica com documentação e handoff",
  "30 dias de suporte pós-entrega",
];

const TIMELINE = [
  "Dia 1: briefing + validação de escopo",
  "Dia 2-3: geração da V1 + preparação da demo",
  "Dia 4-5: ajustes e aprovação",
  "Dia 6-7: entrega final e operação",
];

function brl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function formatDateBR(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export function PropostaBuilder() {
  const params = useSearchParams();
  const now = useMemo(() => new Date(), []);
  const [agency, setAgency] = useState(params.get("agencia") ?? "Sua Agência");
  const [client, setClient] = useState(params.get("cliente") ?? "Cliente Final");
  const [value, setValue] = useState(Number(params.get("valor") ?? "12900"));
  const [days, setDays] = useState(Number(params.get("prazo") ?? "7"));
  const [validityDays, setValidityDays] = useState(Number(params.get("validade") ?? "7"));
  const [payment, setPayment] = useState(params.get("pagamento") ?? "40% entrada · 40% aprovação V1 · 20% entrega");
  const [accent, setAccent] = useState(params.get("cor") ?? "#d97706");
  const [logoUrl, setLogoUrl] = useState(params.get("logo") ?? "");
  const [responsavel, setResponsavel] = useState(params.get("responsavel") ?? "Seu Nome");
  const [cargo, setCargo] = useState(params.get("cargo") ?? "Diretor(a) de Projetos");
  const [proposalNumber, setProposalNumber] = useState(
    params.get("numero") ??
      `PROP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );
  const [status, setStatus] = useState(params.get("status") ?? "rascunho");
  const [obs, setObs] = useState(
    params.get("obs") ??
      "Validade desta proposta: 7 dias corridos. Esta proposta inclui 30 dias de suporte pós-entrega."
  );
  const [signedAt, setSignedAt] = useState(params.get("assinado_em") ?? "");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const today = useMemo(() => formatDateBR(now), [now]);
  const expiryDate = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + Math.max(validityDays, 1));
    return formatDateBR(d);
  }, [now, validityDays]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("agencia", agency);
    url.searchParams.set("cliente", client);
    url.searchParams.set("valor", String(value));
    url.searchParams.set("prazo", String(days));
    url.searchParams.set("validade", String(validityDays));
    url.searchParams.set("pagamento", payment);
    url.searchParams.set("cor", accent);
    if (logoUrl) url.searchParams.set("logo", logoUrl);
    url.searchParams.set("responsavel", responsavel);
    url.searchParams.set("cargo", cargo);
    url.searchParams.set("numero", proposalNumber);
    url.searchParams.set("status", status);
    url.searchParams.set("obs", obs);
    if (signedAt) url.searchParams.set("assinado_em", signedAt);
    return url.toString();
  }, [
    agency,
    client,
    value,
    days,
    validityDays,
    payment,
    accent,
    logoUrl,
    responsavel,
    cargo,
    proposalNumber,
    status,
    obs,
    signedAt,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
  }, []);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      if (!t) return null;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    const pt = getCanvasPoint(e);
    if (!pt) return;
    lastPointRef.current = pt;
  };

  const moveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pt = getCanvasPoint(e);
    const last = lastPointRef.current;
    if (!pt || !last) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPointRef.current = pt;
    if (!hasSignature) setHasSignature(true);
  };

  const endDraw = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const markSigned = () => {
    setSignedAt(formatDateBR(new Date()));
    setStatus("aceita");
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <main className="min-h-screen bg-surface text-white px-6 py-16">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
            color: #111 !important;
          }
          .print-sheet {
            background: #fff !important;
            color: #111 !important;
            border-color: #d1d5db !important;
            box-shadow: none !important;
          }
          .print-sheet .print-muted {
            color: #4b5563 !important;
          }
          .print-sheet .print-border {
            border-color: #e5e7eb !important;
          }
          .print-sheet .print-accent-bg {
            background: color-mix(in srgb, var(--proposal-accent) 14%, white) !important;
            border-color: color-mix(in srgb, var(--proposal-accent) 35%, #d1d5db) !important;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="no-print rounded-xl border border-white/10 bg-white/[0.03] p-5 h-fit">
          <h2 className="text-lg font-semibold mb-4">Personalizar proposta</h2>
          <div className="space-y-3">
            <Input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="Nome da agência" />
            <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" />
            <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value || 0))} placeholder="Valor total (R$)" />
            <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value || 1))} placeholder="Prazo em dias úteis" />
            <Input type="number" value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value || 1))} placeholder="Validade (dias corridos)" />
            <Input value={payment} onChange={(e) => setPayment(e.target.value)} placeholder="Condição de pagamento" />
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Cor da marca" />
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="URL do logo (opcional)" />
            <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Responsável" />
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Cargo" />
            <Input value={proposalNumber} onChange={(e) => setProposalNumber(e.target.value)} placeholder="Número da proposta" />
            <select
              className="flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada</option>
              <option value="aceita">Aceita</option>
              <option value="recusada">Recusada</option>
            </select>
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações comerciais" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={copyLink}>Copiar link</Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>Exportar PDF</Button>
          </div>
          <p className="text-xs text-white/40 mt-3">Dica: compartilhe o link com o cliente já preenchido.</p>
        </aside>

        <section className="lg:col-span-2 print-sheet rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8" style={{ ["--proposal-accent" as string]: accent }}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 print-muted">
              {agency || "Sua Agência"}
            </p>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo da agência" className="h-10 max-w-[170px] object-contain" />
            ) : (
              <span className="text-xs text-white/40 print-muted">Sem logo</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Proposta Comercial</h1>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full border border-white/20 print-border text-white/70 print-muted">
              Nº {proposalNumber}
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full border print-border"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              Status: {status}
            </span>
          </div>
          <p className="text-white/60 print-muted mb-2">
            Proposta emitida por <strong>{agency}</strong> para <strong>{client}</strong>.
          </p>
          <p className="text-xs text-white/45 print-muted mb-8">
            Data de emissão: {today} · Validade até: {expiryDate}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <article className="rounded-xl border border-white/10 print-border bg-white/[0.03] p-5 md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Escopo incluído</h2>
              <ul className="list-disc ml-5 space-y-2 text-white/70 print-muted">
                {ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-xl border border-amber-500/30 print-accent-bg bg-amber-500/10 p-5" style={{ borderColor: `${accent}55`, background: `${accent}1A` }}>
              <h2 className="text-xl font-semibold mb-2" style={{ color: accent }}>Investimento</h2>
              <p className="text-3xl font-bold text-white mb-2">{brl(value)}</p>
              <p className="text-white/70 print-muted text-sm">Prazo estimado: {days} dias úteis.</p>
            </article>
          </div>

          <article className="rounded-xl border border-white/10 print-border bg-white/[0.03] p-5 mb-8">
            <h2 className="text-xl font-semibold mb-3">Cronograma sugerido</h2>
            <ul className="list-disc ml-5 space-y-2 text-white/70 print-muted">
              {TIMELINE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 print-border bg-white/[0.03] p-5 mb-8">
            <h2 className="text-xl font-semibold mb-3">Condições comerciais</h2>
            <ul className="list-disc ml-5 space-y-2 text-white/70 print-muted">
              <li>{payment}</li>
              <li>2 rodadas de ajustes incluídas no escopo.</li>
              <li>Mudanças fora de escopo cobradas por hora/proposta complementar.</li>
              <li>Suporte de 30 dias para estabilidade e pequenos ajustes pós-go-live.</li>
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 print-border bg-white/[0.03] p-5 mb-8">
            <h2 className="text-xl font-semibold mb-3">Assinatura e aceite</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-white/40 print-muted uppercase tracking-[0.2em] mb-2">Responsável da proposta</p>
                <p className="font-semibold">{responsavel}</p>
                <p className="text-white/60 print-muted text-sm">{cargo}</p>
                <div className="mt-4">
                  <p className="text-xs text-white/40 print-muted mb-1">Assinatura digital simples</p>
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={120}
                    className="w-full max-w-[420px] h-[120px] border border-white/20 print-border rounded bg-transparent no-print touch-none"
                    onMouseDown={startDraw}
                    onMouseMove={moveDraw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={moveDraw}
                    onTouchEnd={endDraw}
                  />
                  <div className="no-print flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={clearSignature}>Limpar assinatura</Button>
                    <Button size="sm" onClick={markSigned} disabled={!hasSignature}>Assinar e marcar aceita</Button>
                  </div>
                  <div className="mt-4 border-t border-white/20 print-border pt-2 text-sm text-white/60 print-muted">
                    Assinatura: __________________________________
                    {signedAt ? `  (Assinado em: ${signedAt})` : ""}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 print-muted uppercase tracking-[0.2em] mb-2">Aceite do cliente</p>
                <p className="text-sm text-white/70 print-muted mb-6">Nome: __________________________________</p>
                <p className="text-sm text-white/70 print-muted">Data: ______ / ______ / ______</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-white/10 print-border bg-white/[0.03] p-5 mb-8">
            <h2 className="text-lg font-semibold mb-2">Observações</h2>
            <p className="text-white/65 print-muted whitespace-pre-line">{obs}</p>
          </article>

          <div className="no-print flex gap-4 flex-wrap">
            <Link href="/" className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white/40 transition-colors">
              Voltar para home
            </Link>
            <Link href="/docs/operacao" className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 transition-colors text-white">
              Ver operação completa
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
