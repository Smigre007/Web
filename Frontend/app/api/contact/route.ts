import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { sendContactConfirmationEmail, sendAdminContactNotification } from "@/lib/email";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("E-mail inválido").max(320),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(5000),
  plan: z.string().max(50).optional(),
});

const RATE_LIMIT = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const { limited } = await checkRateLimit(`contact:${ip}`, RATE_LIMIT, WINDOW_MS);
    if (limited) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 15 minutos." },
        {
          status: 429,
          headers: {
            "Retry-After": String(WINDOW_MS / 1000),
            "RateLimit-Limit": String(RATE_LIMIT),
            "RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { name, email, company, phone, message, plan } = parsed.data;

    try {
      const db = getSupabaseAdmin();
      await db.from("contact_requests").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() ?? null,
        phone: phone?.trim() ?? null,
        message: message.trim(),
        plan: plan ?? "enterprise",
        created_at: new Date().toISOString(),
      });
    } catch {
      logger.warn("contact: DB insert failed (DB may not be configured)");
    }

    // Send emails fire-and-forget
    sendContactConfirmationEmail(email, name);
    sendAdminContactNotification({ name, email, company, message, plan });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Contact route error", { error: err });
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
