import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/** Deterministic referral code derived from clerk user ID — always consistent. */
function deriveCode(clerkId: string): string {
  const clean = clerkId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `NC${clean.slice(-6).padStart(6, "0")}`;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const db = getSupabaseAdmin();

    // Fetch user — try to get stored referral_code (column may not exist yet)
    let referralCode = deriveCode(userId);

    try {
      const { data: user } = await db
        .from("users")
        .select("id, referral_code")
        .eq("clerk_id", userId)
        .single();

      if (user?.referral_code) {
        referralCode = user.referral_code;
      } else if (user) {
        // Try to persist the derived code
        await db
          .from("users")
          .update({ referral_code: referralCode })
          .eq("clerk_id", userId);
      }
    } catch {
      // Column may not exist — use derived code
    }

    // Try to fetch referral history
    let items: Array<{
      id: string;
      status: string;
      commission_brl: number;
      created_at: string;
      converted_at: string | null;
    }> = [];

    try {
      const { data: referrals } = await db
        .from("referrals")
        .select("id, status, commission_brl, created_at, converted_at")
        .eq("referral_code", referralCode)
        .order("created_at", { ascending: false });
      if (referrals) items = referrals;
    } catch {
      // Table may not exist yet
    }

    const converted = items.filter((r) => ["converted", "paid"].includes(r.status));
    const totalCommission = converted.reduce((sum, r) => sum + (r.commission_brl ?? 0), 0);

    return NextResponse.json({
      referral_code: referralCode,
      referrals: items,
      total_converted: converted.length,
      total_commission_brl: totalCommission,
    });
  } catch (err) {
    logger.error("Error fetching referrals", { error: err });
    return NextResponse.json({ error: "Erro ao buscar referrals" }, { status: 500 });
  }
}
