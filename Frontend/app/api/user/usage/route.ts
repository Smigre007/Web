import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function checkIsAdmin(userId: string): boolean {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean).includes(userId);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    const { data: user } = await db
      .from("users")
      .select("plan, generations_used, generations_limit, first_name, last_name, email, subscription_cancel_at_period_end")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json({
        plan: "free",
        generations_used: 0,
        generations_limit: 3,
        percent: 0,
        cancel_at_period_end: false,
      });
    }

    const used = user.generations_used ?? 0;
    const limit = user.generations_limit ?? 3;
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    return NextResponse.json({
      plan: user.plan ?? "free",
      generations_used: used,
      generations_limit: limit,
      percent,
      first_name: user.first_name,
      email: user.email,
      cancel_at_period_end: user.subscription_cancel_at_period_end ?? false,
      is_admin: checkIsAdmin(userId),
    });
  } catch {
    return NextResponse.json({
      plan: "free",
      generations_used: 0,
      generations_limit: 3,
      percent: 0,
    });
  }
}
