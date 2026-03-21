/**
 * Transactional email via Resend.
 * All sends are fire-and-forget and fail silently if Resend is not configured.
 */
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { getPublicAppUrl } from "@/lib/env";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "NeuroCode AI <noreply@neurocode.ai>";
const ADMIN = process.env.RESEND_ADMIN_EMAIL ?? "";
const APP_URL = getPublicAppUrl();

// ─── Helpers ────────────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NeuroCode AI</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:16px;border:1px solid #27272a;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">⚡ NeuroCode AI</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #27272a;text-align:center;">
            <p style="margin:0;font-size:12px;color:#52525b;">
              © ${new Date().getFullYear()} NeuroCode AI ·
              <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">neurocode.ai</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${text}</a>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#a1a1aa;">${text}</p>`;
}

function h2(text: string): string {
  return `<h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#fff;">${text}</h2>`;
}

// ─── Email Senders ───────────────────────────────────────────────────────────

/** Sent when a new user registers */
export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Bem-vindo ao NeuroCode AI! 🚀",
      html: baseTemplate(`
        ${h2(`Olá${firstName ? `, ${firstName}` : ""}! Bem-vindo ao NeuroCode AI 🎉`)}
        ${p("Você agora tem acesso ao gerador de software mais avançado do Brasil. Crie sites, apps, APIs e muito mais em segundos com inteligência artificial.")}
        ${p("Seu plano <strong style='color:#fff'>Free</strong> inclui <strong style='color:#fff'>3 gerações</strong> para começar. Experimente agora!")}
        ${btn("Começar a criar →", `${APP_URL}/gerar`)}
        <div style="margin-top:32px;padding:20px;background:#09090b;border-radius:10px;border:1px solid #27272a;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;">O que você pode criar</p>
          <ul style="margin:0;padding-left:20px;color:#a1a1aa;font-size:14px;line-height:2;">
            <li>Sites e landing pages</li>
            <li>Aplicações web completas</li>
            <li>Dashboards e painéis</li>
            <li>APIs REST documentadas</li>
          </ul>
        </div>
      `),
    });
  } catch (err) {
    logger.error("sendWelcomeEmail failed", { error: err, to });
  }
}

/** Sent when a Stripe invoice payment fails */
export async function sendPaymentFailedEmail(to: string, firstName: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "⚠️ Problema com seu pagamento — NeuroCode AI",
      html: baseTemplate(`
        ${h2("Não foi possível processar seu pagamento")}
        ${p(`Olá${firstName ? `, ${firstName}` : ""}! Houve um problema ao cobrar o seu cartão para a renovação da assinatura do NeuroCode AI.`)}
        ${p("Seu acesso será mantido por alguns dias. Por favor, atualize suas informações de pagamento para continuar usando todos os recursos.")}
        ${btn("Atualizar pagamento →", `${APP_URL}/settings/billing`)}
        ${p("<small>Se você já resolveu o problema, pode ignorar este e-mail.</small>")}
      `),
    });
  } catch (err) {
    logger.error("sendPaymentFailedEmail failed", { error: err, to });
  }
}

/** Sent to the user after submitting the contact/enterprise form */
export async function sendContactConfirmationEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Recebemos sua mensagem — NeuroCode AI",
      html: baseTemplate(`
        ${h2(`Obrigado, ${name}!`)}
        ${p("Recebemos sua mensagem e nossa equipe entrará em contato em até <strong style='color:#fff'>1 dia útil</strong>.")}
        ${p("Enquanto isso, você pode explorar nossa plataforma gratuitamente.")}
        ${btn("Explorar NeuroCode AI →", `${APP_URL}/gerar`)}
      `),
    });
  } catch (err) {
    logger.error("sendContactConfirmationEmail failed", { error: err, to });
  }
}

/** Sent to the admin when a new contact/enterprise lead arrives */
export async function sendAdminContactNotification(
  lead: { name: string; email: string; company?: string; message: string; plan?: string }
): Promise<void> {
  const resend = getResend();
  if (!resend || !ADMIN) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `🔔 Novo lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      html: baseTemplate(`
        ${h2("Novo lead recebido")}
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${[
            ["Nome", lead.name],
            ["E-mail", lead.email],
            ["Empresa", lead.company ?? "—"],
            ["Plano de interesse", lead.plan ?? "enterprise"],
          ].map(([k, v]) => `
            <tr>
              <td style="padding:8px 0;color:#71717a;width:120px;">${k}</td>
              <td style="padding:8px 0;color:#fff;font-weight:600;">${v}</td>
            </tr>
          `).join("")}
        </table>
        <div style="margin-top:20px;padding:16px;background:#09090b;border-radius:8px;border:1px solid #27272a;">
          <p style="margin:0 0 6px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Mensagem</p>
          <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;">${lead.message}</p>
        </div>
        ${btn("Ver no painel admin →", `${APP_URL}/admin`)}
      `),
    });
  } catch (err) {
    logger.error("sendAdminContactNotification failed", { error: err });
  }
}

/** Sent when user successfully upgrades their plan */
export async function sendUpgradeConfirmationEmail(
  to: string,
  firstName: string,
  plan: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const limits: Record<string, string> = {
    starter: "20 gerações/mês",
    pro: "100 gerações/mês",
    enterprise: "Gerações ilimitadas",
  };

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🎉 Bem-vindo ao plano ${planLabel}! — NeuroCode AI`,
      html: baseTemplate(`
        ${h2(`Upgrade concluído! Você agora é ${planLabel} 🚀`)}
        ${p(`Olá${firstName ? `, ${firstName}` : ""}! Seu plano foi atualizado com sucesso para <strong style='color:#fff'>${planLabel}</strong>.`)}
        <div style="margin:24px 0;padding:20px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.1));border:1px solid rgba(124,58,237,0.3);border-radius:12px;text-align:center;">
          <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:#fff;">${limits[plan] ?? "Gerações ilimitadas"}</p>
          <p style="margin:0;font-size:14px;color:#a1a1aa;">incluídas no seu plano ${planLabel}</p>
        </div>
        ${btn("Começar a gerar →", `${APP_URL}/gerar`)}
      `),
    });
  } catch (err) {
    logger.error("sendUpgradeConfirmationEmail failed", { error: err, to });
  }
}
