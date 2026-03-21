import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// Vercel Cron: runs at 06:00 UTC on the 1st of every month
// Schedule: "0 6 1 * *"
export async function GET(req: NextRequest) {
  // Verify the request comes from Vercel Cron using timing-safe comparison
  // to prevent timing attacks that could reveal the secret length/content.
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const actual = Buffer.from(authHeader);
  const isValid =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!isValid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const db = getSupabaseAdmin();

    // Reset generations_used for all users in a single UPDATE
    const { error: resetError, count: total } = await db
      .from("users")
      .update({ generations_used: 0 })
      .gte("generations_used", 0); // matches all rows (Supabase requires a filter for safety)

    if (resetError) throw resetError;

    return NextResponse.json({
      success: true,
      reset: total,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error("cron/reset-generations failed", { error: err });
    return NextResponse.json({ error: "Erro ao resetar gerações" }, { status: 500 });
  }
}
